import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function MapaEntregas() {
  const [drones, setDrones] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [zonasExclusao, setZonasExclusao] = useState([]);
  const [pedidosPendentes, setPedidosPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    carregarDados();
    const interval = setInterval(carregarDados, 3000);
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      const [dronesRes, entregasRes, zonasRes, pedidosRes] = await Promise.all([
        api.get('/drones'),
        api.get('/pedidos/entregas'),
        api.get('/drones/zonas-exclusao'),
        api.get('/pedidos/fila')
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

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.5, 0.3));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoomLevel(prev => Math.min(Math.max(prev * delta, 0.3), 5));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    setPanOffset(prev => ({
      x: prev.x + deltaX / zoomLevel,
      y: prev.y + deltaY / zoomLevel
    }));
    
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const calcularEscala = () => {
    let minX = -10, maxX = 10, minY = -10, maxY = 10;

    [...drones, ...entregas.map(e => e.pedido), ...pedidosPendentes, ...zonasExclusao].forEach(item => {
      if (item.x !== undefined || item.posX !== undefined) {
        const x = item.x || item.posX || 0;
        const y = item.y || item.posY || 0;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
      
      if (item.x1 !== undefined) {
        minX = Math.min(minX, item.x1, item.x2);
        maxX = Math.max(maxX, item.x1, item.x2);
        minY = Math.min(minY, item.y1, item.y2);
        maxY = Math.max(maxY, item.y1, item.y2);
      }
    });

    const margemX = (maxX - minX) * 0.1;
    const margemY = (maxY - minY) * 0.1;
    
    return {
      minX: minX - margemX,
      maxX: maxX + margemX,
      minY: minY - margemY,
      maxY: maxY + margemY
    };
  };

  const coordenadaParaPixel = (x, y, escala, width, height) => {
    const rangeX = escala.maxX - escala.minX;
    const rangeY = escala.maxY - escala.minY;
    
    // Aplicar zoom e pan
    const baseX = ((x - escala.minX) / rangeX) * width;
    const baseY = height - ((y - escala.minY) / rangeY) * height;
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    return {
      x: centerX + (baseX - centerX) * zoomLevel + panOffset.x,
      y: centerY + (baseY - centerY) * zoomLevel + panOffset.y
    };
  };

  const renderMapa = () => {
    const width = 800;
    const height = 600;
    const escala = calcularEscala();

    return (
      <div style={{ 
        position: 'relative', 
        width: `${width}px`, 
        height: `${height}px`, 
        margin: '0 auto',
        border: '2px solid #bdc3c7',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <svg 
          width={width} 
          height={height} 
          style={{ background: '#ecf0f1', cursor: isDragging ? 'grabbing' : 'grab' }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d5dbdb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Zonas de Exclusão */}
          {zonasExclusao.map((zona, index) => {
            const p1 = coordenadaParaPixel(zona.x1, zona.y1, escala, width, height);
            const p2 = coordenadaParaPixel(zona.x2, zona.y2, escala, width, height);
            
            return (
              <rect
                key={`zona-${zona.id || index}`}
                x={Math.min(p1.x, p2.x)}
                y={Math.min(p1.y, p2.y)}
                width={Math.abs(p2.x - p1.x)}
                height={Math.abs(p2.y - p1.y)}
                fill="rgba(231, 76, 60, 0.3)"
                stroke="#e74c3c"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            );
          })}

          {/* Base */}
          {(() => {
            const base = coordenadaParaPixel(0, 0, escala, width, height);
            return (
              <g>
                <circle cx={base.x} cy={base.y} r="12" fill="#2c3e50" stroke="#ecf0f1" strokeWidth="3"/>
                <text x={base.x} y={base.y + 25} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#2c3e50">
                  🏠 BASE
                </text>
              </g>
            );
          })()}

          {/* Drones */}
          {drones.map((drone) => {
            const pos = coordenadaParaPixel(drone.posX, drone.posY, escala, width, height);
            const bateriaPercent = (drone.bateriaAtual / drone.autonomiaMaxima) * 100;
            let corDrone = '#3498db';
            
            switch (drone.estado) {
              case 'EM_VOO': corDrone = '#9b59b6'; break;
              case 'ENTREGANDO': corDrone = '#e67e22'; break;
              case 'RETORNANDO': corDrone = '#e74c3c'; break;
              case 'CARREGANDO': corDrone = '#f39c12'; break;
              default: corDrone = '#27ae60';
            }

            return (
              <g key={`drone-${drone.id}`}>
                <circle 
                  cx={pos.x} 
                  cy={pos.y} 
                  r="8" 
                  fill={corDrone}
                  stroke={bateriaPercent < 20 ? '#e74c3c' : '#fff'}
                  strokeWidth={bateriaPercent < 20 ? '3' : '2'}
                >
                  {bateriaPercent < 20 && (
                    <animate attributeName="stroke-opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
                  )}
                </circle>
                <text x={pos.x} y={pos.y - 15} textAnchor="middle" fontSize="10" fontWeight="bold" fill={corDrone}>
                  🚁 {drone.id}
                </text>
                <text x={pos.x} y={pos.y + 20} textAnchor="middle" fontSize="8" fill="#666">
                  {Math.round(bateriaPercent)}%
                </text>
              </g>
            );
          })}

          {/* Pedidos Pendentes */}
          {pedidosPendentes.map((pedido, index) => {
            const pos = coordenadaParaPixel(pedido.x, pedido.y, escala, width, height);
            let corPrioridade = '#3498db';
            
            switch (pedido.prioridade) {
              case 'ALTA': corPrioridade = '#e74c3c'; break;
              case 'MEDIA': corPrioridade = '#f39c12'; break;
              default: corPrioridade = '#3498db';
            }

            return (
              <g key={`pedido-${pedido.id || index}`}>
                <circle cx={pos.x} cy={pos.y} r="6" fill={corPrioridade} stroke="#fff" strokeWidth="2">
                  <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite"/>
                </circle>
                <text x={pos.x} y={pos.y - 12} textAnchor="middle" fontSize="8" fontWeight="bold" fill={corPrioridade}>
                  📦
                </text>
              </g>
            );
          })}

          {/* Entregas Realizadas */}
          {entregas.slice(-5).map((entrega, index) => {
            const pos = coordenadaParaPixel(entrega.pedido.x, entrega.pedido.y, escala, width, height);
            return (
              <g key={`entrega-${entrega.id || index}`} opacity="0.6">
                <circle cx={pos.x} cy={pos.y} r="4" fill="#27ae60" stroke="#fff" strokeWidth="1"/>
                <text x={pos.x} y={pos.y - 8} textAnchor="middle" fontSize="8" fill="#27ae60">
                  ✓
                </text>
              </g>
            );
          })}

        </svg>

        {/* Controles de Zoom */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          padding: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={handleZoomIn}
            style={{
              width: '40px',
              height: '40px',
              border: 'none',
              borderRadius: '6px',
              background: '#3498db',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#2980b9'}
            onMouseLeave={(e) => e.target.style.background = '#3498db'}
            title="Aumentar Zoom"
          >
            +
          </button>
          
          <button
            onClick={handleZoomOut}
            style={{
              width: '40px',
              height: '40px',
              border: 'none',
              borderRadius: '6px',
              background: '#3498db',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#2980b9'}
            onMouseLeave={(e) => e.target.style.background = '#3498db'}
            title="Diminuir Zoom"
          >
            −
          </button>
          
          <button
            onClick={handleZoomReset}
            style={{
              width: '40px',
              height: '40px',
              border: 'none',
              borderRadius: '6px',
              background: '#95a5a6',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#7f8c8d'}
            onMouseLeave={(e) => e.target.style.background = '#95a5a6'}
            title="Resetar Zoom"
          >
            ⌂
          </button>
          
          <div style={{
            fontSize: '10px',
            textAlign: 'center',
            color: '#7f8c8d',
            marginTop: '5px',
            fontWeight: 'bold'
          }}>
            {Math.round(zoomLevel * 100)}%
          </div>
        </div>

        {/* Legenda Simples */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'rgba(255, 255, 255, 0.9)',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '12px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>Legenda</h4>
          <div style={{ marginBottom: '5px' }}><span style={{ color: '#2c3e50' }}>🏠</span> Base</div>
          <div style={{ marginBottom: '5px' }}><span style={{ color: '#27ae60' }}>🚁</span> Drone Idle</div>
          <div style={{ marginBottom: '5px' }}><span style={{ color: '#9b59b6' }}>🚁</span> Em Voo</div>
          <div style={{ marginBottom: '5px' }}><span style={{ color: '#e67e22' }}>🚁</span> Entregando</div>
          <div style={{ marginBottom: '5px' }}><span style={{ color: '#e74c3c' }}>📦</span> Pedido Alta Prioridade</div>
          <div style={{ marginBottom: '5px' }}><span style={{ color: '#f39c12' }}>📦</span> Pedido Média Prioridade</div>
          <div style={{ marginBottom: '5px' }}><span style={{ color: '#27ae60' }}>✓</span> Entrega Realizada</div>
          <div><span style={{ color: '#e74c3c' }}>▨</span> Zona de Exclusão</div>
        </div>

        {/* Status */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(44, 62, 80, 0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '12px',
          minWidth: '200px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#ecf0f1' }}>Status em Tempo Real</h4>
          <div>Drones Ativos: <strong>{drones.length}</strong></div>
          <div>Pedidos Pendentes: <strong>{pedidosPendentes.length}</strong></div>
          <div>Entregas Realizadas: <strong>{entregas.length}</strong></div>
          <div>Zonas de Exclusão: <strong>{zonasExclusao.length}</strong></div>
          <div style={{ marginTop: '10px', fontSize: '10px', color: '#bdc3c7' }}>
            Atualização: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Carregando mapa...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>🗺️ Mapa de Entregas em Tempo Real</h1>
        <p style={{ color: '#7f8c8d', marginTop: '10px' }}>
          Visualização interativa do sistema de entregas por drone
        </p>
        <p style={{ color: '#95a5a6', fontSize: '12px', marginTop: '5px' }}>
          💡 Use os botões de zoom ou role o mouse para dar zoom • Arraste para mover o mapa
        </p>
      </div>
      
      {renderMapa()}
      
      <div style={{ 
        marginTop: '30px', 
        textAlign: 'center',
        background: 'rgba(149, 165, 166, 0.1)',
        padding: '15px',
        borderRadius: '10px',
        color: '#7f8c8d'
      }}>
        <small>
          🔄 Mapa atualizado automaticamente a cada 3 segundos<br/>
          🔍 Zoom atual: <strong>{Math.round(zoomLevel * 100)}%</strong> • 
          🖱️ Arraste para mover • ⚡ Scroll para zoom
        </small>
      </div>
    </div>
  );
}
