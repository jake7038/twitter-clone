import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import FollowButton from '../components/FollowButton';

export default function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('posts'); // 'posts' | 'followers' | 'following'
  const [followList, setFollowList] = useState([]);

  const isMe = me?.username === username;

  useEffect(() => {
    setLoading(true);
    setTab('posts');
    Promise.all([
      api.get(`/users/${username}/`),
      api.get(`/users/${username}/posts/`),
    ])
      .then(([profileRes, postsRes]) => {
        setProfile(profileRes.data);
        setPosts(postsRes.data.results ?? postsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [username]);

  async function loadTab(newTab) {
    setTab(newTab);
    if (newTab === 'posts') return;
    try {
      const { data } = await api.get(`/users/${username}/${newTab}/`);
      setFollowList(data.results ?? data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleFollowToggle({ followers_count, following }) {
    setProfile((p) => ({ ...p, followers_count, is_followed: following }));
  }

  function handleDeletePost(id) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) return <div className="page"><div className="container"><p className="text-muted">Carregando...</p></div></div>;
  if (!profile) return <div className="page"><div className="container"><p className="text-danger">Usuário não encontrado.</p></div></div>;

  return (
    <div className="page">
      <div className="container">
        {/* Profile header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {profile.avatar_url
              ? <img src={profile.avatar_url} alt={profile.username} />
              : <div className="avatar-placeholder">{profile.username[0].toUpperCase()}</div>
            }
          </div>
          <div className="profile-info">
            <div className="profile-name-row">
              <div>
                <h2 className="profile-name">
                  {profile.first_name || profile.last_name
                    ? `${profile.first_name} ${profile.last_name}`.trim()
                    : profile.username}
                </h2>
                <span className="profile-username">@{profile.username}</span>
              </div>
              {isMe
                ? <Link to="/profile/edit" className="btn btn-outline">Editar perfil</Link>
                : <FollowButton username={username} initialFollowing={profile.is_followed} onToggle={handleFollowToggle} />
              }
            </div>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            <div className="profile-stats">
              <button className={`stat-btn ${tab === 'posts' ? 'active' : ''}`} onClick={() => loadTab('posts')}>
                <strong>{posts.length}</strong> posts
              </button>
              <button className={`stat-btn ${tab === 'followers' ? 'active' : ''}`} onClick={() => loadTab('followers')}>
                <strong>{profile.followers_count}</strong> seguidores
              </button>
              <button className={`stat-btn ${tab === 'following' ? 'active' : ''}`} onClick={() => loadTab('following')}>
                <strong>{profile.following_count}</strong> seguindo
              </button>
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* Tab content */}
        {tab === 'posts' && (
          posts.length === 0
            ? <p className="text-muted empty-state">Nenhum post ainda.</p>
            : posts.map((post) => (
                <PostCard key={post.id} post={post} onDelete={isMe ? handleDeletePost : undefined} />
              ))
        )}

        {(tab === 'followers' || tab === 'following') && (
          <div className="user-list">
            {followList.length === 0 && (
              <p className="text-muted empty-state">
                {tab === 'followers' ? 'Nenhum seguidor ainda.' : 'Não está seguindo ninguém.'}
              </p>
            )}
            {followList.map((u) => (
              <Link to={`/profile/${u.username}`} key={u.id} className="user-list-item">
                <div className="avatar-sm">
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt={u.username} />
                    : <div className="avatar-placeholder sm">{u.username[0].toUpperCase()}</div>
                  }
                </div>
                <div>
                  <strong>@{u.username}</strong>
                  {u.first_name && <span className="text-muted"> · {u.first_name} {u.last_name}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}