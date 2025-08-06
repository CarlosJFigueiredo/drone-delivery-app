import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function DeliveryList() {
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [tempoRealAtivo, setTempoRealAtivo] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchDrones();
    verificarTempoReal();
    // Auto-refresh a cada 5 segundos quando tempo real estiver ativo
    const interval = setInterval(() => {
      fetchDrones();
      if (tempoRealAtivo) {
        adicionarLog('info', 'Dados atualizados automaticamente');
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [tempoRealAtivo]);

  const fetchDrones = async () => {
    try {
      const response = await api.get('/api/drones');
      setDrones(response.data);
    } catch (error) {
      console.error('Erro ao buscar drones:', error);
      adicionarLog('error', 'Erro ao buscar dados dos drones');
    }
    setLoading(false);
  };

  const verificarTempoReal = async () => {
    try {
      const response = await api.get('/api/tempo-real/status');
      setTempoRealAtivo(response.data.ativo);
    } catch (error) {
      console.error('Erro ao verificar tempo real:', error);
    }
  };

  const alternarTempoReal = async () => {
    try {
      if (tempoRealAtivo) {
        await api.post('/api/tempo-real/parar');
        setTempoRealAtivo(false);
        adicionarLog('warning', 'Simulação em tempo real pausada');
      } else {
        await api.post('/api/tempo-real/iniciar');
        setTempoRealAtivo(true);
        adicionarLog('success', 'Simulação em tempo real iniciada');
      }
    } catch (error) {
      console.error('Erro ao alterar tempo real:', error);
      adicionarLog('error', 'Erro ao alterar simulação em tempo real');
    }
  };

  const adicionarLog = (level, message) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    setLogs(prev => [newLog, ...prev].slice(0, 10)); // Manter apenas os 10 últimos logs
  };

  const simularEntregas = async () => {
    setSimulating(true);
    adicionarLog('info', 'Iniciando simulação de entregas...');
    try {
      await api.post('/api/drones/simular');
      await fetchDrones();
      adicionarLog('success', 'Simulação de entregas concluída com sucesso');
      // Mostrar feedback visual de sucesso
      document.querySelector('.simulate-btn')?.classList.add('btn-success-feedback');
      setTimeout(() => {
        document.querySelector('.simulate-btn')?.classList.remove('btn-success-feedback');
      }, 600);
    } catch (error) {
      console.error('Erro ao simular entregas:', error);
      adicionarLog('error', 'Erro ao simular entregas: ' + (error.response?.data || error.message));
      alert('Erro ao simular entregas: ' + (error.response?.data || error.message));
    }
    setSimulating(false);
  };

  const simularEventosAleatorios = async () => {
    try {
      await api.post('/api/tempo-real/eventos');
      adicionarLog('warning', 'Simulação de eventos aleatórios iniciada');
      alert('Simulação de eventos aleatórios iniciada!');
    } catch (error) {
      console.error('Erro ao simular eventos:', error);
      adicionarLog('error', 'Erro ao simular eventos aleatórios');
    }
  };

  const recarregarDrone = async (droneId) => {
    try {
      await api.post(`/api/drones/recarregar/${droneId}`);
      await fetchDrones();
      adicionarLog('success', `Drone ${droneId} recarregado com sucesso`);
    } catch (error) {
      console.error('Erro ao recarregar drone:', error);
      adicionarLog('error', `Erro ao recarregar drone ${droneId}`);
    }
  };

  const recarregarTodos = async () => {
    try {
      await api.post('/api/drones/recarregar-todos');
      await fetchDrones();
      adicionarLog('success', 'Todos os drones foram recarregados');
    } catch (error) {
      console.error('Erro ao recarregar todos os drones:', error);
      adicionarLog('error', 'Erro ao recarregar todos os drones');
    }
  };

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'ALTA': return '#e74c3c';
      case 'MEDIA': return '#f39c12';
      case 'BAIXA': return '#3498db';
      default: return '#3498db';
    }
  };

  const getBateriaPercentual = (bateriaAtual, autonomiaMaxima) => {
    return Math.round((bateriaAtual / autonomiaMaxima) * 100);
  };

  const getBateriaColor = (percentual) => {
    if (percentual > 60) return 'battery-high';
    if (percentual > 30) return 'battery-medium';
    if (percentual > 10) return 'battery-low';
    return 'battery-critical';
  };

  const getStatusIcon = (estado) => {
    const icons = {
      'IDLE': '⚡',
      'CARREGANDO': '📦',
      'EM_VOO': '🚁',
      'ENTREGANDO': '📍',
      'RETORNANDO': '🔄'
    };
    return icons[estado] || '❓';
  };

  const getStatusClass = (estado) => {
    return `status-${estado.toLowerCase().replace('_', '-')}`;
  };

  const getPerformanceIndicator = (bateria) => {
    if (bateria > 70) return { class: 'perf-excellent', text: 'Excelente' };
    if (bateria > 40) return { class: 'perf-good', text: 'Bom' };
    return { class: 'perf-average', text: 'Baixo' };
  };

  if (loading) return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <p>Carregando drones...</p>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🚁 Frota de Drones ({drones.length})</h2>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div className={`status-indicator ${tempoRealAtivo ? 'active' : 'inactive'}`}>
            {tempoRealAtivo ? '🟢 Tempo Real Ativo' : '🔴 Tempo Real Inativo'}
          </div>
          <div className="alert alert-success" style={{ margin: 0, padding: '8px 16px' }}>
            ✅ Sistema Online
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <button 
          onClick={simularEntregas} 
          disabled={simulating}
          className="simulate-btn"
          style={{
            opacity: simulating ? 0.7 : 1,
            cursor: simulating ? 'not-allowed' : 'pointer'
          }}
        >
          {simulating ? (
            <>
              <div className="loading-spinner" style={{ width: '16px', height: '16px', marginRight: '8px' }}></div>
              Simulando...
            </>
          ) : (
            '🚀 Simular Entregas'
          )}
        </button>
        
        <button
          onClick={alternarTempoReal}
          className={tempoRealAtivo ? 'refresh-btn' : 'simulate-btn'}
          style={{
            background: tempoRealAtivo 
              ? 'linear-gradient(45deg, #e74c3c, #c0392b)' 
              : 'linear-gradient(45deg, #27ae60, #229954)'
          }}
        >
          {tempoRealAtivo ? '⏹️ Parar Tempo Real' : '▶️ Iniciar Tempo Real'}
        </button>
        
        <button onClick={recarregarTodos} className="refresh-btn">
          🔋 Recarregar Todos
        </button>

        <button onClick={fetchDrones} className="refresh-btn">
          🔄 Atualizar
        </button>
      </div>

      {/* Console de Logs */}
      {logs.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#2c3e50', marginBottom: '10px' }}>📋 Log de Atividades</h4>
          <div className="console-log" style={{ maxHeight: '150px' }}>
            {logs.map((log) => (
              <div key={log.id} className="log-entry">
                <span className="log-timestamp">[{log.timestamp}]</span>
                <span className={`log-level-${log.level}`}> {log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {drones.length === 0 ? (
        <div className="alert alert-warning">
          ⚠️ Nenhum drone cadastrado. Cadastre drones na seção "Cadastros" para começar.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
          {drones.map((drone) => {
            const bateriaPercent = getBateriaPercentual(drone.bateriaAtual, drone.autonomiaMaxima);
            const bateriaClass = getBateriaColor(bateriaPercent);
            const statusClass = getStatusClass(drone.estado);
            const performance = getPerformanceIndicator(bateriaPercent);
            
            return (
              <div key={drone.id} className="drone-card">
                <div className="drone-header">
                  <div className="drone-id">
                    🚁 {drone.id}
                  </div>
                  <div className={`status-badge ${statusClass}`}>
                    {getStatusIcon(drone.estado)} {drone.estado.replace('_', ' ')}
                  </div>
                </div>

                <div className="drone-stats">
                  <div className="stat-item">
                    <div className="stat-label">Capacidade</div>
                    <div className="stat-value-small">{drone.capacidadeMaxima} kg</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Autonomia</div>
                    <div className="stat-value-small">{drone.autonomiaMaxima} km</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Posição</div>
                    <div className="stat-value-small">({drone.posX}, {drone.posY})</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Performance</div>
                    <div className={`performance-indicator ${performance.class}`}>
                      {performance.text}
                    </div>
                  </div>
                </div>

                <div style={{ margin: '15px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>🔋 Bateria</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{bateriaPercent}%</span>
                  </div>
                  <div className="battery-progress">
                    <div 
                      className={`battery-fill ${bateriaClass}`}
                      style={{ width: `${bateriaPercent}%` }}
                    ></div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '2px' }}>
                    {drone.bateriaAtual.toFixed(1)} / {drone.autonomiaMaxima} km
                  </div>
                </div>

                {drone.pedidosAlocados && drone.pedidosAlocados.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#34495e' }}>
                      📦 Pedidos Alocados ({drone.pedidosAlocados.length})
                    </h4>
                    <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                      {drone.pedidosAlocados.map((pedido) => {
                        const borderColor = getPrioridadeColor(pedido.prioridade);
                        return (
                          <div key={`${drone.id}-${pedido.x}-${pedido.y}-${pedido.peso}`} style={{
                            padding: '8px 12px',
                            margin: '5px 0',
                            background: 'rgba(52, 152, 219, 0.1)',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            borderLeft: `3px solid ${borderColor}`
                          }}>
                            <div style={{ fontWeight: '600' }}>📍 ({pedido.x}, {pedido.y})</div>
                            <div style={{ color: '#7f8c8d' }}>
                              {pedido.peso}kg • Prioridade: {pedido.prioridade}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {bateriaPercent < 20 && (
                  <div className="alert alert-warning" style={{ margin: '15px 0 0 0' }}>
                    ⚠️ Bateria baixa! Recarregar recomendado.
                  </div>
                )}

                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => recarregarDrone(drone.id)}
                    className="recharge-btn"
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      background: '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🔋 Recarregar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
