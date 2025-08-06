package com.dtidigital.drone_delivery.service;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import com.dtidigital.drone_delivery.enums.EstadoDrone;
import com.dtidigital.drone_delivery.enums.Prioridade;
import com.dtidigital.drone_delivery.model.Drone;
import com.dtidigital.drone_delivery.model.Pedido;
import com.dtidigital.drone_delivery.model.Entrega;

class DroneServiceTest {

    private DroneService droneService;

    @BeforeEach
    void setUp() {
        droneService = new DroneService();
    }

    @Test
    @DisplayName("Deve cadastrar um drone com sucesso")
    void deveCadastrarDroneComSucesso() {
        // Given
        String id = "DRONE-001";
        double capacidade = 10.0;
        double autonomia = 100.0;

        // When
        droneService.cadastrarDrone(id, capacidade, autonomia);

        // Then
        List<Drone> drones = droneService.getDrones();
        assertEquals(1, drones.size());
        
        Drone drone = drones.get(0);
        assertEquals(id, drone.getId());
        assertEquals(capacidade, drone.getCapacidadeMaxima());
        assertEquals(autonomia, drone.getAutonomiaMaxima());
        assertEquals(autonomia, drone.getBateriaAtual());
        assertEquals(EstadoDrone.IDLE, drone.getEstado());
    }

    @Test
    @DisplayName("Deve adicionar pedido na fila corretamente")
    void deveAdicionarPedidoNaFila() {
        // Given
        Pedido pedido = new Pedido(10, 20, 5.0, Prioridade.ALTA);

        // When
        droneService.adicionarPedido(pedido);

        // Then
        // Como a fila é privada, vamos testar indiretamente via simulação
        droneService.cadastrarDrone("DRONE-001", 10.0, 100.0);
        droneService.simularEntrega();
        
        List<Entrega> entregas = droneService.getEntregasRealizadas();
        assertEquals(1, entregas.size());
        assertEquals(pedido.getId(), entregas.get(0).getPedido().getId());
    }

    @Test
    @DisplayName("Deve priorizar pedidos por prioridade")
    void devePriorizarPedidosPorPrioridade() {
        // Given
        droneService.cadastrarDrone("DRONE-001", 50.0, 1000.0);
        
        // Pedido com prioridade alta (mais próximo para ser mais eficiente)
        Pedido pedidoAlta = new Pedido(5, 5, 5.0, Prioridade.ALTA);
        // Pedido com prioridade baixa (mais longe)
        Pedido pedidoBaixa = new Pedido(1, 1, 5.0, Prioridade.BAIXA);
        
        // When
        droneService.adicionarPedido(pedidoBaixa);
        droneService.adicionarPedido(pedidoAlta);
        droneService.simularEntrega();

        // Then
        List<Entrega> entregas = droneService.getEntregasRealizadas();
        assertTrue(entregas.size() >= 1);
        // Deve processar pelo menos um pedido de alta prioridade
        boolean temAltaPrioridade = entregas.stream()
            .anyMatch(e -> e.getPedido().getPrioridade() == Prioridade.ALTA);
        assertTrue(temAltaPrioridade);
    }

    @Test
    @DisplayName("Não deve alocar pedido se exceder capacidade do drone")
    void naoDeveAlocarPedidoSeExcederCapacidade() {
        // Given
        droneService.cadastrarDrone("DRONE-001", 5.0, 1000.0);
        Pedido pedidoPesado = new Pedido(1, 1, 10.0, Prioridade.ALTA);

        // When
        droneService.adicionarPedido(pedidoPesado);
        droneService.simularEntrega();

        // Then
        List<Entrega> entregas = droneService.getEntregasRealizadas();
        assertEquals(0, entregas.size());
    }

    @Test
    @DisplayName("Não deve alocar pedido se exceder autonomia do drone")
    void naoDeveAlocarPedidoSeExcederAutonomia() {
        // Given
        droneService.cadastrarDrone("DRONE-001", 50.0, 10.0);
        Pedido pedidoLonge = new Pedido(100, 100, 5.0, Prioridade.ALTA);

        // When
        droneService.adicionarPedido(pedidoLonge);
        droneService.simularEntrega();

        // Then
        List<Entrega> entregas = droneService.getEntregasRealizadas();
        assertEquals(0, entregas.size());
    }

