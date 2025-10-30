import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>🏭 Forklift Check - Fam Logística</h1>
          </div>
          
          <div className="user-info">
            <span>Olá, {user?.name}</span>
            <span className="role-badge">{user?.role === 'ADMINISTRATOR' ? 'Administrador' : 'Operador'}</span>
            <button onClick={handleLogout} className="btn btn-outline">
              Sair
            </button>
          </div>
        </div>
      </header>

      <nav className="nav">
        <div className="nav-content">
          <ul className="nav-list">
            {user?.role === 'OPERATOR' && (
              <>
                <li className="nav-item">
                  <Link 
                    to="/checklist" 
                    className={`nav-link ${isActive('/checklist') ? 'active' : ''}`}
                  >
                    Novo Check-list
                  </Link>
                </li>
              </>
            )}
            
            {user?.role === 'ADMINISTRATOR' && (
              <>
                <li className="nav-item">
                  <Link 
                    to="/dashboard" 
                    className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="/users" 
                    className={`nav-link ${isActive('/users') ? 'active' : ''}`}
                  >
                    Usuários
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="/fleet" 
                    className={`nav-link ${isActive('/fleet') ? 'active' : ''}`}
                  >
                    Frota
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    to="/history" 
                    className={`nav-link ${isActive('/history') ? 'active' : ''}`}
                  >
                    Histórico
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="credits">
          <strong>Desenvolvido por Aldemir Garbino com auxílio de IA</strong>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
