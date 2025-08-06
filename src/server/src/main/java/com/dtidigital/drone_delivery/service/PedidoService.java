package com.dtidigital.drone_delivery.service;

import org.springframework.stereotype.Service;

import com.dtidigital.drone_delivery.enums.Prioridade;
import com.dtidigital.drone_delivery.model.Pedido;

@Service
public class PedidoService {

    private final DroneService droneService;

    public PedidoService(DroneService droneService) {
        this.droneService = droneService;
    }

    public void criarPedido(int x, int y, double peso, Prioridade prioridade) {
        Pedido pedido = new Pedido(x, y, peso, prioridade);
        droneService.adicionarPedido(pedido);
    }
}