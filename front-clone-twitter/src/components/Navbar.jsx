import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/users/search/?q=${encodeURIComponent(value)}`);
        setResults(data.results ?? data);
        setOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 350);
  }

  function handleSelect(username) {
    setQuery('');
    setResults([]);
    setOpen(false);
    navigate(`/profile/${username}`);
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/feed" className="navbar-brand">𝕏 Clone</Link>

        {user && (
          <>
            {/* Busca */}
            <div className="search-wrapper" ref={wrapperRef}>
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  value={query}
                  onChange={handleChange}
                  placeholder="Buscar usuários..."
                  className="search-input"
                  onFocus={() => results.length > 0 && setOpen(true)}
                />
                {loading && <span className="search-spinner" />}
              </div>

              {open && (
                <div className="search-dropdown">
                  {results.length === 0 ? (
                    <div className="search-empty">Nenhum usuário encontrado.</div>
                  ) : (
                    results.map((u) => (
                      <button
                        key={u.id}
                        className="search-result-item"
                        onClick={() => handleSelect(u.username)}
                      >
                        <div className="search-avatar">
                          {u.avatar_url
                            ? <img src={u.avatar_url} alt={u.username} />
                            : <div className="avatar-placeholder sm">{u.username[0].toUpperCase()}</div>
                          }
                        </div>
                        <div className="search-result-info">
                          <span className="search-result-username">@{u.username}</span>
                          {(u.first_name || u.last_name) && (
                            <span className="search-result-name">
                              {u.first_name} {u.last_name}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Links */}
            <div className="navbar-links">
              <Link to="/feed">Feed</Link>
              <Link to={`/profile/${user.username}`}>@{user.username}</Link>
              <Link to="/profile/edit">Editar perfil</Link>
              <button onClick={handleLogout} className="btn-link">Sair</button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}