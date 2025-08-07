import React from 'react';
import { 
  FaTachometerAlt, 
  FaRobot, 
  FaBox, 
  FaMapMarkerAlt,
  FaMap,
  FaChartBar
} from 'react-icons/fa';
import './Navigation.css';

export default function Navigation({ activeSection, setActiveSection, isMobile, isNavOpen, setIsNavOpen }) {
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Avançado',
      icon: FaTachometerAlt,
      description: 'Monitoramento em tempo real'
    },
    {
      id: 'pedidos',
      label: 'Gerenciar Pedidos/Drones',
      icon: FaBox,
      description: 'Entregas e cadastro de drones'
    },
    {
      id: 'mapa',
      label: 'Mapa das Entregas',
      icon: FaMap,
      description: 'Visualização em tempo real'
    },
    {
      id: 'zonas',
      label: 'Zonas de Exclusão',
      icon: FaMapMarkerAlt,
      description: 'Áreas restritas'
    },
    {
      id: 'estatisticas',
      label: 'Estatísticas',
      icon: FaChartBar,
      description: 'Relatórios e métricas'
    }
  ];

  const handleNavItemClick = (sectionId) => {
    setActiveSection(sectionId);
    if (isMobile && setIsNavOpen) {
      setIsNavOpen(false);
    }
  };

  return (
    <nav className={`navigation ${isMobile ? 'mobile' : ''} ${isMobile && isNavOpen ? 'nav-open' : ''}`}>
      <div className="nav-header">
        <div className="nav-logo">
          <FaRobot className="logo-icon" />
          <span className="logo-text">DroneDelivery</span>
        </div>
        {isMobile && (
          <button 
            className="nav-close"
            onClick={() => setIsNavOpen(false)}
            aria-label="Close navigation menu"
          >
            ×
          </button>
        )}
      </div>
      
      <div className="nav-items">
        {navigationItems.map(item => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => handleNavItemClick(item.id)}
            >
              <IconComponent className="nav-icon" />
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

