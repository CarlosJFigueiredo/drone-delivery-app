import React, { useState, useEffect } from 'react';
import { 
  FaBox, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaWeight,
  FaClock,
  FaUser,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaSortAmountDown,
  FaSortAmountUp,
  FaRobot,
  FaBatteryFull,
  FaTabs
} from 'react-icons/fa';
import api from '../services/api';
import './PedidoManager.css';

export default function PedidoManager() {
  const [activeTab, setActiveTab] = useState('pedidos');
  const [pedidos, setPedidos] = useState([]);
  const [drones, setDrones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [sortBy, setSortBy] = useState('data');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showForm, setShowForm] = useState(false);
  const [editingPedido, setEditingPedido] = useState(null);
  const [editingDrone, setEditingDrone] = useState(null);
  const [formData, setFormData] = useState({
    cliente: '',
    x: '',
    y: '',
    peso: '',
    prioridade: 'MEDIA'
  });
  const [droneFormData, setDroneFormData] = useState({
    id: '',
    capacidade: '',
    autonomia: ''
  });
  const [zonasExclusao, setZonasExclusao] = useState([]);

  useEffect(() => {
    carregarPedidos();
    carregarDrones();
    carregarZonasExclusao();
  }, []);

  useEffect(() => {
    setSearchTerm('');
    setFilterStatus('TODOS');
    setSortBy(activeTab === 'pedidos' ? 'data' : 'id');
  }, [activeTab]);

  const carregarPedidos = async () => {
    setLoading(true);
    try {
      console.log('🔄 Carregando pedidos...');
      const response = await api.get('/pedidos/fila');
      console.log('✅ Pedidos carregados:', response.data);
      setPedidos(response.data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos:', error);
      console.error('📄 Detalhes do erro:', error.response?.data);
      console.error('🔢 Status:', error.response?.status);
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  const carregarDrones = async () => {
    setLoading(true);
    try {
      console.log('🔄 Carregando drones...');
      const response = await api.get('/drones');
      console.log('✅ Drones carregados:', response.data);
      setDrones(response.data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar drones:', error);
      console.error('📄 Detalhes do erro:', error.response?.data);
      console.error('🔢 Status:', error.response?.status);
      setDrones([]);
    } finally {
      setLoading(false);
    }
  };

  const carregarZonasExclusao = async () => {
    try {
      console.log('🔄 Carregando zonas de exclusão...');
      const response = await api.get('/drones/zonas-exclusao');
      console.log('✅ Zonas carregadas:', response.data);
      setZonasExclusao(response.data || []);
    } catch (error) {
      console.error('❌ Erro ao carregar zonas:', error);
      setZonasExclusao([]);
    }
  };

  const verificarZonaExclusao = (x, y) => {
    for (const zona of zonasExclusao) {
      if (x >= zona.x1 && x <= zona.x2 && y >= zona.y1 && y <= zona.y2) {
        return zona;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🚀 Dados do formulário:', formData);
      
      if (!formData.cliente || !formData.cliente.trim()) {
        alert('Nome do cliente é obrigatório!');
        setLoading(false);
        return;
      }
      
      if (!formData.peso || isNaN(parseFloat(formData.peso)) || parseFloat(formData.peso) <= 0) {
        alert('Peso deve ser um número válido maior que zero!');
        setLoading(false);
        return;
      }
      
      // Verificar se as coordenadas estão em zona de exclusão
      const x = formData.x ? parseFloat(formData.x) : 0;
      const y = formData.y ? parseFloat(formData.y) : 0;
      const zona = verificarZonaExclusao(x, y);
      if (zona) {
        const acao = editingPedido ? 'atualizar' : 'criar';
        alert(`⚠️ Local não permitido!\n\nAs coordenadas (${x}, ${y}) estão na zona de exclusão "${zona.nome}".\nMotivo: ${zona.motivo}\n\nNão é possível ${acao} pedidos nesta localização.`);
        setLoading(false);
        return;
      }
      
      const pedidoData = {
        cliente: formData.cliente.trim(),
        x: formData.x ? parseFloat(formData.x) : 0,
        y: formData.y ? parseFloat(formData.y) : 0,
        peso: parseFloat(formData.peso),
        prioridade: formData.prioridade || 'NORMAL'
      };
      
      console.log('📦 Dados processados:', pedidoData);
      
      let response;
      if (editingPedido) {
        console.log(`✏️ Atualizando pedido ID: ${editingPedido.id}`);
        response = await api.put(`/pedidos/${editingPedido.id}`, pedidoData);
        console.log('✅ Pedido atualizado:', response.data);
      } else {
        console.log('➕ Criando novo pedido...');
        response = await api.post('/pedidos', pedidoData);
        console.log('✅ Pedido criado:', response.data);
      }
      
      await carregarPedidos();
      resetForm();
      alert(editingPedido ? 'Pedido atualizado com sucesso!' : 'Pedido criado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar pedido:', error);
      console.error('📄 Detalhes do erro:', error.response?.data);
      console.error('🔢 Status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Erro desconhecido';
      
      alert(`Erro ao salvar pedido: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDroneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🚁 Dados do formulário drone:', droneFormData);
      
      // Validação básica
      if (!droneFormData.id || !droneFormData.id.trim()) {
        alert('ID do drone é obrigatório!');
        setLoading(false);
        return;
      }
      
      if (!droneFormData.capacidade || isNaN(parseFloat(droneFormData.capacidade)) || parseFloat(droneFormData.capacidade) <= 0) {
        alert('Capacidade deve ser um número válido maior que zero!');
        setLoading(false);
        return;
      }
      
      if (!droneFormData.autonomia || isNaN(parseFloat(droneFormData.autonomia)) || parseFloat(droneFormData.autonomia) <= 0) {
        alert('Autonomia deve ser um número válido maior que zero!');
        setLoading(false);
        return;
      }
      
      // Converter strings para números
      const droneData = {
        id: droneFormData.id.trim(),
        capacidade: parseFloat(droneFormData.capacidade),
        autonomia: parseFloat(droneFormData.autonomia)
      };
      
      console.log('🔧 Dados processados drone:', droneData);
      
      let response;
      if (editingDrone) {
        console.log(`✏️ Atualizando drone ID: ${editingDrone.id}`);
        response = await api.put(`/drones/${editingDrone.id}`, droneData);
        console.log('✅ Drone atualizado:', response.data);
      } else {
        console.log('➕ Criando novo drone...');
        response = await api.post('/drones', droneData);
        console.log('✅ Drone criado:', response.data);
      }
      
      await carregarDrones();
      resetDroneForm();
      alert(editingDrone ? 'Drone atualizado com sucesso!' : 'Drone criado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao salvar drone:', error);
      console.error('📄 Detalhes do erro:', error.response?.data);
      console.error('🔢 Status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Erro desconhecido';
      
      alert(`Erro ao salvar drone: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pedido) => {
    setEditingPedido(pedido);
    setFormData({
      cliente: pedido.cliente,
      x: pedido.x,
      y: pedido.y,
      peso: pedido.peso,
      prioridade: pedido.prioridade
    });
    setShowForm(true);
  };

  const handleDroneEdit = (drone) => {
    setEditingDrone(drone);
    setDroneFormData({
      id: drone.id,
      capacidade: drone.capacidadeMaxima,
      autonomia: drone.autonomiaMaxima
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este pedido?')) {
      setLoading(true);
      try {
        console.log(`🗑️ Excluindo pedido ID: ${id}`);
        await api.delete(`/pedidos/${id}`);
        console.log('✅ Pedido excluído com sucesso');
        await carregarPedidos();
        alert('Pedido excluído com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao excluir pedido:', error);
        console.error('📄 Detalhes do erro:', error.response?.data);
        alert(`Erro ao excluir pedido: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDroneDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este drone?')) {
      setLoading(true);
      try {
        console.log(`🗑️ Excluindo drone ID: ${id}`);
        await api.delete(`/drones/${id}`);
        console.log('✅ Drone excluído com sucesso');
        await carregarDrones();
        alert('Drone excluído com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao excluir drone:', error);
        console.error('📄 Detalhes do erro:', error.response?.data);
        alert(`Erro ao excluir drone: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      cliente: '',
      x: '',
      y: '',
      peso: '',
      prioridade: 'MEDIA'
    });
    setEditingPedido(null);
    setEditingDrone(null);
    setShowForm(false);
  };

  const resetDroneForm = () => {
    setDroneFormData({
      id: '',
      capacidade: '',
      autonomia: ''
    });
    setEditingDrone(null);
    setEditingPedido(null);
    setShowForm(false);
  };

  const filteredAndSortedPedidos = pedidos
    .filter(pedido => {
      const matchesSearch = pedido.cliente && pedido.cliente.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'TODOS' || pedido.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'data') {
        aValue = new Date(a.dataCreacao || a.createdAt || Date.now());
        bValue = new Date(b.dataCreacao || b.createdAt || Date.now());
      } else if (sortBy === 'prioridade') {
        // Ordenação customizada para prioridade: ALTA = 0, MEDIA = 1, BAIXA = 2
        const prioridadeOrder = { 'ALTA': 0, 'MEDIA': 1, 'BAIXA': 2 };
        aValue = prioridadeOrder[a.prioridade] ?? 1;
        bValue = prioridadeOrder[b.prioridade] ?? 1;
      } else if (sortBy === 'peso') {
        aValue = parseFloat(a.peso) || 0;
        bValue = parseFloat(b.peso) || 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const filteredAndSortedDrones = drones
    .filter(drone => {
      const matchesSearch = drone.id && drone.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'TODOS' || drone.estado === filterStatus || (!drone.estado && filterStatus === 'IDLE');
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'id') {
        aValue = a.id || '';
        bValue = b.id || '';
      } else if (sortBy === 'capacidade') {
        aValue = parseFloat(a.capacidadeMaxima || a.capacidade) || 0;
        bValue = parseFloat(b.capacidadeMaxima || b.capacidade) || 0;
      } else if (sortBy === 'bateria') {
        aValue = parseFloat(a.bateriaAtual) || 100;
        bValue = parseFloat(b.bateriaAtual) || 100;
      } else if (sortBy === 'estado') {
        aValue = a.estado || 'IDLE';
        bValue = b.estado || 'IDLE';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDENTE':
        return <FaClock className="status-icon pending" />;
      case 'EM_PREPARO':
        return <FaSpinner className="status-icon preparing" />;
      case 'ENTREGUE':
        return <FaCheckCircle className="status-icon delivered" />;
      case 'CANCELADO':
        return <FaExclamationTriangle className="status-icon cancelled" />;
      default:
        return <FaClock className="status-icon pending" />;
    }
  };

  const getPrioridadeClass = (prioridade) => {
    switch (prioridade) {
      case 'ALTA': return 'priority-high';
      case 'MEDIA': return 'priority-medium';
      case 'BAIXA': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  return (
    <div className="pedido-manager">
      <div className="manager-header">
        <div className="header-title">
          {activeTab === 'pedidos' ? <FaBox className="title-icon" /> : <FaRobot className="title-icon" />}
          <h1>{activeTab === 'pedidos' ? 'Gestão de Pedidos' : 'Gestão de Drones'}</h1>
        </div>
        
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'pedidos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pedidos')}
          >
            <FaBox /> Pedidos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'drones' ? 'active' : ''}`}
            onClick={() => setActiveTab('drones')}
          >
            <FaRobot /> Drones
          </button>
        </div>
        
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          <FaPlus /> {activeTab === 'pedidos' ? 'Novo Pedido' : 'Novo Drone'}
        </button>
      </div>

      <div className="manager-filters">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={activeTab === 'pedidos' ? "Buscar por cliente..." : "Buscar por ID do drone..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <FaFilter className="filter-icon" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="TODOS">
              {activeTab === 'pedidos' ? 'Todos os Status' : 'Todos os Estados'}
            </option>
            {activeTab === 'pedidos' ? (
              <>
                <option value="PENDENTE">Pendente</option>
                <option value="EM_PREPARO">Em Preparo</option>
                <option value="ENTREGUE">Entregue</option>
                <option value="CANCELADO">Cancelado</option>
              </>
            ) : (
              <>
                <option value="IDLE">Disponível</option>
                <option value="BUSY">Ocupado</option>
                <option value="CHARGING">Carregando</option>
                <option value="MAINTENANCE">Manutenção</option>
              </>
            )}
          </select>
        </div>

        <div className="sort-container">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            {activeTab === 'pedidos' ? (
              <>
                <option value="data">Data</option>
                <option value="prioridade">Prioridade</option>
                <option value="peso">Peso</option>
                <option value="cliente">Cliente</option>
              </>
            ) : (
              <>
                <option value="id">ID</option>
                <option value="capacidade">Capacidade</option>
                <option value="bateria">Bateria</option>
                <option value="estado">Estado</option>
              </>
            )}
          </select>
          <button
            className="sort-btn"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <FaSpinner className="loading-spinner" />
          <span>Carregando...</span>
        </div>
      )}

      {activeTab === 'pedidos' && (
        <div className="pedidos-grid">
          {filteredAndSortedPedidos.length > 0 ? (
            filteredAndSortedPedidos.map(pedido => (
              <div key={pedido.id} className={`pedido-card ${getPrioridadeClass(pedido.prioridade)}`}>
                <div className="pedido-header">
                  <div className="pedido-info">
                    <h3 className="pedido-id">#{pedido.id}</h3>
                    <div className="pedido-status">
                      {getStatusIcon(pedido.status)}
                      <span>{pedido.status}</span>
                    </div>
                  </div>
                  
                  <div className="pedido-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleEdit(pedido)}
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDelete(pedido.id)}
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="pedido-content">
                  <div className="pedido-detail">
                    <FaUser className="detail-icon" />
                    <span className="detail-label">Cliente:</span>
                    <span className="detail-value">{pedido.cliente}</span>
                  </div>

                  <div className="pedido-detail">
                    <FaMapMarkerAlt className="detail-icon" />
                    <span className="detail-label">Destino:</span>
                    <span className="detail-value">({pedido.x}, {pedido.y})</span>
                  </div>

                  <div className="pedido-detail">
                    <FaWeight className="detail-icon" />
                    <span className="detail-label">Peso:</span>
                    <span className="detail-value">{pedido.peso}kg</span>
                  </div>

                  <div className="pedido-detail">
                    <span className="detail-label">Prioridade:</span>
                    <span className={`priority-badge ${getPrioridadeClass(pedido.prioridade)}`}>
                      {pedido.prioridade}
                    </span>
                  </div>
                </div>

                <div className="pedido-footer">
                  <span className="pedido-date">
                    <FaClock /> {new Date(pedido.dataCreacao).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <FaBox />
              <span>
                {searchTerm || filterStatus !== 'TODOS' 
                  ? 'Nenhum pedido encontrado com os filtros aplicados' 
                  : 'Nenhum pedido cadastrado ainda'
                }
              </span>
            </div>
          )}
        </div>
      )}

      {activeTab === 'drones' && (
        <div className="drones-grid">
          {filteredAndSortedDrones.length > 0 ? (
            filteredAndSortedDrones.map(drone => (
              <div key={drone.id} className="drone-card">
                <div className="drone-header">
                  <div className="drone-info">
                    <h3 className="drone-id">{drone.id}</h3>
                    <div className="drone-status">
                      <FaRobot className="status-icon" />
                      <span>{drone.estado || drone.status || 'IDLE'}</span>
                    </div>
                  </div>
                  
                  <div className="drone-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => handleDroneEdit(drone)}
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDroneDelete(drone.id)}
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <div className="drone-content">
                  <div className="drone-detail">
                    <FaWeight className="detail-icon" />
                    <span className="detail-label">Capacidade:</span>
                    <span className="detail-value">{drone.capacidadeMaxima || drone.capacidade}kg</span>
                  </div>

                  <div className="drone-detail">
                    <FaBatteryFull className="detail-icon" />
                    <span className="detail-label">Bateria:</span>
                    <span className="detail-value">{Math.round(drone.bateriaAtual || 100)}%</span>
                  </div>

                  <div className="drone-detail">
                    <FaMapMarkerAlt className="detail-icon" />
                    <span className="detail-label">Posição:</span>
                    <span className="detail-value">({drone.posX || drone.x || 0}, {drone.posY || drone.y || 0})</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <FaRobot />
              <span>
                {searchTerm || filterStatus !== 'TODOS' 
                  ? 'Nenhum drone encontrado com os filtros aplicados' 
                  : 'Nenhum drone cadastrado ainda'
                }
              </span>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>
                {activeTab === 'pedidos' 
                  ? (editingPedido ? 'Editar Pedido' : 'Novo Pedido')
                  : (editingDrone ? 'Editar Drone' : 'Novo Drone')
                }
              </h2>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>

            {activeTab === 'pedidos' ? (
              <form onSubmit={handleSubmit} className="pedido-form">
                <div className="form-group">
                  <label htmlFor="cliente">Cliente:</label>
                  <input
                    id="cliente"
                    type="text"
                    value={formData.cliente}
                    onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="coordX">Coordenada X:</label>
                    <input
                      id="coordX"
                      type="number"
                      value={formData.x}
                      onChange={(e) => setFormData({...formData, x: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="coordY">Coordenada Y:</label>
                    <input
                      id="coordY"
                      type="number"
                      value={formData.y}
                      onChange={(e) => setFormData({...formData, y: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="peso">Peso (kg):</label>
                    <input
                      id="peso"
                      type="number"
                      step="0.1"
                      value={formData.peso}
                      onChange={(e) => setFormData({...formData, peso: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="prioridade">Prioridade:</label>
                    <select
                      id="prioridade"
                      value={formData.prioridade}
                      onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
                    >
                      <option value="BAIXA">Baixa</option>
                      <option value="MEDIA">Média</option>
                      <option value="ALTA">Alta</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading && <FaSpinner className="loading-spinner" />}
                    {!loading && (editingPedido ? 'Atualizar' : 'Criar')}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleDroneSubmit} className="drone-form">
                <div className="form-group">
                  <label htmlFor="droneId">ID do Drone:</label>
                  <input
                    id="droneId"
                    type="text"
                    value={droneFormData.id}
                    onChange={(e) => setDroneFormData({...droneFormData, id: e.target.value})}
                    required
                    disabled={editingDrone}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="capacidade">Capacidade (kg):</label>
                    <input
                      id="capacidade"
                      type="number"
                      step="0.1"
                      value={droneFormData.capacidade}
                      onChange={(e) => setDroneFormData({...droneFormData, capacidade: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="autonomia">Autonomia (km):</label>
                    <input
                      id="autonomia"
                      type="number"
                      value={droneFormData.autonomia}
                      onChange={(e) => setDroneFormData({...droneFormData, autonomia: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={resetDroneForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading && <FaSpinner className="loading-spinner" />}
                    {!loading && (editingDrone ? 'Atualizar' : 'Criar')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


