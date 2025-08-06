import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function ZonasExclusao() {
  const [zonas, setZonas] = useState([]);
  const [novaZona, setNovaZona] = useState({
    x1: '', y1: '', x2: '', y2: '', nome: '', motivo: ''
  });
  const [loading, setLoading] = useState(true);

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
    try {
      await api.post('/drones/zonas-exclusao', {
        x1: parseInt(novaZona.x1),
        y1: parseInt(novaZona.y1),
        x2: parseInt(novaZona.x2),
        y2: parseInt(novaZona.y2),
        nome: novaZona.nome,
        motivo: novaZona.motivo
      });
      
      alert('Zona de exclusão adicionada com sucesso!');
      setNovaZona({ x1: '', y1: '', x2: '', y2: '', nome: '', motivo: '' });
      fetchZonas();
    } catch (error) {
      alert('Erro ao adicionar zona: ' + (error.response?.data || error.message));
    }
  };

  const handleInputChange = (field, value) => {
    setNovaZona(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <div className="loading">Carregando zonas...</div>;

  return (
    <div className="zonas-exclusao">
      <h1>🚫 Gerenciamento de Zonas de Exclusão</h1>
      
      <div className="zonas-content">
        <div className="adicionar-zona">
          <h2>➕ Adicionar Nova Zona</h2>
          <form onSubmit={adicionarZona}>
            <div className="coordenadas-grid">
              <input
                type="number"
                placeholder="X1"
                value={novaZona.x1}
                onChange={(e) => handleInputChange('x1', e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Y1"
                value={novaZona.y1}
                onChange={(e) => handleInputChange('y1', e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="X2"
                value={novaZona.x2}
                onChange={(e) => handleInputChange('x2', e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Y2"
                value={novaZona.y2}
                onChange={(e) => handleInputChange('y2', e.target.value)}
                required
              />
            </div>
            
            <input
              type="text"
              placeholder="Nome da zona"
              value={novaZona.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              required
            />
            
            <input
              type="text"
              placeholder="Motivo da exclusão"
              value={novaZona.motivo}
              onChange={(e) => handleInputChange('motivo', e.target.value)}
              required
            />
            
            <button type="submit">Adicionar Zona</button>
          </form>
        </div>
        
        <div className="lista-zonas">
          <h2>📋 Zonas Existentes</h2>
          {zonas.length === 0 ? (
            <p>Nenhuma zona de exclusão cadastrada.</p>
          ) : (
            <div className="zonas-grid">
              {zonas.map((zona, index) => (
                <div key={index} className="zona-card">
                  <h3>{zona.nome}</h3>
                  <p><strong>Coordenadas:</strong> ({zona.x1}, {zona.y1}) até ({zona.x2}, {zona.y2})</p>
                  <p><strong>Motivo:</strong> {zona.motivo}</p>
                  <div className="zona-size">
                    Área: {Math.abs(zona.x2 - zona.x1) * Math.abs(zona.y2 - zona.y1)} unidades²
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
