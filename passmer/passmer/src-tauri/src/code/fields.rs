use crate::{
    code::{languages, msg_box::msg_box},
    database::{
        field::{Field, FieldTypes},
        passmer::{self, GLOBAL_PASSMER_DB},
    },
};

use rand::Rng;

#[tauri::command]
pub fn get_fields(section_id: i64) -> Vec<Field> {
    let db_guard = GLOBAL_PASSMER_DB.lock().unwrap();
    //println!("After Mutex");

    let Some(db) = db_guard.as_ref() else {
        println!("Database not available");
        return vec![];
    };

    let Some(sections) = db.sections.as_ref() else {
        println!("Sections not available");
        return vec![];
    };

    //println!("Finding section: {}", section_id);
    let found_section = sections.iter().find(|s| s.section_id == section_id);

    if let Some(section) = found_section {
        let Some(fields) = section.fields.clone() else {
            println!("Fields not available");
            return vec![];
        };
        fields
    } else {
        println!("Section not found");
        vec![]
    }
}

#[tauri::command]
pub fn add_field(section_id: i64, field_title: String, field_value: String, field_type: String) {
    {
        println!("Adding field: {}", field_title);

        let mut db_guard = GLOBAL_PASSMER_DB.lock().unwrap();
        //println!("After Mutex");

        let Some(mut db) = (*db_guard).clone() else {
            println!("Database not available");
            return;
        };

        let mut section_vectors = match db.sections {
            Some(sections) => sections,
            None => {
                println!("Sections not available");
                return;
            }
        };

        let section_index = section_vectors
            .iter()
            .position(|section| section.section_id == section_id);

        if let Some(index) = section_index {
            let field_order = section_vectors[index]
                .fields
                .as_ref()
                .map_or(0, |f| f.len() as i32);

            let field_type = match field_type.as_str() {
                "Text" => FieldTypes::Text,
                "Password" => FieldTypes::Password,
                "Email" => FieldTypes::Email,
                "Url" => FieldTypes::Url,
                "Phone" => FieldTypes::Phone,
                "Number" => FieldTypes::Number,
                "Date" => FieldTypes::Date,
                "Time" => FieldTypes::Time,
                "DateTime" => FieldTypes::DateTime,
                "Notes" => FieldTypes::Notes,
                "Split" => FieldTypes::Split,
                _ => FieldTypes::Text,
            };

            let highest_field_id = section_vectors[index].fields.as_ref().map_or(-1, |f| {
                f.iter().map(|field| field.field_id).max().unwrap_or(-1)
            });

            let new_field = Field {
                field_id: highest_field_id + 1,
                field_title,
                field_type,
                field_value,
                field_order,
            };

            if let Some(fields) = section_vectors[index].fields.as_mut() {
                fields.push(new_field);
            } else {
                section_vectors[index].fields = Some(vec![new_field]);
            }

            db.sections = Some(section_vectors);
            *db_guard = Some(db);
        }
    }

    passmer::save_db();
}

#[tauri::command]
pub fn swap_order_ids(section_id: i64, field_id_1: i64, field_id_2: i64) {
    {
        let mut db_guard = GLOBAL_PASSMER_DB.lock().unwrap();

        let Some(mut db) = (*db_guard).clone() else {
            println!("Database not available");
            //msg_box("Unable to get the database".to_string(), "error");
            msg_box(languages::get_translation("UNABLE_GET_DB_MSG"), "error");
            return;
        };

        let mut section_vectors = match db.sections {
            Some(sections) => sections,
            None => {
                println!("Sections not available");
                msg_box(
                    languages::get_translation("SECTIONS_NOT_AVAILABLE_MSG"),
                    "error",
                );
                return;
            }
        };

        let section_index = section_vectors
            .iter()
            .position(|section| section.section_id == section_id);

        if let Some(index) = section_index {
            let fields = match section_vectors[index].fields.as_mut() {
                Some(f) => f,
                None => {
                    println!("Fields not available");
                    // msg_box("Fields not available".to_string(), "error");
                    msg_box(
                        languages::get_translation("FIELDS_NOT_AVAILABLE_MSG"),
                        "error",
                    );
                    return;
                }
            };

            let field_index_1 = fields.iter().position(|f| f.field_id == field_id_1);
            let field_index_2 = fields.iter().position(|f| f.field_id == field_id_2);

            if let (Some(index_1), Some(index_2)) = (field_index_1, field_index_2) {
                fields.swap(index_1, index_2);
            }
        }

        db.sections = Some(section_vectors);
        *db_guard = Some(db);
    }

    passmer::save_db();
}

