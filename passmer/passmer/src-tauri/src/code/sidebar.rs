use crate::database::{passmer::GLOBAL_PASSMER_DB, section::Section};

#[tauri::command]
pub fn get_sidebar_data(search: String) -> Vec<Section> {
    let db_data = GLOBAL_PASSMER_DB.lock().unwrap();

    let Some(passmer_db) = (*db_data).clone() else {
        return vec![];
    };

    let sections = passmer_db.sections;

    let Some(sections) = sections else {
        return vec![];
    };

    let mut filtered_sections: Vec<&Section> = sections
        .iter()
        .filter(|section| {
            section
                .section_title
                .to_lowercase()
                .contains(&search.to_lowercase())
        })
        .collect();

    filtered_sections.sort_by(|a, b| a.section_title.cmp(&b.section_title));

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
