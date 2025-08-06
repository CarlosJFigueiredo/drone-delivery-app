package com.dtidigital.drone_delivery.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import com.dtidigital.drone_delivery.enums.EstadoDrone;
import com.dtidigital.drone_delivery.enums.Prioridade;
import com.dtidigital.drone_delivery.model.Drone;
import com.dtidigital.drone_delivery.model.Pedido;

import java.util.Map;

public class BateriaEmergenciaTest {

    private DroneService droneService;
    private SimuladorBateria simuladorBateria;

    @BeforeEach
    void setUp() {
        droneService = new DroneService();
        simuladorBateria = new SimuladorBateria();
    }

    @Test
    void testDeteccaoBateriaBaixa() {
        // Teste das funções de detecção de bateria baixa
        assertTrue(simuladorBateria.isBateriaBaixa(15.0), "15% deve ser considerado bateria baixa");
        assertTrue(simuladorBateria.isBateriaBaixa(20.0), "20% deve ser considerado bateria baixa");
        assertFalse(simuladorBateria.isBateriaBaixa(25.0), "25% não deve ser considerado bateria baixa");
        
        assertTrue(simuladorBateria.isBateriaCritica(5.0), "5% deve ser considerado bateria crítica");
        assertTrue(simuladorBateria.isBateriaCritica(10.0), "10% deve ser considerado bateria crítica");
        assertFalse(simuladorBateria.isBateriaCritica(15.0), "15% não deve ser considerado bateria crítica");
    }

    @Test
    void testVerificacaoBateriaSuficienteParaRetorno() {
        // Teste se há bateria suficiente para retornar à base
        assertTrue(simuladorBateria.bateriaSuficienteParaRetorno(50.0, 10.0), 
                  "50% de bateria deve ser suficiente para 10km de retorno");
        
        assertFalse(simuladorBateria.bateriaSuficienteParaRetorno(8.0, 10.0), 
                   "8% de bateria não deve ser suficiente para 10km de retorno");
    }

    @Test
    void testSimulacaoRecarga() {
        // Teste da simulação de recarga
        double bateriaInicial = 30.0;
        double novoNivel = simuladorBateria.simularRecarga(bateriaInicial, 10.0); // 10 minutos
        
        assertTrue(novoNivel > bateriaInicial, "Bateria deve aumentar após recarga");
        assertTrue(novoNivel <= 100.0, "Bateria não deve passar de 100%");
        
        // Teste de recarga completa
        double bateriaCompleta = simuladorBateria.simularRecarga(90.0, 20.0); // 20 minutos
        assertEquals(100.0, bateriaCompleta, "Recarga deve parar em 100%");
    }

    @Test
    void testDroneComBateriaBaixa() {
        // Cadastrar drone e forçar bateria baixa
        droneService.cadastrarDrone("DRONE-TESTE", 10.0, 100.0);
        Drone drone = droneService.getDrones().get(0);
        
        // Simular bateria baixa
        drone.consumirBateria(85.0); // Deixar com 15%
        assertTrue(drone.getBateriaAtual() < 20.0, "Drone deve ter bateria baixa");
        
        // Verificar se inicia recarga automaticamente
        drone.iniciarRecarga();
        assertEquals(EstadoDrone.CHARGING, drone.getEstado(), "Drone deve estar carregando");
        assertTrue(drone.isEmRecarga(), "Drone deve estar em processo de recarga");
    }

    @Test
    void testStatusBateria() {
        // Cadastrar alguns drones com diferentes níveis de bateria
        droneService.cadastrarDrone("DRONE-1", 10.0, 100.0);
        droneService.cadastrarDrone("DRONE-2", 10.0, 100.0);
        droneService.cadastrarDrone("DRONE-3", 10.0, 100.0);
        
        // Simular diferentes níveis de bateria
        droneService.getDrones().get(0).consumirBateria(85.0); // 15% - bateria baixa
        droneService.getDrones().get(1).consumirBateria(95.0); // 5% - bateria crítica
        droneService.getDrones().get(2).iniciarRecarga(); // Em recarga
        
        // Verificar status
        Map<String, Object> status = droneService.getStatusBateria();
        
        assertEquals(3, status.get("totalDrones"), "Deve haver 3 drones");
        assertTrue((Integer) status.get("dronesComBateriaBaixa") >= 2, "Deve haver pelo menos 2 drones com bateria baixa");
        assertTrue((Integer) status.get("dronesEmRecarga") >= 1, "Deve haver pelo menos 1 drone em recarga");
    }

    @Test
    void testForcarRetornoManual() {
        // Cadastrar drone
        droneService.cadastrarDrone("DRONE-MANUAL", 10.0, 100.0);
        Drone drone = droneService.getDrones().get(0);
        
        // Simular drone em voo
        drone.setEstado(EstadoDrone.EM_VOO);
        drone.setPosicao(10, 10);
        
        // Forçar retorno manual
        boolean sucesso = droneService.forcarRetornoManual("DRONE-MANUAL");
        
        assertTrue(sucesso, "Retorno manual deve ser bem sucedido");
        assertEquals(EstadoDrone.CHARGING, drone.getEstado(), "Drone deve estar carregando após retorno forçado");
    }

    @Test
    void testVerificacaoBateriaAntesMissao() {
        // Cadastrar drone
        droneService.cadastrarDrone("DRONE-MISSAO", 10.0, 100.0);
        
        // Criar pedido distante
        Pedido pedidoDistante = new Pedido("Cliente Teste", 50, 50, 5.0, Prioridade.ALTA);
        droneService.adicionarPedido(pedidoDistante);
        
        // Simular bateria baixa no drone
        Drone drone = droneService.getDrones().get(0);
        drone.consumirBateria(90.0); // Deixar com 10%
        
        // Tentar simular entrega - drone não deve aceitar missão
        droneService.simularEntrega();
        
        // Verificar se drone está carregando (não aceitou a missão)
        assertTrue(drone.getEstado() == EstadoDrone.CHARGING || drone.getEstado() == EstadoDrone.IDLE, 
                  "Drone com bateria baixa não deve aceitar missões");
    }
}
