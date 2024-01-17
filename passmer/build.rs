use std::env;
use std::fs::{copy, File, read_dir, remove_file, create_dir_all};
use std::path::Path;
use std::time::{SystemTime, UNIX_EPOCH};

fn main() {
    //println!("cargo:rerun-if-env-changed=ALWAYS_RUN_BUILD_SCRIPT");
    let start = SystemTime::now();
    let since_the_epoch = start.duration_since(UNIX_EPOCH).unwrap();
    let trash_dir = "trash";
    create_dir_all(trash_dir).unwrap();
    let filename = format!("{}/{}.tmp", trash_dir, since_the_epoch.as_secs());
    clean_trash_folder();
    File::create(&filename).unwrap();

    // This will make the build script re-run if the file changes.
    println!("cargo:rerun-if-changed={}", filename);
    //println!("cargo:rerun-if-changed=libs/linux/libsqlite3.so");
    //println!("cargo:rerun-if-changed=libs/macos/libsqlite3.dylib");
    let out_dir = env::var("OUT_DIR").unwrap();
    let target_path = Path::new(&out_dir).parent().unwrap().parent().unwrap().parent().unwrap();

    println!("Sqlite3 from path {} to path {:?}", out_dir, target_path);
    if cfg!(target_os = "windows") {
        copy("libs/windows/sqlite3.dll", target_path.join("sqlite3.dll")).unwrap();
    } 
    //else if cfg!(target_os = "linux") {
    //    copy("libs/linux/libsqlite3.so", target_path.join("libsqlite3.so")).unwrap();
    //} else if cfg!(target_os = "macos") {
    //    copy("libs/macos/libsqlite3.dylib", target_path.join("libsqlite3.dylib")).unwrap();
    //} else {
    //    panic!("Unsupported OS");
    //}
}

fn clean_trash_folder() {
    let dir_path = "trash";
    if let Ok(entries) = read_dir(dir_path) {
        for entry in entries {
            if let Ok(entry) = entry {
                // `entry` is a `DirEntry`.
                let path = entry.path();
                if path.is_file() {
                    remove_file(path).unwrap();
                }
            }
        }
    }
}