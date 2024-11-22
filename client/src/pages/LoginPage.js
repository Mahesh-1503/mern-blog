import { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState('');
  const { setUserInfo } = useContext(UserContext);

  async function login(ev) {
    ev.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setUserInfo(data);
        setRedirect(true);
      } else {
        setError(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Login failed. Please try again.');
    }
  }

  if (redirect) {
    return <Navigate to={'/'} />
  }

  return (
    <form className="login" onSubmit={login}>
      <h1>Login</h1>
      {error && <div className="error">{error}</div>}
      <div className="form-group">
        <input 
          type="text" 
          placeholder="username"
          value={username}
          onChange={ev => setUsername(ev.target.value)}
          required 
        />
      </div>
      <div className="form-group">
        <input 
          type="password" 
          placeholder="password"
          value={password}
          onChange={ev => setPassword(ev.target.value)}
          required 
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
}
