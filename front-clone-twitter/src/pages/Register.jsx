import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '', password: '', password2: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/feed');
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const msg = Object.values(data).flat().join(' ');
        setError(msg);
      } else {
        setError('Erro ao criar conta.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">𝕏 Clone</h1>
        <h2>Criar conta</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <input name="first_name" placeholder="Nome" value={form.first_name} onChange={handleChange} />
            <input name="last_name" placeholder="Sobrenome" value={form.last_name} onChange={handleChange} />
          </div>
          <input name="username" placeholder="Usuário *" value={form.username} onChange={handleChange} required />
          <input name="email" type="email" placeholder="E-mail" value={form.email} onChange={handleChange} />
          <input name="password" type="password" placeholder="Senha *" value={form.password} onChange={handleChange} required minLength={6} />
          <input name="password2" type="password" placeholder="Confirmar senha *" value={form.password2} onChange={handleChange} required />
          {error && <p className="text-danger">{error}</p>}
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>
        <p className="auth-footer">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}