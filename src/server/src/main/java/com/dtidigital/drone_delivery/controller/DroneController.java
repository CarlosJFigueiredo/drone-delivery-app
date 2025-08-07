package com.dtidigital.drone_delivery.controller;

import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.dtidigital.drone_delivery.dto.DroneDTO;
import com.dtidigital.drone_delivery.model.Drone;
import com.dtidigital.drone_delivery.model.ZonaExclusao;
import com.dtidigital.drone_delivery.service.DroneService;

@RestController
@RequestMapping("/api/drones")
@CrossOrigin(origins = {
    "http://localhost:3000", 
    "http://localhost:3001",
    "https://drone-delivery-cq7u.onrender.com",
    "https://drone-delivery-app.onrender.com"
})
public class DroneController {

    private final DroneService droneService;

    public DroneController(DroneService droneService) {
        this.droneService = droneService;
    }

    @PostMapping
    public ResponseEntity<String> cadastrarDrone(@RequestBody @Valid DroneDTO dto) {
        droneService.cadastrarDrone(dto.getId(), dto.getCapacidade(), dto.getAutonomia());
        return ResponseEntity.ok("Drone " + dto.getId() + " cadastrado com sucesso.");
    }

    @GetMapping
    public ResponseEntity<List<Drone>> listarDrones() {
        return ResponseEntity.ok(droneService.getDrones());
    }

    @PostMapping("/simular")
    public ResponseEntity<String> simularEntregas() {
        droneService.simularEntrega();
        return ResponseEntity.ok("Simulação executada.");
    }

    @PostMapping("/recarregar/{droneId}")
    public ResponseEntity<String> recarregarDrone(@PathVariable String droneId) {
        boolean sucesso = droneService.recarregarDrone(droneId);
        if (sucesso) {
            return ResponseEntity.ok("Drone " + droneId + " recarregado com sucesso.");
        } else {
            return ResponseEntity.badRequest().body("Drone " + droneId + " não encontrado.");
        }
    }

    @PostMapping("/recarregar-todos")
    public ResponseEntity<String> recarregarTodos() {
        droneService.recarregarTodosDrones();
        return ResponseEntity.ok("Todos os drones foram recarregados.");
    }

    @GetMapping("/status-bateria")
    public ResponseEntity<Map<String, Object>> getStatusBateria() {
        return ResponseEntity.ok(droneService.getStatusBateria());
    }

    @PostMapping("/forcar-retorno/{droneId}")
    public ResponseEntity<String> forcarRetorno(@PathVariable String droneId) {
        boolean sucesso = droneService.forcarRetornoManual(droneId);
        if (sucesso) {
            return ResponseEntity.ok("Drone " + droneId + " forçado a retornar à base.");
        } else {
            return ResponseEntity.badRequest().body("Drone " + droneId + " não encontrado ou não disponível para retorno.");
        }
    }

    @GetMapping("/zonas-exclusao")
    public ResponseEntity<List<ZonaExclusao>> listarZonasExclusao() {
        return ResponseEntity.ok(droneService.getZonasExclusao());
    }

    @PostMapping("/zonas-exclusao")
    public ResponseEntity<String> adicionarZonaExclusao(@RequestBody Map<String, Object> zona) {
        int x1 = (Integer) zona.get("x1");
        int y1 = (Integer) zona.get("y1");
        int x2 = (Integer) zona.get("x2");
        int y2 = (Integer) zona.get("y2");
        String nome = (String) zona.get("nome");
        String motivo = (String) zona.get("motivo");
        
        droneService.adicionarZonaExclusao(x1, y1, x2, y2, nome, motivo);
        return ResponseEntity.ok("Zona de exclusão '" + nome + "' adicionada com sucesso.");
    }
    
    @PutMapping("/zonas-exclusao/{zonaId}")
    public ResponseEntity<String> editarZonaExclusao(@PathVariable String zonaId, @RequestBody Map<String, Object> zona) {
        int x1 = (Integer) zona.get("x1");
        int y1 = (Integer) zona.get("y1");
        int x2 = (Integer) zona.get("x2");
        int y2 = (Integer) zona.get("y2");
        String nome = (String) zona.get("nome");
        String motivo = (String) zona.get("motivo");
        
        boolean sucesso = droneService.editarZonaExclusao(zonaId, x1, y1, x2, y2, nome, motivo);
        if (sucesso) {
            return ResponseEntity.ok("Zona de exclusão '" + nome + "' editada com sucesso.");
        } else {
            return ResponseEntity.badRequest().body("Zona de exclusão não encontrada.");
        }
    }
    
    @DeleteMapping("/zonas-exclusao/{zonaId}")
    public ResponseEntity<String> removerZonaExclusao(@PathVariable String zonaId) {
        boolean sucesso = droneService.removerZonaExclusao(zonaId);
        if (sucesso) {
            return ResponseEntity.ok("Zona de exclusão removida com sucesso.");
        } else {
            return ResponseEntity.badRequest().body("Zona de exclusão não encontrada.");
        }
    }
    
    @GetMapping("/zonas-exclusao/{zonaId}")
    public ResponseEntity<ZonaExclusao> buscarZonaExclusao(@PathVariable String zonaId) {
        ZonaExclusao zona = droneService.buscarZonaExclusao(zonaId);
        if (zona != null) {
            return ResponseEntity.ok(zona);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/calcular-rota")
    public ResponseEntity<Map<String, Object>> calcularRota(
            @RequestParam int xInicio, @RequestParam int yInicio,
            @RequestParam int xDestino, @RequestParam int yDestino) {
        return ResponseEntity.ok(droneService.calcularRotaComInfo(xInicio, yInicio, xDestino, yDestino));
    }
    
    @PutMapping("/{droneId}")
    public ResponseEntity<String> editarDrone(@PathVariable String droneId, @RequestBody @Valid DroneDTO dto) {
        boolean sucesso = droneService.editarDrone(droneId, dto.getCapacidade(), dto.getAutonomia());
        if (sucesso) {
            return ResponseEntity.ok("Drone " + droneId + " editado com sucesso.");
        } else {
            return ResponseEntity.badRequest().body("Drone " + droneId + " não encontrado ou não pode ser editado (não está IDLE).");
        }
    }
    
    @DeleteMapping("/{droneId}")
    public ResponseEntity<String> removerDrone(@PathVariable String droneId) {
        boolean sucesso = droneService.removerDrone(droneId);
        if (sucesso) {
            return ResponseEntity.ok("Drone " + droneId + " removido com sucesso.");
        } else {
            return ResponseEntity.badRequest().body("Drone " + droneId + " não encontrado ou não pode ser removido (não está IDLE).");
        }
    }
    
    @GetMapping("/{droneId}")
    public ResponseEntity<Drone> buscarDrone(@PathVariable String droneId) {
        Drone drone = droneService.buscarDrone(droneId);
        if (drone != null) {
            return ResponseEntity.ok(drone);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}