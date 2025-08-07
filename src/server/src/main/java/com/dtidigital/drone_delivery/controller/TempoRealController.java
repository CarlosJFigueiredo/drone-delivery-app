package com.dtidigital.drone_delivery.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.dtidigital.drone_delivery.service.SimuladorTempoReal;

@RestController
@RequestMapping("/api/tempo-real")
@CrossOrigin(origins = {
    "http://localhost:3000", 
    "http://localhost:3001",
    "https://drone-delivery-cq7u.onrender.com",
    "https://drone-delivery-app.onrender.com"
})
public class TempoRealController {

    private final SimuladorTempoReal simuladorTempoReal;

    public TempoRealController(SimuladorTempoReal simuladorTempoReal) {
        this.simuladorTempoReal = simuladorTempoReal;
    }

    @PostMapping("/iniciar")
    public ResponseEntity<String> iniciarSimulacao() {
        simuladorTempoReal.iniciarSimulacaoAutomatica();
        return ResponseEntity.ok("Simulação em tempo real iniciada.");
    }

    @PostMapping("/parar")
    public ResponseEntity<String> pararSimulacao() {
        simuladorTempoReal.pararSimulacao();
        return ResponseEntity.ok("Simulação em tempo real parada.");
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> obterStatus() {
        return ResponseEntity.ok(Map.of(
            "ativo", simuladorTempoReal.isSimulacaoAtiva(),
            "relatorio", simuladorTempoReal.gerarRelatorioTempoReal()
        ));
    }

    @PostMapping("/eventos")
    public ResponseEntity<String> simularEventos() {
        simuladorTempoReal.simularEventosAleatorios();
        return ResponseEntity.ok("Simulação de eventos aleatórios iniciada.");
    }
}
