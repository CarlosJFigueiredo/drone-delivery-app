package com.dtidigital.drone_delivery.model;

public class ZonaExclusao {
    private int x1;
    private int y1;
    private int x2;
    private int y2; // Retângulo de exclusão
    private String nome;
    private String motivo;

    public ZonaExclusao(int x1, int y1, int x2, int y2, String nome, String motivo) {
        this.x1 = Math.min(x1, x2);
        this.y1 = Math.min(y1, y2);
        this.x2 = Math.max(x1, x2);
        this.y2 = Math.max(y1, y2);
        this.nome = nome;
        this.motivo = motivo;
    }

    public boolean contemPonto(int x, int y) {
        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    }

    public boolean interceptaRota(int xInicio, int yInicio, int xFim, int yFim) {
        // Verificação simples se a linha reta intercepta o retângulo
        return contemPonto(xInicio, yInicio) || contemPonto(xFim, yFim) ||
               (xInicio <= x1 && xFim >= x2 && yInicio >= y1 && yInicio <= y2) ||
               (yInicio <= y1 && yFim >= y2 && xInicio >= x1 && xInicio <= x2);
    }

    // Getters
    public int getX1() { return x1; }
    public int getY1() { return y1; }
    public int getX2() { return x2; }
    public int getY2() { return y2; }
    public String getNome() { return nome; }
    public String getMotivo() { return motivo; }
}
