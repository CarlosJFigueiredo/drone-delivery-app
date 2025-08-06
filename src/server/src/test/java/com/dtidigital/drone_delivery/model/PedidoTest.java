package com.dtidigital.drone_delivery.model;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import com.dtidigital.drone_delivery.enums.Prioridade;

class PedidoTest {

    @Test
    @DisplayName("Deve criar pedido com valores corretos")
    void deveCriarPedidoComValoresCorretos() {
        // Given
        int x = 10;
        int y = 20;
        double peso = 5.5;
        Prioridade prioridade = Prioridade.ALTA;

        // When
        Pedido pedido = new Pedido(x, y, peso, prioridade);

        // Then
        assertNotNull(pedido.getId());
        assertFalse(pedido.getId().isEmpty());
        assertEquals(x, pedido.getX());
        assertEquals(y, pedido.getY());
        assertEquals(peso, pedido.getPeso());
        assertEquals(prioridade, pedido.getPrioridade());
    }

    @Test
    @DisplayName("Deve gerar IDs únicos para pedidos diferentes")
    void deveGerarIdsUnicosParaPedidosDiferentes() {
        // Given & When
        Pedido pedido1 = new Pedido(1, 1, 1.0, Prioridade.ALTA);
        Pedido pedido2 = new Pedido(2, 2, 2.0, Prioridade.MEDIA);

        // Then
        assertNotEquals(pedido1.getId(), pedido2.getId());
    }

    @Test
    @DisplayName("Deve aceitar todas as prioridades")
    void deveAceitarTodasAsPrioridades() {
        // Given & When
        Pedido pedidoAlta = new Pedido(1, 1, 1.0, Prioridade.ALTA);
        Pedido pedidoMedia = new Pedido(2, 2, 2.0, Prioridade.MEDIA);
        Pedido pedidoBaixa = new Pedido(3, 3, 3.0, Prioridade.BAIXA);

        // Then
        assertEquals(Prioridade.ALTA, pedidoAlta.getPrioridade());
        assertEquals(Prioridade.MEDIA, pedidoMedia.getPrioridade());
        assertEquals(Prioridade.BAIXA, pedidoBaixa.getPrioridade());
    }

    @Test
    @DisplayName("Deve aceitar coordenadas negativas")
    void deveAceitarCoordenadasNegativas() {
        // Given & When
        Pedido pedido = new Pedido(-10, -20, 5.0, Prioridade.ALTA);

        // Then
        assertEquals(-10, pedido.getX());
        assertEquals(-20, pedido.getY());
    }

    @Test
    @DisplayName("Deve aceitar peso decimal")
    void deveAceitarPesoDecimal() {
        // Given & When
        Pedido pedido = new Pedido(1, 1, 2.75, Prioridade.ALTA);

        // Then
        assertEquals(2.75, pedido.getPeso(), 0.001);
    }
}
