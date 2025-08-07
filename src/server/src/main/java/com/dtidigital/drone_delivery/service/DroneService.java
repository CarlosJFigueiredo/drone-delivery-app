package com.dtidigital.drone_delivery.service;

import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dtidigital.drone_delivery.enums.EstadoDrone;
import com.dtidigital.drone_delivery.model.Drone;
import com.dtidigital.drone_delivery.model.Pedido;
import com.dtidigital.drone_delivery.model.Entrega;
import com.dtidigital.drone_delivery.model.ZonaExclusao;

@Service
public class DroneService {

    private final List<Drone> drones = new ArrayList<>();
    private final List<Pedido> filaDePedidos = new LinkedList<>();
    private final List<Entrega> entregasRealizadas = new ArrayList<>();
    private final List<ZonaExclusao> zonasExclusao = new ArrayList<>();
    
    private final SimuladorBateria simuladorBateria;
    private final OtimizadorEntregas otimizadorEntregas;
    private final CalculadorRota calculadorRota;
    
    private static final double VELOCIDADE_DRONE_KM_H = 30.0;
    private static final double BATERIA_MINIMA_RETORNO = 5.0;
    private static final double BATERIA_CRITICA = 10.0;
    private static final double BATERIA_BAIXA = 20.0;

    @Autowired
    public DroneService(SimuladorBateria simuladorBateria, OtimizadorEntregas otimizadorEntregas, CalculadorRota calculadorRota) {
        this.simuladorBateria = simuladorBateria;
        this.otimizadorEntregas = otimizadorEntregas;
        this.calculadorRota = calculadorRota;
        inicializarZonasExclusao();
    }

    public DroneService() {
        this.simuladorBateria = new SimuladorBateria();
        this.otimizadorEntregas = new OtimizadorEntregas();
        this.calculadorRota = new CalculadorRota();
        inicializarZonasExclusao();
    }

    private void inicializarZonasExclusao() {
    }

    public void cadastrarDrone(String id, double capacidade, double autonomia) {
        Drone novoDrone = new Drone(id, capacidade, autonomia);
        drones.add(novoDrone);
    }

    public List<Drone> getDrones() {
        return drones;
    }

    public boolean adicionarPedido(Pedido pedido) {
        // Verificar se o destino está em zona de exclusão
        for (ZonaExclusao zona : zonasExclusao) {
            if (zona.contemPonto(pedido.getX(), pedido.getY())) {
                System.out.println("⚠️ Pedido rejeitado: destino (" + pedido.getX() + ", " + pedido.getY() + 
                                 ") está na zona de exclusão '" + zona.getNome() + "' - " + zona.getMotivo());
                return false; // Pedido rejeitado
            }
        }
        
        filaDePedidos.add(pedido);
        ordenarFila();
        return true; // Pedido aceito
    }
    
    public String getZonaExclusaoInfo(int x, int y) {
        for (ZonaExclusao zona : zonasExclusao) {
            if (zona.contemPonto(x, y)) {
                return "Coordenada (" + x + ", " + y + ") está na zona de exclusão '" + 
                       zona.getNome() + "' - " + zona.getMotivo();
            }
        }
        return "Coordenada (" + x + ", " + y + ") não está em zona de exclusão";
    }

    private void ordenarFila() {
        filaDePedidos.sort(Comparator
                .comparing(Pedido::getPrioridade)
                .thenComparing(p -> calcularDistancia(0, 0, p.getX(), p.getY())));
    }

