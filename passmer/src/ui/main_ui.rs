use gtk4::prelude::*;
use gtk4::{Box, Grid, Orientation, Widget, Label, Paned};
use gtk4::{Application, ApplicationWindow};
use gtk4::{CssProvider, StyleContext, STYLE_PROVIDER_PRIORITY_APPLICATION };

pub fn ui_init() {
    let app = Application::new(Some("de.fabi_sc.Passmer"), Default::default());

    app.connect_activate(|app| {
        // Main Window
        let win = ApplicationWindow::new(app);
        win.set_default_size(1080, 720);
        win.set_title(Some("Passmer - Password Manager"));

        win.set_child(Some(&main_window_layout()));

        // Show all widgets
        win.show();
    });

    app.run();
}

fn main_window_layout() -> Grid {
    let grid = Grid::new();
    
    let top_row = Box::new(Orientation::Horizontal, 0);
    top_row.set_size_request(-1, 55);
    top_row.set_widget_name("top_row");
    top_row.set_hexpand(true);

    let label = Label::new(Some("Test"));
    top_row.pack_start(&label, true, true, 0);

    let paned = Paned::new(Orientation::Horizontal);
    let sidebar = Box::new(Orientation::Vertical, 0);
    sidebar.set_widget_name("sidebar");
    sidebar.set_size_request(300, -1);
    paned.pack1(&sidebar, false, false);

    let main_area = Box::new(Orientation::Vertical, 0);
    main_area.set_widget_name("main_area"); 
    main_area.set_vexpand(true);
    main_area.set_hexpand(true);
    paned.pack2(&main_area, true, false);

    /*paned.connect_draw(|paned, _| {
        if let Some(handle) = paned.get_handle_window() {
            handle.hide();
        }
        Continue(true)
    });*/

    let bottom_row = Box::new(Orientation::Horizontal, 0);
    bottom_row.set_size_request(-1, 25);
    bottom_row.set_widget_name("bottom_row");
    bottom_row.set_hexpand(true);

    top_row.style_context().add_class("top_row");
    sidebar.style_context().add_class("sidebar");
    main_area.style_context().add_class("main_area");
    bottom_row.style_context().add_class("bottom_row");

    let provider = CssProvider::new();
    provider.load_from_data("
        .top_row {
            background-color: red;
        }
        .sidebar {
            background-color: green;
        }
        .main_area {
            background-color: blue;
        }
        .bottom_row {
            background-color: yellow;
        }
        paned separator {
            background-color: #FFFFFF;
            min-width: 0;
            min-height: 0;
        }
    ");

    StyleContext::add_provider_for_screen(
        &Screen::default().expect("Error initializing gtk css provider."),
        &provider,
        STYLE_PROVIDER_PRIORITY_APPLICATION,
    );

    grid.attach(&top_row, 0, 0, 1, 1);
    grid.attach(&paned, 0, 1, 2, 1);
    //grid.attach(&main_area, 1, 1, 1, 1);
    grid.attach(&bottom_row, 0, 2, 2, 1);

    grid
}