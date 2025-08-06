package com.dtidigital.drone_delivery.dto;

import com.dtidigital.drone_delivery.enums.Prioridade;

import jakarta.validation.constraints.*;

public class PedidoDTO {

    @NotBlank(message = "Nome do cliente é obrigatório")
    private String cliente;

    @NotNull(message = "Coordenada X é obrigatória")
    private Integer x;

    @NotNull(message = "Coordenada Y é obrigatória")
    private Integer y;

    @DecimalMin(value = "0.1", message = "Peso mínimo é 0.1 kg")
    private double peso;

    @NotNull(message = "Prioridade é obrigatória")
    private Prioridade prioridade;

    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }

    public Integer getX() { return x; }
    public void setX(Integer x) { this.x = x; }

    public Integer getY() { return y; }
    public void setY(Integer y) { this.y = y; }

    public double getPeso() { return peso; }
    public void setPeso(double peso) { this.peso = peso; }

    public Prioridade getPrioridade() { return prioridade; }
    public void setPrioridade(Prioridade prioridade) { this.prioridade = prioridade; }
}