package com.dtidigital.drone_delivery.model;

import java.util.ArrayList;
import java.util.List;

import com.dtidigital.drone_delivery.enums.EstadoDrone;

public class Drone {
    private String id;
    private double capacidadeMaxima;
    private double autonomiaMaxima;
    private double bateriaAtual;
    private int posX;
    private int posY;
    private EstadoDrone estado;
    private List<Pedido> pedidosAlocados = new ArrayList<>();
    private long tempoInicioRecarga = 0; // Timestamp do início da recarga
    private boolean emRecarga = false;

    public Drone(String id, double capacidadeMaxima, double autonomiaMaxima) {
        this.id = id;
        this.capacidadeMaxima = capacidadeMaxima;
        this.autonomiaMaxima = autonomiaMaxima;
        this.bateriaAtual = 100;
        this.estado = EstadoDrone.IDLE;
        this.posX = 0;
        this.posY = 0;
    }

    public String getId() {
        return id;
    }

    public double getCapacidadeMaxima() {
        return capacidadeMaxima;
    }

    public double getAutonomiaMaxima() {
        return autonomiaMaxima;
    }

    public double getBateriaAtual() {
        return bateriaAtual;
    }

    public void consumirBateria(double distancia) {
        this.bateriaAtual -= distancia;
    }

    public void recarregar() {
        this.bateriaAtual = autonomiaMaxima;
    }

    public int getPosX() {
        return posX;
    }

    public int getPosY() {
        return posY;
    }

    public void setPosicao(int x, int y) {
        this.posX = x;
        this.posY = y;
    }

    public EstadoDrone getEstado() {
        return estado;
    }

    public void setEstado(EstadoDrone estado) {
        this.estado = estado;
    }

    public List<Pedido> getPedidosAlocados() {
        return pedidosAlocados;
    }

    public void limparPedidos() {
        pedidosAlocados.clear();
    }

    public void adicionarPedido(Pedido pedido) {
        pedidosAlocados.add(pedido);
    }
    
    /**
     * Inicia processo de recarga de emergência
     */
    public void iniciarRecarga() {
        this.emRecarga = true;
        this.tempoInicioRecarga = System.currentTimeMillis();
        this.estado = EstadoDrone.CHARGING;
    }
    
    /**
     * Finaliza processo de recarga
     */
    public void finalizarRecarga() {
        this.emRecarga = false;
        this.tempoInicioRecarga = 0;
        this.bateriaAtual = 100.0; // Recarga completa
        this.estado = EstadoDrone.IDLE;
    }
    
    /**
     * Verifica se está em processo de recarga
     */
    public boolean isEmRecarga() {
        return emRecarga;
    }
    
    /**
     * Obtém tempo decorrido de recarga em minutos
     */
    public long getTempoRecargaMinutos() {
        if (!emRecarga) return 0;
        return (System.currentTimeMillis() - tempoInicioRecarga) / 60000;
    }
    
    /**
     * Simula recarga parcial baseada no tempo
     */
    public void atualizarRecarga(double taxaRecargaPorMinuto) {
        if (emRecarga && bateriaAtual < 100.0) {
            long minutosDecorridos = getTempoRecargaMinutos();
            this.bateriaAtual = Math.min(100.0, bateriaAtual + (taxaRecargaPorMinuto * minutosDecorridos));
            
            // Se recarga completa, finalizar automaticamente
            if (bateriaAtual >= 100.0) {
                finalizarRecarga();
            }
        }
    }
    
    /**
     * Força retorno de emergência à base
     */
    public void retornoEmergencia() {
        limparPedidos(); // Cancelar pedidos atuais
        this.estado = EstadoDrone.RETORNANDO;
    }
}