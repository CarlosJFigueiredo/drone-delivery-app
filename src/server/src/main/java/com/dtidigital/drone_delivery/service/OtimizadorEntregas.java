package com.dtidigital.drone_delivery.service;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.dtidigital.drone_delivery.model.Drone;
import com.dtidigital.drone_delivery.model.Pedido;
import com.dtidigital.drone_delivery.enums.Prioridade;

@Component
public class OtimizadorEntregas {
    
    /**
     * Otimiza a alocação de pedidos para maximizar eficiência
     */
    public List<List<Pedido>> otimizarAlocacao(List<Drone> drones, List<Pedido> pedidos) {
        List<List<Pedido>> alocacoes = new ArrayList<>();
        
        // Ordenar pedidos por prioridade e depois por eficiência (peso/distância)
        List<Pedido> pedidosOrdenados = pedidos.stream()
            .sorted(this::compararPedidos)
            .collect(Collectors.toList());
        
        for (Drone drone : drones) {
            List<Pedido> melhorCombinacao = encontrarMelhorCombinacao(drone, pedidosOrdenados);
            alocacoes.add(melhorCombinacao);
            pedidosOrdenados.removeAll(melhorCombinacao);
        }
        
        return alocacoes;
    }
    
    /**
     * Encontra a melhor combinação de pedidos para um drone
     */
    private List<Pedido> encontrarMelhorCombinacao(Drone drone, List<Pedido> pedidosDisponiveis) {
        List<Pedido> melhorCombinacao = new ArrayList<>();
        double melhorEficiencia = 0;
        
        // Gerar todas as combinações possíveis (algoritmo simplificado para performance)
        List<List<Pedido>> combinacoes = gerarCombinacoesValidas(drone, pedidosDisponiveis);
        
        for (List<Pedido> combinacao : combinacoes) {
            double eficiencia = calcularEficiencia(drone, combinacao);
            if (eficiencia > melhorEficiencia) {
                melhorEficiencia = eficiencia;
                melhorCombinacao = new ArrayList<>(combinacao);
            }
        }
        
        return melhorCombinacao;
    }
    
    /**
     * Gera combinações válidas de pedidos para um drone
     */
    private List<List<Pedido>> gerarCombinacoesValidas(Drone drone, List<Pedido> pedidos) {
        List<List<Pedido>> combinacoes = new ArrayList<>();
        
        // Implementação gulosa para performance
        List<Pedido> combinacaoAtual = new ArrayList<>();
        double pesoTotal = 0;
        double distanciaTotal = 0;
        
        for (Pedido pedido : pedidos) {
            double distanciaPedido = calcularDistancia(0, 0, pedido.getX(), pedido.getY()) * 2; // ida e volta
            
            if (pesoTotal + pedido.getPeso() <= drone.getCapacidadeMaxima() &&
                distanciaTotal + distanciaPedido <= drone.getBateriaAtual() * 2) { // margem de segurança
                
                combinacaoAtual.add(pedido);
                pesoTotal += pedido.getPeso();
                distanciaTotal += distanciaPedido;
            }
        }
        
        combinacoes.add(combinacaoAtual);
        return combinacoes;
    }
    
    /**
     * Calcula a eficiência de uma combinação de pedidos
     */
    private double calcularEficiencia(Drone drone, List<Pedido> pedidos) {
        if (pedidos.isEmpty()) return 0;
        
        double pesoTotal = pedidos.stream().mapToDouble(Pedido::getPeso).sum();
        double distanciaTotal = calcularDistanciaTotal(pedidos);
        double pontuacaoPrioridade = calcularPontuacaoPrioridade(pedidos);
        
        // Fórmula de eficiência: maximizar peso e prioridade, minimizar distância
        double utilizacaoCapacidade = pesoTotal / drone.getCapacidadeMaxima();
        double eficienciaDistancia = distanciaTotal > 0 ? Math.max(1, 100.0 / distanciaTotal) : 0; // Inverso da distância
        
        return (utilizacaoCapacidade * 0.4) + (eficienciaDistancia * 0.3) + (pontuacaoPrioridade * 0.3);
    }
    
