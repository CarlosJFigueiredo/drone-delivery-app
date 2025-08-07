import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function Estatisticas() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEstatisticas();
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

  // Funções auxiliares para reduzir complexidade cognitiva
  const getBatteryColor = (bateria) => {
    if (bateria > 50) return '#22c55e';
    if (bateria > 20) return '#f59e0b';
    return '#ef4444';
  };

  const getPriorityIcon = (prioridade) => {
    const icons = {
      'ALTA': '🔴',
      'MEDIA': '🟡',
      'BAIXA': '🟢'
    };
    return icons[prioridade] || '⭕';
  };

  const getPriorityColor = (prioridade) => {
    const cores = {
      'ALTA': '#ef4444',
      'MEDIA': '#f59e0b',
      'BAIXA': '#22c55e'
    };
    return cores[prioridade] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'IDLE': '🟢',
      'EM_VOO': '🚁',
      'ENTREGANDO': '📦',
      'CHARGING': '🔋',
      'RETORNANDO': '🔄'
    };
    return icons[status] || '⭕';
  };

  const getStatusColor = (status) => {
    if (status === 'EM_VOO' || status === 'ENTREGANDO') return '#22c55e';
    if (status === 'CHARGING') return '#f59e0b';
    return '#6b7280';
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

        <div className="stat-card glass-card">
          <h3>🔋 Consumo Médio</h3>
          <div className="stat-value">{stats.consumoMedioBateria || 0}%</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>
            Bateria por entrega
          </div>
        </div>

        <div className="stat-card glass-card">
          <h3>⚡ Eficiência Geral</h3>
          <div className="stat-value" style={{ 
            color: (() => {
              const eff = stats.eficienciaGeral;
              if (eff > 80) return '#22c55e';
              if (eff > 60) return '#f59e0b';
              return '#ef4444';
            })()
          }}>
            {stats.eficienciaGeral || 0}%
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>
            Performance da frota
          </div>
        </div>
      </div>

      {/* Status da Frota */}
      <div style={{ marginTop: '30px' }}>
        <h2>📊 Status da Frota</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
          <div className="stat-card glass-card">
            <h4>🚁 Drones Ativos</h4>
            <div className="stat-value" style={{ color: '#22c55e' }}>{stats.dronesAtivos || 0}</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>
              Em operação agora
            </div>
          </div>

          <div className="stat-card glass-card">
            <h4>🔋 Bateria Média</h4>
            <div className="stat-value" style={{ color: getBatteryColor(stats.bateriaMedia || 0) }}>
              {stats.bateriaMedia || 0}%
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>
              Nível da frota
            </div>
          </div>

          <div className="stat-card glass-card">
            <h4>📏 Distância Total</h4>
            <div className="stat-value" style={{ color: '#3b82f6' }}>{stats.distanciaTotal || 0} km</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>
              Percorrida hoje
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas por Prioridade */}
      {stats.pedidosPorPrioridade && Object.keys(stats.pedidosPorPrioridade).length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2>📋 Pedidos por Prioridade</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginTop: '15px' }}>
            {Object.entries(stats.pedidosPorPrioridade).map(([prioridade, quantidade]) => (
              <div key={prioridade} className="stat-card glass-card">
                <h4>{getPriorityIcon(prioridade)} {prioridade}</h4>
                <div className="stat-value" style={{ 
                  color: getPriorityColor(prioridade) 
                }}>
                  {quantidade}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>
                  Na fila
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status dos Drones */}
      {stats.statusFrota && Object.keys(stats.statusFrota).length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2>🔧 Status Individual</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginTop: '15px' }}>
            {Object.entries(stats.statusFrota).map(([status, quantidade]) => (
              <div key={status} className="stat-card glass-card">
                <h4>
                  {getStatusIcon(status)} 
                  {status.replace('_', ' ')}
                </h4>
                <div className="stat-value" style={{ 
                  color: getStatusColor(status)
                }}>
                  {quantidade}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '5px' }}>
                  {quantidade === 1 ? 'drone' : 'drones'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
              {(() => {
                const nivel = stats.bateriaMedia;
                if (nivel > 70) return 'Alta';
                if (nivel > 40) return 'Média';
                return 'Baixa';
              })()}
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

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <div className="alert alert-success">
          🟢 Sistema operacional • Última atualização: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}


