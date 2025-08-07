package com.dtidigital.drone_delivery.controller;

import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dtidigital.drone_delivery.dto.PedidoDTO;
import com.dtidigital.drone_delivery.model.Pedido;
import com.dtidigital.drone_delivery.model.Entrega;
import com.dtidigital.drone_delivery.service.DroneService;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class PedidoController {

    private final DroneService droneService;

    public PedidoController(DroneService droneService) {
        this.droneService = droneService;
    }

    @PostMapping
    public ResponseEntity<String> criarPedido(@RequestBody @Valid PedidoDTO pedidoDTO) {
        Pedido novoPedido = new Pedido(
            pedidoDTO.getCliente(),
            pedidoDTO.getX(),
            pedidoDTO.getY(),
            pedidoDTO.getPeso(),
            pedidoDTO.getPrioridade()
        );

        boolean sucesso = droneService.adicionarPedido(novoPedido);
        if (sucesso) {
            return ResponseEntity.ok("Pedido " + novoPedido.getId() + " adicionado com sucesso!");
        } else {
            return ResponseEntity.badRequest().body("Pedido rejeitado: destino está em zona de exclusão aérea. Escolha um local diferente para entrega.");
        }
    }

    @GetMapping("/entregas")
    public ResponseEntity<List<Entrega>> listarEntregas() {
        return ResponseEntity.ok(droneService.getEntregasRealizadas());
    }

    @GetMapping("/fila")
    public ResponseEntity<List<Pedido>> listarFilaPedidos() {
        return ResponseEntity.ok(droneService.getPedidosNaFila());
    }

    @GetMapping("/pendentes")
    public ResponseEntity<List<Pedido>> listarPedidosPendentes() {
        return ResponseEntity.ok(droneService.getPedidosNaFila());
    }

    @GetMapping("/status/{pedidoId}")
    public ResponseEntity<Map<String, String>> obterStatusPedido(@PathVariable String pedidoId) {
        String status = droneService.getStatusPedido(pedidoId);
        return ResponseEntity.ok(Map.of("status", status));
    }

    @GetMapping("/estatisticas")
    public ResponseEntity<Map<String, Object>> obterEstatisticas() {
        return ResponseEntity.ok(droneService.getEstatisticas());
    }
    
    @PutMapping("/{pedidoId}")
    public ResponseEntity<String> editarPedido(@PathVariable String pedidoId, @RequestBody @Valid PedidoDTO pedidoDTO) {
        boolean sucesso = droneService.editarPedido(
            pedidoId,
            pedidoDTO.getCliente(),
            pedidoDTO.getX(),
            pedidoDTO.getY(),
            pedidoDTO.getPeso(),
            pedidoDTO.getPrioridade().name()
        );
        
        if (sucesso) {
            return ResponseEntity.ok("Pedido " + pedidoId + " editado com sucesso!");
        } else {
            // Verificar se o pedido existe para dar erro mais específico
            if (droneService.buscarPedido(pedidoId) != null) {
                return ResponseEntity.badRequest().body("Edição rejeitada: novo destino está em zona de exclusão aérea. Escolha um local diferente.");
            } else {
                return ResponseEntity.badRequest().body("Pedido " + pedidoId + " não encontrado na fila.");
            }
        }
    }
    
    @DeleteMapping("/{pedidoId}")
    public ResponseEntity<String> removerPedido(@PathVariable String pedidoId) {
        boolean sucesso = droneService.removerPedido(pedidoId);
        if (sucesso) {
            return ResponseEntity.ok("Pedido " + pedidoId + " removido com sucesso!");
        } else {
            return ResponseEntity.badRequest().body("Pedido " + pedidoId + " não encontrado na fila.");
        }
    }
    
    @GetMapping("/{pedidoId}")
    public ResponseEntity<Pedido> buscarPedido(@PathVariable String pedidoId) {
        Pedido pedido = droneService.buscarPedido(pedidoId);
        if (pedido != null) {
            return ResponseEntity.ok(pedido);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}