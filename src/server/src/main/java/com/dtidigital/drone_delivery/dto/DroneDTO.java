package com.dtidigital.drone_delivery.dto;

import jakarta.validation.constraints.*;

public class DroneDTO {
    
    @NotBlank(message = "ID do drone é obrigatório")
    private String id;
    
    @DecimalMin(value = "0.1", message = "Capacidade mínima é 0.1 kg")
    private double capacidade;
    
    @DecimalMin(value = "1.0", message = "Autonomia mínima é 1.0 km")
    private double autonomia;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public double getCapacidade() {
        return capacidade;
    }

    public void setCapacidade(double capacidade) {
        this.capacidade = capacidade;
    }

    public double getAutonomia() {
        return autonomia;
    }

    public void setAutonomia(double autonomia) {
        this.autonomia = autonomia;
    }
}