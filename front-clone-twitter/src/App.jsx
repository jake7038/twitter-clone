import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page"><p className="text-muted" style={{textAlign:'center'}}>Carregando...</p></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/feed" replace /> : children;
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/feed" element={<PrivateRoute><Layout><Feed /></Layout></PrivateRoute>} />
          <Route path="/profile/edit" element={<PrivateRoute><Layout><EditProfile /></Layout></PrivateRoute>} />
          <Route path="/profile/:username" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}