import { useEffect, useState } from 'react'
import passmerLogo from './assets/icon.webp'
import './style/main.css'
import { invoke } from '@tauri-apps/api';

function Login() {
  const [password, setPassword] = useState('');

  useEffect(() => {
    invoke('resize_window_for_login');

    return () => {
    }
  }, []);

  const bindPasswordValue = (e) => {
    setPassword(e.target.value);
  }

  const reFocus = (e) => {
    e.target.focus();
  }

  const random = Math.random().toString(36).substring(7);

  return (
    <>
      <div>
        <div className="login">
          <img className='login logo' src={passmerLogo} alt="Passmer Logo" />
          <input className='login password-input' type="password" placeholder="Pin or Password" value={password} onChange={bindPasswordValue} autoComplete={'passmer' + random} onBlur={reFocus} autoFocus />
        </div>
      </div>
    </>
  )
}

export default Login
