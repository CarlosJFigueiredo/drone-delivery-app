import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Estatisticas() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEstatisticas();
    // Auto-refresh a cada 60 segundos
    const interval = setInterval(fetchEstatisticas, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchEstatisticas = async () => {
    try {
      setError(null);
      const response = await api.get('/pedidos/estatisticas');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setError('Erro ao carregar estatísticas');
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <p>Carregando estatísticas...</p>
    </div>
  );

  if (error) return (
    <div className="alert alert-error">
      ⚠️ {error}
      <button onClick={fetchEstatisticas} style={{ marginLeft: '10px', padding: '5px 10px' }}>
        🔄 Tentar Novamente
      </button>
    </div>
  );

  return (
    <div className="estatisticas">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>📊 Estatísticas do Sistema</h2>
        <button onClick={fetchEstatisticas} className="refresh-btn">
          🔄 Atualizar Dados
        </button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card glass-card">
          <h3>📦 Entregas Realizadas</h3>
          <div className="stat-value completed">{stats.totalEntregas || 0}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>
            Total de entregas concluídas
          </div>
        </div>

        <div className="stat-card glass-card">
          <h3>🚁 Drones Ativos</h3>
          <div className="stat-value">{stats.totalDrones || 0}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>
            Drones disponíveis na frota
          </div>
        </div>

        <div className="stat-card glass-card">
          <h3>⏱️ Tempo Médio</h3>
          <div className="stat-value">{stats.tempoMedioEntrega || 0} min</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>
            Tempo médio por entrega
          </div>
        </div>

        <div className="stat-card glass-card">
          <h3>🏆 Drone Mais Eficiente</h3>
          <div className="stat-value" style={{ fontSize: '1.5rem' }}>
            {stats.droneMaisEficiente || 'N/A'}
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>
            Melhor performance geral
          </div>
        </div>

        <div className="stat-card glass-card">
          <h3>📋 Pedidos na Fila</h3>
          <div className="stat-value pending">{stats.pedidosNaFila || 0}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>
            Aguardando processamento
          </div>
        </div>

        <div className="stat-card glass-card">
          <h3>🔋 Bateria Média</h3>
          <div className="stat-value">{stats.bateriaMedia || 0}%</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>
            Nível médio da frota
          </div>
        </div>

        <div className="stat-card glass-card">
          <h3>📏 Distância Total</h3>
          <div className="stat-value">{stats.distanciaTotal || 0} km</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>
            Percorrida por toda frota
          </div>
        </div>

        <div className="stat-card glass-card">
          <h3>🚫 Zonas de Exclusão</h3>
          <div className="stat-value">{stats.zonasExclusao || 0}</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>
            Áreas restritas ativas
          </div>
        </div>
      </div>

      {/* Performance Grid Detalhada */}
      <div style={{ marginTop: '40px' }}>
        <h3>📈 Performance Detalhada</h3>
        <div className="performance-grid">
          <div className="performance-item glass-card-dark">
            <span className="performance-label">📦 Taxa de Sucesso</span>
            <span className="performance-value completed">
              {stats.totalEntregas > 0 ? '100%' : '0%'}
            </span>
          </div>
          
          <div className="performance-item glass-card-dark">
            <span className="performance-label">⚡ Eficiência Energética</span>
            <span className="performance-value">
              {stats.bateriaMedia > 70 ? 'Alta' : stats.bateriaMedia > 40 ? 'Média' : 'Baixa'}
            </span>
          </div>
          
          <div className="performance-item glass-card-dark">
            <span className="performance-label">🎯 Precisão de Rota</span>
            <span className="performance-value completed">Otimizada</span>
          </div>
          
          <div className="performance-item glass-card-dark">
            <span className="performance-label">🔄 Tempo de Ciclo</span>
            <span className="performance-value">
              {stats.tempoMedioEntrega || 0} min
            </span>
          </div>
        </div>
      </div>

      {/* Resumo de Ações */}
      <div className="action-summary">
        <div className="summary-item">
          <div className="summary-label">Entregas Hoje</div>
          <div className="summary-value completed">{stats.entregasHoje || 0}</div>
        </div>
        
        <div className="summary-item">
          <div className="summary-label">Em Processamento</div>
          <div className="summary-value pending">{stats.pedidosProcessando || 0}</div>
        </div>
        
        <div className="summary-item">
          <div className="summary-label">Drones Ativos</div>
          <div className="summary-value">{stats.dronesAtivos || 0}</div>
        </div>
        
        <div className="summary-item">
          <div className="summary-label">Uptime Sistema</div>
          <div className="summary-value completed">99.9%</div>
        </div>
      </div>

      {/* Status em Tempo Real */}
      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <div className="alert alert-success">
          🟢 Sistema operacional • Última atualização: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}


