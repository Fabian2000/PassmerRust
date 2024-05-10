import { invoke } from '@tauri-apps/api';

export const resizeWindowForLogin = () => invoke('resize_window_for_login');

export const resizeWindowForMain = () => invoke('resize_window_for_main');

export const validatePassword = (password) => invoke('validate_password', { "password" : password });

export const msgBox = (message, level) => invoke('msg_box', { "text" : message, "level" : level });

export const msgBoxLevel = Object.freeze({
    INFO: "info",
    WARNING: "warning",
    ERROR: "error"
});