export const setContextMenuLocation = (e) => {
    // Find the container element
    const container = document.querySelector('.sidebar-second');
    
    if (!container) {
        return;
    }
    
    // Get the bounding rectangle of the container
    const containerRect = container.getBoundingClientRect();
    
    // Calculate the relative cursor position within the container
    let x = e.clientX - containerRect.left;
    let y = e.clientY - containerRect.top;
    
    // Container size
    let containerWidth = containerRect.width;
    let containerHeight = containerRect.height;
    
    // Context menu size
    let contextMenu = document.querySelector('.context-menu');
    let anyContextMenuVisible = document.querySelector('.context-menu.show'); // To prevent location change if already visible
    
    if (!contextMenu || anyContextMenuVisible) {
        return;
    }
    
    let contextMenuWidth = contextMenu.offsetWidth;
    let contextMenuHeight = contextMenu.offsetHeight;
    
    // If context menu is going to be out of container, move it inside
    if (x + contextMenuWidth > containerWidth) {
        x = containerWidth - contextMenuWidth;
    }
    if (y + contextMenuHeight > containerHeight) {
        y = containerHeight - contextMenuHeight;
    }
    
    // Set the CSS variables for context menu position
    contextMenu.style.setProperty('--context-menu-x', `${x}px`);
    contextMenu.style.setProperty('--context-menu-y', `${y}px`);
};