    public void simularEntrega() {
        // Primeiro, verificar e gerenciar drones com bateria baixa
        gerenciarBateriaBaixa();
        
        if (filaDePedidos.isEmpty()) {
            return;
        }
        
        // Usar otimizador para melhor alocação de pedidos
        List<Pedido> pedidosValidos = filaDePedidos.stream()
            .filter(p -> !verificarZonaExclusao(0, 0, p.getX(), p.getY()))
            .toList();
            
        List<List<Pedido>> alocacoesOtimizadas = otimizadorEntregas.otimizarAlocacao(
            drones.stream().filter(d -> d.getEstado() == EstadoDrone.IDLE).toList(),
            new ArrayList<>(pedidosValidos)
        );
        
        int index = 0;
        for (Drone drone : drones) {
            if (drone.getEstado() == EstadoDrone.IDLE && index < alocacoesOtimizadas.size()) {
                List<Pedido> pedidosParaDrone = alocacoesOtimizadas.get(index);
                if (!pedidosParaDrone.isEmpty()) {
                    // Verificar se drone tem bateria suficiente antes de alocar
                    if (verificarBateriaSuficienteParaMissao(drone, pedidosParaDrone)) {
                        // Remover pedidos alocados da fila
                        filaDePedidos.removeAll(pedidosParaDrone);
                        // Executar entregas com simulação avançada
                        executarEntregasAvancadas(drone, pedidosParaDrone);
                    }
                }
                index++;
            }
        }
    }

