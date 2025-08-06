import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function MapaEntregas() {
  const [drones, setDrones] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [zonasExclusao, setZonasExclusao] = useState([]);
  const [pedidosPendentes, setPedidosPendentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 3000); // Atualizar a cada 3 segundos
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      const [dronesRes, entregasRes, zonasRes, pedidosRes] = await Promise.all([
        api.get('/api/drones'),
        api.get('/api/pedidos/entregas'),
        api.get('/api/drones/zonas-exclusao'),
        api.get('/api/pedidos/fila')
      ]);

      setDrones(dronesRes.data);
      setEntregas(entregasRes.data);
      setZonasExclusao(zonasRes.data);
      setPedidosPendentes(pedidosRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados do mapa:', error);
    }
    setLoading(false);
  };

  const gerarMapaASCII = () => {
    const tamanho = 21; // Grid 21x21 (-10 a +10)
    const mapa = Array(tamanho).fill().map(() => Array(tamanho).fill('.'));
    
    // Função para converter coordenadas reais para grid
    const toGrid = (coord) => Math.max(0, Math.min(tamanho - 1, coord + 10));
    
    // Marcar base (0,0)
    mapa[toGrid(0)][toGrid(0)] = '🏠';
    
    // Marcar zonas de exclusão
    zonasExclusao.forEach(zona => {
      for (let x = Math.max(-10, zona.x1); x <= Math.min(10, zona.x2); x++) {
        for (let y = Math.max(-10, zona.y1); y <= Math.min(10, zona.y2); y++) {
          const gridX = toGrid(x);
          const gridY = toGrid(y);
          if (mapa[gridX][gridY] === '.') {
            mapa[gridX][gridY] = '🚫';
          }
        }
      }
    });
    
    // Marcar entregas realizadas
    entregas.forEach(entrega => {
      const x = toGrid(entrega.pedido.x);
      const y = toGrid(entrega.pedido.y);
      if (mapa[x][y] === '.') {
        mapa[x][y] = '📦';
      }
    });
    
    // Marcar drones ativos
    drones.forEach(drone => {
      const x = toGrid(drone.posX);
      const y = toGrid(drone.posY);
      if (drone.estado !== 'IDLE') {
        mapa[x][y] = '🚁';
      }
    });
    
    return mapa;
  };

  if (loading) return <div>Carregando mapa...</div>;

  const mapa = gerarMapaASCII();

  return (
    <div className="mapa-entregas">
      <h2>🗺️ Mapa de Entregas</h2>
      
      <div className="legenda">
        <h3>Legenda:</h3>
        <div className="legenda-item">🏠 Base</div>
        <div className="legenda-item">📦 Entregas</div>
        <div className="legenda-item">🚁 Drones</div>
        <div className="legenda-item">🚫 Zonas de Exclusão</div>
        <div className="legenda-item">. Área Livre</div>
      </div>
      
      <div className="mapa-grid">
        {mapa.map((linha, i) => (
          <div key={i} className="mapa-linha">
            {linha.map((celula, j) => (
              <span key={j} className="mapa-celula">
                {celula}
              </span>
            ))}
          </div>
        ))}
      </div>
      
      <div className="info-adicional">
        <p>Total de entregas: {entregas.length}</p>
        <p>Drones ativos: {drones.filter(d => d.estado !== 'IDLE').length}</p>
        <p>Zonas de exclusão: {zonasExclusao.length}</p>
      </div>
      
      <button onClick={carregarDados} className="refresh-btn">
        🔄 Atualizar Mapa
      </button>
    </div>
  );
}
