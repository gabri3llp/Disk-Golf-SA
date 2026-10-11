import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <main className="auth-page">
      <div className="glass auth-card">
        <div className="auth-image" role="img" aria-label="Disc golf player" />
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Login</h1>
          <input className="field" name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <input className="field" name="password" type="password" placeholder="Password" onChange={handleChange} required />
          {error && <p className="error-msg">{error}</p>}
          <button className="btn" type="submit">Login</button>
          <p className="auth-switch">Don't have an account? <Link to="/signup">Sign up</Link></p>
        </form>
      </div>
    </main>
  );
}