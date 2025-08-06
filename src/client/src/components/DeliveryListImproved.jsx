import React, { useState, useEffect } from 'react';
import { 
  FaRobot, 
  FaBatteryFull, 
  FaBatteryHalf, 
  FaBatteryQuarter,
  FaBatteryEmpty,
  FaPlay,
  FaPause,
  FaSync,
  FaPlus,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaCog,
  FaChartBar
} from 'react-icons/fa';
import api from '../services/api';
import './DeliveryList.css';

export default function DeliveryList() {
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [tempoRealAtivo, setTempoRealAtivo] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchDrones();
    verificarTempoReal();
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

  const simularEntrega = async () => {
    setSimulating(true);
    try {
      await api.post('/api/drones/simular');
      await fetchDrones();
      adicionarLog('success', 'Simulação de entrega executada com sucesso');
    } catch (error) {
      console.error('Erro ao simular entrega:', error);
      adicionarLog('error', 'Erro ao executar simulação de entrega');
    }
    setSimulating(false);
  };

  const recarregarTodos = async () => {
    try {
      await api.post('/api/drones/recarregar-todos');
      await fetchDrones();
      adicionarLog('success', 'Todos os drones foram recarregados');
    } catch (error) {
      console.error('Erro ao recarregar drones:', error);
      adicionarLog('error', 'Erro ao recarregar drones');
    }
  };

  const adicionarLog = (tipo, mensagem) => {
    const novoLog = {
      id: Date.now(),
      tipo,
      mensagem,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [novoLog, ...prev.slice(0, 9)]);
  };

  const getBatteryIcon = (nivel) => {
    if (nivel > 75) return <FaBatteryFull className="battery-full" />;
    if (nivel > 50) return <FaBatteryHalf className="battery-half" />;
    if (nivel > 25) return <FaBatteryQuarter className="battery-low" />;
    return <FaBatteryEmpty className="battery-empty" />;
  };

  const getStatusClass = (estado) => {
    switch (estado) {
      case 'IDLE': return 'status-idle';
      case 'CARREGANDO': return 'status-loading';
      case 'EM_VOO': return 'status-flying';
      case 'ENTREGANDO': return 'status-delivering';
      case 'RETORNANDO': return 'status-returning';
      default: return 'status-unknown';
    }
  };

  const getLogIcon = (tipo) => {
    switch (tipo) {
      case 'success': return <FaCheckCircle className="log-success" />;
      case 'error': return <FaTimes className="log-error" />;
      case 'warning': return <FaExclamationTriangle className="log-warning" />;
      default: return <FaInfoCircle className="log-info" />;
    }
  };

  if (loading) {
    return (
      <div className="delivery-list">
        <div className="loading">
          <FaSync className="loading-icon" />
          <span>Carregando drones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="delivery-list">
      <div className="delivery-header">
        <h2>
          <FaRobot className="header-icon" />
          Gerenciamento de Drones
        </h2>
        
        <div className="control-panel">
          <button 
            onClick={alternarTempoReal}
            className={`btn ${tempoRealAtivo ? 'btn-warning' : 'btn-success'}`}
          >
            {tempoRealAtivo ? <FaPause /> : <FaPlay />}
            {tempoRealAtivo ? 'Pausar' : 'Iniciar'} Tempo Real
          </button>
          
          <button 
            onClick={simularEntrega}
            disabled={simulating}
            className="btn btn-primary"
          >
            <FaCog className={simulating ? 'spinning' : ''} />
            {simulating ? 'Simulando...' : 'Simular Entrega'}
          </button>
          
          <button 
            onClick={recarregarTodos}
            className="btn btn-secondary"
          >
            <FaBatteryFull />
            Recarregar Todos
          </button>
          
          <button 
            onClick={fetchDrones}
            className="btn btn-info"
          >
            <FaSync />
            Atualizar
          </button>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <FaRobot className="stat-icon" />
          <div className="stat-content">
            <span className="stat-number">{drones.length}</span>
            <span className="stat-label">Total de Drones</span>
          </div>
        </div>
        
        <div className="stat-card">
          <FaCheckCircle className="stat-icon stat-success" />
          <div className="stat-content">
            <span className="stat-number">{drones.filter(d => d.estado === 'IDLE').length}</span>
            <span className="stat-label">Drones Disponíveis</span>
          </div>
        </div>
        
        <div className="stat-card">
          <FaCog className="stat-icon stat-warning" />
          <div className="stat-content">
            <span className="stat-number">{drones.filter(d => d.estado !== 'IDLE').length}</span>
            <span className="stat-label">Drones Ativos</span>
          </div>
        </div>
        
        <div className="stat-card">
          <FaBatteryHalf className="stat-icon stat-info" />
          <div className="stat-content">
            <span className="stat-number">
              {drones.length > 0 ? Math.round(drones.reduce((acc, d) => acc + d.bateriaAtual, 0) / drones.length) : 0}%
            </span>
            <span className="stat-label">Bateria Média</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="drones-grid">
          {drones.map(drone => (
            <div key={drone.id} className="drone-card">
              <div className="drone-header">
                <div className="drone-title">
                  <FaRobot className="drone-icon" />
                  <span className="drone-id">{drone.id}</span>
                </div>
                <div className={`drone-status ${getStatusClass(drone.estado)}`}>
                  {drone.estado}
                </div>
              </div>
              
              <div className="drone-info">
                <div className="info-row">
                  <span className="info-label">Bateria:</span>
                  <div className="battery-info">
                    {getBatteryIcon(drone.bateriaAtual)}
                    <span className="battery-percentage">{Math.round(drone.bateriaAtual)}%</span>
                  </div>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Capacidade:</span>
                  <span className="info-value">{drone.capacidadeMaxima} kg</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Autonomia:</span>
                  <span className="info-value">{drone.autonomiaMaxima} km</span>
                </div>
                
                <div className="info-row">
                  <span className="info-label">Posição:</span>
                  <span className="info-value">({drone.posX}, {drone.posY})</span>
                </div>
                
                {drone.pedidosAlocados && drone.pedidosAlocados.length > 0 && (
                  <div className="info-row">
                    <span className="info-label">Pedidos:</span>
                    <span className="info-value">{drone.pedidosAlocados.length}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="activity-log">
          <h3>
            <FaChartBar className="log-title-icon" />
            Log de Atividades
          </h3>
          <div className="log-container">
            {logs.length === 0 ? (
              <div className="no-logs">
                <FaInfoCircle />
                <span>Nenhuma atividade registrada</span>
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className={`log-entry log-${log.tipo}`}>
                  {getLogIcon(log.tipo)}
                  <span className="log-time">{log.timestamp}</span>
                  <span className="log-message">{log.mensagem}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
