import React, { useState, useEffect } from 'react';
import { FaBan, FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes } from 'react-icons/fa';
import api from '../services/api';

export default function ZonasExclusao() {
  const [zonas, setZonas] = useState([]);
  const [novaZona, setNovaZona] = useState({
    x1: '', y1: '', x2: '', y2: '', nome: '', motivo: ''
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingZona, setEditingZona] = useState(null);

  useEffect(() => {
    fetchZonas();
  }, []);

  const fetchZonas = async () => {
    try {
      const response = await api.get('/drones/zonas-exclusao');
      setZonas(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar zonas:', error);
      setLoading(false);
    }
  };

  const adicionarZona = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!novaZona.nome?.trim()) {
        alert('Nome da zona é obrigatório!');
        setLoading(false);
        return;
      }
      
      if (!novaZona.motivo?.trim()) {
        alert('Motivo da exclusão é obrigatório!');
        setLoading(false);
        return;
      }
      
      const x1 = parseInt(novaZona.x1);
      const y1 = parseInt(novaZona.y1);
      const x2 = parseInt(novaZona.x2);
      const y2 = parseInt(novaZona.y2);
      
      if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
        alert('Todas as coordenadas devem ser números válidos!');
        setLoading(false);
        return;
      }
      
      if (x1 === x2 || y1 === y2) {
        alert('As coordenadas devem formar uma área válida (x1 ≠ x2 e y1 ≠ y2)!');
        setLoading(false);
        return;
      }
      
      const zonaData = {
        x1, y1, x2, y2,
        nome: novaZona.nome.trim(),
        motivo: novaZona.motivo.trim()
      };
      
      if (editingZona) {
        console.log(`✏️ Editando zona ID: ${editingZona.id}`);
        await api.put(`/drones/zonas-exclusao/${editingZona.id}`, zonaData);
        alert('Zona de exclusão editada com sucesso!');
      } else {
        console.log('➕ Criando nova zona...');
        await api.post('/drones/zonas-exclusao', zonaData);
        alert('Zona de exclusão adicionada com sucesso!');
      }
      
      resetForm();
      fetchZonas();
    } catch (error) {
      console.error('❌ Erro ao salvar zona:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Erro desconhecido';
      alert(`Erro ao ${editingZona ? 'editar' : 'adicionar'} zona: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNovaZona({ x1: '', y1: '', x2: '', y2: '', nome: '', motivo: '' });
    setShowForm(false);
    setEditingZona(null);
  };

  const handleEdit = (zona) => {
    setEditingZona(zona);
    setNovaZona({
      x1: zona.x1.toString(),
      y1: zona.y1.toString(),
      x2: zona.x2.toString(),
      y2: zona.y2.toString(),
      nome: zona.nome,
      motivo: zona.motivo
    });
    setShowForm(true);
  };

  const handleDelete = async (zona) => {
    if (window.confirm(`Tem certeza que deseja excluir a zona "${zona.nome}"?`)) {
      setLoading(true);
      try {
        console.log(`🗑️ Excluindo zona ID: ${zona.id}`);
        await api.delete(`/drones/zonas-exclusao/${zona.id}`);
        console.log('✅ Zona excluída com sucesso');
        await fetchZonas();
        alert('Zona excluída com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao excluir zona:', error);
        console.error('📄 Detalhes do erro:', error.response?.data);
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message || 
                            'Erro desconhecido';
        alert(`Erro ao excluir zona: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (field, value) => {
    setNovaZona(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return (
    <div className="loading-overlay">
      <FaSpinner className="loading-spinner" />
      <span>Carregando zonas...</span>
    </div>
  );

  return (
    <div className="pedido-manager">
      <div className="manager-header">
        <div className="header-title">
          <FaBan className="title-icon" />
          <h1>Gerenciamento de Zonas de Exclusão</h1>
        </div>
        
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          <FaPlus /> Nova Zona
        </button>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-value">{zonas.length}</div>
          <div className="stat-label">Zonas Cadastradas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {zonas.reduce((total, zona) => 
              total + Math.abs(zona.x2 - zona.x1) * Math.abs(zona.y2 - zona.y1), 0
            )}
          </div>
          <div className="stat-label">Área Total (unidades²)</div>
        </div>
      </div>

      {zonas.length === 0 ? (
        <div className="empty-state">
          <FaBan className="empty-icon" />
          <h3>Nenhuma zona de exclusão cadastrada</h3>
          <p>Clique em "Nova Zona" para adicionar sua primeira zona de exclusão</p>
        </div>
      ) : (
        <div className="zonas-grid">
          {zonas.map((zona) => (
            <div key={zona.id || `${zona.nome}-${zona.x1}-${zona.y1}`} className="zona-card">
              <div className="zona-header">
                <h3 className="zona-nome">{zona.nome}</h3>
                <div className="zona-actions">
                  <button 
                    className="btn-icon btn-edit"
                    onClick={() => handleEdit(zona)}
                    title="Editar zona"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(zona)}
                    title="Excluir zona"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              
              <div className="zona-details">
                <div className="detail-row">
                  <strong>Coordenadas:</strong>
                  <span>({zona.x1}, {zona.y1}) até ({zona.x2}, {zona.y2})</span>
                </div>
                <div className="detail-row">
                  <strong>Motivo:</strong>
                  <span>{zona.motivo}</span>
                </div>
                <div className="detail-row">
                  <strong>Área:</strong>
                  <span>{Math.abs(zona.x2 - zona.x1) * Math.abs(zona.y2 - zona.y1)} unidades²</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingZona ? 'Editar Zona' : 'Nova Zona de Exclusão'}</h2>
              <button className="close-btn" onClick={resetForm}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={adicionarZona} className="pedido-form">
              <div className="form-group">
                <label htmlFor="nome">Nome da Zona:</label>
                <input
                  id="nome"
                  type="text"
                  placeholder="Ex: Aeroporto Central, Hospital, Escola..."
                  value={novaZona.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="motivo">Motivo da Exclusão:</label>
                <input
                  id="motivo"
                  type="text"
                  placeholder="Ex: Zona de tráfego aéreo intenso, Área hospitalar..."
                  value={novaZona.motivo}
                  onChange={(e) => handleInputChange('motivo', e.target.value)}
                  required
                />
              </div>

              <div className="form-section">
                <h4>Coordenadas da Área</h4>
                <div className="coordinates-grid">
                  <div className="coordinate-group">
                    <h5>Ponto Inicial</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="x1">X1:</label>
                        <input
                          id="x1"
                          type="number"
                          placeholder="0"
                          value={novaZona.x1}
                          onChange={(e) => handleInputChange('x1', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="y1">Y1:</label>
                        <input
                          id="y1"
                          type="number"
                          placeholder="0"
                          value={novaZona.y1}
                          onChange={(e) => handleInputChange('y1', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="coordinate-group">
                    <h5>Ponto Final</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="x2">X2:</label>
                        <input
                          id="x2"
                          type="number"
                          placeholder="0"
                          value={novaZona.x2}
                          onChange={(e) => handleInputChange('x2', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="y2">Y2:</label>
                        <input
                          id="y2"
                          type="number"
                          placeholder="0"
                          value={novaZona.y2}
                          onChange={(e) => handleInputChange('y2', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? <FaSpinner className="spinner" /> : <FaPlus />}
                  {editingZona ? 'Atualizar Zona' : 'Criar Zona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

