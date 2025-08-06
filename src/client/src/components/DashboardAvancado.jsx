import React, { useState, useEffect } from 'react';
import { 
  FaTachometerAlt,
  FaRobot,
  FaShippingFast,
  FaClock,
  FaBatteryFull,
  FaMapMarkerAlt,
  FaChartLine,
  FaPlay,
  FaPause,
  FaSync,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaCog
} from 'react-icons/fa';
import api from '../services/api';
import './DashboardAvancado.css';

export default function DashboardAvancado() {
  const [estatisticas, setEstatisticas] = useState({});
  const [drones, setDrones] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [tempoRealAtivo, setTempoRealAtivo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    carregarDados();
    verificarTempoReal();
    const interval = setInterval(() => {
      if (tempoRealAtivo) {
        carregarDados();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [tempoRealAtivo]);

  const carregarDados = async () => {
    try {
      const [statsRes, dronesRes, entregasRes, bateriaRes] = await Promise.all([
        api.get('/pedidos/estatisticas'),
        api.get('/drones'),
        api.get('/pedidos/entregas'),
        api.get('/drones/status-bateria')
      ]);
      
      setEstatisticas(statsRes.data);
      setDrones(dronesRes.data);
      setEntregas(entregasRes.data);
      
      // Gerar alertas baseados nos dados de bateria
      gerarAlertasBateria(bateriaRes.data);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setLoading(false);
  };

  const verificarTempoReal = async () => {
    try {
      const response = await api.get('/tempo-real/status');
      setTempoRealAtivo(response.data.ativo);
    } catch (error) {
      console.error('Erro ao verificar tempo real:', error);
    }
  };

  const alternarTempoReal = async () => {
    try {
      if (tempoRealAtivo) {
        await api.post('/tempo-real/parar');
        setTempoRealAtivo(false);
      } else {
        await api.post('/tempo-real/iniciar');
        setTempoRealAtivo(true);
      }
    } catch (error) {
      console.error('Erro ao alterar tempo real:', error);
    }
  };

  const gerarAlertasBateria = (dadosBateria) => {
    const novosAlertas = [];
    
    if (dadosBateria && dadosBateria.drones) {
      dadosBateria.drones.forEach(drone => {
        if (drone.bateriaCritica) {
          novosAlertas.push({
            id: `critical-${drone.id}`,
            tipo: 'error',
            mensagem: `🔋 CRÍTICO: Drone ${drone.id} com bateria crítica (${Math.round(drone.bateria)}%)`
          });
        } else if (drone.bateriaBaixa) {
          novosAlertas.push({
            id: `battery-${drone.id}`,
            tipo: 'warning',
            mensagem: `⚠️ Drone ${drone.id} com bateria baixa (${Math.round(drone.bateria)}%)`
          });
        }
        
        if (drone.emRecarga) {
          novosAlertas.push({
            id: `charging-${drone.id}`,
            tipo: 'info',
            mensagem: `🔌 Drone ${drone.id} recarregando (${Math.round(drone.bateria)}%)`
          });
        }
      });
    }
    
    setAlertas(novosAlertas);
  };

  const forcarRetornoDrone = async (droneId) => {
    try {
      await api.post(`/drones/forcar-retorno/${droneId}`);
      await carregarDados();
    } catch (error) {
      console.error('Erro ao forçar retorno do drone:', error);
    }
  };

  const getBatteryColor = (bateria) => {
    if (bateria > 50) return '#27ae60'; // Verde
    if (bateria > 20) return '#f39c12'; // Amarelo
    return '#e74c3c'; // Vermelho
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <FaSync className="loading-spinner" />
        <span>Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-avancado">
      <div className="dashboard-header">
        <div className="header-title">
          <FaTachometerAlt className="title-icon" />
          <h1>Dashboard de Controle</h1>
          <div className={`status-indicator ${tempoRealAtivo ? 'active' : 'inactive'}`}>
            <div className="status-dot"></div>
            {tempoRealAtivo ? 'Tempo Real Ativo' : 'Tempo Real Inativo'}
          </div>
        </div>
        
        <div className="header-controls">
          <button 
            onClick={alternarTempoReal}
            className={`control-btn ${tempoRealAtivo ? 'btn-stop' : 'btn-start'}`}
          >
            {tempoRealAtivo ? <FaPause /> : <FaPlay />}
            {tempoRealAtivo ? 'Pausar' : 'Iniciar'} Simulação
          </button>
          
          <button 
            onClick={carregarDados}
            className="control-btn btn-refresh"
          >
            <FaSync />
            Atualizar
          </button>
        </div>
      </div>

      {alertas.length > 0 && (
        <div className="alertas-section">
          <h3>
            <FaExclamationTriangle />
            Alertas do Sistema
          </h3>
          <div className="alertas-grid">
            {alertas.map(alerta => (
              <div key={alerta.id} className={`alerta alerta-${alerta.tipo}`}>
                {alerta.tipo === 'error' ? <FaExclamationTriangle /> : <FaInfoCircle />}
                {alerta.mensagem}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">
            <FaRobot />
          </div>
          <div className="metric-content">
            <div className="metric-value">{estatisticas.totalDrones || 0}</div>
            <div className="metric-label">Total de Drones</div>
            <div className="metric-detail">
              {drones.filter(d => d.estado === 'IDLE').length} disponíveis
            </div>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">
            <FaShippingFast />
          </div>
          <div className="metric-content">
            <div className="metric-value">{estatisticas.totalEntregas || 0}</div>
            <div className="metric-label">Entregas Realizadas</div>
            <div className="metric-detail">
              {entregas.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length} hoje
            </div>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">
            <FaBatteryFull />
          </div>
          <div className="metric-content">
            <div className="metric-value">
              {drones.length > 0 ? Math.round(drones.reduce((acc, d) => acc + d.bateriaAtual, 0) / drones.length) : 0}%
            </div>
            <div className="metric-label">Bateria Média</div>
            <div className="metric-detail">
              {drones.filter(d => d.bateriaAtual < 20).length} com bateria baixa
            </div>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">
            <FaClock />
          </div>
          <div className="metric-content">
            <div className="metric-value">{estatisticas.tempoMedioEntrega || 0}</div>
            <div className="metric-label">Tempo Médio (min)</div>
            <div className="metric-detail">
              Por entrega
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="performance-section">
          <h3>
            <FaChartLine />
            Performance dos Drones
          </h3>
          <div className="drones-performance">
            {drones.map(drone => (
              <div key={drone.id} className="drone-performance-card">
                <div className="drone-header">
                  <span className="drone-name">{drone.id}</span>
                  <div className={`drone-status-badge ${drone.estado.toLowerCase()}`}>
                    {drone.estado}
                  </div>
                </div>
                
                <div className="performance-metrics">
                  <div className="performance-metric">
                    <span className="metric-name">Bateria</span>
                    <div className="battery-bar">
                      <div 
                        className="battery-fill" 
                        style={{ 
                          width: `${drone.bateriaAtual}%`,
                          backgroundColor: getBatteryColor(drone.bateriaAtual)
                        }}
                      ></div>
                    </div>
                    <span className="metric-value">{Math.round(drone.bateriaAtual)}%</span>
                    {drone.bateriaAtual < 20 && (
                      <button 
                        className="emergency-return-btn"
                        onClick={() => forcarRetornoDrone(drone.id)}
                        title="Forçar retorno à base"
                      >
                        🏠
                      </button>
                    )}
                  </div>
                  
                  <div className="performance-metric">
                    <span className="metric-name">Posição</span>
                    <span className="metric-value">({drone.posX}, {drone.posY})</span>
                  </div>
                  
                  <div className="performance-metric">
                    <span className="metric-name">Capacidade</span>
                    <span className="metric-value">{drone.capacidadeMaxima} kg</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="recent-deliveries">
          <h3>
            <FaMapMarkerAlt />
            Entregas Recentes
          </h3>
          <div className="deliveries-list">
            {entregas.slice(0, 5).map((entrega, index) => (
              <div key={index} className="delivery-item">
                <div className="delivery-icon">
                  <FaCheckCircle />
                </div>
                <div className="delivery-info">
                  <div className="delivery-drone">Drone: {entrega.droneId}</div>
                  <div className="delivery-destination">
                    Destino: ({entrega.pedido.x}, {entrega.pedido.y})
                  </div>
                  <div className="delivery-time">
                    {new Date(entrega.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="delivery-weight">
                  {entrega.pedido.peso} kg
                </div>
              </div>
            ))}
            
            {entregas.length === 0 && (
              <div className="no-deliveries">
                <FaInfoCircle />
                <span>Nenhuma entrega realizada ainda</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


