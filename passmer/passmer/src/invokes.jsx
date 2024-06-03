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

export const getSidebarTitleById = (sectionId) => invoke('get_sidebar_title_by_id', { "sectionId": sectionId });

export const addNewSection = (title) => invoke('add_new_section', { "sectionName": title });

export const deleteSection = (id) => invoke('delete_section', { "sectionId": id });

export const renameSection = (id, title) => invoke('rename_section', { "sectionId": id, "newName": title });

export const duplicateSection = (id, title) => invoke('duplicate_section', { "sectionId": id, "duplicationName": title });

export const isValidSectionName = (title) => invoke('is_valid_section_name', { "input": title, "bypassMinLen": true });

export const getFields = (sectionId) => invoke('get_fields', { "sectionId": sectionId });

export const addField = (sectionId, title, value, type) => invoke('add_field', { "sectionId": sectionId, "fieldTitle": title, "fieldValue": value, "fieldType": type });

export const swapOrderIds = (sectionId, fieldId1, fieldId2) => invoke('swap_order_ids', { "sectionId": sectionId, "fieldId1": fieldId1, "fieldId2": fieldId2 });

export const deleteField = (sectionId, fieldId) => invoke('delete_field', { "sectionId": sectionId, "fieldId": fieldId });

export const renameField = (sectionId, fieldId, title) => invoke('rename_field', { "sectionId": sectionId, "fieldId": fieldId, "newTitle": title });

export const updateFieldValue = (sectionId, fieldId, value) => invoke('update_field_value', { "sectionId": sectionId, "fieldId": fieldId, "newValue": value });

export const clipboardCopy = (text) => invoke('clipboard_copy', { "text": text });

export const remoteTypeText = (text) => invoke('remote_type_text', { "text": text });

export const securePasswordGenerator = () => invoke('secure_password_generator');

export const checkUpdate = () => invoke('check_update');

export const downloadUpdater = () => invoke('download_updater');

export const startUpdater = () => invoke('start_updater');

export const msgBox = (message, level) => invoke('msg_box', { "text" : message, "level" : level });

export const msgBoxLevel = Object.freeze({
    INFO: "info",
    WARNING: "warning",
    ERROR: "error"
});

export const fieldTypes = Object.freeze({
    TEXT: "Text",
    PASSWORD: "Password",
    EMAIL: "Email",
    URL: "Url",
    PHONE: "Phone",
    NUMBER: "Number",
    DATE: "Date",
    TIME: "Time",
    DATETIME: "DateTime",
    NOTES: "Notes",
    SPLIT: "Split"
});