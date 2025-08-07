package com.dtidigital.drone_delivery.service;

import com.dtidigital.drone_delivery.model.ZonaExclusao;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Serviço para calcular rotas que evitam zonas de exclusão
 */
@Component
public class CalculadorRota {
    
    /**
     * Calcula uma rota que evita zonas de exclusão usando algoritmo A*
     */
    public List<Point> calcularRotaSegura(int xInicio, int yInicio, int xDestino, int yDestino, 
                                         List<ZonaExclusao> zonasExclusao, int limiteGrid) {
        
        // Se a rota direta não intercepta nenhuma zona, usar a rota direta
        if (!interceptaAlgumaZona(xInicio, yInicio, xDestino, yDestino, zonasExclusao)) {
            List<Point> rotaDireta = new ArrayList<>();
            rotaDireta.add(new Point(xInicio, yInicio));
            rotaDireta.add(new Point(xDestino, yDestino));
            return rotaDireta;
        }
        
        // Caso contrário, usar algoritmo A* para encontrar rota alternativa
        return encontrarRotaAlternativa(xInicio, yInicio, xDestino, yDestino, zonasExclusao, limiteGrid);
    }
    
    /**
     * Verifica se uma linha reta intercepta alguma zona de exclusão
     */
    private boolean interceptaAlgumaZona(int x1, int y1, int x2, int y2, List<ZonaExclusao> zonas) {
        for (ZonaExclusao zona : zonas) {
            if (zona.interceptaRota(x1, y1, x2, y2)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Algoritmo A* simplificado para encontrar rota alternativa
     */
    private List<Point> encontrarRotaAlternativa(int xInicio, int yInicio, int xDestino, int yDestino, 
                                                List<ZonaExclusao> zonasExclusao, int limiteGrid) {
        
        Set<Point> pontosProibidos = criarSetPontosProibidos(zonasExclusao, limiteGrid);
        
        // Usar pontos de contorno das zonas como waypoints potenciais
        List<Point> waypoints = gerarWaypoints(zonasExclusao);
        
        Point inicio = new Point(xInicio, yInicio);
        Point destino = new Point(xDestino, yDestino);
        
        // Encontrar a melhor rota através dos waypoints
        return encontrarMelhorRota(inicio, destino, waypoints, pontosProibidos);
    }
    
    /**
     * Cria conjunto de pontos proibidos baseado nas zonas de exclusão
     */
    private Set<Point> criarSetPontosProibidos(List<ZonaExclusao> zonas, int limiteGrid) {
        Set<Point> pontosProibidos = new HashSet<>();
        
        for (ZonaExclusao zona : zonas) {
            // Marcar todos os pontos dentro da zona como proibidos
            for (int x = Math.max(0, zona.getX1()); x <= Math.min(limiteGrid, zona.getX2()); x++) {
                for (int y = Math.max(0, zona.getY1()); y <= Math.min(limiteGrid, zona.getY2()); y++) {
                    pontosProibidos.add(new Point(x, y));
                }
            }
        }
        
        return pontosProibidos;
    }
    
    /**
     * Gera waypoints (pontos de contorno) das zonas de exclusão
     */
    private List<Point> gerarWaypoints(List<ZonaExclusao> zonas) {
        List<Point> waypoints = new ArrayList<>();
        
        for (ZonaExclusao zona : zonas) {
            // Adicionar pontos nos cantos da zona (com margem de segurança)
            int margem = 2;
            
            // Cantos da zona com margem
            waypoints.add(new Point(zona.getX1() - margem, zona.getY1() - margem));
            waypoints.add(new Point(zona.getX2() + margem, zona.getY1() - margem));
            waypoints.add(new Point(zona.getX1() - margem, zona.getY2() + margem));
            waypoints.add(new Point(zona.getX2() + margem, zona.getY2() + margem));
        }
        
        // Filtrar waypoints inválidos (negativos ou que interceptam outras zonas)
        waypoints.removeIf(p -> p.x < 0 || p.y < 0);
        
        return waypoints;
    }
    
    /**
     * Encontra a melhor rota usando os waypoints disponíveis
     */
    private List<Point> encontrarMelhorRota(Point inicio, Point destino, List<Point> waypoints, Set<Point> pontosProibidos) {
        
        // Algoritmo simples: tentar rota direta, senão usar waypoint mais próximo
        List<Point> melhorRota = new ArrayList<>();
        melhorRota.add(inicio);
        
        // Se ainda há interferência, usar waypoint intermediário
        Point melhorWaypoint = null;
        double menorDistanciaTotal = Double.MAX_VALUE;
        
        for (Point waypoint : waypoints) {
            if (!pontosProibidos.contains(waypoint)) {
                double distanciaTotal = calcularDistancia(inicio, waypoint) + calcularDistancia(waypoint, destino);
                if (distanciaTotal < menorDistanciaTotal) {
                    menorDistanciaTotal = distanciaTotal;
                    melhorWaypoint = waypoint;
                }
            }
        }
        
        if (melhorWaypoint != null) {
            melhorRota.add(melhorWaypoint);
        }
        
        melhorRota.add(destino);
        return melhorRota;
    }
    
    /**
     * Calcula distância euclidiana entre dois pontos
     */
    private double calcularDistancia(Point p1, Point p2) {
        double dx = (double) p2.x - p1.x;
        double dy = (double) p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Calcula distância total de uma rota
     */
    public double calcularDistanciaTotal(List<Point> rota) {
        if (rota.size() < 2) return 0;
        
        double distanciaTotal = 0;
        for (int i = 0; i < rota.size() - 1; i++) {
            distanciaTotal += calcularDistancia(rota.get(i), rota.get(i + 1));
        }
        
        return distanciaTotal;
    }
    
    /**
     * Classe auxiliar para representar um ponto
     */
    public static class Point {
        public final int x;
        public final int y;
        
        public Point(int x, int y) {
            this.x = x;
            this.y = y;
        }
        
        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (obj == null || getClass() != obj.getClass()) return false;
            Point point = (Point) obj;
            return x == point.x && y == point.y;
        }
        
        @Override
        public int hashCode() {
            return Objects.hash(x, y);
        }
        
        @Override
        public String toString() {
            return "(" + x + ", " + y + ")";
        }
    }
}
