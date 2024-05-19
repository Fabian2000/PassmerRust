import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style/main.css';
import * as Invokes from './invokes';
import * as ContextMenu from './contextmenu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlus, faGear, faArrowRightFromBracket, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';

function Sidebar() {
  const [search, setSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    Invokes.resizeWindowForMain();

    const resetContextMenu = () => {
      console.log("test");
      //if (showOptions) {
        setShowOptions(false);
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

  const random = Math.random().toString(36).substring(7);

  const bindSearchValue = (e) => {
    setSearch(e.target.value);
  }

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-first">
          <div className="sidebar-first-split-top">
            <button title="Search" className="sidebar-btn move" onMouseMove={handleMouseMove} onClick={ () => setShowSearchInput(!showSearchInput) }>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>

            <button title="Add" className="sidebar-btn wiggle" onMouseMove={handleMouseMove}>
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
            <div style={{backgroundColor: 'red', width: '100%', height: '50px'}}></div>
          </div>
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
