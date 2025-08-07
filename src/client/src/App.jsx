import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import DeliveryList from './components/DeliveryList';
import PedidoManager from './components/PedidoManager';
import ZonasExclusao from './components/ZonasExclusao';
import Estatisticas from './components/Estatisticas';
import MapaEntregas from './components/MapaEntregas';
import './App.css';

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'pedidos':
        return <PedidoManager />;
      case 'zonas':
        return <ZonasExclusao />;
      case 'mapa':
        return <MapaEntregas />;
      case 'estatisticas':
        return <Estatisticas />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Navigation 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
      
      <main className="main-content">
        {renderActiveSection()}
      </main>
    </div>
  );
}