    private void executarEntregasAvancadas(Drone drone, List<Pedido> pedidos) {
        drone.setEstado(EstadoDrone.CARREGANDO);
        
        // Simular tempo de carregamento
        try {
            Thread.sleep(100); // Simular 100ms de carregamento
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Usar rota otimizada do OtimizadorEntregas
        List<Pedido> rotaOtimizada = otimizadorEntregas.otimizarRota(pedidos);
        
        for (Pedido pedido : rotaOtimizada) {
            Entrega entrega = new Entrega(drone.getId(), pedido);
            
            drone.setEstado(EstadoDrone.EM_VOO);
            
            // **NOVA FUNCIONALIDADE**: Calcular rota segura que evita zonas de exclusão
            List<CalculadorRota.Point> rotaSegura = calculadorRota.calcularRotaSegura(
                drone.getPosX(), drone.getPosY(), 
                pedido.getX(), pedido.getY(), 
                zonasExclusao, 200 // limite do grid
            );
            
            // Calcular distância total da rota segura (pode ser maior que rota direta)
            double distanciaTotal = calculadorRota.calcularDistanciaTotal(rotaSegura);
            double tempo = calcularTempo(distanciaTotal);
            
            // Verificar se a rota é diferente da direta
            if (rotaSegura.size() > 2) {
                System.out.println("🛣️ Drone " + drone.getId() + " usando rota alternativa para evitar zona de exclusão");
                System.out.println("   Rota: " + rotaSegura);
                System.out.println("   Distância: " + Math.round(distanciaTotal) + " unidades (vs " + 
                                 Math.round(calcularDistancia(drone.getPosX(), drone.getPosY(), pedido.getX(), pedido.getY())) + " direta)");
            }
            
            // Usar simulador avançado de bateria
            double pesoTotal = rotaOtimizada.stream().mapToDouble(Pedido::getPeso).sum();
            boolean condicaoAdversa = Math.random() < 0.3; // 30% chance de condições adversas
            double bateriaConsumida = simuladorBateria.calcularConsumoReal(distanciaTotal, pesoTotal, condicaoAdversa);
            
            // Verificar se há bateria suficiente para continuar e retornar
            double distanciaRetorno = calcularDistancia(pedido.getX(), pedido.getY(), 0, 0);
            if (!simuladorBateria.bateriaSuficienteParaRetorno(drone.getBateriaAtual() - bateriaConsumida, distanciaRetorno)) {
                // Bateria insuficiente - retornar à base imediatamente
                System.out.println("⚠️ Drone " + drone.getId() + " cancelando entrega - bateria insuficiente para retorno seguro");
                break;
            }
            
            // Consumir bateria e mover drone
            drone.consumirBateria(bateriaConsumida);
            drone.setPosicao(pedido.getX(), pedido.getY());
            
            // Verificar novamente após consumo se ainda é seguro continuar
            if (simuladorBateria.isBateriaCritica(drone.getBateriaAtual())) {
                System.out.println("🔋 Drone " + drone.getId() + " com bateria crítica - interrompendo entregas");
                break;
            }
            
            drone.setEstado(EstadoDrone.ENTREGANDO);
            
            // Simular tempo de entrega
            try {
                Thread.sleep(50); // 50ms para entrega
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            entrega.finalizar(distanciaTotal, tempo, bateriaConsumida);
            entregasRealizadas.add(entrega);
        }

        // Retornar à base
        drone.setEstado(EstadoDrone.RETORNANDO);
        double distanciaRetorno = calcularDistancia(drone.getPosX(), drone.getPosY(), 0, 0);
        double bateriaRetorno = simuladorBateria.calcularConsumoReal(distanciaRetorno, 0, false);
        
        drone.consumirBateria(bateriaRetorno);
        drone.setPosicao(0, 0);
        drone.limparPedidos();
        
        // Verificar se precisa recarregar baseado nos novos critérios
        if (simuladorBateria.isBateriaBaixa(drone.getBateriaAtual())) {
            drone.iniciarRecarga();
            System.out.println("🔋 Drone " + drone.getId() + " iniciando recarga - bateria em " + 
                              Math.round(drone.getBateriaAtual()) + "%");
        } else {
            drone.setEstado(EstadoDrone.IDLE);
        }
    }

    private boolean verificarZonaExclusao(int x1, int y1, int x2, int y2) {
        for (ZonaExclusao zona : zonasExclusao) {
            if (zona.interceptaRota(x1, y1, x2, y2)) {
                return true;
            }
        }
        return false;
    }

    public List<Entrega> getEntregasRealizadas() {
        return entregasRealizadas;
    }

    public List<Pedido> getPedidosNaFila() {
        return new ArrayList<>(filaDePedidos);
    }

    public List<ZonaExclusao> getZonasExclusao() {
        return zonasExclusao;
    }

    public void adicionarZonaExclusao(int x1, int y1, int x2, int y2, String nome, String motivo) {
        zonasExclusao.add(new ZonaExclusao(x1, y1, x2, y2, nome, motivo));
    }

    public boolean editarZonaExclusao(String zonaId, int x1, int y1, int x2, int y2, String nome, String motivo) {
        for (ZonaExclusao zona : zonasExclusao) {
            if (zona.getId().equals(zonaId)) {
                zona.setNome(nome);
                zona.setMotivo(motivo);
                zona.setCoordenadas(x1, y1, x2, y2);
                return true;
            }
        }
        return false;
    }

    public boolean removerZonaExclusao(String zonaId) {
        return zonasExclusao.removeIf(zona -> zona.getId().equals(zonaId));
    }

    public ZonaExclusao buscarZonaExclusao(String zonaId) {
        for (ZonaExclusao zona : zonasExclusao) {
            if (zona.getId().equals(zonaId)) {
                return zona;
            }
        }
        return null;
    }
    
    /**
     * Calcula rota segura e retorna informações detalhadas
     */
    public Map<String, Object> calcularRotaComInfo(int xInicio, int yInicio, int xDestino, int yDestino) {
        Map<String, Object> resultado = new HashMap<>();
        
        // Calcular rota segura
        List<CalculadorRota.Point> rotaSegura = calculadorRota.calcularRotaSegura(
            xInicio, yInicio, xDestino, yDestino, zonasExclusao, 200
        );
        
        // Calcular distâncias
        double distanciaDireta = calcularDistancia(xInicio, yInicio, xDestino, yDestino);
        double distanciaSegura = calculadorRota.calcularDistanciaTotal(rotaSegura);
        
        // Verificar se há zonas interceptadas
        boolean interceptaZona = false;
        List<String> zonasInterceptadas = new ArrayList<>();
        for (ZonaExclusao zona : zonasExclusao) {
            if (zona.interceptaRota(xInicio, yInicio, xDestino, yDestino)) {
                interceptaZona = true;
                zonasInterceptadas.add(zona.getNome());
            }
        }
        
        // Montar resultado
        resultado.put("rotaSegura", rotaSegura);
        resultado.put("distanciaDireta", Math.round(distanciaDireta * 10) / 10.0);
        resultado.put("distanciaSegura", Math.round(distanciaSegura * 10) / 10.0);
        resultado.put("interceptaZona", interceptaZona);
        resultado.put("zonasInterceptadas", zonasInterceptadas);
        resultado.put("desvioNecessario", rotaSegura.size() > 2);
        resultado.put("acrescimoDistancia", Math.round((distanciaSegura - distanciaDireta) * 10) / 10.0);
        
        return resultado;
    }

    public Map<String, Object> getEstatisticas() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalEntregas", entregasRealizadas.size());
        stats.put("totalDrones", drones.size());
        stats.put("pedidosNaFila", filaDePedidos.size());
        
        if (!entregasRealizadas.isEmpty()) {
            double tempoMedio = entregasRealizadas.stream()
                    .mapToDouble(Entrega::getTempoTotalMinutos)
                    .average()
                    .orElse(0);
            stats.put("tempoMedioEntrega", Math.round(tempoMedio * 100.0) / 100.0);
            
            // Drone mais eficiente (que fez mais entregas)
            Map<String, Long> entregasPorDrone = entregasRealizadas.stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            Entrega::getDroneId, 
                            java.util.stream.Collectors.counting()));
            
            String droneMaisEficiente = entregasPorDrone.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("Nenhum");
            
            stats.put("droneMaisEficiente", droneMaisEficiente);
        } else {
            stats.put("tempoMedioEntrega", 0);
            stats.put("droneMaisEficiente", "Nenhum");
        }
        