#[tauri::command]
pub fn delete_field(section_id: i64, field_id: i64) {
    {
        let mut db_guard = GLOBAL_PASSMER_DB.lock().unwrap();

        let Some(mut db) = (*db_guard).clone() else {
            println!("Database not available");
            //msg_box("Unable to get the database".to_string(), "error");
            msg_box(languages::get_translation("UNABLE_GET_DB_MSG"), "error");
            return;
        };

        let mut section_vectors = match db.sections {
            Some(sections) => sections,
            None => {
                println!("Sections not available");
                msg_box(
                    languages::get_translation("SECTIONS_NOT_AVAILABLE_MSG"),
                    "error",
                );
                return;
            }
        };

        let section_index = section_vectors
            .iter()
            .position(|section| section.section_id == section_id);

        if let Some(index) = section_index {
            let fields = match section_vectors[index].fields.as_mut() {
                Some(f) => f,
                None => {
                    println!("Fields not available");
                    msg_box(
                        languages::get_translation("FIELDS_NOT_AVAILABLE_MSG"),
                        "error",
                    );
                    return;
                }
            };

            let field_index = fields.iter().position(|f| f.field_id == field_id);

            if let Some(index) = field_index {
                fields.remove(index);
            }
        }

        db.sections = Some(section_vectors);
        *db_guard = Some(db);
    }

    passmer::save_db();
}

#[tauri::command]
pub fn rename_field(section_id: i64, field_id: i64, new_title: String) {
    {
        let mut db_guard = GLOBAL_PASSMER_DB.lock().unwrap();

        let Some(mut db) = (*db_guard).clone() else {
            println!("Database not available");
            msg_box(languages::get_translation("UNABLE_GET_DB_MSG"), "error");
            return;
        };

        let mut section_vectors = match db.sections {
            Some(sections) => sections,
            None => {
                println!("Sections not available");
                msg_box(
                    languages::get_translation("SECTIONS_NOT_AVAILABLE_MSG"),
                    "error",
                );
                return;
            }
        };

        let section_index = section_vectors
            .iter()
            .position(|section| section.section_id == section_id);

        if let Some(index) = section_index {
            let fields = match section_vectors[index].fields.as_mut() {
                Some(f) => f,
                None => {
                    println!("Fields not available");
                    msg_box(
                        languages::get_translation("FIELDS_NOT_AVAILABLE_MSG"),
                        "error",
                    );
                    return;
                }
            };

            let field_index = fields.iter().position(|f| f.field_id == field_id);

            if let Some(index) = field_index {
                fields[index].field_title = new_title;
            }
        }

        db.sections = Some(section_vectors);
        *db_guard = Some(db);
    }

    passmer::save_db();
}

#[tauri::command]
pub fn update_field_value(section_id: i64, field_id: i64, new_value: String) {
    {
        let mut db_guard = GLOBAL_PASSMER_DB.lock().unwrap();

        let Some(mut db) = (*db_guard).clone() else {
            println!("Database not available");
            msg_box(languages::get_translation("UNABLE_GET_DB_MSG"), "error");
            return;
        };

        let mut section_vectors = match db.sections {
            Some(sections) => sections,
            None => {
                println!("Sections not available");
                msg_box(
                    languages::get_translation("SECTIONS_NOT_AVAILABLE_MSG"),
                    "error",
                );
                return;
            }
        };

        let section_index = section_vectors
            .iter()
            .position(|section| section.section_id == section_id);

        if let Some(index) = section_index {
            let fields = match section_vectors[index].fields.as_mut() {
                Some(f) => f,
                None => {
                    println!("Fields not available");
                    msg_box(
                        languages::get_translation("FIELDS_NOT_AVAILABLE_MSG"),
                        "error",
                    );
                    return;
                }
            };

            let field_index = fields.iter().position(|f| f.field_id == field_id);

            if let Some(index) = field_index {
                fields[index].field_value = new_value;
            }
        }

        db.sections = Some(section_vectors);
        *db_guard = Some(db);
    }

    passmer::save_db();
}

#[tauri::command]
pub fn secure_password_generator() -> String {
    // minimum length of 40 characters
    // at least 1 uppercase letter
    // at least 1 lowercase letter
    // at least 1 number
    // at least 1 special character
    // no spaces
    // random cryptographically secure password

    let mut password = String::new();

    loop {
        for _ in 0..40 {
            password.push(generate_random_char());
        }

        if validate_generated_password(&password) {
            break;
        } else {
            password.clear();
        }
    }

    password
}

fn generate_random_char() -> char {
    let mut rng = rand::thread_rng();
    let random_char = match rng.gen_range(0..4) {
        0 => rng.gen_range(48..58),  // 0-9
        1 => rng.gen_range(65..91),  // A-Z
        2 => rng.gen_range(97..123), // a-z
        3 => match rng.gen_range(0..4) {
            0 => rng.gen_range(33..48),   // !-/
            1 => rng.gen_range(58..65),   // :-@
            2 => rng.gen_range(91..97),   // [-`
            3 => rng.gen_range(123..127), // {-~
            _ => 32,                      // Leerzeichen als Default-Wert
        },
        _ => 32, // Leerzeichen als Default-Wert
    };

    std::char::from_u32(random_char).unwrap_or('0')
}

fn validate_generated_password(password: &str) -> bool {
    let mut has_uppercase = false;
    let mut has_lowercase = false;
    let mut has_number = false;
    let mut has_special = false;

    for c in password.chars() {
        if c.is_ascii_uppercase() {
            has_uppercase = true;
        } else if c.is_ascii_lowercase() {
            has_lowercase = true;
        } else if c.is_ascii_digit() {
            has_number = true;
        } else if c.is_ascii_punctuation() {
            has_special = true;
        }
    }

    has_uppercase && has_lowercase && has_number && has_special
}
