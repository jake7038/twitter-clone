import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
    password: '',
    password2: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(user?.avatar_url || null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password && form.password !== form.password2) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (form.first_name) formData.append('first_name', form.first_name);
      if (form.last_name) formData.append('last_name', form.last_name);
      formData.append('bio', form.bio);
      if (form.password) {
        formData.append('password', form.password);
        formData.append('password2', form.password2);
      }
      if (avatar) formData.append('avatar', avatar);

      const { data } = await api.patch('/users/me/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(data);
      setSuccess('Perfil atualizado com sucesso!');
      setForm((f) => ({ ...f, password: '', password2: '' }));
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        setError(Object.values(data).flat().join(' '));
      } else {
        setError('Erro ao atualizar perfil.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container container-sm">
        <div className="page-header">
          <button className="btn-link" onClick={() => navigate(-1)}>← Voltar</button>
          <h2>Editar perfil</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Avatar */}
          <div className="avatar-edit">
            <div className="avatar-preview">
              {preview
                ? <img src={preview} alt="avatar" />
                : <div className="avatar-placeholder lg">{user?.username?.[0]?.toUpperCase()}</div>
              }
            </div>
            <label className="btn btn-outline avatar-label">
              Alterar foto
              <input type="file" accept="image/*" onChange={handleAvatar} hidden />
            </label>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Nome</label>
              <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="Nome" />
            </div>
            <div className="form-group">
              <label>Sobrenome</label>
              <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Sobrenome" />
            </div>
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Fale um pouco sobre você..."
              maxLength={160}
              rows={3}
            />
          </div>

          <hr className="divider" />
          <p className="text-muted form-hint">Deixe em branco para não alterar a senha.</p>

          <div className="form-group">
            <label>Nova senha</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Nova senha" minLength={6} />
          </div>
          <div className="form-group">
            <label>Confirmar nova senha</label>
            <input name="password2" type="password" value={form.password2} onChange={handleChange} placeholder="Confirmar nova senha" />
          </div>

          {error && <p className="text-danger">{error}</p>}
          {success && <p className="text-success">{success}</p>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}