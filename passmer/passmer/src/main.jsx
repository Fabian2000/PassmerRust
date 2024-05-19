import {useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Login from './login';
import Sidebar from './sidebar';
import { invoke } from '@tauri-apps/api';

export function Main() {
  useEffect(() => {

    const preventCtrl = (e) => {
      // Exclude Ctrl + V and Ctrl + C and Ctrl + A (in input fields)
      if (e.ctrlKey && e.key === 'v') {
        return;
      }
      if (e.ctrlKey && e.key === 'c') {
        return;
      }
      if ((e.ctrlKey && e.key === 'a') && e.target.nodeName === 'INPUT') {
        return;
      }
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };

    const preventAlt = (e) => {
      if (e.altKey) {
        e.preventDefault();
      }
    }

    const preventFunctionKeys = (e) => {
      if (e.key.startsWith('F') && !isNaN(e.key.slice(1)) && parseInt(e.key.slice(1)) >= 1 && parseInt(e.key.slice(1)) <= 12) {
        e.preventDefault();
      }
    };

    const preventContextMenu = (e) => {
      e.preventDefault();
    };

    const preventImageDrag = (e) => {
      if (e.target.nodeName === 'IMG') {
        e.preventDefault();
      }
    }

    let contextMenuAlreadyTriggered = false;
    const hideCustomContextMenus = () => {
      if (contextMenuAlreadyTriggered) {
        return;
      }
      contextMenuAlreadyTriggered = true;

      const event = new Event('resetContextMenus');
      window.dispatchEvent(event);

      setTimeout(() => {
        contextMenuAlreadyTriggered = false;
      }, 1000);
    }

    let isReleaseMode = true;
    // eslint-disable-next-line no-undef
    if (process.env.NODE_ENV === 'development') {
      isReleaseMode = false;
      console.log('Development mode');
    }

    if (isReleaseMode) {
      window.addEventListener('keydown', preventCtrl);
      window.addEventListener('keydown', preventAlt);
      window.addEventListener('keydown', preventFunctionKeys);
      window.addEventListener('contextmenu', preventContextMenu);
      window.addEventListener('dragstart', preventImageDrag);
    }

    window.addEventListener('click', hideCustomContextMenus);
    window.addEventListener('contextmenu', hideCustomContextMenus);
    window.addEventListener('blur', hideCustomContextMenus);

    invoke('show_window');
    return () => { 
      if (isReleaseMode) {
        window.removeEventListener('keydown', preventCtrl);
        window.removeEventListener('keydown', preventAlt);
        window.removeEventListener('keydown', preventFunctionKeys);
        window.removeEventListener('contextmenu', preventContextMenu);
        window.removeEventListener('dragstart', preventImageDrag);
      }

      window.removeEventListener('click', hideCustomContextMenus);
      window.removeEventListener('contextmenu', hideCustomContextMenus);
      window.removeEventListener('blur', hideCustomContextMenus);
    };
  }, []);

  const location = useLocation();

  return (
    <div className="app-container">
      <TransitionGroup>
        <CSSTransition
          key={location.key}
          timeout={300}
          classNames="window-fade"
        >
          {/*<React.StrictMode> <- Makes double calls. WTF. Useless. That proves nothing, but destroys everything. Double event handling and everything is not the right way to prove things!
          My explanation of React.StrictMode:
          StrictMode is a tool for highlighting potential problems in an application. Like Fragment, StrictMode does not render any visible UI. It activates additional checks and warnings for its descendants.
          This checks do the following:
          They create double events, double data and more problems than they solve. They are not the right. Whoever invented this: Shame on you. :)
          And no, I will not discuss about it. It's a fact. With strict mode, I create more potential security problems than I solve (Even if they are only during development).*/}
            <Routes>
              <Route path="/" element={<Login/>} />
              <Route path="/sidebar" element={<Sidebar/>} />
            </Routes>
        {/*</React.StrictMode>*/}
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Main />
    </Router>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
