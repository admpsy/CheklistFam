import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';

const FleetManagementPage = () => {
  const [forklifts, setForklifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingForklift, setEditingForklift] = useState(null);
  const [formData, setFormData] = useState({
    serial_number: '',
    model: '',
    capacity: '',
    current_status: 'IN_SERVICE',
    last_horimeter: '0',
    is_active: true
  });

  useEffect(() => {
    fetchForklifts();
  }, []);

  const fetchForklifts = async () => {
    try {
      const response = await api.get('/fleet');
      setForklifts(response.data);
    } catch (error) {
      console.error('Erro ao buscar empilhadeiras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        capacity: parseFloat(formData.capacity),
        last_horimeter: parseFloat(formData.last_horimeter)
      };

      if (editingForklift) {
        await api.put(`/fleet/${editingForklift.id}`, payload);
      } else {
        await api.post('/fleet', payload);
      }

      resetForm();
      fetchForklifts();
      alert(editingForklift ? 'Empilhadeira atualizada com sucesso!' : 'Empilhadeira criada com sucesso!');
    } catch (error) {
      alert('Erro ao salvar empilhadeira: ' + (error.response?.data?.error || 'Erro desconhecido'));
    }
  };

  const resetForm = () => {
    setFormData({
      serial_number: '',
      model: '',
      capacity: '',
      current_status: 'IN_SERVICE',
      last_horimeter: '0',
      is_active: true
    });
    setEditingForklift(null);
    setShowForm(false);
  };

  const editForklift = (forklift) => {
    setFormData({
      serial_number: forklift.serial_number,
      model: forklift.model,
      capacity: forklift.capacity.toString(),
      current_status: forklift.current_status,
      last_horimeter: forklift.last_horimeter.toString(),
      is_active: forklift.is_active
    });
    setEditingForklift(forklift);
    setShowForm(true);
  };

  const deleteForklift = async (forklift) => {
    if (!confirm(`Tem certeza que deseja excluir a empilhadeira "${forklift.model} - ${forklift.serial_number}"?`)) {
      return;
    }

    try {
      await api.delete(`/fleet/${forklift.id}`);
      fetchForklifts();
      alert('Empilhadeira excluída com sucesso!');
    } catch (error) {
      alert('Erro ao excluir empilhadeira: ' + (error.response?.data?.error || 'Erro desconhecido'));
    }
  };

  if (loading) {
    return <div className="loading">Carregando frota...</div>;
  }

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="card-title">Gestão de Frota</h2>
            <p>Cadastro e administração da frota de empilhadeiras</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Nova Empilhadeira
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#00aaff', marginBottom: '1rem' }}>
              {editingForklift ? 'Editar Empilhadeira' : 'Nova Empilhadeira'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Número de Série *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Modelo *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Capacidade (kg) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Último Horímetro</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    value={formData.last_horimeter}
                    onChange={(e) => setFormData({ ...formData, last_horimeter: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-control"
                    value={formData.current_status}
                    onChange={(e) => setFormData({ ...formData, current_status: e.target.value })}
                  >
                    <option value="IN_SERVICE">Em Serviço</option>
                    <option value="OUT_OF_SERVICE">Fora de Serviço</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Status no Sistema</label>
                  <select
                    className="form-control"
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                  >
                    <option value={true}>Ativa</option>
                    <option value={false}>Inativa</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingForklift ? 'Atualizar' : 'Criar'} Empilhadeira
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabela de Empilhadeiras */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nº Série</th>
                <th>Modelo</th>
                <th>Capacidade</th>
                <th>Status</th>
                <th>Último Horímetro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {forklifts.map(forklift => (
                <tr key={forklift.id}>
                  <td>{forklift.serial_number}</td>
                  <td>{forklift.model}</td>
                  <td>{forklift.capacity} kg</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '3px',
                      background: forklift.current_status === 'IN_SERVICE' ? '#28a745' : '#dc3545',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}>
                      {forklift.current_status === 'IN_SERVICE' ? 'Em Serviço' : 'Fora de Serviço'}
                    </span>
                  </td>
                  <td>{forklift.last_horimeter}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        onClick={() => editForklift(forklift)}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                        onClick={() => deleteForklift(forklift)}
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

export default FleetManagementPage;
