package com.dtidigital.drone_delivery.model;

import java.time.LocalDateTime;

public class Entrega {
    private String id;
    private String droneId;
    private Pedido pedido;
    private LocalDateTime inicioEntrega;
    private LocalDateTime fimEntrega;
    private double distanciaPercorrida;
    private double tempoTotalMinutos;
    private double bateriaConsumida;

    public Entrega(String droneId, Pedido pedido) {
        this.id = java.util.UUID.randomUUID().toString();
        this.droneId = droneId;
        this.pedido = pedido;
        this.inicioEntrega = LocalDateTime.now();
    }

    public void finalizar(double distancia, double tempo, double bateria) {
        this.fimEntrega = LocalDateTime.now();
        this.distanciaPercorrida = distancia;
        this.tempoTotalMinutos = tempo;
        this.bateriaConsumida = bateria;
    }

    // Getters
    public String getId() { return id; }
    public String getDroneId() { return droneId; }
    public Pedido getPedido() { return pedido; }
    public LocalDateTime getInicioEntrega() { return inicioEntrega; }
    public LocalDateTime getFimEntrega() { return fimEntrega; }
    public double getDistanciaPercorrida() { return distanciaPercorrida; }
    public double getTempoTotalMinutos() { return tempoTotalMinutos; }
    public double getBateriaConsumida() { return bateriaConsumida; }
}
