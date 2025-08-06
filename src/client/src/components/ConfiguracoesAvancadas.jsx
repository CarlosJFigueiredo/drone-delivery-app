import React, { useState, useEffect } from 'react';
import { 
  FaCog, 
  FaSave, 
  FaUndo, 
  FaRobot,
  FaMapMarkerAlt,
  FaClock,
  FaBatteryFull,
  FaShieldAlt,
  FaBell,
  FaPalette,
  FaDatabase,
  FaWifi,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import './ConfiguracoesAvancadas.css';

export default function ConfiguracoesAvancadas() {
  const [configuracoes, setConfiguracoes] = useState({
    // Configurações de Drone
    droneVelocidadeMaxima: 60,
    droneAltitudeMaxima: 120,
    droneBateriaMinima: 20,
    droneCapacidadeMaxima: 5,
    
    // Configurações de Entrega
    entregaTempoMaximo: 30,
    entregaRaioMaximo: 10,
    entregaPrioridadeAutomatica: true,
    entregaNotificacoes: true,
    
    // Configurações de Segurança
    segurancaZonasExclusao: true,
    segurancaVerificacaoBateria: true,
    segurancaVerificacaoClima: false,
    segurancaBackupAutomatico: true,
    
    // Configurações de Interface
    interfaceTema: 'dark',
    interfaceIdioma: 'pt-BR',
    interfaceAnimacoes: true,
    interfaceNotificacoesSonoras: true,
    
    // Configurações de Sistema
    sistemaLogLevel: 'INFO',
    sistemaBackupInterval: 24,
    sistemaLimpezaLogs: 7,
    sistemaMaxConexoes: 100
  });

  const [configuracoesSalvas, setConfiguracoesSalvas] = useState({ ...configuracoes });
  const [alteracoesPendentes, setAlteracoesPendentes] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    // Carregar configurações do backend
    carregarConfiguracoes();
  }, []);

  useEffect(() => {
    // Verificar se há alterações pendentes
    const temAlteracoes = JSON.stringify(configuracoes) !== JSON.stringify(configuracoesSalvas);
    setAlteracoesPendentes(temAlteracoes);
  }, [configuracoes, configuracoesSalvas]);

  const carregarConfiguracoes = async () => {
    try {
      // Simular carregamento do backend
      console.log('Carregando configurações...');
      // const response = await api.get('/api/configuracoes');
      // setConfiguracoes(response.data);
      // setConfiguracoesSalvas(response.data);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      mostrarMensagem('error', 'Erro ao carregar configurações');
    }
  };

  const salvarConfiguracoes = async () => {
    setSalvando(true);
    try {
      // Simular salvamento no backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      // await api.put('/api/configuracoes', configuracoes);
      
      setConfiguracoesSalvas({ ...configuracoes });
      mostrarMensagem('success', 'Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      mostrarMensagem('error', 'Erro ao salvar configurações');
    } finally {
      setSalvando(false);
    }
  };

  const resetarConfiguracoes = () => {
    setConfiguracoes({ ...configuracoesSalvas });
    mostrarMensagem('info', 'Alterações descartadas');
  };

  const mostrarMensagem = (tipo, texto) => {
    setMensagem({ tipo, texto });
    setTimeout(() => setMensagem({ tipo: '', texto: '' }), 3000);
  };

  const handleChange = (secao, campo, valor) => {
    setConfiguracoes(prev => ({
      ...prev,
      [`${secao}${campo}`]: valor
    }));
  };

  const ConfigSection = ({ title, icon: Icon, children }) => (
    <div className="config-section">
      <div className="section-header">
        <Icon className="section-icon" />
        <h3>{title}</h3>
      </div>
      <div className="section-content">
        {children}
      </div>
    </div>
  );

  const ConfigField = ({ label, type, value, onChange, min, max, options, tooltip }) => (
    <div className="config-field">
      <div className="field-header">
        <label>{label}</label>
        {tooltip && (
          <div className="tooltip">
            <FaInfoCircle className="tooltip-icon" />
            <span className="tooltip-text">{tooltip}</span>
          </div>
        )}
      </div>
      
      {type === 'number' && (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          className="config-input"
        />
      )}
      
      {type === 'boolean' && (
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      )}
      
      {type === 'select' && (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="config-select"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  return (
    <div className="configuracoes-avancadas">
      <div className="config-header">
        <div className="header-title">
          <FaCog className="title-icon" />
          <h1>Configurações Avançadas</h1>
        </div>
        
        <div className="header-actions">
          {alteracoesPendentes && (
            <button 
              className="btn-secondary"
              onClick={resetarConfiguracoes}
              disabled={salvando}
            >
              <FaUndo /> Descartar
            </button>
          )}
          
          <button 
            className="btn-primary"
            onClick={salvarConfiguracoes}
            disabled={!alteracoesPendentes || salvando}
          >
            <FaSave /> {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      {mensagem.texto && (
        <div className={`mensagem ${mensagem.tipo}`}>
          {mensagem.tipo === 'success' && <FaCheckCircle />}
          {mensagem.tipo === 'error' && <FaExclamationTriangle />}
          {mensagem.tipo === 'info' && <FaInfoCircle />}
          {mensagem.texto}
        </div>
      )}

      <div className="config-grid">
        <ConfigSection title="Configurações de Drone" icon={FaRobot}>
          <ConfigField
            label="Velocidade Máxima (km/h)"
            type="number"
            value={configuracoes.droneVelocidadeMaxima}
            onChange={(v) => handleChange('drone', 'VelocidadeMaxima', v)}
            min={10}
            max={100}
            tooltip="Velocidade máxima que os drones podem atingir"
          />
          
          <ConfigField
            label="Altitude Máxima (m)"
            type="number"
            value={configuracoes.droneAltitudeMaxima}
            onChange={(v) => handleChange('drone', 'AltitudeMaxima', v)}
            min={50}
            max={200}
            tooltip="Altitude máxima permitida para voo"
          />
          
          <ConfigField
            label="Bateria Mínima (%)"
            type="number"
            value={configuracoes.droneBateriaMinima}
            onChange={(v) => handleChange('drone', 'BateriaMinima', v)}
            min={10}
            max={50}
            tooltip="Nível mínimo de bateria para iniciar uma entrega"
          />
          
          <ConfigField
            label="Capacidade Máxima (kg)"
            type="number"
            value={configuracoes.droneCapacidadeMaxima}
            onChange={(v) => handleChange('drone', 'CapacidadeMaxima', v)}
            min={1}
            max={10}
            tooltip="Peso máximo que um drone pode carregar"
          />
        </ConfigSection>

        <ConfigSection title="Configurações de Entrega" icon={FaMapMarkerAlt}>
          <ConfigField
            label="Tempo Máximo de Entrega (min)"
            type="number"
            value={configuracoes.entregaTempoMaximo}
            onChange={(v) => handleChange('entrega', 'TempoMaximo', v)}
            min={15}
            max={60}
            tooltip="Tempo máximo permitido para uma entrega"
          />
          
          <ConfigField
            label="Raio Máximo de Entrega (km)"
            type="number"
            value={configuracoes.entregaRaioMaximo}
            onChange={(v) => handleChange('entrega', 'RaioMaximo', v)}
            min={5}
            max={50}
            tooltip="Distância máxima para entregas"
          />
          
          <ConfigField
            label="Priorização Automática"
            type="boolean"
            value={configuracoes.entregaPrioridadeAutomatica}
            onChange={(v) => handleChange('entrega', 'PrioridadeAutomatica', v)}
            tooltip="Priorizar automaticamente entregas baseado na urgência"
          />
          
          <ConfigField
            label="Notificações de Entrega"
            type="boolean"
            value={configuracoes.entregaNotificacoes}
            onChange={(v) => handleChange('entrega', 'Notificacoes', v)}
            tooltip="Enviar notificações sobre status das entregas"
          />
        </ConfigSection>

        <ConfigSection title="Configurações de Segurança" icon={FaShieldAlt}>
          <ConfigField
            label="Verificar Zonas de Exclusão"
            type="boolean"
            value={configuracoes.segurancaZonasExclusao}
            onChange={(v) => handleChange('seguranca', 'ZonasExclusao', v)}
            tooltip="Verificar zonas de exclusão antes de planejar rotas"
          />
          
          <ConfigField
            label="Verificação de Bateria"
            type="boolean"
            value={configuracoes.segurancaVerificacaoBateria}
            onChange={(v) => handleChange('seguranca', 'VerificacaoBateria', v)}
            tooltip="Verificar nível de bateria antes de cada missão"
          />
          
          <ConfigField
            label="Verificação Climática"
            type="boolean"
            value={configuracoes.segurancaVerificacaoClima}
            onChange={(v) => handleChange('seguranca', 'VerificacaoClima', v)}
            tooltip="Verificar condições climáticas antes do voo"
          />
          
          <ConfigField
            label="Backup Automático"
            type="boolean"
            value={configuracoes.segurancaBackupAutomatico}
            onChange={(v) => handleChange('seguranca', 'BackupAutomatico', v)}
            tooltip="Realizar backup automático dos dados"
          />
        </ConfigSection>

        <ConfigSection title="Configurações de Interface" icon={FaPalette}>
          <ConfigField
            label="Tema"
            type="select"
            value={configuracoes.interfaceTema}
            onChange={(v) => handleChange('interface', 'Tema', v)}
            options={[
              { value: 'light', label: 'Claro' },
              { value: 'dark', label: 'Escuro' },
              { value: 'auto', label: 'Automático' }
            ]}
            tooltip="Tema visual da interface"
          />
          
          <ConfigField
            label="Idioma"
            type="select"
            value={configuracoes.interfaceIdioma}
            onChange={(v) => handleChange('interface', 'Idioma', v)}
            options={[
              { value: 'pt-BR', label: 'Português (Brasil)' },
              { value: 'en-US', label: 'English (US)' },
              { value: 'es-ES', label: 'Español' }
            ]}
            tooltip="Idioma da interface"
          />
          
          <ConfigField
            label="Animações"
            type="boolean"
            value={configuracoes.interfaceAnimacoes}
            onChange={(v) => handleChange('interface', 'Animacoes', v)}
            tooltip="Ativar animações na interface"
          />
          
          <ConfigField
            label="Notificações Sonoras"
            type="boolean"
            value={configuracoes.interfaceNotificacoesSonoras}
            onChange={(v) => handleChange('interface', 'NotificacoesSonoras', v)}
            tooltip="Reproduzir sons para notificações"
          />
        </ConfigSection>

        <ConfigSection title="Configurações de Sistema" icon={FaDatabase}>
          <ConfigField
            label="Nível de Log"
            type="select"
            value={configuracoes.sistemaLogLevel}
            onChange={(v) => handleChange('sistema', 'LogLevel', v)}
            options={[
              { value: 'DEBUG', label: 'Debug' },
              { value: 'INFO', label: 'Info' },
              { value: 'WARN', label: 'Warning' },
              { value: 'ERROR', label: 'Error' }
            ]}
            tooltip="Nível de detalhamento dos logs"
          />
          
          <ConfigField
            label="Intervalo de Backup (horas)"
            type="number"
            value={configuracoes.sistemaBackupInterval}
            onChange={(v) => handleChange('sistema', 'BackupInterval', v)}
            min={1}
            max={168}
            tooltip="Intervalo entre backups automáticos"
          />
          
          <ConfigField
            label="Limpeza de Logs (dias)"
            type="number"
            value={configuracoes.sistemaLimpezaLogs}
            onChange={(v) => handleChange('sistema', 'LimpezaLogs', v)}
            min={1}
            max={30}
            tooltip="Manter logs por quantos dias"
          />
          
          <ConfigField
            label="Máximo de Conexões"
            type="number"
            value={configuracoes.sistemaMaxConexoes}
            onChange={(v) => handleChange('sistema', 'MaxConexoes', v)}
            min={10}
            max={1000}
            tooltip="Número máximo de conexões simultâneas"
          />
        </ConfigSection>
      </div>
    </div>
  );
}
