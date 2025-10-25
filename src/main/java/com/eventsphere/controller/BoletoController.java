package com.eventsphere.controller;

import com.eventsphere.model.Boleto;
import com.eventsphere.service.BoletoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/boletos")
@CrossOrigin(origins = "*")
public class BoletoController {
    
    @Autowired
    private BoletoService boletoService;
    
    @GetMapping
    public ResponseEntity<List<Boleto>> listarBoletos() {
        // Este endpoint necesitaría filtros por usuario/evento
        // Por ahora retornamos error porque no es práctico listar todos
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarBoletoPorId(@PathVariable Long id) {
        return boletoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/qr/{codigoQR}")
    public ResponseEntity<?> buscarPorCodigoQR(@PathVariable String codigoQR) {
        return boletoService.buscarPorCodigoQR(codigoQR)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{id}/usar")
    public ResponseEntity<?> usarBoleto(@PathVariable Long id, @RequestParam String codigoQR) {
        try {
            Boleto boleto = boletoService.usarBoleto(codigoQR);
            return ResponseEntity.ok(boleto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelarBoleto(@PathVariable Long id) {
        try {
            boletoService.cancelarBoleto(id);
            return ResponseEntity.ok("Boleto cancelado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
