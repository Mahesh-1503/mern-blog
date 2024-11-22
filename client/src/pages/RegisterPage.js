import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);

  async function register(ev) {
    ev.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/register', {
        method: 'POST',
        body: JSON.stringify({username, password}),
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
      });
      
      if(response.ok) {
        setRedirect(true);
      } else {
        const data = await response.json();
        alert('Registration failed: ' + data.message);
      }
    } catch(error) {
      console.error('Error:', error);
      alert('Registration failed');
    }
  }

  if (redirect) {
    return <Navigate to={'/login'} />
  }
  
  return (
    <form className="register" onSubmit={register}>
      <h1>Register</h1>
      <div className="form-group">
        <input 
          type="text" 
          placeholder="username"
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          required 
        />
      </div>
      <div className="form-group">
        <input 
          type="password" 
          placeholder="password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          required 
        />
      </div>
      <button type="submit">Register</button>
    </form>
  );
}
