use serde::{Deserialize, Serialize};

use super::{languages, msg_box::msg_box};

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
            msg_box(
                format!(
                    "{}: {}",
                    languages::get_translation("ERR_CHECK_UPDATES_MSG"),
                    err
                ),
                "error",
            );
            return None;
        }
    };

    // Check response status and handle errors
    if !response.status().is_success() {
        msg_box(
            languages::get_translation("SERVER_RESPOND_ERR_MSG"),
            "error",
        );
        return None;
    }

    // Get the response body and handle errors
    let bytes = match response.bytes().await {
        Ok(bytes) => bytes,
        Err(err) => {
            msg_box(
                format!(
                    "{}: {}",
                    languages::get_translation("ERR_READ_UPDATE_INFO_MSG"),
                    err
                ),
                "error",
            );
            return None;
        }
    };

    // Parse the JSON and handle errors
    let update_info = match serde_json::from_slice::<UpdateInfo>(&bytes) {
        Ok(update_info) => update_info,
        Err(err) => {
            msg_box(
                format!(
                    "{}: {}",
                    languages::get_translation("ERR_PARSE_UPDATE_INFO_MSG"),
                    err
                ),
                "error",
            );
            return None;
        }
    };

    let current_version = env!("CARGO_PKG_VERSION");
    let latest_version = update_info.latest_version.as_str();

    if current_version == latest_version {
        msg_box(
            languages::get_translation("NO_UPDATE_AVAILABLE_MSG"),
            "info",
        );
        None
    } else {
        Some(update_info)
    }
}

#[tauri::command(async)]
pub async fn download_updater() {
    // May not work on Linux
    if cfg!(not(target_os = "windows")) {
        msg_box(
            languages::get_translation("ERR_UPDATE_NOT_SUPPORTED_MSG"),
            "info",
        );
        return;
    }

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
            msg_box(
                format!(
                    "{}: {}",
                    languages::get_translation("ERR_DOWNLOAD_UPDATER_MSG"),
                    err
                ),
                "error",
            );
            return;
        }
    };

    // Check response status and handle errors
    if !response.status().is_success() {
        msg_box(
            languages::get_translation("SERVER_RESPOND_ERR_MSG"),
            "error",
        );
        return;
    }

    // Get the response body and handle errors
    let bytes = match response.bytes().await {
        Ok(bytes) => bytes,
        Err(err) => {
            msg_box(
                format!(
                    "{}: {}",
                    languages::get_translation("ERR_READ_UPDATER_MSG"),
                    err
                ),
                "error",
            );
            return;
        }
    };

    // Write the updater to disk and handle errors
    match std::fs::write(path_of_updater, bytes) {
        Ok(_) => {}
        Err(err) => {
            msg_box(
                format!(
                    "{}: {}",
                    languages::get_translation("ERR_WRITE_UPDATER_MSG"),
                    err
                ),
                "error",
            );
        }
    }
}

fn close_app() {
    std::process::exit(0);
}

#[tauri::command]
pub fn start_updater() {
    // May not work on Linux
    if cfg!(not(target_os = "windows")) {
        return;
    }

    let path_of_current_executable = std::env::current_exe().unwrap();
    let file_name = "passmer_updater.exe";
    let path_of_updater = path_of_current_executable.with_file_name(file_name);

    // Start the updater
    match std::process::Command::new(path_of_updater).spawn() {
        Ok(_) => close_app(),
        Err(err) => {
            msg_box(
                format!(
                    "{}: {}",
                    languages::get_translation("ERR_START_UPDATER_MSG"),
                    err
                ),
                "error",
            );
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
