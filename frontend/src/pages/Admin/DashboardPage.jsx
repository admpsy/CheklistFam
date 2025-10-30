import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/reports/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Carregando dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="alert alert-error">Erro ao carregar dados do dashboard</div>;
  }

  return (
    <div className="main-content">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Dashboard - Visão Geral</h2>
          <p>Métricas e indicadores do sistema</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{dashboardData.forklifts.total}</div>
            <div className="stat-label">Total de Empilhadeiras</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{dashboardData.forklifts.in_service}</div>
            <div className="stat-label">Em Serviço</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{dashboardData.forklifts.out_of_service}</div>
            <div className="stat-label">Fora de Serviço</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{dashboardData.today_checklists}</div>
            <div className="stat-label">Check-lists Hoje</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{dashboardData.monthly_nc}</div>
            <div className="stat-label">NC's Este Mês</div>
          </div>

          <div className="stat-card">
            <div className="stat-number">{dashboardData.monthly_hours.toFixed(1)}h</div>
            <div className="stat-label">Horas de Uso (Mês)</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 style={{ color: '#00aaff', marginBottom: '1rem' }}>Ações Rápidas</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/fleet'}
            >
              Gerenciar Frota
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/users'}
            >
              Gerenciar Usuários
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/history'}
            >
              Ver Histórico
            </button>
          </div>
        </div>

        {/* Alertas */}
        {dashboardData.forklifts.out_of_service > 0 && (
          <div className="alert alert-warning">
            <strong>⚠️ Atenção:</strong> Existem {dashboardData.forklifts.out_of_service} empilhadeira(s) 
            fora de serviço. Verifique os check-lists recentes para mais detalhes.
          </div>
        )}

        {dashboardData.monthly_nc > 0 && (
          <div className="alert alert-warning">
            <strong>📊 Análise:</strong> Foram registradas {dashboardData.monthly_nc} não conformidades 
            este mês. Considere revisar os treinamentos e procedimentos.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
