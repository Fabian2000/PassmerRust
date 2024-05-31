use serde::{Deserialize, Serialize};

use super::msg_box::msg_box;

#[tauri::command(async)]
pub async fn check_update() -> Option<UpdateInfo> {
    let client = reqwest::Client::new();

    // Fetch the response and handle errors
    let response = match client
        .get("https://files.fabi-sc.de/main_website/projects/passmer/version.json")
        .send()
        .await
    {
        Ok(res) => res,
        Err(err) => {
            msg_box(format!("Error checking for updates: {}", err), "error");
            return None;
        }
    };

    // Check response status and handle errors
    if !response.status().is_success() {
        msg_box("Server responded with an error".to_string(), "error");
        return None;
    }

    // Get the response body and handle errors
    let bytes = match response.bytes().await {
        Ok(bytes) => bytes,
        Err(err) => {
            msg_box(
                format!("Error reading update information: {}", err),
                "error",
            );
            return None;
        }
    };

    // Parse the JSON and handle errors
    match serde_json::from_slice::<UpdateInfo>(&bytes) {
        Ok(update_info) => Some(update_info),
        Err(err) => {
            msg_box(
                format!("Error parsing update information: {}", err),
                "error",
            );
            None
        }
    }
}

#[tauri::command(async)]
pub async fn download_updater() {
    let path_of_current_executable = std::env::current_exe().unwrap();
    let file_name = "passmer_updater.exe";
    let path_of_updater = path_of_current_executable.with_file_name(file_name);

    // Download the updater
    let client = reqwest::Client::new();
    let response = match client
        .get("https://files.fabi-sc.de/main_website/projects/passmer/passmer_updater.exe")
        .send()
        .await
    {
        Ok(res) => res,
        Err(err) => {
            msg_box(format!("Error downloading updater: {}", err), "error");
            return;
        }
    };

    // Check response status and handle errors
    if !response.status().is_success() {
        msg_box("Server responded with an error".to_string(), "error");
        return;
    }

    // Get the response body and handle errors
    let bytes = match response.bytes().await {
        Ok(bytes) => bytes,
        Err(err) => {
            msg_box(format!("Error reading updater: {}", err), "error");
            return;
        }
    };

    // Write the updater to disk and handle errors
    match std::fs::write(path_of_updater, bytes) {
        Ok(_) => {}
        Err(err) => {
            msg_box(format!("Error writing updater to disk: {}", err), "error");
        }
    }
}

fn close_app() {
    std::process::exit(0);
}

#[tauri::command]
pub fn start_updater() {
    let path_of_current_executable = std::env::current_exe().unwrap();
    let file_name = "passmer_updater.exe";
    let path_of_updater = path_of_current_executable.with_file_name(file_name);

    // Start the updater
    match std::process::Command::new(path_of_updater).spawn() {
        Ok(_) => close_app(),
        Err(err) => {
            msg_box(format!("Error starting updater: {}", err), "error");
        }
    }
}

#[derive(Serialize, Deserialize)]
pub struct UpdateInfo {
    pub latest_version: String,
    pub version: Vec<Version>,
}

#[derive(Serialize, Deserialize)]
pub struct Version {
    pub version: String,
    pub changelog: String,
}
