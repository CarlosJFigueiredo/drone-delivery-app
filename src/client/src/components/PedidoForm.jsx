import React, { useState } from 'react';
import api from '../services/api';

export default function PedidoForm() {
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [peso, setPeso] = useState('');
  const [prioridade, setPrioridade] = useState('MEDIA');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pedidos', {
        x: parseInt(x),
        y: parseInt(y),
        peso: parseFloat(peso),
        prioridade
      });
      alert('Pedido criado!');
      setX('');
      setY('');
      setPeso('');
      setPrioridade('MEDIA');
    } catch (error) {
      alert('Erro ao criar pedido: ' + error.response?.data || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Criar Pedido</h2>
      <input
        type="number"
        placeholder="Coordenada X"
        value={x}
        onChange={(e) => setX(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Coordenada Y"
        value={y}
        onChange={(e) => setY(e.target.value)}
        required
      />
      <input
        type="number"
        step="0.1"
        placeholder="Peso (kg)"
        value={peso}
        onChange={(e) => setPeso(e.target.value)}
        required
      />
      <select
        value={prioridade}
        onChange={(e) => setPrioridade(e.target.value)}
        required
      >
        <option value="ALTA">Alta</option>
        <option value="MEDIA">Média</option>
        <option value="BAIXA">Baixa</option>
      </select>
      <button type="submit">Criar Pedido</button>
    </form>
  );
}

