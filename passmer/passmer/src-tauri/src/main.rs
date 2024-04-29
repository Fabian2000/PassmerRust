// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rfd::MessageDialog;
use std::process::exit;

fn main() {
    let health_state = tauri::Builder::default().run(tauri::generate_context!());

    // In case of error, show a message dialog and exit the application
    match health_state {
        Ok(_) => {}
        Err(e) => {
            MessageDialog::new()
                .set_title("Error")
                .set_description(format!("{}", e))
                .set_level(rfd::MessageLevel::Error)
                .show();
            exit(1);
        }
    }
}
