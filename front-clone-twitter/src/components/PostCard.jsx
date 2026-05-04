import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import CommentSection from './CommentSection';

export default function PostCard({ post: initial, onDelete }) {
  const { user } = useAuth();
  const [post, setPost] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(initial.content);

  const isOwner = user?.username === post.author.username;

  async function handleLike() {
    try {
      const { data } = await api.post(`/posts/${post.id}/like/`);
      setPost((p) => ({ ...p, likes_count: data.likes_count, is_liked: data.liked }));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete() {
    if (!confirm('Deletar este post?')) return;
    try {
      await api.delete(`/posts/${post.id}/`);
      if (onDelete) onDelete(post.id);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    if (!editText.trim()) return;
    try {
      const { data } = await api.patch(`/posts/${post.id}/`, { content: editText });
      setPost((p) => ({ ...p, content: data.content }));
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author-info">
          <Link to={`/profile/${post.author.username}`} className="post-author">
            @{post.author.username}
          </Link>
          <span className="post-date">
            {new Date(post.created_at).toLocaleDateString('pt-BR', {
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </div>
        {isOwner && (
          <div className="post-actions">
            <button className="btn-link" onClick={() => setEditing((e) => !e)}>Editar</button>
            <button className="btn-link text-danger" onClick={handleDelete}>Deletar</button>
          </div>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleEdit} className="edit-form">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            maxLength={280}
            rows={3}
          />
          <div className="edit-form-actions">
            <button type="submit" className="btn btn-primary">Salvar</button>
            <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancelar</button>
          </div>
        </form>
      ) : (
        <p className="post-content">{post.content}</p>
      )}

      <div className="post-footer">
        <button
          className={`btn-like ${post.is_liked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          {post.is_liked ? '❤️' : '🤍'} {post.likes_count}
        </button>
        <CommentSection postId={post.id} comments={post.comments || []} />
      </div>
    </div>
  );
}