import React, { useState } from 'react';
import api from '../services/api';

export default function StatusPedido() {
  const [pedidoId, setPedidoId] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const consultarStatus = async (e) => {
    e.preventDefault();
    if (!pedidoId.trim()) return;

    setLoading(true);
    try {
      const response = await api.get(`/pedidos/status/${pedidoId}`);
      setStatus(response.data.status);
    } catch (error) {
      setStatus('Erro ao consultar status: ' + (error.response?.data || error.message));
    }
    setLoading(false);
  };

  return (
    <div className="status-pedido">
      <h2>📍 Consultar Status do Pedido</h2>
      
      <form onSubmit={consultarStatus}>
        <input
          type="text"
          placeholder="ID do Pedido"
          value={pedidoId}
          onChange={(e) => setPedidoId(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Consultando...' : 'Consultar Status'}
        </button>
      </form>

      {status && (
        <div className={`status-result ${status.includes('Erro') ? 'error' : 'success'}`}>
          <h3>Status:</h3>
          <p>{status}</p>
        </div>
      )}
    </div>
  );
}
