use crate::database::passmer;

use super::super::database::db_file;

#[tauri::command]
pub fn validate_password(password: String) -> bool {
    let key = db_file::as_key(&password);
    let Ok(key) = key.try_into() else {
        return false;
    };
    db_file::validate(&db_file::default_filepath(), &key)
}

#[tauri::command]
pub fn logout() {
    let mut db = passmer::GLOBAL_PASSMER_DB.lock().unwrap();
    let mut key = passmer::DB_KEY.lock().unwrap();
    *db = None;
    *key = None;
}
