import { invoke } from '@tauri-apps/api';

export const resizeWindowForLogin = () => invoke('resize_window_for_login');

export const resizeWindowForMain = () => invoke('resize_window_for_main');

export const validatePassword = (password) => invoke('validate_password', { "password" : password });
// database::passmer::load_db,
// database::passmer::save_db,
// database::passmer::db_exists,
export const loadDb = (key) => invoke('load_db', { "key": key });

export const saveDb = () => invoke('save_db');

export const dbExists = () => invoke('db_exists');

export const logout = () => invoke('logout');

export const open = (link) => invoke('open', { "link": link });

export const getSidebarData = (search) => invoke('get_sidebar_data', { "search": search});

export const msgBox = (message, level) => invoke('msg_box', { "text" : message, "level" : level });

export const msgBoxLevel = Object.freeze({
    INFO: "info",
    WARNING: "warning",
    ERROR: "error"
});