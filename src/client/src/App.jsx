import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import DeliveryList from './components/DeliveryList';
import PedidoManager from './components/PedidoManager';
import ZonasExclusao from './components/ZonasExclusao';
import Estatisticas from './components/Estatisticas';
import MapaEntregas from './components/MapaEntregas';
import './App.css';
import './responsive.css';

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

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
    <div className={`app ${isMobile ? 'mobile' : ''}`}>
      {isMobile && (
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsNavOpen(!isNavOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}
      
      <Navigation 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        isMobile={isMobile}
        isNavOpen={isNavOpen}
        setIsNavOpen={setIsNavOpen}
      />
      
      <main className={`main-content ${isMobile && isNavOpen ? 'nav-open' : ''}`}>
        {renderActiveSection()}
      </main>
    </div>
  );
}

