export const setContextMenuLocation = (e) => {
    // Find the container element
    const container = document.querySelector('.sidebar-second');
    
    if (!container) {
        return;
    }
    
    // Get the bounding rectangle of the container
    //const containerRect = container.getBoundingClientRect();
    
    // Calculate the relative cursor position within the container
    let x = e.clientX;// - containerRect.left;
    let y = e.clientY;// - containerRect.top;
    
    // Container size
    /*let containerWidth = containerRect.width;
    let containerHeight = containerRect.height;*/
    
    // Context menu size
    let contextMenus = document.querySelectorAll('.context-menu');
    contextMenus.forEach((contextMenu) => {
        //let anyContextMenuVisible = document.querySelector('.context-menu.show'); // To prevent location change if already visible
        
        if (!contextMenu /*|| anyContextMenuVisible*/) {
            return;
        }
        
        // Show the context menu to get its size (because it's hidden by default which causes offsetWidth and offsetHeight to be 0)
        contextMenu.classList.add('temp-show');
        let contextMenuWidth = contextMenu.offsetWidth;
        let contextMenuHeight = contextMenu.offsetHeight;
        contextMenu.classList.remove('temp-show');

        // If context menu is going to be out of container, move it inside
        if (x + contextMenuWidth > window.innerWidth) {
            x = window.innerWidth - contextMenuWidth;
        }
        // log y + contextMenuHeight, window.innerHeight
        console.log(y + contextMenuHeight, window.innerHeight);
        if (y + contextMenuHeight > window.innerHeight) {
            y = window.innerHeight - contextMenuHeight;
        }
        console.log("Coords: ", x, y);
        
        // Set the CSS variables for context menu position
        contextMenu.style.setProperty('--context-menu-x', `${x}px`);
        contextMenu.style.setProperty('--context-menu-y', `${y}px`);
    });
};