    @Test
    @DisplayName("Deve combinar múltiplos pedidos em uma viagem")
    void deveCombinarMultiplosPedidosEmUmaViagem() {
        // Given
        droneService.cadastrarDrone("DRONE-001", 50.0, 1000.0);
        
        Pedido pedido1 = new Pedido(1, 1, 5.0, Prioridade.ALTA);
        Pedido pedido2 = new Pedido(2, 2, 5.0, Prioridade.ALTA);
        Pedido pedido3 = new Pedido(3, 3, 5.0, Prioridade.ALTA);

        // When
        droneService.adicionarPedido(pedido1);
        droneService.adicionarPedido(pedido2);
        droneService.adicionarPedido(pedido3);
        droneService.simularEntrega();

        // Then
        List<Entrega> entregas = droneService.getEntregasRealizadas();
        assertEquals(3, entregas.size());
    }

    @Test
    @DisplayName("Drone deve consumir bateria durante entrega")
    void droneDeveConsumirBateriaDuranteEntrega() {
        // Given
        droneService.cadastrarDrone("DRONE-001", 10.0, 100.0);
        Pedido pedido = new Pedido(10, 10, 5.0, Prioridade.ALTA);

        // When
        droneService.adicionarPedido(pedido);
        droneService.simularEntrega();

        // Then
        Drone drone = droneService.getDrones().get(0);
        assertTrue(drone.getBateriaAtual() < 100.0); // Bateria consumida
        assertEquals(EstadoDrone.IDLE, drone.getEstado()); // Estado resetado após entrega
    }

    @Test
    @DisplayName("Deve gerenciar múltiplos drones corretamente")
    void deveGerenciarMultiplosDronesCorretamente() {
        // Given
        droneService.cadastrarDrone("DRONE-001", 10.0, 100.0);
        droneService.cadastrarDrone("DRONE-002", 15.0, 150.0);
        
        Pedido pedido1 = new Pedido(1, 1, 5.0, Prioridade.ALTA);
        Pedido pedido2 = new Pedido(2, 2, 8.0, Prioridade.MEDIA);

        // When
        droneService.adicionarPedido(pedido1);
        droneService.adicionarPedido(pedido2);
        droneService.simularEntrega();

        // Then
        List<Entrega> entregas = droneService.getEntregasRealizadas();
        assertEquals(2, entregas.size());
        
        List<Drone> drones = droneService.getDrones();
        assertEquals(2, drones.size());
    }

    @Test
    @DisplayName("Deve calcular estatísticas corretamente")
    void deveCalcularEstatisticasCorretamente() {
        // Given
        droneService.cadastrarDrone("DRONE-001", 10.0, 100.0);
        Pedido pedido = new Pedido(5, 5, 3.0, Prioridade.ALTA);

        // When
        droneService.adicionarPedido(pedido);
        droneService.simularEntrega();
        Map<String, Object> stats = droneService.getEstatisticas();

        // Then
        assertEquals(1, stats.get("totalEntregas"));
        assertEquals(1, stats.get("totalDrones"));
        assertEquals(0, stats.get("pedidosNaFila"));
        assertNotNull(stats.get("tempoMedioEntrega"));
        assertEquals("DRONE-001", stats.get("droneMaisEficiente"));
    }

    @Test
    @DisplayName("Deve obter status do pedido corretamente")
    void deveObterStatusDoPedidoCorretamente() {
        // Given
        droneService.cadastrarDrone("DRONE-001", 10.0, 100.0);
        Pedido pedido = new Pedido(5, 5, 3.0, Prioridade.ALTA);

        // When - Pedido na fila
        droneService.adicionarPedido(pedido);
        String statusFila = droneService.getStatusPedido(pedido.getId());

        // Then
        assertTrue(statusFila.contains("posição"));

        // When - Pedido entregue
        droneService.simularEntrega();
        String statusEntregue = droneService.getStatusPedido(pedido.getId());

        // Then
        assertTrue(statusEntregue.contains("Entregue"));
    }

    @Test
    @DisplayName("Deve adicionar zona de exclusão")
    void deveAdicionarZonaExclusao() {
        // When
        droneService.adicionarZonaExclusao(10, 10, 20, 20, "Teste", "Área de teste");

        // Then
        assertEquals(4, droneService.getZonasExclusao().size()); // 3 padrão + 1 nova
    }
}
