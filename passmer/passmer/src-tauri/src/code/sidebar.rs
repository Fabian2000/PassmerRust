use crate::code::data_finder::sort_by_search_with_strings;
use crate::database::{passmer::GLOBAL_PASSMER_DB, section::Section};

#[tauri::command]
pub fn get_sidebar_data(search: String, smart_search: bool) -> Vec<Section> {
    let db_data = GLOBAL_PASSMER_DB.lock().unwrap();

    let Some(passmer_db) = (*db_data).clone() else {
        return vec![];
    };

    let sections = passmer_db.sections;

    let Some(sections) = sections else {
        return vec![];
    };

    let search_value = if smart_search {
        String::new()
    } else {
        search.clone().to_lowercase()
    };

    let mut filtered_sections: Vec<&Section> = sections
        .iter()
        .filter(|section| section.section_title.to_lowercase().contains(&search_value))
        .collect();

    if smart_search {
        // get all titles
        let mut titles: Vec<String> = filtered_sections
            .iter()
            .map(|section| section.section_title.clone())
            .collect();

        sort_by_search_with_strings(&search, &mut titles);

        let mut filtered_sections_new: Vec<&Section> = vec![];

        for title in titles {
            let section = filtered_sections
                .iter()
                .find(|section| section.section_title.to_lowercase() == title);

            if let Some(section) = section {
                filtered_sections_new.push(section);
            }
        }

        filtered_sections = filtered_sections_new;
    }

    if !smart_search {
        filtered_sections.sort_by(|a, b| a.section_title.cmp(&b.section_title));
    }

    let mut filtered_sections: Vec<Section> =
        filtered_sections.iter().map(|x| (*x).clone()).collect();

    // set field option to none to save too much data being sent to the frontend
    for section in filtered_sections.iter_mut() {
        section.fields = None;
    }

    filtered_sections
}

#[tauri::command]
pub fn get_sidebar_title_by_id(section_id: i64) -> Option<String> {
    let db_data = GLOBAL_PASSMER_DB.lock().unwrap();

    let passmer_db = (*db_data).clone()?;

    let sections = passmer_db.sections;

    let sections = sections?;

    let section = sections
        .iter()
        .find(|section| section.section_id == section_id);

    section.map(|section| section.section_title.clone())
}
