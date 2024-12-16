use std::sync::MutexGuard;

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
    // Clean up the key
    clean_key(&mut key);
    *key = None;
}

// This function is called when the window is closed or destroyed.
// It will force logout the user and clean up the memory, ensuring no data is left in memory.
// This is important for security reasons.
// The normal logout is still working for the user to logout manually, but if the window is closed, this function must be called.
// Closing a window in tauri does not call the Drop trait of the Field struct, so we need to manually call it.
pub fn force_logout() {
    println!("Force logout called");
    let mut db = passmer::GLOBAL_PASSMER_DB.lock().unwrap();

    if let Some(ref mut db) = *db {
        if let Some(ref mut sections) = db.sections {
            for section in sections.iter_mut() {
                if let Some(fields) = section.fields.as_mut() {
                    for field in fields.iter_mut() {
                        // Manually drop the field to ensure it's removed from memory
                        // Important, if windows is closed. Rust will not drop on close
                        unsafe {
                            std::mem::drop(std::ptr::read(field));
                        }
                    }
                }
            }
        }
    }

    *db = None;
    let mut key = passmer::DB_KEY.lock().unwrap();
    // Clean up the key
    clean_key(&mut key);
    *key = None;
}

fn clean_key(key: &mut MutexGuard<'_, Option<[u8; 32]>>) {
    if let Some(key) = key.as_mut() {
        for byte in key.iter_mut() {
            *byte = 0;
        }
    }
}
