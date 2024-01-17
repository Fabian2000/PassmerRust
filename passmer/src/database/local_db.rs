use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel::table;
use diesel::Queryable;

table! {
    users (id) {
        id -> Integer,
        a1 -> Text,  // "username" in Rust, "a1" in the database
        b2 -> Text,  // "password" in Rust, "b2" in the database
    }
}

table! {
    data (id) {
        id -> Integer,
        uid -> Integer,  // Foreign key to users table
        c3 -> Text,  // "title" in Rust, "c3" in the database
        d4 -> Text,  // "username" in Rust, "d4" in the database
        e5 -> Text,  // "email" in Rust, "e5" in the database
        f6 -> Text,  // "password" in Rust, "f6" in the database
        g7 -> Text,  // "notes" in Rust, "g7" in the database
    }
}

#[derive(Queryable)]
struct User {
    pub id: i32,
    pub username: String,
    pub password: String,
}

#[derive(Queryable)]
struct Data {
    pub id: i32,
    pub user_id: i32,
    pub title: String,
    pub username: String,
    pub email: String,
    pub password: String,
    pub notes: String,
}

impl User {
    pub fn get_id(&self) -> i32 {
        self.id
    }

    pub fn get_username(&self) -> &String {
        &self.username
    }
    pub fn set_username(&mut self, username: String) {
        self.username = username;
    }

    pub fn get_password(&self) -> &String {
        &self.password
    }
    pub fn set_password(&mut self, password: String) {
        self.password = password;
    }
}

impl Data {
    pub fn get_id(&self) -> i32 {
        self.id
    }

    pub fn get_user_id(&self) -> i32 {
        self.user_id
    }
    pub fn set_user_id(&mut self, user_id: i32) {
        self.user_id = user_id;
    }

    pub fn get_title(&self) -> &String {
        &self.title
    }
    pub fn set_title(&mut self, title: String) {
        self.title = title;
    }

    pub fn get_username(&self) -> &String {
        &self.username
    }
    pub fn set_username(&mut self, username: String) {
        self.username = username;
    }

    pub fn get_email(&self) -> &String {
        &self.email
    }
    pub fn set_email(&mut self, email: String) {
        self.email = email;
    }

    pub fn get_password(&self) -> &String {
        &self.password
    }
    pub fn set_password(&mut self, password: String) {
        self.password = password;
    }

    pub fn get_notes(&self) -> &String {
        &self.notes
    }
    pub fn set_notes(&mut self, notes: String) {
        self.notes = notes;
    }
}

pub fn establish_connection() -> SqliteConnection {
    let database_url = "passmer.db";
    SqliteConnection::establish(&database_url)
        .expect(&format!("Error connecting to {}", database_url))
}