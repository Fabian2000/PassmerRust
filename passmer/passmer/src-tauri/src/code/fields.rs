use crate::{
    code::msg_box::msg_box,
    database::{
        field::{Field, FieldTypes},
        passmer::{self, GLOBAL_PASSMER_DB},
    },
};

#[tauri::command]
pub fn get_fields(section_id: i64) -> Vec<Field> {
    let db_guard = GLOBAL_PASSMER_DB.lock().unwrap();
    println!("After Mutex");

    let Some(db) = db_guard.as_ref() else {
        println!("Database not available");
        return vec![];
    };

    let Some(sections) = db.sections.as_ref() else {
        println!("Sections not available");
        return vec![];
    };

    println!("Finding section: {}", section_id);
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
        println!("After Mutex");

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
            msg_box("Unable to get the database".to_string(), "error");
            return;
        };

        let mut section_vectors = match db.sections {
            Some(sections) => sections,
            None => {
                println!("Sections not available");
                msg_box("Sections not available".to_string(), "error");
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
                    msg_box("Fields not available".to_string(), "error");
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
            msg_box("Unable to get the database".to_string(), "error");
            return;
        };

        let mut section_vectors = match db.sections {
            Some(sections) => sections,
            None => {
                println!("Sections not available");
                msg_box("Sections not available".to_string(), "error");
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
                    msg_box("Fields not available".to_string(), "error");
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
            msg_box("Unable to get the database".to_string(), "error");
            return;
        };

        let mut section_vectors = match db.sections {
            Some(sections) => sections,
            None => {
                println!("Sections not available");
                msg_box("Sections not available".to_string(), "error");
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
                    msg_box("Fields not available".to_string(), "error");
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
            msg_box("Unable to get the database".to_string(), "error");
            return;
        };

        let mut section_vectors = match db.sections {
            Some(sections) => sections,
            None => {
                println!("Sections not available");
                msg_box("Sections not available".to_string(), "error");
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
                    msg_box("Fields not available".to_string(), "error");
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