        return stats;
    }

    private double calcularDistancia(int x1, int y1, int x2, int y2) {
        double dx = (double) x2 - x1;
        double dy = (double) y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    private double calcularTempo(double distanciaKm) {
        return (distanciaKm / VELOCIDADE_DRONE_KM_H) * 60; // Retorna tempo em minutos
    }

    public String getStatusPedido(String pedidoId) {
        // Verificar se está na fila
        for (Pedido pedido : filaDePedidos) {
            if (pedido.getId().equals(pedidoId)) {
                int posicao = filaDePedidos.indexOf(pedido) + 1;
                return "Pedido na fila, posição: " + posicao;
            }
        }
        
        // Verificar se está em entrega
        for (Drone drone : drones) {
            for (Pedido pedido : drone.getPedidosAlocados()) {
                if (pedido.getId().equals(pedidoId)) {
                    double distancia = calcularDistancia(0, 0, drone.getPosX(), drone.getPosY());
                    return "Em entrega - Drone a " + Math.round(distancia) + " metros da base";
                }
            }
        }
        
        // Verificar se foi entregue
        for (Entrega entrega : entregasRealizadas) {
            if (entrega.getPedido().getId().equals(pedidoId)) {
                return "Entregue em " + entrega.getFimEntrega().toString();
            }
        }
        
        return "Pedido não encontrado";
    }

    public boolean recarregarDrone(String droneId) {
        for (Drone drone : drones) {
            if (drone.getId().equals(droneId)) {
                drone.recarregar();
                return true;
            }
        }
        return false;
    }

    public void recarregarTodosDrones() {
        for (Drone drone : drones) {
            drone.recarregar();
        }
    }
    
    /**
     * Gerencia drones com bateria baixa ou em recarga
     */
    private void gerenciarBateriaBaixa() {
        for (Drone drone : drones) {
            // Atualizar recarga de drones que estão carregando
            if (drone.getEstado() == EstadoDrone.CHARGING) {
                drone.atualizarRecarga(1.5); // 1.5% por minuto
                continue;
            }
            
            // Verificar se bateria está criticamente baixa
            if (simuladorBateria.isBateriaCritica(drone.getBateriaAtual())) {
                if (drone.getEstado() != EstadoDrone.RETORNANDO && drone.getEstado() != EstadoDrone.CHARGING) {
                    // Retorno de emergência
                    forcarRetornoEmergencia(drone);
                }
            }
            // Verificar se bateria está baixa e drone está em missão
            else if (simuladorBateria.isBateriaBaixa(drone.getBateriaAtual())) {
                if (drone.getEstado() == EstadoDrone.EM_VOO || drone.getEstado() == EstadoDrone.ENTREGANDO) {
                    // Verificar se tem bateria suficiente para retornar
                    double distanciaBase = calcularDistancia(drone.getPosX(), drone.getPosY(), 0, 0);
                    if (!simuladorBateria.bateriaSuficienteParaRetorno(drone.getBateriaAtual(), distanciaBase)) {
                        forcarRetornoEmergencia(drone);
                    }
                }
            }
        }
    }
    
    /**
     * Força retorno de emergência de um drone
     */
    private void forcarRetornoEmergencia(Drone drone) {
        System.out.println("⚠️ ALERTA: Drone " + drone.getId() + " com bateria baixa (" + 
                          Math.round(drone.getBateriaAtual()) + "%) - Retornando à base!");
        
        drone.retornoEmergencia();
        
        // Simular retorno imediato à base
        double distanciaRetorno = calcularDistancia(drone.getPosX(), drone.getPosY(), 0, 0);
        double bateriaRetorno = simuladorBateria.calcularConsumoReal(distanciaRetorno, 0, false);
        
        drone.consumirBateria(bateriaRetorno);
        drone.setPosicao(0, 0);
        
        // Iniciar recarga automática
        drone.iniciarRecarga();
        System.out.println("🔋 Drone " + drone.getId() + " iniciou recarga automática");
    }
    
    /**
     * Verifica se drone tem bateria suficiente para missão
     */
    private boolean verificarBateriaSuficienteParaMissao(Drone drone, List<Pedido> pedidos) {
        if (pedidos.isEmpty()) return true;
        
        // Calcular distância total da missão
        double distanciaTotal = 0;
        int currentX = drone.getPosX();
        int currentY = drone.getPosY();
        
        for (Pedido pedido : pedidos) {
            distanciaTotal += calcularDistancia(currentX, currentY, pedido.getX(), pedido.getY());
            currentX = pedido.getX();
            currentY = pedido.getY();
        }
        
        // Adicionar distância de retorno à base
        distanciaTotal += calcularDistancia(currentX, currentY, 0, 0);
        
        // Calcular peso total
        double pesoTotal = pedidos.stream().mapToDouble(Pedido::getPeso).sum();
        
        // Verificar se bateria é suficiente
        return simuladorBateria.bateriaSeguraParaMissao(drone.getBateriaAtual(), distanciaTotal, pesoTotal);
    }
    
    /**
     * Retorna status detalhado da bateria de todos os drones
     */
    public Map<String, Object> getStatusBateria() {
        Map<String, Object> status = new HashMap<>();
        List<Map<String, Object>> dronesStatus = new ArrayList<>();
        
        int dronesComBateriaBaixa = 0;
        int dronesEmRecarga = 0;
        
        for (Drone drone : drones) {
            Map<String, Object> droneInfo = new HashMap<>();
            droneInfo.put("id", drone.getId());
            droneInfo.put("bateria", Math.round(drone.getBateriaAtual() * 100.0) / 100.0);
            droneInfo.put("estado", drone.getEstado().toString());
            droneInfo.put("posicao", Map.of("x", drone.getPosX(), "y", drone.getPosY()));
            droneInfo.put("bateriaBaixa", simuladorBateria.isBateriaBaixa(drone.getBateriaAtual()));
            droneInfo.put("bateriaCritica", simuladorBateria.isBateriaCritica(drone.getBateriaAtual()));
            droneInfo.put("emRecarga", drone.isEmRecarga());
            
            if (drone.isEmRecarga()) {
                droneInfo.put("tempoRecargaMinutos", drone.getTempoRecargaMinutos());
                dronesEmRecarga++;
            }
            
            if (simuladorBateria.isBateriaBaixa(drone.getBateriaAtual())) {
                dronesComBateriaBaixa++;
            }
            
            dronesStatus.add(droneInfo);
        }
        
        status.put("drones", dronesStatus);
        status.put("totalDrones", drones.size());
        status.put("dronesComBateriaBaixa", dronesComBateriaBaixa);
        status.put("dronesEmRecarga", dronesEmRecarga);
        status.put("timestamp", System.currentTimeMillis());
        
        return status;
    }
    
    /**
     * Força retorno manual de um drone específico
     */
    public boolean forcarRetornoManual(String droneId) {
        for (Drone drone : drones) {
            if (drone.getId().equals(droneId)) {
                if (drone.getEstado() == EstadoDrone.IDLE || 
                    drone.getEstado() == EstadoDrone.CHARGING) {
                    return false; // Já está na base
                }
                
                forcarRetornoEmergencia(drone);
                return true;
            }
        }
        return false;
    }
    
    /**
     * Edita um drone existente
     */
    public boolean editarDrone(String id, double capacidade, double autonomia) {
        for (Drone drone : drones) {
            if (drone.getId().equals(id)) {
                // Só permitir edição se drone estiver IDLE
                if (drone.getEstado() != EstadoDrone.IDLE) {
                    return false;
                }
                
                // Atualizar propriedades
                drone.setCapacidadeMaxima(capacidade);
                drone.setAutonomiaMaxima(autonomia);
                
                // Se a nova autonomia for menor que a bateria atual, ajustar
                if (drone.getBateriaAtual() > autonomia) {
                    drone.setBateriaAtual(autonomia);
                }
                
                return true;
            }
        }
        return false;
    }
    
    /**
     * Remove um drone do sistema
     */
    public boolean removerDrone(String id) {
        for (int i = 0; i < drones.size(); i++) {
            Drone drone = drones.get(i);
            if (drone.getId().equals(id)) {
                // Só permitir remoção se drone estiver IDLE
                if (drone.getEstado() != EstadoDrone.IDLE) {
                    return false;
                }
                
                drones.remove(i);
                return true;
            }
        }
        return false;
    }
    
    /**
     * Edita um pedido na fila
     */
    public boolean editarPedido(String id, String cliente, int x, int y, double peso, String prioridade) {
        // Verificar se o novo destino está em zona de exclusão
        for (ZonaExclusao zona : zonasExclusao) {
            if (zona.contemPonto(x, y)) {
                System.out.println("⚠️ Edição de pedido rejeitada: novo destino (" + x + ", " + y + 
                                 ") está na zona de exclusão '" + zona.getNome() + "' - " + zona.getMotivo());
                return false; // Edição rejeitada
            }
        }
        
        for (Pedido pedido : filaDePedidos) {
            if (pedido.getId().equals(id)) {
                pedido.setCliente(cliente);
                pedido.setX(x);
                pedido.setY(y);
                pedido.setPeso(peso);
                pedido.setPrioridade(com.dtidigital.drone_delivery.enums.Prioridade.valueOf(prioridade));
                
                // Reordenar fila após edição
                ordenarFila();
                return true;
            }
        }
        return false;
    }
    
    /**
     * Remove um pedido da fila
     */
    public boolean removerPedido(String id) {
        for (int i = 0; i < filaDePedidos.size(); i++) {
            if (filaDePedidos.get(i).getId().equals(id)) {
                filaDePedidos.remove(i);
                return true;
            }
        }
        return false;
    }
    
    /**
     * Busca um pedido por ID
     */
    public Pedido buscarPedido(String id) {
        for (Pedido pedido : filaDePedidos) {
            if (pedido.getId().equals(id)) {
                return pedido;
            }
        }
        return null;
    }
    
    /**
     * Busca um drone por ID
     */
    public Drone buscarDrone(String id) {
        for (Drone drone : drones) {
            if (drone.getId().equals(id)) {
                return drone;
            }
        }
        return null;
    }
}