import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    registration_number: '',
    role: 'OPERATOR',
    authorized_forklifts: [],
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
      } else {
        await api.post('/users', formData);
      }

      resetForm();
      fetchUsers();
      alert(editingUser ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
    } catch (error) {
      alert('Erro ao salvar usuário: ' + (error.response?.data?.error || 'Erro desconhecido'));
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      name: '',
      registration_number: '',
      role: 'OPERATOR',
      authorized_forklifts: [],
      is_active: true
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const editUser = (user) => {
    setFormData({
      username: user.username,
      password: '', // Não preencher senha por segurança
      name: user.name,
      registration_number: user.registration_number,
      role: user.role,
      authorized_forklifts: user.authorized_forklifts || [],
      is_active: user.is_active
    });
    setEditingUser(user);
    setShowForm(true);
  };

  const deleteUser = async (user) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) {
      return;
    }

    try {
      await api.delete(`/users/${user.id}`);
      fetchUsers();
      alert('Usuário excluído com sucesso!');
    } catch (error) {
      alert('Erro ao excluir usuário: ' + (error.response?.data?.error || 'Erro desconhecido'));
    }
  };

  if (loading) {
    return <div className="loading">Carregando usuários...</div>;
  }

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="card-title">Gestão de Usuários</h2>
            <p>Cadastro e administração de operadores e administradores</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Novo Usuário
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#00aaff', marginBottom: '1rem' }}>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Nome Completo *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Matrícula *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.registration_number}
                    onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Usuário *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Senha {!editingUser && '*'}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? 'Deixe em branco para manter a atual' : ''}
                    required={!editingUser}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Perfil *</label>
                  <select
                    className="form-control"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                  >
                    <option value="OPERATOR">Operador</option>
                    <option value="ADMINISTRATOR">Administrador</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                  >
                    <option value={true}>Ativo</option>
                    <option value={false}>Inativo</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Atualizar' : 'Criar'} Usuário
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabela de Usuários */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Usuário</th>
                <th>Matrícula</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.username}</td>
                  <td>{user.registration_number}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '3px',
                      background: user.role === 'ADMINISTRATOR' ? '#0066cc' : '#28a745',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}>
                      {user.role === 'ADMINISTRATOR' ? 'Administrador' : 'Operador'}
                    </span>
                  </td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '3px',
                      background: user.is_active ? '#28a745' : '#dc3545',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        onClick={() => editUser(user)}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        onClick={() => deleteUser(user)}
                        disabled={user.username === 'admin'} // Não permitir excluir admin
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
