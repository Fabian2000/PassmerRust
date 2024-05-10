use rfd::{MessageDialog, MessageLevel};

#[tauri::command]
pub fn msg_box(text: String, level: &str) {
    MessageDialog::new()
                .set_title("Passmer - PasswordManager")
                .set_description(format!("{}", text))
                .set_level(match level {
                    "info" => MessageLevel::Info,
                    "warning" => MessageLevel::Warning,
                    "error" => MessageLevel::Error,
                    _ => MessageLevel::Info,
                })
                .show();
}