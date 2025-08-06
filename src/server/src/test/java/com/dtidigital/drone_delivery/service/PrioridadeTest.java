package com.dtidigital.drone_delivery.service;

import com.dtidigital.drone_delivery.enums.Prioridade;
import com.dtidigital.drone_delivery.model.Pedido;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PrioridadeTest {

    @Test
    @DisplayName("Deve ordenar pedidos por prioridade corretamente")
    void deveOrdenarPedidosPorPrioridade() {
        // Criar pedidos com diferentes prioridades
        Pedido pedidoAlta1 = new Pedido(1, 1, 5.0, Prioridade.ALTA);
        Pedido pedidoBaixa = new Pedido(2, 2, 3.0, Prioridade.BAIXA);
        Pedido pedidoMedia = new Pedido(3, 3, 4.0, Prioridade.MEDIA);
        Pedido pedidoAlta2 = new Pedido(4, 4, 6.0, Prioridade.ALTA);

        List<Pedido> pedidos = Arrays.asList(pedidoBaixa, pedidoMedia, pedidoAlta1, pedidoAlta2);
        
        // Ordenar usando a lógica atual do DroneService
        List<Pedido> pedidosOrdenados = pedidos.stream()
            .sorted(Comparator.comparing(Pedido::getPrioridade))
            .toList();
        
        // Verificar se a ordem está correta: ALTA deve vir primeiro
        assertEquals(Prioridade.ALTA, pedidosOrdenados.get(0).getPrioridade());
        assertEquals(Prioridade.ALTA, pedidosOrdenados.get(1).getPrioridade());
        assertEquals(Prioridade.MEDIA, pedidosOrdenados.get(2).getPrioridade());
        assertEquals(Prioridade.BAIXA, pedidosOrdenados.get(3).getPrioridade());
        
        System.out.println("=== TESTE DE PRIORIDADE ===");
        for (int i = 0; i < pedidosOrdenados.size(); i++) {
            Pedido p = pedidosOrdenados.get(i);
            System.out.println("Posição " + i + " - Prioridade: " + p.getPrioridade() + " - Peso: " + p.getPeso());
        }
    }
    
    @Test
    @DisplayName("Deve verificar ordenação natural do enum Prioridade")
    void deveVerificarOrdenacaoNaturalEnum() {
        Prioridade[] prioridades = {Prioridade.BAIXA, Prioridade.ALTA, Prioridade.MEDIA};
        
        Arrays.sort(prioridades);
        
        System.out.println("=== ORDENAÇÃO NATURAL DO ENUM ===");
        for (Prioridade p : prioridades) {
            System.out.println(p + " (ordinal: " + p.ordinal() + ")");
        }
        
        // A ordenação natural deve ser por ordinal: ALTA(0), MEDIA(1), BAIXA(2)
        assertEquals(Prioridade.ALTA, prioridades[0]);
        assertEquals(Prioridade.MEDIA, prioridades[1]);
        assertEquals(Prioridade.BAIXA, prioridades[2]);
    }
}
