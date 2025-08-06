package com.dtidigital.drone_delivery.model;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import com.dtidigital.drone_delivery.enums.EstadoDrone;
import com.dtidigital.drone_delivery.enums.Prioridade;

class DroneTest {

    @Test
    @DisplayName("Deve criar drone com valores iniciais corretos")
    void deveCriarDroneComValoresIniciaisCorretos() {
        // Given
        String id = "DRONE-001";
        double capacidade = 10.0;
        double autonomia = 100.0;

        // When
        Drone drone = new Drone(id, capacidade, autonomia);

        // Then
        assertEquals(id, drone.getId());
        assertEquals(capacidade, drone.getCapacidadeMaxima());
        assertEquals(autonomia, drone.getAutonomiaMaxima());
        assertEquals(autonomia, drone.getBateriaAtual());
        assertEquals(0, drone.getPosX());
        assertEquals(0, drone.getPosY());
        assertEquals(EstadoDrone.IDLE, drone.getEstado());
        assertTrue(drone.getPedidosAlocados().isEmpty());
    }

    @Test
    @DisplayName("Deve consumir bateria corretamente")
    void deveConsumirBateriaCorretamente() {
        // Given
        Drone drone = new Drone("DRONE-001", 10.0, 100.0);
        double distancia = 20.0;

        // When
        drone.consumirBateria(distancia);

        // Then
        assertEquals(80.0, drone.getBateriaAtual());
    }

    @Test
    @DisplayName("Deve recarregar bateria para valor máximo")
    void deveRecarregarBateriaParaValorMaximo() {
        // Given
        Drone drone = new Drone("DRONE-001", 10.0, 100.0);
        drone.consumirBateria(50.0);

        // When
        drone.recarregar();

        // Then
        assertEquals(100.0, drone.getBateriaAtual());
    }

    @Test
    @DisplayName("Deve alterar posição corretamente")
    void deveAlterarPosicaoCorretamente() {
        // Given
        Drone drone = new Drone("DRONE-001", 10.0, 100.0);
        int novoX = 10;
        int novoY = 20;

        // When
        drone.setPosicao(novoX, novoY);

        // Then
        assertEquals(novoX, drone.getPosX());
        assertEquals(novoY, drone.getPosY());
    }

    @Test
    @DisplayName("Deve alterar estado corretamente")
    void deveAlterarEstadoCorretamente() {
        // Given
        Drone drone = new Drone("DRONE-001", 10.0, 100.0);

        // When
        drone.setEstado(EstadoDrone.EM_VOO);

        // Then
        assertEquals(EstadoDrone.EM_VOO, drone.getEstado());
    }

    @Test
    @DisplayName("Deve adicionar pedidos à lista")
    void deveAdicionarPedidosALista() {
        // Given
        Drone drone = new Drone("DRONE-001", 10.0, 100.0);
        Pedido pedido = new Pedido(5, 5, 2.0, Prioridade.ALTA);

        // When
        drone.adicionarPedido(pedido);

        // Then
        assertEquals(1, drone.getPedidosAlocados().size());
        assertEquals(pedido, drone.getPedidosAlocados().get(0));
    }

    @Test
    @DisplayName("Deve limpar lista de pedidos")
    void deveLimparListaDePedidos() {
        // Given
        Drone drone = new Drone("DRONE-001", 10.0, 100.0);
        Pedido pedido1 = new Pedido(5, 5, 2.0, Prioridade.ALTA);
        Pedido pedido2 = new Pedido(10, 10, 3.0, Prioridade.MEDIA);
        
        drone.adicionarPedido(pedido1);
        drone.adicionarPedido(pedido2);

        // When
        drone.limparPedidos();

        // Then
        assertTrue(drone.getPedidosAlocados().isEmpty());
    }
}
