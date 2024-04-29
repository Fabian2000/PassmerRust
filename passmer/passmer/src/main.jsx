import React, {useEffect} from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App.jsx'
import './index.css'

function Main() {
  useEffect(() => {

    const preventCtrl = (e) => {
      // Exclude Ctrl + V and Ctrl + C
      if (e.ctrlKey && e.key === 'v') {
        return;
      }
      if (e.ctrlKey && e.key === 'c') {
        return;
      }
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

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

    let isReleaseMode = true;
    if (process.env.NODE_ENV === 'development') {
      isReleaseMode = false;
      console.log('Development mode');
    }

    if (isReleaseMode) {
      window.addEventListener('keydown', preventCtrl);
      window.addEventListener('keydown', preventFunctionKeys);
      window.addEventListener('contextmenu', preventContextMenu);
      window.addEventListener('dragstart', preventImageDrag);
    }
    return () => { 
      if (isReleaseMode) {
        window.removeEventListener('keydown', preventCtrl);
        window.removeEventListener('keydown', preventFunctionKeys);
        window.removeEventListener('contextmenu', preventContextMenu);
        window.removeEventListener('dragstart', preventImageDrag);
      }
    };
  }, []);

  return (
    <React.StrictMode>
      <Router>
        <Routes>
          {/*<Route path="/about">
            <About />
          </Route>*/}
          <Route path="/" element={<App/>} />
        </Routes>
      </Router>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
