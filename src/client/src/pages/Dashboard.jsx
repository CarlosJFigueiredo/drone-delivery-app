import React, { useState } from 'react';
import DeliveryList from '../components/DeliveryList';
import Estatisticas from '../components/Estatisticas';
import StatusPedido from '../components/StatusPedido';
import MapaEntregas from '../components/MapaEntregas';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('drones');

  const tabs = [
    { id: 'drones', label: '🚁 Drones', component: <DeliveryList /> },
    { id: 'stats', label: '📊 Estatísticas', component: <Estatisticas /> },
    { id: 'status', label: '📍 Status', component: <StatusPedido /> },
    { id: 'mapa', label: '🗺️ Mapa', component: <MapaEntregas /> }
  ];

  return (
    <div className="dashboard">
      <h1>🎛️ Dashboard - Controle de Drones</h1>
      
      <div className="dashboard-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="dashboard-content">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}
