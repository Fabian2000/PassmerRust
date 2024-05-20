use aes_gcm::aead::{generic_array::GenericArray, Aead, KeyInit};
use aes_gcm::{Aes256Gcm, Nonce};
use rand::rngs::OsRng;
use rand::RngCore;
use sha2::{Digest, Sha256};
use std::fs::{self, OpenOptions};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use tauri::api::path::document_dir;

use crate::code::msg_box::msg_box;

use super::passmer::Passmer;

// Default filename for the db
const DEFAULT_FILENAME: &str = "passmer.crypt.bin";

fn get_document_path(filename: &str) -> Option<PathBuf> {
    if let Some(mut doc_path) = document_dir() {
        doc_path.push("Passmer");
        if !doc_path.exists() {
            if let Err(e) = fs::create_dir(&doc_path) {
                eprintln!("Failed to create directory: {}", e);
                msg_box("Unable to create \"Passmer\" folder".to_string(), "error");
                return None;
            }
        }
        doc_path.push(filename);
        Some(doc_path)
    } else {
        None
    }
}

pub fn default_filepath() -> String {
    get_document_path(DEFAULT_FILENAME)
        .unwrap()
        .to_str()
        .unwrap()
        .to_string()
}

// Saves encrypted data with a nonce into the database file
pub fn save(filename: &str, key: &[u8; 32], data: Passmer) -> Result<(), String> {
    create(filename, key)?; // Create the file if it doesn't exist

    // Convert Passmer to a JSON string
    let data = to_json_string(data).map_err(|err| format!("JSON serialization failed: {}", err))?;

    // Initialize AES256-GCM cipher
    let cipher = Aes256Gcm::new(GenericArray::from_slice(key));

    // Generate a random nonce using OsRng
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    // Encrypt the data
    let cipher_text = cipher
        .encrypt(nonce, data.as_bytes())
        .map_err(|err| format!("Encryption failed: {}", err))?;

    // Open the file for writing
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open(filename)
        .map_err(|err| format!("Failed to open file '{}': {}", filename, err))?;

    // Write the nonce first, followed by the encrypted data
    file.write_all(&nonce_bytes)
        .and_then(|_| file.write_all(cipher_text.as_slice()))
        .map_err(|err| format!("Failed to write to file '{}': {}", filename, err))?;

    Ok(())
}

// Reads the encrypted data and nonce from the file and decrypts it
pub fn load(filename: &str, key: &[u8; 32]) -> Result<Passmer, String> {
    create(filename, key)?;

    // Initialize AES256-GCM Cipher
    let cipher = Aes256Gcm::new(GenericArray::from_slice(key));

    // Open the file for reading
    let mut file = OpenOptions::new()
        .read(true)
        .open(filename)
        .map_err(|err| format!("Failed to open file '{}': {}", filename, err))?;

    // Read the nonce first
    let mut nonce_bytes = [0u8; 12];
    file.read_exact(&mut nonce_bytes)
        .map_err(|err| format!("Failed to read nonce from file '{}': {}", filename, err))?;
    let nonce = Nonce::from_slice(&nonce_bytes);

    // Read the remaining encrypted data
    let mut cipher_text = Vec::new();
    file.read_to_end(&mut cipher_text)
        .map_err(|err| format!("Failed to read data from file '{}': {}", filename, err))?;

    // Decrypt the data
    let plaintext = cipher
        .decrypt(nonce, cipher_text.as_slice())
        .map_err(|err| format!("Decryption failed: {}", err))?;

    // Convert the decrypted JSON data into a Passmer instance
    let plaintext_str = String::from_utf8(plaintext)
        .map_err(|err| format!("Failed to convert bytes to UTF-8: {}", err))?;
    let db_instance: Passmer = from_json_string(&plaintext_str)
        .map_err(|err| format!("JSON deserialization failed: {}", err))?;

    Ok(db_instance)
}

// Checks if database file exists
pub fn exists(filename: &str) -> bool {
    let path = Path::new(filename);
    let Ok(found) = path.try_exists() else {
        return false;
    };

    found
}

// Creates a new database file
fn create(filename: &str, key: &[u8; 32]) -> Result<(), String> {
    // Check if the file already exists
    if exists(filename) {
        return Ok(()); // If the file exists, return early without errors
    }

    // Open the file for writing
    let mut file = OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open(filename)
        .map_err(|err| format!("Failed to open file '{}': {}", filename, err))?;

    // Create an empty Passmer instance
    let passmer_instance = Passmer { sections: None };

    // Create a nonce initialized to zero bytes
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    // Initialize AES256-GCM cipher
    let cipher = Aes256Gcm::new(GenericArray::from_slice(key));

    // Encrypt an empty data structure
    let empty_data = serde_json::to_string(&passmer_instance)
        .map_err(|err| format!("JSON serialization failed: {}", err))?;
    let cipher_text = cipher
        .encrypt(nonce, empty_data.as_bytes())
        .map_err(|err| format!("Encryption failed: {}", err))?;

    // Write the nonce first, followed by the encrypted data
    file.write_all(&nonce_bytes)
        .and_then(|_| file.write_all(cipher_text.as_slice()))
        .map_err(|err| format!("Failed to write to file '{}': {}", filename, err))?;

    Ok(())
}

// Validate the key of a file
pub fn validate(filename: &str, key: &[u8; 32]) -> bool {
    let result = load(filename, key);
    result.is_ok()
}

// passmer database to json string
fn to_json_string(passmer_struct: Passmer) -> Result<String, String> {
    let json_string = serde_json::to_string(&passmer_struct)
        .map_err(|err| format!("Serialization failed: {}", err))?;
    Ok(json_string)
}

// json string to passmer database
fn from_json_string(json_string: &str) -> Result<Passmer, String> {
    let passmer_struct: Passmer = serde_json::from_str(json_string)
        .map_err(|err| format!("Deserialization failed: {}", err))?;
    Ok(passmer_struct)
}

// Hash a password to a 32-byte key
pub fn as_key(password: &str) -> Vec<u8> {
    let mut hasher = Sha256::default();
    hasher.update(password.as_bytes());
    hasher.finalize().to_vec()
}
