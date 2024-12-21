use lazy_static::lazy_static;
use std::fs::File;
use std::io::BufRead;
use std::sync::{Arc, Mutex};
use std::{collections::HashMap, io::BufReader};

use super::msg_box::msg_box;

pub fn get_languages() -> HashMap<String, String> {
    println!("Getting languages");
    let mut languages = HashMap::new();

    let mut executable_path = std::env::current_exe().unwrap();
    executable_path.pop();
    let path_of_languages = executable_path.join("languages");

    let language_files = match std::fs::read_dir(path_of_languages) {
        Ok(files) => files,
        Err(_) => {
            msg_box("Error reading languages directory".to_string(), "error");
            std::process::exit(1);
        }
    };

    for file in language_files {
        let file = file.unwrap();
        let path = file.path();
        let extension = path.extension().unwrap();
        let extension = extension.to_str().unwrap();
        if extension == "pmerlng" {
            let language_val = path.file_stem().unwrap().to_str().unwrap();
            let Ok(file) = File::open(path.clone()) else {
                msg_box(
                    format!("Error reading language file: {}", language_val),
                    "error",
                );
                continue;
            };

            let mut bufreader = BufReader::new(file);
            let mut language_key = String::new();
            loop {
                language_key.clear();
                bufreader.read_line(&mut language_key).unwrap();

                let splitted_line = split_lang_string(&language_key);
                if splitted_line.0 == "LANG_NAME" {
                    language_key = splitted_line.1.to_string();
                    break;
                }
            }

            languages.insert(language_key.to_string(), language_val.to_string());
        }
    }
    println!("Got them!");
    languages
}

pub fn get_language(name: &String) -> HashMap<String, String> {
    let mut language = HashMap::new();

    let mut executable_path = std::env::current_exe().unwrap();
    executable_path.pop();
    let path_of_languages = executable_path.join("languages");

    let language_file = path_of_languages.join(format!("{}.pmerlng", name));

    let file = match File::open(language_file) {
        Ok(file) => file,
        Err(_) => {
            msg_box("Error reading language file".to_string(), "error");
            std::process::exit(1);
        }
    };

    let mut bufreader = BufReader::new(file);
    let mut line = String::new();
    loop {
        let ret = bufreader.read_line(&mut line).unwrap();
        if ret == 0 {
            break;
        }

        let (key, value) = split_lang_string(&line);
        language.entry(key.to_string()).or_insert(value.to_string());

        line.clear();
    }

    language
}

fn split_lang_string(lang_string: &str) -> (&str, &str) {
    if !lang_string.contains("::") {
        msg_box("Invalid language string".to_string(), "error");
        std::process::exit(1);
    }

    let mut lang_string = lang_string.split("::").collect::<Vec<&str>>();

    #[allow(clippy::needless_range_loop)]
    // Clippy is wrong here. Of course we could iterate the whole array, but it's not what we want. And why making an extra if statement for validation, if 0..=1 works aswell?
    for i in 0..=1 {
        if lang_string[i].contains('<') && lang_string[i].contains('>') {
            lang_string[i] = lang_string[i].split('<').collect::<Vec<&str>>()[1];
            lang_string[i] = lang_string[i].split('>').collect::<Vec<&str>>()[0];
        }
    }

    (lang_string[0], lang_string[1])
}

lazy_static! {
    static ref DEFAULT_LANGUAGE: Arc<HashMap<String, String>> = {
        match get_languages().get("English") {
            Some(default_language) => Arc::new(get_language(default_language)),
            None => {
                msg_box("Error getting default language".to_string(), "error");
                std::process::exit(1);
            }
        }
    };
}

lazy_static! {
    pub static ref CURRENT_LANGUAGE: Arc<Mutex<HashMap<String, String>>> =
        Arc::new(Mutex::new(DEFAULT_LANGUAGE.as_ref().clone()));
}

#[allow(dead_code)]
pub fn fill_missing_language_keys() {
    unreachable!(
        "Update to JSON based language files? Probably smarter than inventing a new format."
    );
    /*let mut current_language = CURRENT_LANGUAGE.lock().unwrap();

    for (key, value) in DEFAULT_LANGUAGE.iter() {
        _ = *current_language
            .entry(key.to_string())
            .or_insert(value.to_string());
    }*/
}

pub fn get_translation(key: &str) -> String {
    let current_language = CURRENT_LANGUAGE.lock().unwrap();

    match current_language.get(&key.to_string()) {
        Some(translation) => translation.clone(),
        None => key.to_string(),
    }
}
