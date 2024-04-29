use tauri::{PhysicalPosition, PhysicalSize, Position, Size};

const LOGIN_SIZE: (i32, i32) = (300, 400);
const MAIN_SIZE: (i32, i32) = (800, 600);

#[tauri::command]
pub fn resize_window_for_login(window: tauri::Window) -> Result<(), String> {
    let (curr_x, curr_y) = get_window_position(&window)?;
    let (curr_width, curr_height) = get_window_size(&window)?;
    let (new_width, new_height) = LOGIN_SIZE;
    let (new_x, new_y) = calculate_new_position(
        curr_x,
        curr_y,
        curr_width,
        curr_height,
        new_width,
        new_height,
    );

    let Ok(_) = window.set_resizable(false) else {
        return Err("Failed to set window resizable".to_string());
    };
    set_window_size_and_position(&window, new_x, new_y, new_width, new_height)
}

#[tauri::command]
pub fn resize_window_for_main(window: tauri::Window) -> Result<(), String> {
    let (curr_x, curr_y) = get_window_position(&window)?;
    let (curr_width, curr_height) = get_window_size(&window)?;
    let (new_width, new_height) = MAIN_SIZE;
    let (new_x, new_y) = calculate_new_position(
        curr_x,
        curr_y,
        curr_width,
        curr_height,
        new_width,
        new_height,
    );

    let Ok(_) = window.set_resizable(true) else {
        return Err("Failed to set window resizable".to_string());
    };
    set_window_size_and_position(&window, new_x, new_y, new_width, new_height)
}

fn get_window_position(window: &tauri::Window) -> Result<(i32, i32), String> {
    let Ok(position) = window.inner_position() else {
        return Err("Failed to get window position".to_string());
    };

    Ok((position.x, position.y))
}

fn get_window_size(window: &tauri::Window) -> Result<(i32, i32), String> {
    let Ok(size) = window.inner_size() else {
        return Err("Failed to get window size".to_string());
    };

    Ok((size.width as i32, size.height as i32))
}

// Calculates the new position after resizing the window, so that the window remains centered
fn calculate_new_position(
    curr_x: i32,
    curr_y: i32,
    curr_width: i32,
    curr_height: i32,
    new_width: i32,
    new_height: i32,
) -> (i32, i32) {
    let center_x = curr_x + curr_width / 2;
    let center_y = curr_y + curr_height / 2;
    let new_x = center_x - new_width / 2;
    let new_y = center_y - new_height / 2;

    (new_x, new_y)
}

fn set_window_size_and_position(
    window: &tauri::Window,
    new_x: i32,
    new_y: i32,
    new_width: i32,
    new_height: i32,
) -> Result<(), String> {
    let pos = Position::Physical(PhysicalPosition::new(new_x, new_y));
    let size = Size::Physical(PhysicalSize::new(new_width as u32, new_height as u32));

    let Ok(_) = window.set_position(pos) else {
        return Err("Failed to set window position".to_string());
    };

    let Ok(_) = window.set_size(size) else {
        return Err("Failed to set window size".to_string());
    };

    Ok(())
}
