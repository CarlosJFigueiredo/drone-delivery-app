import React, { useState } from 'react';
import api from '../services/api';

export default function DroneForm() {
  const [id, setId] = useState('');
  const [capacidade, setCapacidade] = useState('');
  const [autonomia, setAutonomia] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/drones', { 
        id, 
        capacidade: parseFloat(capacidade), 
        autonomia: parseFloat(autonomia) 
      });
      alert('Drone cadastrado!');
      setId('');
      setCapacidade('');
      setAutonomia('');
    } catch (error) {
      alert('Erro ao cadastrar drone: ' + error.response?.data || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Cadastro de Drone</h2>
      <input
        type="text"
        placeholder="ID do Drone"
        value={id}
        onChange={(e) => setId(e.target.value)}
        required
      />
      <input
        type="number"
        step="0.1"
        placeholder="Capacidade (kg)"
        value={capacidade}
        onChange={(e) => setCapacidade(e.target.value)}
        required
      />
      <input
        type="number"
        step="0.1"
        placeholder="Autonomia (km)"
        value={autonomia}
        onChange={(e) => setAutonomia(e.target.value)}
        required
      />
      <button type="submit">Cadastrar</button>
    </form>
  );
}

