import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

export default function CommentSection({ postId, comments: initial }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initial || []);
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/posts/${postId}/comments/`, { content: text });
      setComments((prev) => [...prev, data]);
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(commentId) {
    try {
      await api.delete(`/posts/${postId}/comments/${commentId}/`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="comment-section">
      <button className="btn-link comment-toggle" onClick={() => setOpen((o) => !o)}>
        💬 {comments.length} comentário{comments.length !== 1 ? 's' : ''}
      </button>

      {open && (
        <div className="comment-body">
          {comments.map((c) => (
            <div key={c.id} className="comment">
              <span className="comment-author">
                <Link to={`/profile/${c.author.username}`}>@{c.author.username}</Link>
              </span>
              <span className="comment-content">{c.content}</span>
              {user?.username === c.author.username && (
                <button className="btn-link comment-delete" onClick={() => handleDelete(c.id)}>✕</button>
              )}
            </div>
          ))}

          <form onSubmit={handleSubmit} className="comment-form">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escreva um comentário..."
              maxLength={280}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !text.trim()}>
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}