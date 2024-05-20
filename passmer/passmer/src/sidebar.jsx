import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './style/main.css';
import * as Invokes from './invokes';
import * as ContextMenu from './contextmenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlus, faGear, faArrowRightFromBracket, faEllipsisVertical, faFilePen } from '@fortawesome/free-solid-svg-icons';

function Sidebar() {
  const [search, setSearch] = useState('');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showRenameSection, setShowRenameSection] = useState(false);
  const [renameMode, setRenameMode] = useState(false); // If true, rename, otherwise duplicate
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [sidebarData, setSidebarData] = useState([]);
  const [lastSelectedSection, setLastSelectedSection] = useState(-1);
  const [lastSelectedSectionTitle, setLastSelectedSectionTitle] = useState('');

  const { sectionId } = useParams();
  const navigate = useNavigate();
  const addSectionInputRef = useRef(null);
  const addSectionAddButtonRef = useRef(null);
  const renameSectionInputRef = useRef(null);
  const renameSectionAddButtonRef = useRef(null);
  const deleteSectionWrapperRef = useRef(null);

  useEffect(() => {
    Invokes.resizeWindowForMain();

    const resetContextMenu = () => {
      console.log("test");
      //if (showOptions) {
        setShowOptions(false);
        setShowContextMenu(false);
      //}
    }

    window.addEventListener('resetContextMenus', resetContextMenu);

    return () => {
      window.removeEventListener('resetContextMenus', resetContextMenu);
    }
  }, []);

  useEffect(() => {
    console.log('showOptions', showOptions);
  }, [showOptions]);
  
  useEffect(() => {
    console.log('showContextMenu', showContextMenu);
  }, [showContextMenu]);

  useEffect(() => {
    if (showAddSection) {
      setTimeout(() => {
        if (addSectionInputRef.current) {
          addSectionInputRef.current.focus();
        }
      }, 100);
    }
  }, [showAddSection]);

  useEffect(() => {
    if (showRenameSection) {
      setTimeout(() => {
        if (renameSectionInputRef.current) {
          renameSectionInputRef.current.focus();
        }
      }, 100);
    }
  }, [showRenameSection]);

  useEffect(() => {
    if (showDeleteSection) {
      setTimeout(() => {
        if (deleteSectionWrapperRef.current) {
          deleteSectionWrapperRef.current.focus();
        }
      }, 100);
    }
  }, [showDeleteSection]);

  useEffect(() => {
    if (addSectionAddButtonRef.current && addSectionInputRef.current) {
      addSectionAddButtonRef.current.disabled = addSectionInputRef.current.value.length == 0;
    }
    if (renameSectionAddButtonRef.current && renameSectionInputRef.current) {
      renameSectionAddButtonRef.current.disabled = renameSectionInputRef.current.value.length == 0;
    }
  }, [newSectionTitle]);

  useEffect(() => {
    reRenderSidebarItems(search);
  }, [search]);

  const reRenderSidebarItems = (search) => {
    Invokes.getSidebarData(search).then((result) => {
      setSidebarData(result);
    });
  }

  const handleMouseMove = (e) => {
    const targetRect = e.target.getBoundingClientRect();
    const x = Math.round(e.clientX - targetRect.left) + "px";
    const y = Math.round(e.clientY - targetRect.top) + "px";

    e.target.style.setProperty('--mouse-x', x);
    e.target.style.setProperty('--mouse-y', y);
  };

  const showOptionsMenu = () => {
    if (showOptions) {
      return;
    }
    setTimeout(() => {
      setShowOptions(true);
    }, 100);
  }
  
  const showTheContextMenu = () => {
    if (showContextMenu) {
      return;
    }
    setTimeout(() => {
      setShowContextMenu(true);
    }, 100);
  }

  const random = Math.random().toString(36).substring(7);

  const bindSearchValue = (e) => {
    setSearch(e.target.value);
  }

  const bindSectionTitleValue = (e) => {
    let value = e.target.value;

    // Instant validation
    Invokes.isValidSectionName(value).then((result) => {
      if (result) {
        setNewSectionTitle(value);
      }
    });
  }

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-first">
          <div className="sidebar-first-split-top">
            <button title="Search" className="sidebar-btn move" onMouseMove={handleMouseMove} onClick={ () => setShowSearchInput(!showSearchInput) }>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>

            <button title="Add" className="sidebar-btn wiggle" onMouseMove={handleMouseMove} onClick={() => setShowAddSection(true) }>
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>

          <div className="sidebar-first-split-bottom">
            <button title="Logout" className="sidebar-btn jump" onMouseMove={handleMouseMove} onClick={ () => { Invokes.logout(); navigate('/', { replace: true }); } }>
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
            </button>

            <button title="Settings" className="sidebar-btn rotate" onMouseMove={handleMouseMove} onClick={ () => Invokes.msgBox("Coming soon ...", Invokes.msgBoxLevel.INFO) }>
              <FontAwesomeIcon icon={faGear} />
            </button>
          </div>
        </div>
        <div className="sidebar-second">
          <div className="sidebar-view">
            <div className="sidebar-title-area">
              <h1 className="title">Passmer</h1>
              <button title="Options" className="sidebar-btn bg-transparent" onClick={ (e) => { showOptionsMenu(); ContextMenu.setContextMenuLocation(e) } }>
                <FontAwesomeIcon icon={faEllipsisVertical} />
              </button>
            </div>
            <div className={`context-menu ${(showOptions ? "show" : "")}` }>
              <button className="context-menu-btn">Check for Update</button>
              <button className="context-menu-btn" onClick={ () => Invokes.open("https://fabi-sc.de") }>Website</button>
            </div>

            <div className={`search-input-wrapper ${(showSearchInput ? "show" : "")}`}>
              <input className={`search-input ${(showSearchInput ? "show" : "")}`} type="text" placeholder="Search" value={search} onChange={bindSearchValue} autoComplete={'passmer' + random} />
            </div>

            {/* ITEM VIEW START */}
            <div className="sidebar-items">
            {
              sidebarData.map((item) => (
                <div className="sidebar-item" data-id={item.section_id} key={item.section_id} onClick={ () => navigate(`/fields/${item.section_id}`, { replace: true }) } onContextMenu={ (e) => { e.preventDefault(); setLastSelectedSection(item.section_id); setLastSelectedSectionTitle(item.section_title); showTheContextMenu(); ContextMenu.setContextMenuLocation(e) } }>
                  <p className="item-title">{ sectionId == item.section_id ? <FontAwesomeIcon icon={faFilePen} /> : "" } {item.section_title}</p>
                </div>
              ))
            }
            </div>
            {/* ITEM VIEW END */}

          </div>
        </div>
        {
        // Add Section Dialog
        }
        <div className={`add-section-wrapper ${(showAddSection ? "show" : "")}`} tabIndex={0} onKeyDown={ (e) => {
          // If escape key is pressed close the add section dialog
          if (e.key == 'Escape') {
            console.log('ESC pressed on add section dialog');
            setShowAddSection(false);
            setNewSectionTitle('');
          }
          else if (e.key == 'Enter') {
            if (addSectionAddButtonRef.current) {
              addSectionAddButtonRef.current.click();
            }
          }
        }} onClick={ () => addSectionInputRef.current.focus() }>
          <div className="add-section">
            <h2 className='title'>Add Section</h2>
            <input type="text" className="add-section-input" ref={addSectionInputRef} placeholder="New name" value={newSectionTitle} onChange={bindSectionTitleValue} autoComplete={'passmer' + random} />
            <div className='btn-collection'>
              <button className="btn" ref={addSectionAddButtonRef} onClick={ () => {
                setShowAddSection(false);
                Invokes.addNewSection(newSectionTitle);
                setNewSectionTitle('');
                setTimeout(() => {
                  reRenderSidebarItems(search);
                }, 1000);
              }}>Add</button>
              <button className="btn" onClick={ () => {
                setShowAddSection(false);
                setNewSectionTitle('');
              }}>Cancel</button>
            </div>
          </div>
        </div>
        {
        // Rename or Duplicate Section Dialog
        }
        <div className={`add-section-wrapper ${(showRenameSection ? "show" : "")}`} tabIndex={0} onKeyDown={ (e) => {
          // If escape key is pressed close the add section dialog
          if (e.key == 'Escape') {
            console.log('ESC pressed on rename / duplicate section dialog');
            setShowRenameSection(false);
            setNewSectionTitle('');
          }
          else if (e.key == 'Enter') {
            if (renameSectionAddButtonRef.current) {
              renameSectionAddButtonRef.current.click();
            }
          }
        }} onClick={ () => renameSectionInputRef.current.focus() }>
          <div className="add-section">
            <h2 className='title'>{ (renameMode ? "Rename" : "Duplicate") } Section</h2>
            <input type="text" className="add-section-input" ref={renameSectionInputRef} placeholder="New name" value={newSectionTitle} onChange={bindSectionTitleValue} autoComplete={'passmer' + random} />
            <div className='btn-collection'>
              <button className="btn" ref={renameSectionAddButtonRef} onClick={ () => {
                setShowRenameSection(false);
                if (renameMode) {
                  Invokes.renameSection(lastSelectedSection, newSectionTitle);
                } else {
                  Invokes.duplicateSection(lastSelectedSection, newSectionTitle);
                }
                setNewSectionTitle('');
                setTimeout(() => {
                  reRenderSidebarItems(search);
                }, 1000);
              }}>{ (renameMode ? "Rename" : "Duplicate") }</button>
              <button className="btn" onClick={ () => {
                setShowRenameSection(false);
                setNewSectionTitle('');
              }}>Cancel</button>
            </div>
          </div>
        </div>
        {
        // Delete Section Dialog
        }
        <div className={`add-section-wrapper ${(showDeleteSection ? "show" : "")}`} tabIndex={0} ref={deleteSectionWrapperRef} onKeyDown={ (e) => {
          // If escape key is pressed close the add section dialog
          if (e.key == 'Escape') {
            console.log('ESC pressed on delete section dialog');
            setShowDeleteSection(false);
          }
        }}>
          <div className="add-section">
            <h2 className='title'>Delete Section</h2>
            <div className='btn-collection'>
              <button className="btn" onClick={ () => {
                setShowDeleteSection(false);
                Invokes.deleteSection(lastSelectedSection);
                setTimeout(() => {
                  reRenderSidebarItems(search);
                }, 1000);
              }}>Delete</button>
              <button className="btn" onClick={ () => {
                setShowDeleteSection(false);
              }}>Cancel</button>
            </div>
          </div>
        </div>

        <div className={`context-menu ${(showContextMenu ? "show" : "")}` }>
          <button className="context-menu-btn" onClick={ ()=> {
            setShowRenameSection(true);
            setNewSectionTitle(lastSelectedSectionTitle);
            setRenameMode(false);
            setShowContextMenu(false);
          }}>Duplicate</button>
          <button className="context-menu-btn" onClick={()=> {
            setShowRenameSection(true);
            setNewSectionTitle(lastSelectedSectionTitle);
            setRenameMode(true);
            setShowContextMenu(false);
          }}>Rename</button>
          <button className="context-menu-btn" onClick={ () => {
            setShowDeleteSection(true);
            setShowContextMenu(false);
          }}>Delete</button>
        </div>
        {/*<div>
          CONTEXTMENU
          ==========
          DUPLICATE
          DELETE
          RENAME
        </div>*/}
      </div>
    </>
  );
}

export default Sidebar
