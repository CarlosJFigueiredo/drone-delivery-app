package com.dtidigital.drone_delivery.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.List;

import com.dtidigital.drone_delivery.model.Pedido;
import com.dtidigital.drone_delivery.enums.Prioridade;

class OtimizadorEntregasTest {
    
    private OtimizadorEntregas otimizador;
    
    @BeforeEach
    void setUp() {
        otimizador = new OtimizadorEntregas();
    }
    
    @Test
    @DisplayName("Deve priorizar pedidos por prioridade mesmo quando mais distantes")
    void devePriorizarPorPrioridade() {
        // Pedido de prioridade ALTA mais distante
        Pedido pedidoAlta = new Pedido("Cliente Alta Prioridade", 100, 100, 5.0, Prioridade.ALTA);
        
        // Pedido de prioridade MEDIA mais próximo
        Pedido pedidoMedia = new Pedido("Cliente Media Prioridade", 5, 5, 5.0, Prioridade.MEDIA);
        
        // Pedido de prioridade BAIXA mais próximo ainda
        Pedido pedidoBaixa = new Pedido("Cliente Baixa Prioridade", 1, 1, 5.0, Prioridade.BAIXA);
        
        List<Pedido> pedidos = List.of(pedidoBaixa, pedidoMedia, pedidoAlta);
        
        List<Pedido> rotaOtimizada = otimizador.otimizarRota(pedidos);
        
        // Verificar se a ordem está correta por prioridade
        assertEquals(3, rotaOtimizada.size());
        assertEquals(Prioridade.ALTA, rotaOtimizada.get(0).getPrioridade());
        assertEquals(Prioridade.MEDIA, rotaOtimizada.get(1).getPrioridade());
        assertEquals(Prioridade.BAIXA, rotaOtimizada.get(2).getPrioridade());
        
        System.out.println("=== ORDEM DE ENTREGA OTIMIZADA ===");
        for (int i = 0; i < rotaOtimizada.size(); i++) {
            Pedido p = rotaOtimizada.get(i);
            System.out.println((i+1) + ". " + p.getCliente() + 
                " - Prioridade: " + p.getPrioridade() + 
                " - Posição: (" + p.getX() + ", " + p.getY() + ")");
        }
    }
    
    @Test
    @DisplayName("Deve otimizar distância dentro do mesmo grupo de prioridade")
    void deveOtimizarDistanciaDentroDoMesmoGrupo() {
        // Dois pedidos de prioridade ALTA com distâncias diferentes
        Pedido pedidoAlta1 = new Pedido("Alta Distante", 100, 100, 5.0, Prioridade.ALTA);
        
        Pedido pedidoAlta2 = new Pedido("Alta Próximo", 2, 2, 5.0, Prioridade.ALTA);
        
        List<Pedido> pedidos = List.of(pedidoAlta1, pedidoAlta2);
        
        List<Pedido> rotaOtimizada = otimizador.otimizarRota(pedidos);
        
        // O primeiro deve ser o mais próximo (dentro da mesma prioridade)
        assertEquals("Alta Próximo", rotaOtimizada.get(0).getCliente());
        assertEquals("Alta Distante", rotaOtimizada.get(1).getCliente());
    }
}
