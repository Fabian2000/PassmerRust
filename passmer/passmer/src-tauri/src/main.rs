// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rfd::{MessageDialog, MessageLevel};
use std::process::exit;
use tauri::Manager;

mod code;
mod database;
mod tauri_ui;

fn main() {
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
        ])
        .run(tauri::generate_context!());

    // In case of error, show a message dialog and exit the application
    match health_state {
        Ok(_) => {}
        Err(e) => {
            MessageDialog::new()
                .set_title("Error")
                .set_description(format!("{}", e))
                .set_level(MessageLevel::Error)
                .show();
            exit(1);
        }
    }
}
