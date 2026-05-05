import { useState } from 'react';
import api from '../api/axios';

export default function PostForm({ onCreated }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/posts/', { content });
      setContent('');
      if (onCreated) onCreated(data);
    } catch (err) {
      setError('Erro ao criar post.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const remaining = 280 - content.length;

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="O que está acontecendo?"
        maxLength={280}
        rows={3}
        disabled={loading}
      />
      <div className="post-form-footer">
        <span className={`char-count ${remaining < 20 ? 'warning' : ''}`}>{remaining}</span>
        {error && <span className="text-danger">{error}</span>}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !content.trim()}
        >
          Postar
        </button>
      </div>
    </form>
  );
}