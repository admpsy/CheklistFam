import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(username, password);

    if (result.success) {
      navigate('/checklist');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #000000 0%, #333333 100%)'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '2rem' }}>
        <div className="card-header" style={{ textAlign: 'center' }}>
          <h2 className="card-title">Forklift Check</h2>
          <p style={{ color: '#ccc', marginTop: '0.5rem' }}>Fam Logística</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Usuário</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              required
            />
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0, 102, 204, 0.1)', borderRadius: '5px' }}>
          <p style={{ fontSize: '0.875rem', color: '#ccc', textAlign: 'center' }}>
            <strong>Credenciais de teste:</strong><br />
            Admin: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
