use aes_gcm::{Aes256Gcm, Nonce, aead::{Aead, NewAead}};
use pbkdf2::pbkdf2;
use hmac::Hmac;
use sha2::Sha256;
use std::error::Error;

struct Aes256 {
    key: [u8; 32],
    nonce: Nonce
}

impl Aes256 {
    pub fn new(password: &str, username: &str) -> Self {
        let salt = username; // Username as Salt
        let mut key = [0u8; 32];
        // Combine password and salt
        let data = [password, salt].concat();

        // PBKDF2 for key generation
        pbkdf2::<Hmac<Sha256>>(data.as_bytes(), salt.as_bytes(), 100_000, &mut key);

        let nonce = Nonce::generate();
        Self { key, nonce }
    }

    pub fn encrypt(&self, data: &str) -> Result<String, Box<dyn Error>> {
        let cipher = Aes256Gcm::new_from_slice(&self.key)?;
        let encrypted_data = cipher.encrypt(&self.nonce, data.as_bytes())?;
        Ok(base64::encode(encrypted_data))
    }

    pub fn decrypt(&self, data: &str) -> Result<String, Box<dyn Error>> {
        let cipher = Aes256Gcm::new_from_slice(&self.key)?;
        let decrypted_data = cipher.decrypt(&self.nonce, &base64::decode(data)?)?;
        Ok(String::from_utf8(decrypted_data)?)
    }
}