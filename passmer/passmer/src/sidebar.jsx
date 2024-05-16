import { useEffect, useState } from 'react';
import passmerLogo from './assets/icon.webp';
import './style/main.css';
import * as Invokes from './invokes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlus, faGear, faArrowRightFromBracket, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';

function Sidebar() {
  const [search, setSearch] = useState('');

  useEffect(() => {
    Invokes.resizeWindowForMain();

    return () => {
    }
  }, []);

  const handleMouseMove = (e) => {
    const targetRect = e.target.getBoundingClientRect();
    const x = Math.round(e.clientX - targetRect.left) + "px";
    const y = Math.round(e.clientY - targetRect.top) + "px";

    e.target.style.setProperty('--mouse-x', x);
    e.target.style.setProperty('--mouse-y', y);

    console.log(`x: ${x} y: ${y}`);
  };

  const random = Math.random().toString(36).substring(7);

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-first">
          <div className="sidebar-first-split-top">
            <button title="Search" className="sidebar-btn move" onMouseMove={handleMouseMove}>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>

            <button title="Add" className="sidebar-btn wiggle" onMouseMove={handleMouseMove}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>

          <div className="sidebar-first-split-bottom">
            <button title="Logout" className="sidebar-btn jump" onMouseMove={handleMouseMove}>
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
            </button>

            <button title="Settings" className="sidebar-btn rotate" onMouseMove={handleMouseMove}>
              <FontAwesomeIcon icon={faGear} />
            </button>
          </div>
        </div>
        <div className="sidebar-second">
          <div className="sidebar-view">
            <div className="sidebar-title-area">
              <h1 className="title">Passmer</h1>
              <button title="Options" className="sidebar-btn bg-transparent">
                <FontAwesomeIcon icon={faEllipsisVertical} />
              </button>
            </div>
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
