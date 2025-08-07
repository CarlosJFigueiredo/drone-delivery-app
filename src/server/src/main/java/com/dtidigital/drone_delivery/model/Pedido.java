package com.dtidigital.drone_delivery.model;

import java.util.UUID;

import com.dtidigital.drone_delivery.enums.Prioridade;

public class Pedido {
    private String id;
    private String cliente;
    private int x;
    private int y;
    private double peso;
    private Prioridade prioridade;

    public Pedido(String cliente, int x, int y, double peso, Prioridade prioridade) {
        this.id = UUID.randomUUID().toString();
        this.cliente = cliente;
        this.x = x;
        this.y = y;
        this.peso = peso;
        this.prioridade = prioridade;
    }

    // Construtor compatível com código existente
    public Pedido(int x, int y, double peso, Prioridade prioridade) {
        this("Cliente Anônimo", x, y, peso, prioridade);
    }

    public String getId() {
        return id;
    }

    public String getCliente() {
        return cliente;
    }
    
    public void setCliente(String cliente) {
        this.cliente = cliente;
    }

    public int getX() {
        return x;
    }
    
    public void setX(int x) {
        this.x = x;
    }

    public int getY() {
        return y;
    }
    
    public void setY(int y) {
        this.y = y;
    }

    public double getPeso() {
        return peso;
    }
    
    public void setPeso(double peso) {
        this.peso = peso;
    }

    public Prioridade getPrioridade() {
        return prioridade;
    }
    
    public void setPrioridade(Prioridade prioridade) {
        this.prioridade = prioridade;
    }
}
