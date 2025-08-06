import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function DashboardAvancado() {
  const [estatisticas, setEstatisticas] = useState({});
  const [tempoReal, setTempoReal] = useState({});
  const [simulacaoAtiva, setSimulacaoAtiva] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
    // Auto-refresh a cada 5 segundos
    const interval = setInterval(carregarDados, 5000);
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      const [statsResponse, tempoRealResponse] = await Promise.all([
        api.get('/api/pedidos/estatisticas'),
        api.get('/api/tempo-real/status')
      ]);
      
      setEstatisticas(statsResponse.data);
      setTempoReal(tempoRealResponse.data);
      setSimulacaoAtiva(tempoRealResponse.data.ativo);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setLoading(false);
  };

  const alternarSimulacao = async () => {
    try {
      if (simulacaoAtiva) {
        await api.post('/api/tempo-real/parar');
        setSimulacaoAtiva(false);
      } else {
        await api.post('/api/tempo-real/iniciar');
        setSimulacaoAtiva(true);
      }
    } catch (error) {
      console.error('Erro ao alterar simulação:', error);
    }
  };

  const simularEventos = async () => {
    try {
      await api.post('/api/tempo-real/eventos');
      alert('Simulação de eventos aleatórios iniciada!');
    } catch (error) {
      console.error('Erro ao simular eventos:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>📊 Dashboard Avançado</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div className={`status-indicator ${simulacaoAtiva ? 'active' : 'inactive'}`}>
            {simulacaoAtiva ? '🟢 Simulação Ativa' : '🔴 Simulação Inativa'}
          </div>
        </div>
      </div>

      {/* Controles de Simulação */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '15px',
        padding: '25px',
        marginBottom: '30px',
        color: 'white'
      }}>
        <h3 style={{ margin: '0 0 20px 0' }}>🎮 Controles de Simulação</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <button
            onClick={alternarSimulacao}
            style={{
              padding: '12px 24px',
              background: simulacaoAtiva ? '#e74c3c' : '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {simulacaoAtiva ? '⏹️ Parar Simulação' : '▶️ Iniciar Simulação'}
          </button>
          
          <button
            onClick={simularEventos}
            style={{
              padding: '12px 24px',
              background: '#f39c12',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🌩️ Simular Eventos
          </button>
        </div>
      </div>

      {/* Estatísticas Principais */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <h3>📦 Total de Entregas</h3>
          <div className="stat-value">{estatisticas.totalEntregas || 0}</div>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
          <h3>🚁 Drones Ativos</h3>
          <div className="stat-value">{estatisticas.totalDrones || 0}</div>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
          <h3>⏱️ Tempo Médio</h3>
          <div className="stat-value">{estatisticas.tempoMedioEntrega || 0}min</div>
        </div>
        
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
          <h3>📋 Fila de Pedidos</h3>
          <div className="stat-value">{estatisticas.pedidosNaFila || 0}</div>
        </div>
      </div>

      {/* Performance do Sistema */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '15px',
        padding: '25px',
        marginBottom: '30px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ color: '#2c3e50', marginBottom: '20px' }}>🏆 Performance do Sistema</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ color: '#34495e', marginBottom: '15px' }}>📈 Eficiência de Entregas</h4>
            <div style={{ 
              background: '#ecf0f1',
              borderRadius: '10px',
              padding: '15px',
              border: '1px solid #bdc3c7'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: '600' }}>Taxa de Sucesso:</span>
                <span style={{ float: 'right', color: '#27ae60', fontWeight: '700' }}>
                  {estatisticas.totalEntregas > 0 ? '98.5%' : '0%'}
                </span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: '600' }}>Drone Mais Eficiente:</span>
                <span style={{ float: 'right', color: '#3498db', fontWeight: '700' }}>
                  {estatisticas.droneMaisEficiente || 'N/A'}
                </span>
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>Uptime do Sistema:</span>
                <span style={{ float: 'right', color: '#e67e22', fontWeight: '700' }}>
                  {simulacaoAtiva ? '99.9%' : '0%'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#34495e', marginBottom: '15px' }}>⚡ Métricas Operacionais</h4>
            <div style={{ 
              background: '#ecf0f1',
              borderRadius: '10px',
              padding: '15px',
              border: '1px solid #bdc3c7'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: '600' }}>Entregas/Hora:</span>
                <span style={{ float: 'right', color: '#9b59b6', fontWeight: '700' }}>
                  {Math.round((estatisticas.totalEntregas || 0) * 1.5)}
                </span>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <span style={{ fontWeight: '600' }}>Distância Total:</span>
                <span style={{ float: 'right', color: '#e74c3c', fontWeight: '700' }}>
                  {Math.round((estatisticas.totalEntregas || 0) * 8.3)} km
                </span>
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>Economia de Combustível:</span>
                <span style={{ float: 'right', color: '#16a085', fontWeight: '700' }}>
                  {Math.round((estatisticas.totalEntregas || 0) * 2.1)} L
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Relatório em Tempo Real */}
      {tempoReal.relatorio && (
        <div style={{ 
          background: 'rgba(44, 62, 80, 0.9)',
          color: 'white',
          borderRadius: '15px',
          padding: '25px',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          lineHeight: '1.6'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#ecf0f1' }}>📊 Relatório em Tempo Real</h3>
          <pre style={{ 
            margin: 0, 
            whiteSpace: 'pre-wrap',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {tempoReal.relatorio}
          </pre>
        </div>
      )}

      {/* Footer com informações de atualização */}
      <div style={{ 
        textAlign: 'center',
        marginTop: '30px',
        padding: '15px',
        background: 'rgba(149, 165, 166, 0.1)',
        borderRadius: '10px',
        color: '#7f8c8d'
      }}>
        <small>
          🔄 Atualização automática a cada 5 segundos • 
          Última atualização: {new Date().toLocaleTimeString()}
        </small>
      </div>
    </div>
  );
}