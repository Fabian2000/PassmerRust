use crate::code::msg_box;

use super::{
    passmer::{self, GLOBAL_PASSMER_DB},
    section::Section,
};

#[tauri::command]
pub fn add_new_section(section_name: String) {
    {
        if !is_valid_section_name(&section_name, false) {
            msg_box::msg_box(
                "Section name must be between 2 and 28 characters long and contain only alphanumeric characters, spaces, and the following special characters: _ - . /".to_string(),
                "error",
            );
            return;
        }

        println!("Adding new section: {}", section_name);
        let mut db_guard = GLOBAL_PASSMER_DB.lock().unwrap();
        println!("DB Guard: ENDE");

        let Some(mut db) = (*db_guard).clone() else {
            eprintln!("Database not available");
            return;
        };

        println!("Database available");

        let mut section_vectors = match db.sections {
            Some(sections) => {
                // If section with the same name already exists, return
                if sections
                    .iter()
                    .any(|section| section.section_title == section_name)
                {
                    msg_box::msg_box(
                        "Section with the same name already exists".to_string(),
                        "error",
                    );
                    return;
                }

                sections
            }
            None => Vec::new(),
        };

        let mut highest_id = -1;
        if !section_vectors.is_empty() {
            highest_id = section_vectors
                .iter()
                .max_by_key(|section| section.section_id)
                .unwrap()
                .section_id;
        }

        println!("Highest ID: {}", highest_id);

        let new_section = Section {
            section_id: highest_id + 1,
            section_title: section_name,
            fields: None,
        };

        section_vectors.push(new_section);
        db.sections = Some(section_vectors);

        *db_guard = Some(db);

        println!("Saving DB now");
    }
    passmer::save_db();
}

#[tauri::command]
pub fn is_valid_section_name(input: &str, bypass_min_len: bool) -> bool {
    let input = input.trim();

    if !bypass_min_len && input.len() < 2 {
        return false;
    }

    if input.len() > 28 {
        return false;
    }

    #[allow(clippy::collapsible_if)]
    if !bypass_min_len {
        if !input.chars().any(|c| c.is_alphanumeric()) {
            return false;
        }
    }

    if !bypass_min_len {
        input.chars().all(|c| {
            c.is_alphanumeric() || c == ' ' || c == '_' || c == '-' || c == '.' || c == '/'
        })
    } else {
        input.chars().all(|c| {
            c.is_alphanumeric() || c == ' ' || c == '_' || c == '-' || c == '.' || c == '/'
        }) || input.is_empty()
    }
}

#[tauri::command]
pub fn delete_section(section_id: i64) {
    println!("Deleting section: {}", section_id);
    {
        let mut db_guard = GLOBAL_PASSMER_DB.lock().unwrap();
        let Some(mut db) = (*db_guard).clone() else {
            println!("Database not available");
            return;
        };

        let mut section_vectors = match db.sections {
            Some(sections) => sections,
            None => {
                println!("Sections not available");
                msg_box::msg_box("Sections not available".to_string(), "error");
                return;
            }
        };

        let section_index = section_vectors
            .iter()
            .position(|section| section.section_id == section_id);

        if let Some(index) = section_index {
            println!("Deleting section at index: {}", index);
            section_vectors.remove(index);
            db.sections = Some(section_vectors);
            *db_guard = Some(db);
        } else {
            println!("Section index not found");
        }
    }

    passmer::save_db();
}

#[tauri::command]
pub fn rename_section(section_id: i64, new_name: String) {
    {
        if !is_valid_section_name(&new_name, false) {
            msg_box::msg_box(
                "Section name must be between 2 and 28 characters long and contain only alphanumeric characters, spaces, and the following special characters: _ - . /".to_string(),
                "error",
            );
            return;
        }

        let mut db_guard = GLOBAL_PASSMER_DB.lock().unwrap();

        let Some(mut db) = (*db_guard).clone() else {
            eprintln!("Database not available");
            return;
        };

        let mut section_vectors = match db.sections {
            Some(sections) => sections,
            None => {
                eprintln!("Sections not available");
                msg_box::msg_box("Sections not available".to_string(), "error");
                return;
            }
        };

        let section_index = section_vectors
            .iter()
            .position(|section| section.section_id == section_id);

        // If section with the same name already exists, return
        if section_vectors
            .iter()
            .any(|section| section.section_title == new_name)
        {
            msg_box::msg_box(
                "Section with the same name already exists".to_string(),
                "error",
            );
            return;
        }

        if let Some(index) = section_index {
            section_vectors[index].section_title = new_name;
            db.sections = Some(section_vectors);
            *db_guard = Some(db);
        }
    }

    passmer::save_db();
}

#[tauri::command]
pub fn duplicate_section(section_id: i64, duplication_name: String) {
    {
        if !is_valid_section_name(&duplication_name, false) {
            msg_box::msg_box(
                "Section name must be between 2 and 28 characters long and contain only alphanumeric characters, spaces, and the following special characters: _ - . /".to_string(),
                "error",
            );
            return;
        }

        let mut db_guard = GLOBAL_PASSMER_DB.lock().unwrap();

        let Some(mut db) = (*db_guard).clone() else {
            eprintln!("Database not available");
            return;
        };

        let mut section_vectors = match db.sections {
            Some(sections) => sections,
            None => {
                eprintln!("Sections not available");
                msg_box::msg_box("Sections not available".to_string(), "error");
                return;
            }
        };

        let section_index = section_vectors
            .iter()
            .position(|section| section.section_id == section_id);

        // If section with the same name already exists, return
        if section_vectors
            .iter()
            .any(|section| section.section_title == duplication_name)
        {
            msg_box::msg_box(
                "Section with the same name already exists".to_string(),
                "error",
            );
            return;
        }

        if let Some(index) = section_index {
            let section_to_duplicate = section_vectors[index].clone();
            let mut highest_id = -1;
            if !section_vectors.is_empty() {
                highest_id = section_vectors
                    .iter()
                    .max_by_key(|section| section.section_id)
                    .unwrap()
                    .section_id;
            }

            let new_section = Section {
                section_id: highest_id + 1,
                section_title: duplication_name,
                fields: section_to_duplicate.fields,
            };

            section_vectors.push(new_section);
            db.sections = Some(section_vectors);
            *db_guard = Some(db);
        }
    }

    passmer::save_db();
}
