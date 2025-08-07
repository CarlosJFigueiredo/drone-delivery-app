package com.dtidigital.drone_delivery.service;

import java.time.LocalDateTime;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Component;

import com.dtidigital.drone_delivery.enums.EstadoDrone;
import com.dtidigital.drone_delivery.model.Drone;

@Component
public class SimuladorTempoReal {
    
    private ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
    private final DroneService droneService;
    private boolean simulacaoAtiva = false;
    private ScheduledFuture<?> tarefaEntregas;
    private ScheduledFuture<?> tarefaBateria;
    private ScheduledFuture<?> tarefaEventos;
    
    public SimuladorTempoReal(DroneService droneService) {
        this.droneService = droneService;
    }
    
    /**
     * Inicia simulação automática de entregas
     */
    public void iniciarSimulacaoAutomatica() {
        if (!simulacaoAtiva) {
            simulacaoAtiva = true;
            
            // Recriar scheduler se foi fechado
            if (scheduler.isShutdown()) {
                scheduler = Executors.newScheduledThreadPool(2);
            }
            
            // Simular entregas a cada 10 segundos
            tarefaEntregas = scheduler.scheduleAtFixedRate(() -> {
                try {
                    if (simulacaoAtiva && !droneService.getPedidosNaFila().isEmpty()) {
                        droneService.simularEntrega();
                    }
                } catch (Exception e) {
                    System.err.println("Erro na simulação automática: " + e.getMessage());
                }
            }, 10, 10, TimeUnit.SECONDS);
            
            // Simular degradação de bateria a cada 30 segundos
            tarefaBateria = scheduler.scheduleAtFixedRate(() -> {
                try {
                    if (simulacaoAtiva) {
                        simularDegradacaoBateria();
                    }
                } catch (Exception e) {
                    System.err.println("Erro na degradação de bateria: " + e.getMessage());
                }
            }, 30, 30, TimeUnit.SECONDS);
        }
    }
    
    /**
     * Para a simulação automática
     */
    public void pararSimulacao() {
        simulacaoAtiva = false;
        
        // Cancelar tarefas ativas sem fechar o scheduler
        if (tarefaEntregas != null && !tarefaEntregas.isCancelled()) {
            tarefaEntregas.cancel(false);
        }
        if (tarefaBateria != null && !tarefaBateria.isCancelled()) {
            tarefaBateria.cancel(false);
        }
        if (tarefaEventos != null && !tarefaEventos.isCancelled()) {
            tarefaEventos.cancel(false);
        }
    }
    
    /**
     * Simula degradação natural da bateria dos drones
     * Apenas afeta drones que estão em operação há algum tempo
     */
    private void simularDegradacaoBateria() {
        for (Drone drone : droneService.getDrones()) {
            // Só degradar bateria se o drone não está com bateria cheia (recém-criado)
            if (drone.getBateriaAtual() < drone.getAutonomiaMaxima()) {
                
                // Drones em voo consomem mais bateria
                if (drone.getEstado() == EstadoDrone.EM_VOO || 
                    drone.getEstado() == EstadoDrone.ENTREGANDO ||
                    drone.getEstado() == EstadoDrone.RETORNANDO) {
                    
                    double consumoAdicional = 0.5; // 0.5 unidades por ciclo
                    if (drone.getBateriaAtual() > consumoAdicional) {
                        drone.consumirBateria(consumoAdicional);
                        
                        // Se bateria crítica, forçar retorno
                        if (drone.getBateriaAtual() < 10) {
                            drone.setEstado(EstadoDrone.RETORNANDO);
                            drone.setPosicao(0, 0);
                            drone.limparPedidos();
                            drone.recarregar();
                            drone.setEstado(EstadoDrone.IDLE);
                        }
                    }
                }
                
                // Drones ociosos com bateria parcial consomem um pouco (sistemas de bordo)
                else if (drone.getEstado() == EstadoDrone.IDLE && drone.getBateriaAtual() < drone.getAutonomiaMaxima() * 0.95) {
                    double consumoOcioso = 0.1; // Consumo mínimo
                    if (drone.getBateriaAtual() > consumoOcioso) {
                        drone.consumirBateria(consumoOcioso);
                    }
                }
            }
        }
    }
    
