import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services/api';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const { token } = await login(username, password);
      localStorage.setItem('token', token);
      navigate('/dashboard');
    } catch (error: any) {
      setErrorMsg('Invalid username or password');
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto mt-10 p-4 shadow-md border rounded">
      <h2 className="text-xl font-bold mb-4">Login</h2>

      {errorMsg && <div className="text-red-600 mb-2">{errorMsg}</div>}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="block w-full mb-2 p-2 border rounded"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="block w-full mb-4 p-2 border rounded"
        required
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
        Login
      </button>
    </form>
  );
};

export default LoginForm;
