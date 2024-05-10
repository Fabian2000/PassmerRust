use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct Field {
    pub field_id: i64,
    pub field_title: String,
    pub field_type: FieldTypes,
    pub field_value: String,
}

impl Drop for Field {
    fn drop(&mut self) {
        // Get length and capacity of the string
        let len = self.field_value.len();
        let capacity = self.field_value.capacity();

        // Access string bytes directly
        unsafe {
            let vec = self.field_value.as_mut_vec();
            for byte in vec.iter_mut() {
                *byte = 0;
            }
        }

        // Optional: refill the capacity with null bytes (not necessary)
        self.field_value.reserve_exact(capacity - len);
        self.field_value.clear();
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum FieldTypes {
    Text,
    Password,
    Email,
    Url,
    Phone,
    Number,
    Date,
    Time,
    DateTime,
    Notes,
}