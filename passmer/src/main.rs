use diesel_migrations::EmbeddedMigrations;
use diesel_migrations::embed_migrations;
use diesel_migrations::MigrationHarness;

mod database;
use database::local_db::establish_connection;
mod ui;
use ui::main_ui::ui_init;

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut conn = establish_connection();

    //println!("Migrating...");
    conn.run_pending_migrations(MIGRATIONS).unwrap();

    ui_init();

    Ok(())
}