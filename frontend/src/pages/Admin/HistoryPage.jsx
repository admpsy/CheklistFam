import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';

const HistoryPage = () => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    forklift_id: '',
    operator_id: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchChecklists();
  }, []);

  const fetchChecklists = async (filterParams = {}) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await api.get(`/checklists?${params}`);
      setChecklists(response.data);
    } catch (error) {
      console.error('Erro ao buscar checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    setLoading(true);
    fetchChecklists(filters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      forklift_id: '',
      operator_id: '',
      start_date: '',
      end_date: ''
    };
    setFilters(emptyFilters);
    fetchChecklists(emptyFilters);
  };

  const exportToCSV = () => {
    const headers = [
      'Data',
      'Empilhadeira',
      'Operador',
      'Horímetro Inicial',
      'Horímetro Final',
      'Horas de Uso',
      'Status',
      'Safety Stop'
    ];

    const csvData = checklists.map(item => [
      new Date(item.inspection_date).toLocaleDateString('pt-BR'),
      item.serial_number,
      item.operator_name,
      item.initial_horimeter,
      item.final_horimeter || 'N/A',
      item.hours_of_use || 'N/A',
      item.inspection_status === 'CONFORM' ? 'Conforme' : 'Não Conforme',
      item.safety_stop_reason ? 'Sim' : 'Não'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checklists-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="loading">Carregando histórico...</div>;
  }

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="card-title">Histórico de Check-lists</h2>
            <p>Consulta e exportação de inspeções realizadas</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={exportToCSV}
            disabled={checklists.length === 0}
          >
            Exportar CSV
          </button>
        </div>

        {/* Filtros */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ color: '#00aaff', marginBottom: '1rem' }}>Filtros</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Data Início</label>
              <input
                type="date"
                className="form-control"
                value={filters.start_date}
                onChange={(e) => handleFilterChange('start_date', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Data Fim</label>
              <input
                type="date"
                className="form-control"
                value={filters.end_date}
                onChange={(e) => handleFilterChange('end_date', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button className="btn btn-outline" onClick={clearFilters}>
              Limpar Filtros
            </button>
            <button className="btn btn-primary" onClick={applyFilters}>
              Aplicar Filtros
            </button>
          </div>
        </div>

        {/* Tabela de Check-lists */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Empilhadeira</th>
                <th>Operador</th>
                <th>Horímetro Inicial</th>
                <th>Horímetro Final</th>
                <th>Horas de Uso</th>
                <th>Status</th>
                <th>Safety Stop</th>
              </tr>
            </thead>
            <tbody>
              {checklists.map(checklist => (
                <tr key={checklist.id}>
                  <td>
                    {new Date(checklist.inspection_date).toLocaleDateString('pt-BR')}
                    <br />
                    <small style={{ color: '#ccc' }}>
                      {new Date(checklist.inspection_date).toLocaleTimeString('pt-BR')}
                    </small>
                  </td>
                  <td>{checklist.serial_number}</td>
                  <td>{checklist.operator_name}</td>
                  <td>{checklist.initial_horimeter}</td>
                  <td>{checklist.final_horimeter || 'N/A'}</td>
                  <td>{checklist.hours_of_use || 'N/A'}</td>
                  <td>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '3px',
                      background: checklist.inspection_status === 'CONFORM' ? '#28a745' : '#dc3545',
                      color: 'white',
                      fontSize: '0.875rem'
                    }}>
                      {checklist.inspection_status === 'CONFORM' ? 'Conforme' : 'Não Conforme'}
                    </span>
                  </td>
                  <td>
                    {checklist.safety_stop_reason ? (
                      <span style={{ color: '#dc3545' }}>● Sim</span>
                    ) : (
                      <span style={{ color: '#28a745' }}>● Não</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {checklists.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#ccc' }}>
              Nenhum check-list encontrado com os filtros aplicados.
            </div>
          )}
        </div>

        {/* Estatísticas */}
        {checklists.length > 0 && (
          <div className="card">
            <h3 style={{ color: '#00aaff', marginBottom: '1rem' }}>Resumo do Período</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00aaff' }}>
                  {checklists.length}
                </div>
                <div style={{ color: '#ccc' }}>Total de Check-lists</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
                  {checklists.filter(c => c.inspection_status === 'CONFORM').length}
                </div>
                <div style={{ color: '#ccc' }}>Conformes</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>
                  {checklists.filter(c => c.inspection_status === 'NON_CONFORM').length}
                </div>
                <div style={{ color: '#ccc' }}>Não Conformes</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>
                  {checklists.filter(c => c.safety_stop_reason).length}
                </div>
                <div style={{ color: '#ccc' }}>Safety Stops</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
