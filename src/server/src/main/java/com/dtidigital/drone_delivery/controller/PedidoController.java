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

        droneService.adicionarPedido(novoPedido);
        return ResponseEntity.ok("Pedido " + novoPedido.getId() + " adicionado com sucesso!");
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
}