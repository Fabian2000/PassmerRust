use std::collections::HashSet;

use serde::{Deserialize, Serialize};

use super::field::Field;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Section {
    pub section_id: i64,
    pub section_title: String,
    pub fields: Option<Vec<Field>>,
    pub tags: Option<HashSet<String>>,
}
