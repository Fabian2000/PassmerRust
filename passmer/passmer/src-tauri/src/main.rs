// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use clipboard::{ClipboardContext, ClipboardProvider};
use code::languages;
use enigo::*;
use named_lock::NamedLock;
use rfd::{MessageDialog, MessageLevel};
use std::process::exit;
use tauri::Manager;

use crate::code::msg_box::msg_box;

mod code;
mod database;
mod tauri_ui;

fn main() {
    let Ok(lock) = NamedLock::create("passmer_start_only_once_lock") else {
        MessageDialog::new()
            .set_title("Error")
            .set_description(languages::get_translation("SINGLE_INSTANCE_LOCK_MSG"))
            .set_level(MessageLevel::Error)
            .show();
        exit(1);
    };

    let Ok(_lock_guard) = lock.try_lock() else {
        MessageDialog::new()
            .set_title("Error")
            .set_description(languages::get_translation("ANOTHER_INSTANCE_RUNNING_MSG"))
            .set_level(MessageLevel::Error)
            .show();
        exit(1);
    };

    let health_state = tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").ok_or("Window not found")?;
            tauri_ui::window::resize_window_for_login(window.clone())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            tauri_ui::window::resize_window_for_login,
            tauri_ui::window::resize_window_for_main,
            tauri_ui::window::hide_window,
            tauri_ui::window::show_window,
            code::login::validate_password,
            code::msg_box::msg_box,
            database::passmer::load_db,
            database::passmer::save_db,
            database::passmer::db_exists,
            code::sidebar::get_sidebar_data,
            code::sidebar::get_sidebar_title_by_id,
            code::login::logout,
            open,
            database::commands::add_new_section,
            database::commands::is_valid_section_name,
            database::commands::delete_section,
            database::commands::rename_section,
            database::commands::duplicate_section,
            code::fields::get_fields,
            code::fields::add_field,
            code::fields::swap_order_ids,
            code::fields::delete_field,
            code::fields::rename_field,
            clipboard_copy,
            code::fields::update_field_value,
            remote_type_text,
            code::fields::secure_password_generator,
            code::update::check_update,
            code::update::download_updater,
            code::update::start_updater,
        ])
        .run(tauri::generate_context!());

    // In case of error, show a message dialog and exit the application
    match health_state {
        Ok(_) => {}
        Err(e) => {
            MessageDialog::new()
                .set_title("Passmer Error")
                .set_description(format!("{}", e))
                .set_level(MessageLevel::Error)
                .show();
            exit(1);
        }
    }

    #[tauri::command]
    fn open(link: String) {
        open::that(link).unwrap();
    }

    #[tauri::command]
    fn clipboard_copy(text: String) {
        let Ok(mut ctx): Result<ClipboardContext, _> = ClipboardProvider::new() else {
            println!("Error creating clipboard context");
            msg_box(
                languages::get_translation("ERR_CLIPBOARD_COPY_MSG"),
                "error",
            );
            return;
        };
        if let Err(result) = ctx.set_contents(text) {
            println!("Error copying to clipboard: {:?}", result);
            msg_box(
                languages::get_translation("ERR_CLIPBOARD_COPY_MSG"),
                "error",
            );
        }
    }

    #[tauri::command]
    fn remote_type_text(text: String) {
        let enigo = Enigo::new(&Settings::default());

        if let Ok(mut enigo) = enigo {
            if let Err(error) = enigo.text(&text) {
                println!("Error typing text: {:?}", error);
                msg_box(languages::get_translation("ERR_TYPING_TEXT_MSG"), "error");
            }
        } else {
            println!("Error creating enigo");
            msg_box(languages::get_translation("ERR_TYPING_TEXT_MSG"), "error");
        }
    }
}
