use super::super::database::db_file;

#[tauri::command]
pub fn validate_password(password: String) -> bool {
    let key = db_file::as_key(&password);
    let Ok(key) = key.try_into() else {
        return false;
    };
    db_file::validate(db_file::DEFAULT_FILENAME, &key)
}
