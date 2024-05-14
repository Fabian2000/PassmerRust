use std::sync::{Arc, Mutex};

use rfd::MessageDialog;
use serde::{Deserialize, Serialize};

use crate::database::db_file;

use super::section::Section;

use lazy_static::lazy_static;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Passmer {
    pub vec: Option<Vec<Section>>,
}

lazy_static! {
    pub static ref GLOBAL_PASSMER_DB: Arc<Mutex<Option<Passmer>>> = Arc::new(Mutex::new(None));
    pub static ref DB_KEY: Arc<Mutex<Option<[u8; 32]>>> = Arc::new(Mutex::new(None));
}

pub fn keep_db_global(passmer: Passmer) {
    let mut db = GLOBAL_PASSMER_DB.lock().unwrap();
    *db = Some(passmer);
}

#[tauri::command]
pub fn load_db(key: String) {
    let Ok(key) = db_file::as_key(&key).try_into() else {
        MessageDialog::new()
            .set_title("Error")
            .set_description("Unable to convert password to key")
            .show();
        return;
    };

    // Save the key for later use (e.g. saving the file)
    let mut db_key = DB_KEY.lock().unwrap();
    *db_key = Some(key);

    let Ok(db) = db_file::load(db_file::DEFAULT_FILENAME, &key) else {
        MessageDialog::new()
            .set_title("Error")
            .set_description("Unable to load database")
            .show();
        return;
    };

    // Attach the database to the global variable
    keep_db_global(db);
}

#[tauri::command]
pub fn save_db() {
    let db = GLOBAL_PASSMER_DB.lock().unwrap();
    let db = db.as_ref();
    let key = DB_KEY.lock().unwrap();
    let key = key.as_ref();

    if db.is_none() {
        MessageDialog::new()
            .set_title("Error")
            .set_description("No database found")
            .show();
        return;
    }

    if key.is_none() {
        MessageDialog::new()
            .set_title("Error")
            .set_description("No key found")
            .show();
        return;
    }

    let Ok(_) = db_file::save(db_file::DEFAULT_FILENAME, key.unwrap(), db.unwrap().clone()) else {
        MessageDialog::new()
            .set_title("Error")
            .set_description("Unable to save database")
            .show();
        return;
    };
}

#[tauri::command]
pub fn db_exists() -> bool {
    db_file::exists(db_file::DEFAULT_FILENAME)
}
