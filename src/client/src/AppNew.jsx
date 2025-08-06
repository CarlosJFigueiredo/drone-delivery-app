import React, { useState } from 'react';
import Navigation from './components/Navigation';
import DashboardAvancado from './components/DashboardAvancado';
import DeliveryListImproved from './components/DeliveryListImproved';
import PedidoManager from './components/PedidoManager';
import ZonasExclusao from './components/ZonasExclusao';
import Estatisticas from './components/Estatisticas';
import MapaEntregas from './components/MapaEntregasNew';
import './AppNew.css';

export default function AppNew() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardAvancado />;
      case 'pedidos':
        return <PedidoManager />;
      case 'zonas':
        return <ZonasExclusao />;
      case 'mapa':
        return <MapaEntregas />;
      case 'estatisticas':
        return <Estatisticas />;
      default:
        return <DashboardAvancado />;
    }
  };

  return (
    <div className="app-new">
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

