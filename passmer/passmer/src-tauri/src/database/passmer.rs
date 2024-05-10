use serde::{Deserialize, Serialize};

use super::section::Section;

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Passmer {
    pub vec: Option<Vec<Section>>,
}