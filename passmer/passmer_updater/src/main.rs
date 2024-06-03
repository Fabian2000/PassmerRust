use reqwest::get;
use std::fs::{remove_file, File};
use std::io::{copy, BufReader};
use std::path::Path;
use std::{thread::sleep, time::Duration};
use tokio::task;
use zip::ZipArchive;

#[tokio::main]
async fn main() {
    println!("┌─┐┌─┐┌─┐┌─┐┌┬┐┌─┐┬─┐  ┬ ┬┌─┐┌┬┐┌─┐┌┬┐┌─┐┬─┐");
    println!("├─┘├─┤└─┐└─┐│││├┤ ├┬┘  │ │├─┘ ││├─┤ │ ├┤ ├┬┘");
    println!("┴  ┴ ┴└─┘└─┘┴ ┴└─┘┴└─  └─┘┴  ─┴┘┴ ┴ ┴ └─┘┴└─");

    sleep(Duration::from_secs(1));

    let current_version = env!("CARGO_PKG_VERSION");
    println!("Current Updater Passmer Version: {}", current_version);

    sleep(Duration::from_secs(1));

    println!("Waiting for 5 seconds...");

    sleep(Duration::from_secs(5));

    println!("Downloading Update...");

    let current_system = std::env::consts::OS;
    let current_system = match current_system {
        //"macos" => "macos",
        "windows" => "windows",
        "linux" => "linux",
        _ => {
            eprintln!("Unsupported Operating System: {}", current_system);
            return;
        }
    };

    let zip_name = format!("passmer-{}.zip", current_system);

    let url = format!(
        "https://files.fabi-sc.de/main_website/projects/passmer/{}",
        zip_name
    );
    let output_path = Path::new(&zip_name);

    match download_update(&url, output_path).await {
        Ok(_) => println!("Update downloaded successfully!"),
        Err(e) => {
            eprintln!("Failed to download the update: {}", e);
            return;
        }
    }

    println!("Unzipping Update...");
    let file_path = output_path.to_str().unwrap().to_string();
    match unzip_update(file_path, "./".to_string()).await {
        Ok(_) => println!("Update unzipped successfully!"),
        Err(e) => {
            eprintln!("Failed to unzip the update: {}", e);
            return;
        }
    }

    println!("Cleaning up...");
    match remove_file(output_path) {
        Ok(_) => println!("Clean up completed successfully!"),
        Err(e) => {
            eprintln!("Failed to clean up: {}", e);
            return;
        }
    }
    println!("Update completed successfully!");
}

async fn download_update(url: &str, output_path: &Path) -> Result<(), String> {
    // Send a GET request to the specified URL
    let Ok(response) = get(url).await else {
        return Err(format!("Failed to send a GET request to {}", url));
    };

    // Create or open the output file
    let mut dest = File::create(output_path).map_err(|e| e.to_string())?;

    // Copy the content from the response to the output file
    copy(
        &mut response.bytes().await.map_err(|e| e.to_string())?.as_ref(),
        &mut dest,
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

async fn unzip_update(input: String, output: String) -> Result<(), String> {
    task::spawn_blocking(move || {
        let file = File::open(input).map_err(|e| e.to_string())?;
        let mut archive = ZipArchive::new(BufReader::new(file)).map_err(|e| e.to_string())?;

        for i in 0..archive.len() {
            let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
            let outpath = match file.enclosed_name() {
                Some(path) => Path::new(&output).join(path),
                None => continue,
            };

            if (*file.name()).ends_with('/') {
                std::fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
            } else {
                if let Some(p) = outpath.parent() {
                    if !p.exists() {
                        std::fs::create_dir_all(p).map_err(|e| e.to_string())?;
                    }
                }
                let mut outfile = File::create(&outpath).map_err(|e| e.to_string())?;
                std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
            }
        }
        Ok(())
    })
    .await
    .map_err(|e| e.to_string())?
}

/*

ACII Art
┌─┐┌─┐┌─┐┌─┐┌┬┐┌─┐┬─┐  ┬ ┬┌─┐┌┬┐┌─┐┌┬┐┌─┐┬─┐
├─┘├─┤└─┐└─┐│││├┤ ├┬┘  │ │├─┘ ││├─┤ │ ├┤ ├┬┘
┴  ┴ ┴└─┘└─┘┴ ┴└─┘┴└─  └─┘┴  ─┴┘┴ ┴ ┴ └─┘┴└─

*/
