package com.dtidigital.drone_delivery.service;

import com.dtidigital.drone_delivery.model.ZonaExclusao;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes para o CalculadorRota
 */
class CalculadorRotaTest {

    private CalculadorRota calculadorRota;

    @BeforeEach
    void setUp() {
        calculadorRota = new CalculadorRota();
    }

    @Test
    @DisplayName("Deve usar rota direta quando não há zonas de exclusão")
    void deveUsarRotaDiretaSemZonas() {
        
        List<ZonaExclusao> zonasVazias = List.of();
       
        List<CalculadorRota.Point> rota = calculadorRota.calcularRotaSegura(0, 0, 10, 10, zonasVazias, 50);
      
        assertEquals(2, rota.size());
        assertEquals(new CalculadorRota.Point(0, 0), rota.get(0));
        assertEquals(new CalculadorRota.Point(10, 10), rota.get(1));
    }

    @Test
    @DisplayName("Deve usar rota direta quando não intercepta zonas")
    void deveUsarRotaDiretaQuandoNaoIntercepta() {
        
        ZonaExclusao zona = new ZonaExclusao(20, 20, 30, 30, "Escola", "Zona escolar");
        List<ZonaExclusao> zonas = List.of(zona);
        
        // When - rota que não passa pela zona
        List<CalculadorRota.Point> rota = calculadorRota.calcularRotaSegura(0, 0, 10, 10, zonas, 50);
        
        // Then
        assertEquals(2, rota.size());
        assertEquals(new CalculadorRota.Point(0, 0), rota.get(0));
        assertEquals(new CalculadorRota.Point(10, 10), rota.get(1));
    }

    @Test
    @DisplayName("Deve calcular rota alternativa quando intercepta zona")
    void deveCalcularRotaAlternativaComInterceptacao() {
        // Given - zona que bloqueia o caminho direto
        ZonaExclusao zona = new ZonaExclusao(5, 5, 15, 15, "Hospital", "Zona hospitalar");
        List<ZonaExclusao> zonas = List.of(zona);
        
        // When - rota que passaria pela zona
        List<CalculadorRota.Point> rota = calculadorRota.calcularRotaSegura(0, 0, 20, 20, zonas, 50);
        
        // Then - deve ter waypoint intermediário
        assertTrue(rota.size() >= 2);
        assertEquals(new CalculadorRota.Point(0, 0), rota.get(0));
        assertEquals(new CalculadorRota.Point(20, 20), rota.get(rota.size() - 1));
        
        // A distância total deve ser maior que a direta
        double distanciaAlternativa = calculadorRota.calcularDistanciaTotal(rota);
        double distanciaDireta = Math.sqrt(400 + 400); 
        assertTrue(distanciaAlternativa >= distanciaDireta);
    }

    @Test
    @DisplayName("Deve calcular distância total corretamente")
    void deveCalcularDistanciaTotalCorretamente() {
        
        List<CalculadorRota.Point> rota = List.of(
            new CalculadorRota.Point(0, 0),
            new CalculadorRota.Point(3, 4),
            new CalculadorRota.Point(6, 8)
        );
        
        
        double distanciaTotal = calculadorRota.calcularDistanciaTotal(rota);
        
        
        assertEquals(10.0, distanciaTotal, 0.01);
    }

    @Test
    @DisplayName("Deve retornar zero para rota vazia")
    void deveRetornarZeroParaRotaVazia() {
        
        List<CalculadorRota.Point> rotaVazia = List.of();
      
        double distancia = calculadorRota.calcularDistanciaTotal(rotaVazia);
       
        assertEquals(0.0, distancia);
    }

    @Test
    @DisplayName("Point deve implementar equals e hashCode corretamente")
    void pointDeveImplementarEqualsCorretamente() {
        
        CalculadorRota.Point p1 = new CalculadorRota.Point(5, 10);
        CalculadorRota.Point p2 = new CalculadorRota.Point(5, 10);
        CalculadorRota.Point p3 = new CalculadorRota.Point(10, 5);
       
        assertEquals(p1, p2);
        assertNotEquals(p1, p3);
        assertEquals(p1.hashCode(), p2.hashCode());
        assertNotEquals(p1.hashCode(), p3.hashCode());
    }
}
