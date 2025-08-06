package com.dtidigital.drone_delivery.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import com.dtidigital.drone_delivery.enums.EstadoDrone;
import com.dtidigital.drone_delivery.model.Drone;

public class TempoRecargaTest {

    private DroneService droneService;
    private SimuladorBateria simuladorBateria;

    @BeforeEach
    void setUp() {
        droneService = new DroneService();
        simuladorBateria = new SimuladorBateria();
    }

    @Test
    void testTempoRecargaCompleta() {
        System.out.println("=== TESTE DE TEMPO DE RECARGA ===");
        
        // Cadastrar drone com bateria em 0%
        droneService.cadastrarDrone("DRONE-TESTE", 10.0, 100.0);
        Drone drone = droneService.getDrones().get(0);
        
        // Simular bateria totalmente descarregada
        drone.consumirBateria(100.0); // 0%
        System.out.println("Bateria inicial: " + drone.getBateriaAtual() + "%");
        
        // Iniciar recarga
        drone.iniciarRecarga();
        assertEquals(EstadoDrone.CHARGING, drone.getEstado());
        System.out.println("Estado: " + drone.getEstado());
        
        // Simular diferentes tempos de recarga
        double[] temposMinutos = {10, 20, 30, 45, 60, 67};
        
        for (double tempo : temposMinutos) {
            double nivelBateria = simuladorBateria.simularRecarga(0.0, tempo);
            System.out.printf("Após %.0f minutos: %.1f%%\n", tempo, nivelBateria);
        }
        
        // Teste específico: quanto tempo para recarga completa?
        double tempoCompleto = 100.0 / 1.5; // 100% ÷ 1.5% por minuto
        System.out.printf("\n⏱️ Tempo para recarga completa: %.1f minutos (%.1f horas)\n", 
                         tempoCompleto, tempoCompleto / 60);
    }

    @Test
    void testRecargaParcial() {
        System.out.println("\n=== TESTE DE RECARGA PARCIAL ===");
        
        // Cenários comuns de recarga
        double[] bateriaInicial = {5.0, 15.0, 25.0, 40.0};
        
        for (double bateria : bateriaInicial) {
            double tempoNecessario = (100.0 - bateria) / 1.5;
            System.out.printf("Bateria %.0f%% → 100%%: %.1f minutos (%.1f horas)\n", 
                             bateria, tempoNecessario, tempoNecessario / 60);
        }
    }

    @Test 
    void testRecargaRapida() {
        System.out.println("\n=== TESTE: E SE A RECARGA FOSSE MAIS RÁPIDA? ===");
        
        // Simulando diferentes taxas de recarga
        double[] taxasRecarga = {3.0, 5.0, 10.0, 20.0}; // % por minuto
        
        for (double taxa : taxasRecarga) {
            double tempoCompleto = 100.0 / taxa;
            System.out.printf("Taxa %.1f%%/min → Recarga completa: %.1f minutos (%.1f horas)\n", 
                             taxa, tempoCompleto, tempoCompleto / 60);
        }
    }

    @Test
    void testComparacaoTempoReal() {
        System.out.println("\n=== COMPARAÇÃO COM CENÁRIOS REAIS ===");
        
        System.out.println("🔋 Tesla Model S: ~1 hora (Supercharger)");
        System.out.println("📱 iPhone: ~2 horas");
        System.out.println("🚗 Carro elétrico comum: 4-8 horas");
        System.out.println("🚁 Nossos drones: ~1 hora (taxa atual)");
        
        System.out.println("\n💡 Taxa atual (1.5%/min) é REALISTA para drones pequenos!");
    }
}
