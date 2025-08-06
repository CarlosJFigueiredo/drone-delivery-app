package com.dtidigital.drone_delivery.service;

import org.springframework.stereotype.Component;

@Component
public class SimuladorBateria {
    
    // Configurações do simulador
    private static final double CONSUMO_VENTO = 1.2; // Fator de vento (20% a mais)
    private static final double CONSUMO_TEMPERATURA = 1.1; // Fator temperatura (10% a mais)
    private static final double CONSUMO_PESO = 0.1; // 10% adicional por kg de peso
    private static final double EFICIENCIA_BATERIA = 0.95; // 95% de eficiência
    
    /**
     * Calcula o consumo real de bateria considerando fatores ambientais
     */
    public double calcularConsumoReal(double distancia, double peso, boolean condicaoAdversa) {
        double consumoBase = distancia * 0.5; // 0.5 unidades por km
        
        // Aplicar fatores ambientais
        if (condicaoAdversa) {
            consumoBase *= CONSUMO_VENTO;
            consumoBase *= CONSUMO_TEMPERATURA;
        }
        
        // Aplicar fator de peso
        consumoBase += (peso * CONSUMO_PESO);
        
        // Aplicar eficiência da bateria
        consumoBase /= EFICIENCIA_BATERIA;
        
        return consumoBase;
    }
    
    /**
     * Simula degradação da bateria ao longo do tempo
     */
    public double aplicarDegradacao(double bateriaAtual, int horasUso) {
        double fatorDegradacao = 1.0 - (horasUso * 0.001); // 0.1% por hora de uso
        return Math.max(0, bateriaAtual * fatorDegradacao);
    }
    
    /**
     * Calcula tempo de recarga necessário
     */
    public double calcularTempoRecarga(double bateriaAtual, double bateriaMaxima) {
        double diferenca = bateriaMaxima - bateriaAtual;
        return (diferenca / bateriaMaxima) * 60; // 60 minutos para recarga completa
    }
    
    /**
     * Verifica se a bateria é suficiente para uma missão
     */
    public boolean bateriaSeguraParaMissao(double bateriaAtual, double distanciaTotal, double peso) {
        double consumoEstimado = calcularConsumoReal(distanciaTotal, peso, true); // Considera condições adversas
        double margem = bateriaAtual * 0.1; // 10% de margem de segurança
        
        return (bateriaAtual - consumoEstimado) >= margem;
    }
    
    /**
     * Calcula autonomia restante em quilômetros
     */
    public double calcularAutonomiaRestante(double bateriaAtual, double peso) {
        double consumoPorKm = calcularConsumoReal(1.0, peso, false);
        return bateriaAtual / consumoPorKm;
    }
}
