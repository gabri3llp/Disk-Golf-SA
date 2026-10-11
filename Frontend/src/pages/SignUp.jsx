import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function SignUp() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/signup', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);
      navigate('/dashboard');
    } catch (err) {
      const first = err.response?.data?.errors?.[0];
      setError(err.response?.data?.error || (first && `${first.path}: ${first.msg}`) || 'Something went wrong');
    }
  };

  return (
    <main className="auth-page">
      <div className="glass auth-card">
        <div className="auth-image" role="img" aria-label="Disc golf player" />
        <form className="auth-form" onSubmit={handleSubmit}>
          <h1>Sign Up</h1>
          <input className="field" name="full_name" placeholder="Name & Surname" onChange={handleChange} required />
          <input className="field" name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <input className="field" name="password" type="password" placeholder="Password (min 8 characters)" onChange={handleChange} required />
          {error && <p className="error-msg">{error}</p>}
          <button className="btn" type="submit">Create an account</button>
          <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
        </form>
      </div>
    </main>
  );
}