import { useState, useEffect } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import PostForm from '../components/PostForm';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/posts/feed/')
      .then(({ data }) => setPosts(data.results ?? data))
      .catch(() => setError('Erro ao carregar o feed.'))
      .finally(() => setLoading(false));
  }, []);

  function handleCreated(post) {
    setPosts((prev) => [post, ...prev]);
  }

  function handleDelete(id) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="page">
      <div className="container">
        <PostForm onCreated={handleCreated} />
        <hr className="divider" />
        {loading && <p className="text-muted">Carregando...</p>}
        {error && <p className="text-danger">{error}</p>}
        {!loading && posts.length === 0 && (
          <p className="text-muted empty-state">
            Seu feed está vazio. Siga outros usuários para ver os posts deles aqui.
          </p>
        )}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}