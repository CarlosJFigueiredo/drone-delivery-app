import React, { useState, useEffect } from 'react';
import { 
  FaBan, FaPlus, FaEdit, FaTrash, FaSpinner, FaTimes, 
  FaMapMarkerAlt, FaRuler, FaShieldAlt, FaExclamationTriangle,
  FaCheck, FaInfoCircle, FaMap, FaLayerGroup
} from 'react-icons/fa';
import api from '../services/api';
import './ZonasExclusao.css';

// Componente de Card de Estatística
const StatCard = ({ icon: IconComponent, title, value, description, color = '#3498db' }) => (
  <div className="stat-card-modern">
    <div className="stat-card-header">
      <div className="stat-icon-container" style={{ background: `${color}20`, color }}>
        <IconComponent className="stat-icon-modern" />
      </div>
    </div>
    <div className="stat-content">
      <h3 className="stat-title-modern">{title}</h3>
      <div className="stat-value-modern" style={{ color }}>{value}</div>
      <p className="stat-description-modern">{description}</p>
    </div>
  </div>
);

// Componente de Card de Zona
const ZonaCard = ({ zona, onEdit, onDelete }) => {
  const area = Math.abs(zona.x2 - zona.x1) * Math.abs(zona.y2 - zona.y1);
  
  return (
    <div className="zona-card-modern">
      <div className="zona-card-header">
        <div className="zona-status-indicator">
          <FaShieldAlt className="zona-status-icon" />
        </div>
        <div className="zona-actions">
          <button 
            className="btn-icon-modern btn-edit"
            onClick={() => onEdit(zona)}
            title="Editar zona"
          >
            <FaEdit />
          </button>
          <button 
            className="btn-icon-modern btn-delete"
            onClick={() => onDelete(zona)}
            title="Excluir zona"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      
      <div className="zona-content">
        <h3 className="zona-nome-modern">{zona.nome}</h3>
        <p className="zona-motivo">{zona.motivo}</p>
        
        <div className="zona-details">
          <div className="zona-detail-item">
            <FaMapMarkerAlt className="detail-icon" />
            <span className="detail-label">Coordenadas:</span>
            <span className="detail-value">
              ({zona.x1}, {zona.y1}) → ({zona.x2}, {zona.y2})
            </span>
          </div>
          
          <div className="zona-detail-item">
            <FaRuler className="detail-icon" />
            <span className="detail-label">Área:</span>
            <span className="detail-value">{area} unidades²</span>
          </div>
        </div>
      </div>
      
      <div className="zona-card-footer">
        <div className="zona-coordinates-visual">
          <div className="coordinate-point">
            <span className="point-label">P1</span>
            <span className="point-coords">({zona.x1}, {zona.y1})</span>
          </div>
          <div className="coordinate-line"></div>
          <div className="coordinate-point">
            <span className="point-label">P2</span>
            <span className="point-coords">({zona.x2}, {zona.y2})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Formulário Modal
const ZonaFormModal = ({ isOpen, zona, onSave, onClose, loading }) => {
  const [formData, setFormData] = useState({
    x1: '', y1: '', x2: '', y2: '', nome: '', motivo: ''
  });

  useEffect(() => {
    if (zona) {
      setFormData(zona);
    } else {
      setFormData({ x1: '', y1: '', x2: '', y2: '', nome: '', motivo: '' });
    }
  }, [zona]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-modern">
        <div className="modal-header">
          <h2 className="modal-title">
            <FaMapMarkerAlt className="modal-icon" />
            {zona ? 'Editar Zona de Exclusão' : 'Nova Zona de Exclusão'}
          </h2>
          <button className="btn-close-modal" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-section">
            <h3 className="section-title">
              <FaInfoCircle className="section-icon" />
              Informações Básicas
            </h3>
            
            <div className="form-group">
              <label className="form-label">Nome da Zona</label>
              <input
                type="text"
                className="form-input-modern"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Ex: Zona Residencial Centro"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Motivo da Exclusão</label>
              <textarea
                className="form-textarea-modern"
                value={formData.motivo}
                onChange={(e) => handleChange('motivo', e.target.value)}
                placeholder="Descreva o motivo da exclusão desta zona..."
                rows="3"
                required
              />
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <FaMap className="section-icon" />
              Coordenadas da Zona
            </h3>
            
            <div className="coordinates-grid">
              <div className="coordinate-group">
                <label className="coordinate-label">Ponto 1 (Superior Esquerdo)</label>
                <div className="coordinate-inputs">
                  <input
                    type="number"
                    className="form-input-modern coordinate-input"
                    value={formData.x1}
                    onChange={(e) => handleChange('x1', e.target.value)}
                    placeholder="X1"
                    required
                  />
                  <input
                    type="number"
                    className="form-input-modern coordinate-input"
                    value={formData.y1}
                    onChange={(e) => handleChange('y1', e.target.value)}
                    placeholder="Y1"
                    required
                  />
                </div>
              </div>

              <div className="coordinate-group">
                <label className="coordinate-label">Ponto 2 (Inferior Direito)</label>
                <div className="coordinate-inputs">
                  <input
                    type="number"
                    className="form-input-modern coordinate-input"
                    value={formData.x2}
                    onChange={(e) => handleChange('x2', e.target.value)}
                    placeholder="X2"
                    required
                  />
                  <input
                    type="number"
                    className="form-input-modern coordinate-input"
                    value={formData.y2}
                    onChange={(e) => handleChange('y2', e.target.value)}
                    placeholder="Y2"
                    required
                  />
                </div>
              </div>
            </div>

            {formData.x1 && formData.y1 && formData.x2 && formData.y2 && (
              <div className="area-preview">
                <FaRuler className="area-icon" />
                <span>Área calculada: {Math.abs(formData.x2 - formData.x1) * Math.abs(formData.y2 - formData.y1)} unidades²</span>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn-secondary-modern"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary-modern"
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="spinner" />
                  Salvando...
                </>
              ) : (
                <>
                  <FaCheck />
                  {zona ? 'Atualizar' : 'Criar'} Zona
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function ZonasExclusao() {
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingZona, setEditingZona] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchZonas();
  }, []);

  const fetchZonas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/drones/zonas-exclusao');
      setZonas(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar zonas:', error);
      setZonas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveZona = async (formData) => {
    setActionLoading(true);
    
    try {
      if (!formData.nome?.trim() || !formData.motivo?.trim()) {
        alert('Nome e motivo são obrigatórios!');
        return;
      }
      
      const zonaData = {
        ...formData,
        x1: parseInt(formData.x1),
        y1: parseInt(formData.y1),
        x2: parseInt(formData.x2),
        y2: parseInt(formData.y2)
      };
      
      if (editingZona) {
        await api.put(`/drones/zonas-exclusao/${editingZona.id}`, zonaData);
      } else {
        await api.post('/drones/zonas-exclusao', zonaData);
      }
      
      await fetchZonas();
      setShowForm(false);
      setEditingZona(null);
    } catch (error) {
      console.error('Erro ao salvar zona:', error);
      alert('Erro ao salvar zona. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (zona) => {
    setEditingZona(zona);
    setShowForm(true);
  };

  const handleDelete = async (zona) => {
    if (!window.confirm(`Tem certeza que deseja excluir a zona "${zona.nome}"?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await api.delete(`/drones/zonas-exclusao/${zona.id}`);
      await fetchZonas();
    } catch (error) {
      console.error('Erro ao deletar zona:', error);
      alert('Erro ao deletar zona. Tente novamente.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingZona(null);
  };

  // Estatísticas calculadas
  const totalArea = zonas.reduce((total, zona) => 
    total + Math.abs(zona.x2 - zona.x1) * Math.abs(zona.y2 - zona.y1), 0
  );

  const averageArea = zonas.length > 0 ? Math.round(totalArea / zonas.length) : 0;

  if (loading) {
    return (
      <div className="loading-container">
        <FaSpinner className="loading-spinner" />
        <h3>Carregando zonas de exclusão...</h3>
        <p>Aguarde enquanto buscamos as informações</p>
      </div>
    );
  }

  return (
    <div className="zonas-exclusao">
      {/* Header */}
      <div className="zonas-header">
        <div className="header-title">
          <FaBan className="title-icon" />
          <h1>Gerenciamento de Zonas de Exclusão</h1>
        </div>
        
        <button 
          className="btn-primary-modern btn-add-zona"
          onClick={() => setShowForm(true)}
          disabled={actionLoading}
        >
          <FaPlus />
          Nova Zona
        </button>
      </div>

      {/* Estatísticas */}
      <div className="stats-grid-modern">
        <StatCard
          icon={FaLayerGroup}
          title="Zonas Cadastradas"
          value={zonas.length}
          description="Total de zonas de exclusão ativas"
          color="#3498db"
        />
        
        <StatCard
          icon={FaRuler}
          title="Área Total"
          value={`${totalArea.toLocaleString()}`}
          description="Unidades quadradas de exclusão"
          color="#e74c3c"
        />
        
        <StatCard
          icon={FaMapMarkerAlt}
          title="Área Média"
          value={`${averageArea.toLocaleString()}`}
          description="Área média por zona de exclusão"
          color="#f39c12"
        />
        
        <StatCard
          icon={FaShieldAlt}
          title="Status"
          value="Ativo"
          description="Sistema de exclusão operacional"
          color="#27ae60"
        />
      </div>

      {/* Lista de Zonas */}
      {zonas.length === 0 ? (
        <div className="empty-state">
          <FaBan className="empty-icon" />
          <h3>Nenhuma zona de exclusão cadastrada</h3>
          <p>Clique em "Nova Zona" para adicionar sua primeira zona de exclusão</p>
          <button 
            className="btn-primary-modern"
            onClick={() => setShowForm(true)}
          >
            <FaPlus />
            Criar Primeira Zona
          </button>
        </div>
      ) : (
        <div className="zonas-grid-modern">
          {zonas.map((zona, index) => (
            <ZonaCard
              key={zona.id || `zona-${index}`}
              zona={zona}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal de Formulário */}
      <ZonaFormModal
        isOpen={showForm}
        zona={editingZona}
        onSave={handleSaveZona}
        onClose={handleCloseForm}
        loading={actionLoading}
      />
    </div>
  );
}