    /**
     * Simula eventos aleatórios no sistema
     */
    public void simularEventosAleatorios() {
        // Verificar se há drones disponíveis antes de iniciar eventos
        if (droneService.getDrones().isEmpty()) {
            return; // Não fazer nada se não há drones
        }
        
        // Cancelar eventos anteriores se existirem
        if (tarefaEventos != null && !tarefaEventos.isCancelled()) {
            tarefaEventos.cancel(false);
        }
        
        tarefaEventos = scheduler.scheduleAtFixedRate(() -> {
            try {
                // Verificar se simulação ainda está ativa e há drones
                if (!simulacaoAtiva || droneService.getDrones().isEmpty()) {
                    return;
                }
                
                double chance = Math.random();
                
                // 10% chance de tempestade (afeta todas as entregas)
                if (chance < 0.1) {
                    System.out.println("[EVENTO] ⛈️ Tempestade detectada! Drones retornando à base.");
                    forcarRetornoEmergencia();
                }
                
                // 5% chance de falha de drone
                else if (chance < 0.15) {
                    simularFalhaDrone();
                }
                
                // 20% chance de pedido urgente
                else if (chance < 0.35) {
                    // Aqui poderia gerar um pedido de alta prioridade automaticamente
                    System.out.println("[EVENTO] 🚨 Demanda alta detectada na região central.");
                }
                
            } catch (Exception e) {
                System.err.println("Erro em eventos aleatórios: " + e.getMessage());
            }
        }, 60, 120, TimeUnit.SECONDS); // A cada 2 minutos
    }
    
    /**
     * Força retorno de emergência de todos os drones
     */
    private void forcarRetornoEmergencia() {
        for (Drone drone : droneService.getDrones()) {
            if (drone.getEstado() != EstadoDrone.IDLE) {
                drone.setEstado(EstadoDrone.RETORNANDO);
                drone.setPosicao(0, 0);
                drone.limparPedidos();
                drone.setEstado(EstadoDrone.IDLE);
            }
        }
    }
    
    /**
     * Simula falha aleatória de um drone
     */
    private void simularFalhaDrone() {
        var drones = droneService.getDrones();
        if (drones.isEmpty()) {
            return; // Não fazer nada se não há drones
        }
        
        Drone droneAleatorio = drones.get((int) (Math.random() * drones.size()));
        
        if (droneAleatorio.getEstado() != EstadoDrone.IDLE) {
            System.out.println("[EVENTO] ⚠️ Drone " + droneAleatorio.getId() + 
                " apresentou falha técnica. Retornando para manutenção.");
                
            droneAleatorio.setEstado(EstadoDrone.RETORNANDO);
            droneAleatorio.setPosicao(0, 0);
            droneAleatorio.limparPedidos();
            
            // Reduzir bateria para simular gasto de emergência
            double bateriaAntesRedução = droneAleatorio.getBateriaAtual();
            if (bateriaAntesRedução > 20) {
                droneAleatorio.consumirBateria(20);
            } else {
                // Se bateria muito baixa, consumir apenas o que tem
                droneAleatorio.consumirBateria(bateriaAntesRedução * 0.5);
            }
            
            droneAleatorio.setEstado(EstadoDrone.IDLE);
        }
    }
    
    /**
     * Gera relatório de status em tempo real
     */
    public String gerarRelatorioTempoReal() {
        var drones = droneService.getDrones();
        var pedidos = droneService.getPedidosNaFila();
        var entregas = droneService.getEntregasRealizadas();
        
        StringBuilder relatorio = new StringBuilder();
        relatorio.append("=== RELATÓRIO TEMPO REAL ===\n");
        relatorio.append("Timestamp: ").append(LocalDateTime.now()).append("\n\n");
        
        relatorio.append("📊 ESTATÍSTICAS GERAIS:\n");
        relatorio.append("• Drones ativos: ").append(drones.size()).append("\n");
        relatorio.append("• Pedidos pendentes: ").append(pedidos.size()).append("\n");
        relatorio.append("• Entregas realizadas: ").append(entregas.size()).append("\n\n");
        
        relatorio.append("🚁 STATUS DOS DRONES:\n");
        for (Drone drone : drones) {
            relatorio.append("• ").append(drone.getId()).append(": ")
                .append(drone.getEstado()).append(" (")
                .append(String.format("%.1f", (drone.getBateriaAtual() / drone.getAutonomiaMaxima()) * 100))
                .append("% bateria)\n");
        }
        
        return relatorio.toString();
    }
    
    public boolean isSimulacaoAtiva() {
        return simulacaoAtiva;
    }
}
