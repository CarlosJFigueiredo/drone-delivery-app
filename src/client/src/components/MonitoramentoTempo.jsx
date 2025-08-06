import React, { useState, useEffect } from 'react';
import { 
  FaEye,
  FaMapMarkerAlt,
  FaRobot,
  FaRoute,
  FaBatteryFull,
  FaWifi,
  FaPlay,
  FaPause,
  FaExpand,
  FaCompress,
  FaLayerGroup,
  FaFilter,
  FaCrosshairs,
  FaSync
} from 'react-icons/fa';
import './MonitoramentoTempo.css';

export default function MonitoramentoTempo() {
  const [drones, setDrones] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [zonasExclusao, setZonasExclusao] = useState([]);
  const [modoVisualizacao, setModoVisualizacao] = useState('mapa');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [simulacaoAtiva, setSimulacaoAtiva] = useState(false);
  const [telaCheiaAtiva, setTelaCheiaAtiva] = useState(false);
  const [camadaVisivel, setCamadaVisivel] = useState({
    drones: true,
    entregas: true,
    zonas: true,
    rotas: true
  });

  useEffect(() => {
    // Carregar dados iniciais
    carregarDados();
    
    // Setup intervalo para atualização em tempo real
    let intervalo;
    if (simulacaoAtiva) {
      intervalo = setInterval(atualizarDados, 2000);
    }
    
    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [simulacaoAtiva]);

  const carregarDados = async () => {
    try {
      // Simular carregamento de dados
      console.log('Carregando dados de monitoramento...');
      
      // Dados simulados
      setDrones([
        {
          id: 'DRONE-001',
          posicao: { x: 10, y: 15 },
          status: 'EM_VOO',
          bateria: 85,
          velocidade: 45,
          altitude: 80,
          entregaAtual: 'PED-123',
          proximoDestino: { x: 25, y: 30 },
          rota: [
            { x: 10, y: 15 },
            { x: 15, y: 20 },
            { x: 20, y: 25 },
            { x: 25, y: 30 }
          ]
        },
        {
          id: 'DRONE-002',
          posicao: { x: 35, y: 40 },
          status: 'CARREGANDO',
          bateria: 95,
          velocidade: 0,
          altitude: 0,
          entregaAtual: null,
          proximoDestino: { x: 0, y: 0 },
          rota: []
        },
        {
          id: 'DRONE-003',
          posicao: { x: 50, y: 25 },
          status: 'RETORNANDO',
          bateria: 40,
          velocidade: 50,
          altitude: 75,
          entregaAtual: null,
          proximoDestino: { x: 0, y: 0 },
          rota: [
            { x: 50, y: 25 },
            { x: 40, y: 20 },
            { x: 30, y: 15 },
            { x: 20, y: 10 },
            { x: 0, y: 0 }
          ]
        }
      ]);

      setEntregas([
        {
          id: 'PED-123',
          posicao: { x: 25, y: 30 },
          status: 'EM_TRANSITO',
          prioridade: 'ALTA',
          droneAssignado: 'DRONE-001',
          tempoEstimado: 8
        },
        {
          id: 'PED-124',
          posicao: { x: 60, y: 45 },
          status: 'PENDENTE',
          prioridade: 'MEDIA',
          droneAssignado: null,
          tempoEstimado: null
        }
      ]);

      setZonasExclusao([
        {
          id: 'ZONA-001',
          x1: 15, y1: 35, x2: 25, y2: 45,
          nome: 'Aeroporto',
          tipo: 'RESTRITA'
        },
        {
          id: 'ZONA-002',
          x1: 40, y1: 10, x2: 55, y2: 20,
          nome: 'Base Militar',
          tipo: 'PROIBIDA'
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const atualizarDados = () => {
    // Simular movimento dos drones
    setDrones(prevDrones => 
      prevDrones.map(drone => {
        if (drone.status === 'EM_VOO' || drone.status === 'RETORNANDO') {
          // Simular movimento ao longo da rota
          const novaX = drone.posicao.x + (Math.random() - 0.5) * 2;
          const novaY = drone.posicao.y + (Math.random() - 0.5) * 2;
          const novaBateria = Math.max(drone.bateria - Math.random() * 0.5, 20);
          
          return {
            ...drone,
            posicao: { x: novaX, y: novaY },
            bateria: novaBateria
          };
        }
        return drone;
      })
    );
  };

  const toggleSimulacao = () => {
    setSimulacaoAtiva(!simulacaoAtiva);
  };

  const toggleTelaCheia = () => {
    setTelaCheiaAtiva(!telaCheiaAtiva);
  };

  const toggleCamada = (camada) => {
    setCamadaVisivel(prev => ({
      ...prev,
      [camada]: !prev[camada]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'EM_VOO': return '#3498db';
      case 'CARREGANDO': return '#f39c12';
      case 'RETORNANDO': return '#9b59b6';
      case 'IDLE': return '#27ae60';
      case 'MANUTENCAO': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getBateriaColor = (nivel) => {
    if (nivel > 60) return '#27ae60';
    if (nivel > 30) return '#f39c12';
    return '#e74c3c';
  };

  const dronesFiltrados = drones.filter(drone => {
    if (filtroStatus === 'TODOS') return true;
    return drone.status === filtroStatus;
  });

  return (
    <div className={`monitoramento-tempo ${telaCheiaAtiva ? 'tela-cheia' : ''}`}>
      <div className="monitor-header">
        <div className="header-title">
          <FaEye className="title-icon" />
          <h1>Monitoramento em Tempo Real</h1>
        </div>
        
        <div className="header-controls">
          <button 
            className={`control-btn ${simulacaoAtiva ? 'active' : ''}`}
            onClick={toggleSimulacao}
          >
            {simulacaoAtiva ? <FaPause /> : <FaPlay />}
            {simulacaoAtiva ? 'Pausar' : 'Iniciar'} Simulação
          </button>
          
          <button className="control-btn" onClick={() => carregarDados()}>
            <FaSync /> Atualizar
          </button>
          
          <button className="control-btn" onClick={toggleTelaCheia}>
            {telaCheiaAtiva ? <FaCompress /> : <FaExpand />}
            {telaCheiaAtiva ? 'Sair' : 'Tela Cheia'}
          </button>
        </div>
      </div>

      <div className="monitor-content">
        <div className="monitor-sidebar">
          <div className="sidebar-section">
            <h3><FaFilter /> Filtros</h3>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="filter-select"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="EM_VOO">Em Voo</option>
              <option value="CARREGANDO">Carregando</option>
              <option value="RETORNANDO">Retornando</option>
              <option value="IDLE">Parado</option>
            </select>
          </div>

          <div className="sidebar-section">
            <h3><FaLayerGroup /> Camadas</h3>
            <div className="camadas-controls">
              {Object.entries(camadaVisivel).map(([camada, visivel]) => (
                <label key={camada} className="camada-toggle">
                  <input
                    type="checkbox"
                    checked={visivel}
                    onChange={() => toggleCamada(camada)}
                  />
                  <span className="camada-nome">
                    {camada.charAt(0).toUpperCase() + camada.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3><FaRobot /> Drones Ativos</h3>
            <div className="drones-lista">
              {dronesFiltrados.map(drone => (
                <div key={drone.id} className="drone-item">
                  <div className="drone-header">
                    <span className="drone-id">{drone.id}</span>
                    <span 
                      className="drone-status-dot"
                      style={{ backgroundColor: getStatusColor(drone.status) }}
                    ></span>
                  </div>
                  
                  <div className="drone-info">
                    <div className="info-item">
                      <FaMapMarkerAlt />
                      <span>({Math.round(drone.posicao.x)}, {Math.round(drone.posicao.y)})</span>
                    </div>
                    
                    <div className="info-item">
                      <FaBatteryFull style={{ color: getBateriaColor(drone.bateria) }} />
                      <span>{Math.round(drone.bateria)}%</span>
                    </div>
                    
                    <div className="info-item">
                      <FaWifi />
                      <span>{drone.velocidade} km/h</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="monitor-main">
          <div className="mapa-container">
            <div className="mapa-grid">
              {/* Renderizar zonas de exclusão */}
              {camadaVisivel.zonas && zonasExclusao.map(zona => (
                <div
                  key={zona.id}
                  className={`zona-exclusao ${zona.tipo.toLowerCase()}`}
                  style={{
                    left: `${zona.x1 * 2}%`,
                    top: `${zona.y1 * 2}%`,
                    width: `${(zona.x2 - zona.x1) * 2}%`,
                    height: `${(zona.y2 - zona.y1) * 2}%`
                  }}
                  title={`${zona.nome} (${zona.tipo})`}
                />
              ))}

              {/* Renderizar drones */}
              {camadaVisivel.drones && dronesFiltrados.map(drone => (
                <div key={drone.id}>
                  {/* Drone */}
                  <div
                    className="drone-marker"
                    style={{
                      left: `${drone.posicao.x * 2}%`,
                      top: `${drone.posicao.y * 2}%`,
                      backgroundColor: getStatusColor(drone.status)
                    }}
                    title={`${drone.id} - ${drone.status}`}
                  >
                    <FaRobot />
                  </div>

                  {/* Rota do drone */}
                  {camadaVisivel.rotas && drone.rota.length > 1 && (
                    <svg className="rota-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                      <polyline
                        points={drone.rota.map(p => `${p.x * 2},${p.y * 2}`).join(' ')}
                        fill="none"
                        stroke={getStatusColor(drone.status)}
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        opacity="0.7"
                      />
                    </svg>
                  )}
                </div>
              ))}

              {/* Renderizar entregas */}
              {camadaVisivel.entregas && entregas.map(entrega => (
                <div
                  key={entrega.id}
                  className={`entrega-marker ${entrega.prioridade.toLowerCase()}`}
                  style={{
                    left: `${entrega.posicao.x * 2}%`,
                    top: `${entrega.posicao.y * 2}%`
                  }}
                  title={`${entrega.id} - ${entrega.status}`}
                >
                  <FaMapMarkerAlt />
                </div>
              ))}

              {/* Grid de coordenadas */}
              <div className="coordenadas-grid">
                {Array.from({ length: 11 }, (_, i) => (
                  <div key={`v-${i}`} className="linha-vertical" style={{ left: `${i * 10}%` }}>
                    <span className="coordenada-label">{i * 5}</span>
                  </div>
                ))}
                {Array.from({ length: 11 }, (_, i) => (
                  <div key={`h-${i}`} className="linha-horizontal" style={{ top: `${i * 10}%` }}>
                    <span className="coordenada-label">{i * 5}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="status-bar">
            <div className="status-item">
              <span className="status-label">Drones Ativos:</span>
              <span className="status-value">{drones.filter(d => d.status !== 'IDLE').length}</span>
            </div>
            
            <div className="status-item">
              <span className="status-label">Entregas em Andamento:</span>
              <span className="status-value">{entregas.filter(e => e.status === 'EM_TRANSITO').length}</span>
            </div>
            
            <div className="status-item">
              <span className="status-label">Simulação:</span>
              <span className={`status-value ${simulacaoAtiva ? 'ativa' : 'inativa'}`}>
                {simulacaoAtiva ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

