import React, { useState, useEffect } from 'react';
import './App.css';
import api from './services/api';

export default function App() {
  // Estados principais
  const [activeSection, setActiveSection] = useState('cadastros');
  const [drones, setDrones] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [stats, setStats] = useState({});
  const [zonasExclusao, setZonasExclusao] = useState([]);
  
  // Estados dos formulários
  const [novoDrone, setNovoDrone] = useState({ id: '', capacidade: '', autonomia: '' });
  const [novoPedido, setNovoPedido] = useState({ cliente: '', x: '', y: '', peso: '', prioridade: 'MEDIA' });
  const [novaZona, setNovaZona] = useState({ x1: '', y1: '', x2: '', y2: '', nome: '', motivo: '' });
  const [statusPedidoId, setStatusPedidoId] = useState('');
  const [statusResult, setStatusResult] = useState('');
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    console.log('Iniciando carregamento de dados...');
    setLoading(true);
    try {
      const [dronesRes, pedidosRes, entregasRes, statsRes, zonasRes] = await Promise.all([
        api.get('/api/drones'),
        api.get('/api/pedidos/pendentes'),
        api.get('/api/pedidos/entregas'),
        api.get('/api/pedidos/estatisticas'),
        api.get('/api/drones/zonas-exclusao')
      ]);
      
      console.log('Dados carregados:', {
        drones: dronesRes.data,
        pedidos: pedidosRes.data,
        entregas: entregasRes.data,
        stats: statsRes.data,
        zonas: zonasRes.data
      });
      
      setDrones(dronesRes.data);
      setPedidos(pedidosRes.data);
      setEntregas(entregasRes.data);
      setStats(statsRes.data);
      setZonasExclusao(zonasRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setLoading(false);
  };

  const cadastrarDrone = async (e) => {
    e.preventDefault();
    console.log('Iniciando cadastro de drone:', novoDrone);
    try {
      const droneData = {
        id: novoDrone.id,
        capacidade: parseFloat(novoDrone.capacidade),
        autonomia: parseFloat(novoDrone.autonomia)
      };
      console.log('Dados do drone para envio:', droneData);
      
      const response = await api.post('/api/drones', droneData);
      console.log('Resposta do servidor:', response);
      
      alert('Drone cadastrado com sucesso!');
      setNovoDrone({ id: '', capacidade: '', autonomia: '' });
      carregarDados();
    } catch (error) {
      console.error('Erro ao cadastrar drone:', error);
      alert('Erro ao cadastrar drone: ' + (error.response?.data || error.message));
    }
  };

  const criarPedido = async (e) => {
    e.preventDefault();
    console.log('Iniciando criação de pedido:', novoPedido);
    try {
      const pedidoData = {
        cliente: novoPedido.cliente,
        x: parseInt(novoPedido.x),
        y: parseInt(novoPedido.y),
        peso: parseFloat(novoPedido.peso),
        prioridade: novoPedido.prioridade
      };
      console.log('Dados do pedido para envio:', pedidoData);
      
      const response = await api.post('/api/pedidos', pedidoData);
      console.log('Resposta do servidor:', response);
      
      alert('Pedido criado com sucesso!');
      setNovoPedido({ cliente: '', x: '', y: '', peso: '', prioridade: 'MEDIA' });
      carregarDados();
    } catch (error) {
      alert('Erro ao criar pedido: ' + (error.response?.data || error.message));
    }
  };

  const simularEntregas = async () => {
    try {
      await api.post('/api/drones/simular');
      alert('Simulação de entregas executada!');
      carregarDados();
    } catch (error) {
      alert('Erro na simulação: ' + (error.response?.data || error.message));
    }
  };

  const adicionarZona = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/drones/zonas-exclusao', {
        x1: parseInt(novaZona.x1),
        y1: parseInt(novaZona.y1),
        x2: parseInt(novaZona.x2),
        y2: parseInt(novaZona.y2),
        nome: novaZona.nome,
        motivo: novaZona.motivo
      });
      alert('Zona de exclusão adicionada!');
      setNovaZona({ x1: '', y1: '', x2: '', y2: '', nome: '', motivo: '' });
      carregarDados();
    } catch (error) {
      alert('Erro ao adicionar zona: ' + (error.response?.data || error.message));
    }
  };

  const consultarStatus = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get(`/api/pedidos/status/${statusPedidoId}`);
      setStatusResult(`Status: ${response.data.status}`);
    } catch (error) {
      setStatusResult('Erro: ' + (error.response?.data || error.message));
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'cadastros':
        return (
          <div className="section-content">
            <h2>📝 Cadastros</h2>
            
            <div className="forms-container">
              <div className="form-card">
                <h3>🚁 Cadastrar Drone</h3>
                <form onSubmit={cadastrarDrone}>
                  <input
                    type="text"
                    placeholder="ID do Drone"
                    value={novoDrone.id}
                    onChange={(e) => setNovoDrone({...novoDrone, id: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Capacidade (kg)"
                    value={novoDrone.capacidade}
                    onChange={(e) => setNovoDrone({...novoDrone, capacidade: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Autonomia (km)"
                    value={novoDrone.autonomia}
                    onChange={(e) => setNovoDrone({...novoDrone, autonomia: e.target.value})}
                    required
                  />
                  <button type="submit">Cadastrar Drone</button>
                </form>
              </div>

              <div className="form-card">
                <h3>📦 Criar Pedido</h3>
                <form onSubmit={criarPedido}>
                  <input
                    type="text"
                    placeholder="Nome do Cliente"
                    value={novoPedido.cliente}
                    onChange={(e) => setNovoPedido({...novoPedido, cliente: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Coordenada X"
                    value={novoPedido.x}
                    onChange={(e) => setNovoPedido({...novoPedido, x: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Coordenada Y"
                    value={novoPedido.y}
                    onChange={(e) => setNovoPedido({...novoPedido, y: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Peso (kg)"
                    value={novoPedido.peso}
                    onChange={(e) => setNovoPedido({...novoPedido, peso: e.target.value})}
                    required
                  />
                  <select
                    value={novoPedido.prioridade}
                    onChange={(e) => setNovoPedido({...novoPedido, prioridade: e.target.value})}
                  >
                    <option value="ALTA">Alta Prioridade</option>
                    <option value="MEDIA">Média Prioridade</option>
                    <option value="BAIXA">Baixa Prioridade</option>
                  </select>
                  <button type="submit">Criar Pedido</button>
                </form>
              </div>
            </div>

            <div className="action-buttons">
              <button onClick={simularEntregas} className="simulate-btn">
                🚀 Simular Entregas
              </button>
              <button onClick={carregarDados} className="refresh-btn">
                🔄 Atualizar Dados
              </button>
            </div>
          </div>
        );

      case 'operacoes':
        return (
          <div className="section-content">
            <h2>🎛️ Operações</h2>
            
            <div className="operations-grid">
              <div className="operation-card">
                <h3>🚁 Drones Ativos ({drones.length})</h3>
                <div className="items-list">
                  {drones.map(drone => {
                    const bateriaPercent = drone.autonomiaMaxima > 0 ? (drone.bateriaAtual / drone.autonomiaMaxima) * 100 : 0;
                    const bateriaColor = bateriaPercent > 60 ? '#27ae60' : bateriaPercent > 30 ? '#f39c12' : '#e74c3c';
                    
                    return (
                      <div key={drone.id} className="item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong>{drone.id}</strong> - {drone.estado}
                            <br />Posição: ({drone.posX}, {drone.posY})
                          </div>
                          <div style={{ textAlign: 'right', minWidth: '120px' }}>
                            <div style={{ fontSize: '12px', marginBottom: '2px' }}>
                              Bateria: {bateriaPercent.toFixed(1)}%
                            </div>
                            <div style={{
                              width: '100px',
                              height: '8px',
                              backgroundColor: '#ecf0f1',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${bateriaPercent}%`,
                                height: '100%',
                                backgroundColor: bateriaColor,
                                transition: 'width 0.3s ease'
                              }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="operation-card">
                <h3>⏳ Pedidos Pendentes ({pedidos.length})</h3>
                <div className="items-list">
                  {pedidos.slice(0, 10).map((pedido) => (
                    <div key={pedido.id} className="item pedido-pendente">
                      <strong>#{pedido.id}</strong> - {pedido.cliente}
                      <br />Destino: ({pedido.x}, {pedido.y}) | Peso: {pedido.peso}kg
                      <br />Prioridade: <span className={`prioridade-${pedido.prioridade?.toLowerCase()}`}>{pedido.prioridade}</span>
                    </div>
                  ))}
                  {pedidos.length === 0 && (
                    <div className="item">✅ Nenhum pedido pendente!</div>
                  )}
                </div>
              </div>

              <div className="operation-card">
                <h3>✅ Entregas Realizadas ({entregas.length})</h3>
                <div className="items-list">
                  {entregas.slice(0, 5).map((entrega, idx) => (
                    <div key={`entrega-${entrega.droneId}-${idx}`} className="item entrega-realizada">
                      <strong>Drone: {entrega.droneId}</strong>
                      <br />Distância: {entrega.distanciaPercorrida?.toFixed(1)}km | Tempo: {entrega.tempoTotalMinutos?.toFixed(1)}min
                      <br />Status: <span className="status-concluido">ENTREGUE</span>
                    </div>
                  ))}
                  {entregas.length === 0 && (
                    <div className="item">📦 Nenhuma entrega realizada ainda</div>
                  )}
                </div>
              </div>

              <div className="operation-card">
                <h3>📍 Consultar Status</h3>
                <form onSubmit={consultarStatus}>
                  <input
                    type="text"
                    placeholder="ID do Pedido"
                    value={statusPedidoId}
                    onChange={(e) => setStatusPedidoId(e.target.value)}
                    required
                  />
                  <button type="submit">Consultar</button>
                </form>
                {statusResult && <div className="status-result">{statusResult}</div>}
              </div>
            </div>

            <div className="action-summary">
              <div className="summary-item">
                <span className="summary-label">📊 Total de Pedidos:</span>
                <span className="summary-value">{pedidos.length + entregas.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">⏳ Aguardando Entrega:</span>
                <span className="summary-value pending">{pedidos.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">✅ Entregues:</span>
                <span className="summary-value completed">{entregas.length}</span>
              </div>
            </div>
          </div>
        );

      case 'zonas':
        return (
          <div className="section-content">
            <h2>🚫 Zonas de Exclusão</h2>
            
            <div className="zona-form">
              <h3>Adicionar Nova Zona</h3>
              <form onSubmit={adicionarZona}>
                <div className="coord-inputs">
                  <input type="number" placeholder="X1" value={novaZona.x1} 
                         onChange={(e) => setNovaZona({...novaZona, x1: e.target.value})} required />
                  <input type="number" placeholder="Y1" value={novaZona.y1} 
                         onChange={(e) => setNovaZona({...novaZona, y1: e.target.value})} required />
                  <input type="number" placeholder="X2" value={novaZona.x2} 
                         onChange={(e) => setNovaZona({...novaZona, x2: e.target.value})} required />
                  <input type="number" placeholder="Y2" value={novaZona.y2} 
                         onChange={(e) => setNovaZona({...novaZona, y2: e.target.value})} required />
                </div>
                <input type="text" placeholder="Nome da Zona" value={novaZona.nome} 
                       onChange={(e) => setNovaZona({...novaZona, nome: e.target.value})} required />
                <input type="text" placeholder="Motivo da Restrição" value={novaZona.motivo} 
                       onChange={(e) => setNovaZona({...novaZona, motivo: e.target.value})} required />
                <button type="submit">Adicionar Zona</button>
              </form>
            </div>

            <div className="zonas-list">
              <h3>Zonas Cadastradas ({zonasExclusao.length})</h3>
              {zonasExclusao.map((zona, idx) => (
                <div key={`zona-${zona.nome}-${idx}`} className="zona-item">
                  <strong>{zona.nome}</strong> - ({zona.x1}, {zona.y1}) até ({zona.x2}, {zona.y2})
                  <br />Motivo: {zona.motivo}
                </div>
              ))}
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="section-content">
            <h2>📊 Dashboard</h2>
            
            <div className="stats-overview">
              <div className="stat-card">
                <h3>🚁 Total Drones</h3>
                <div className="stat-value">{drones.length}</div>
              </div>
              <div className="stat-card">
                <h3>⏳ Pedidos Pendentes</h3>
                <div className="stat-value pending">{pedidos.length}</div>
              </div>
              <div className="stat-card">
                <h3>✅ Entregas Realizadas</h3>
                <div className="stat-value completed">{entregas.length}</div>
              </div>
              <div className="stat-card">
                <h3>📊 Taxa de Conclusão</h3>
                <div className="stat-value">{pedidos.length + entregas.length > 0 ? ((entregas.length / (pedidos.length + entregas.length)) * 100).toFixed(1) : 0}%</div>
              </div>
            </div>

            <div className="performance-summary">
              <h3>📈 Resumo de Performance</h3>
              <div className="performance-grid">
                <div className="performance-item">
                  <span className="performance-label">📦 Total de pedidos criados:</span>
                  <span className="performance-value">{pedidos.length + entregas.length}</span>
                </div>
                <div className="performance-item">
                  <span className="performance-label">⏳ Aguardando entrega:</span>
                  <span className="performance-value pending">{pedidos.length}</span>
                </div>
                <div className="performance-item">
                  <span className="performance-label">✅ Entregas concluídas:</span>
                  <span className="performance-value completed">{entregas.length}</span>
                </div>
                <div className="performance-item">
                  <span className="performance-label">🚁 Drones em operação:</span>
                  <span className="performance-value">{drones.filter(d => d.estado !== 'IDLE').length}</span>
                </div>
                <div className="performance-item">
                  <span className="performance-label">🚫 Zonas de exclusão ativas:</span>
                  <span className="performance-value">{zonasExclusao.length}</span>
                </div>
                <div className="performance-item">
                  <span className="performance-label">📏 Distância total percorrida:</span>
                  <span className="performance-value">{entregas.reduce((acc, e) => acc + (e.distanciaPercorrida || 0), 0).toFixed(1)} km</span>
                </div>
                <div className="performance-item">
                  <span className="performance-label">⏱️ Tempo médio por entrega:</span>
                  <span className="performance-value">{entregas.length > 0 ? (entregas.reduce((acc, e) => acc + (e.tempoTotalMinutos || 0), 0) / entregas.length).toFixed(1) : 0} min</span>
                </div>
                <div className="performance-item">
                  <span className="performance-label">🏆 Drone mais eficiente:</span>
                  <span className="performance-value">{stats.droneMaisEficiente || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🚁 Sistema de Entrega com Drones - DTI Digital</h1>
        <p>Gerencie drones, pedidos, zonas de exclusão e acompanhe estatísticas em tempo real</p>
      </header>

      <nav className="main-nav">
        <button 
          className={activeSection === 'cadastros' ? 'active' : ''}
          onClick={() => setActiveSection('cadastros')}
        >
          📝 Cadastros
        </button>
        <button 
          className={activeSection === 'operacoes' ? 'active' : ''}
          onClick={() => setActiveSection('operacoes')}
        >
          🎛️ Operações
        </button>
        <button 
          className={activeSection === 'zonas' ? 'active' : ''}
          onClick={() => setActiveSection('zonas')}
        >
          🚫 Zonas de Exclusão
        </button>
        <button 
          className={activeSection === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveSection('dashboard')}
        >
          📊 Dashboard
        </button>
      </nav>

      <main className="main-content">
        {loading ? (
          <div className="loading">🔄 Carregando dados...</div>
        ) : (
          renderSection()
        )}
      </main>

      <footer className="footer">
        <p>🎯 Desafio Técnico DTI Digital - Sistema completo com simulação de bateria, zonas de exclusão e estatísticas</p>
      </footer>
    </div>
  );
}