    /**
     * Calcula a distância total de uma rota otimizada
     */
    private double calcularDistanciaTotal(List<Pedido> pedidos) {
        if (pedidos.isEmpty()) return 0;
        
        double distanciaTotal = 0;
        int xAtual = 0;
        int yAtual = 0;
        
        // Otimizar ordem usando algoritmo do vizinho mais próximo
        List<Pedido> pedidosOrdenados = otimizarRota(pedidos);
        
        for (Pedido pedido : pedidosOrdenados) {
            distanciaTotal += calcularDistancia(xAtual, yAtual, pedido.getX(), pedido.getY());
            xAtual = pedido.getX();
            yAtual = pedido.getY();
        }
        
        // Adicionar distância de retorno à base
        distanciaTotal += calcularDistancia(xAtual, yAtual, 0, 0);
        
        return distanciaTotal;
    }
    
    /**
     * Otimiza a rota considerando prioridade primeiro, depois distância
     */
    public List<Pedido> otimizarRota(List<Pedido> pedidos) {
        if (pedidos.size() <= 1) return new ArrayList<>(pedidos);
        
        // Primeiro: ordenar por prioridade
        List<Pedido> pedidosOrdenados = pedidos.stream()
            .sorted(this::compararPedidos)
            .collect(Collectors.toList());
        
        // Segundo: otimizar rota dentro de cada grupo de prioridade
        List<Pedido> rota = new ArrayList<>();
        
        // Agrupar por prioridade
        Map<Prioridade, List<Pedido>> gruposPorPrioridade = pedidosOrdenados.stream()
            .collect(Collectors.groupingBy(Pedido::getPrioridade,
                LinkedHashMap::new, Collectors.toList()));
        
        int xAtual = 0;
        int yAtual = 0;
        
        // Processar cada grupo de prioridade em ordem
        for (List<Pedido> grupo : gruposPorPrioridade.values()) {
            List<Pedido> naoVisitados = new ArrayList<>(grupo);
            
            while (!naoVisitados.isEmpty()) {
                Pedido maisProximo = null;
                double menorDistancia = Double.MAX_VALUE;
                
                for (Pedido pedido : naoVisitados) {
                    double distancia = calcularDistancia(xAtual, yAtual, pedido.getX(), pedido.getY());
                    if (distancia < menorDistancia) {
                        menorDistancia = distancia;
                        maisProximo = pedido;
                    }
                }
                
                if (maisProximo != null) {
                    rota.add(maisProximo);
                    naoVisitados.remove(maisProximo);
                    xAtual = maisProximo.getX();
                    yAtual = maisProximo.getY();
                }
            }
        }
        
        return rota;
    }
    
    /**
     * Calcula pontuação baseada na prioridade dos pedidos
     */
    private double calcularPontuacaoPrioridade(List<Pedido> pedidos) {
        return pedidos.stream()
            .mapToDouble(p -> {
                switch (p.getPrioridade()) {
                    case ALTA: return 1.0;
                    case MEDIA: return 0.6;
                    case BAIXA: return 0.3;
                    default: return 0.3;
                }
            })
            .average()
            .orElse(0);
    }
    
    /**
     * Compara pedidos para ordenação por prioridade e eficiência
     */
    private int compararPedidos(Pedido p1, Pedido p2) {
        // Primeiro por prioridade
        int comparacaoPrioridade = p1.getPrioridade().compareTo(p2.getPrioridade());
        if (comparacaoPrioridade != 0) {
            return comparacaoPrioridade;
        }
        
        // Depois por eficiência (peso/distância)
        double distancia1 = Math.max(1, calcularDistancia(0, 0, p1.getX(), p1.getY()));
        double distancia2 = Math.max(1, calcularDistancia(0, 0, p2.getX(), p2.getY()));
        double eficiencia1 = distancia1 > 0 ? p1.getPeso() / distancia1 : 0;
        double eficiencia2 = distancia2 > 0 ? p2.getPeso() / distancia2 : 0;
        
        return Double.compare(eficiencia2, eficiencia1); // Ordem decrescente
    }
    
    /**
     * Calcula distância euclidiana entre dois pontos
     */
    private double calcularDistancia(int x1, int y1, int x2, int y2) {
        double dx = (double) x2 - x1;
        double dy = (double) y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Calcula tempo estimado de entrega para uma rota
     */
    public double calcularTempoEntrega(List<Pedido> rota, double velocidadeDrone) {
        double distanciaTotal = calcularDistanciaTotal(rota);
        double tempoVoo = distanciaTotal / velocidadeDrone;
        double tempoEntregas = rota.size() * 2.0; // 2 minutos por entrega
        
        return tempoVoo + tempoEntregas;
    }
}
