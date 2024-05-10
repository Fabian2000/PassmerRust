import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import passmerLogo from './assets/icon.webp';
import './style/main.css';
import * as Invokes from './invokes';

function Login() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Invokes.resizeWindowForLogin();

    return () => {
    }
  }, []);

  const bindPasswordValue = (e) => {
    setPassword(e.target.value);
  }

  const reFocus = (e) => {
    e.target.focus();
  }

  const ValidateKeyPressed = (e) => {
    if (e.key === 'Enter') {
      Invokes.validatePassword(e.target.value).then((response) => {
        debugger;
        if (response == false) {
          Invokes.msgBox('Invalid Password', Invokes.msgBoxLevel.WARNING);
          setPassword('');
          return;
        }
        navigate('/sidebar', { replace: true });
      });

      // TODO: Validate password
    }
  }

  const random = Math.random().toString(36).substring(7);

  return (
    <>
      <div>
        <div className="login">
          <img className='login logo' src={passmerLogo} alt="Passmer Logo" />
          <input className='login password-input' type="password" placeholder="Pin or Password" value={password} onChange={bindPasswordValue} onKeyDown={ValidateKeyPressed} autoComplete={'passmer' + random} onBlur={reFocus} autoFocus />
        </div>
      </div>
    </>
  )
}

export default Login
