import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/feed" className="navbar-brand">𝕏 Clone</Link>
        {user && (
          <div className="navbar-links">
            <Link to="/feed">Feed</Link>
            <Link to={`/profile/${user.username}`}>@{user.username}</Link>
            <Link to="/profile/edit">Editar perfil</Link>
            <button onClick={handleLogout} className="btn-link">Sair</button>
          </div>
        )}
      </div>
    </nav>
  );
}