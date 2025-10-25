package com.eventsphere.controller;

import com.eventsphere.model.Boleto;
import com.eventsphere.model.Evento;
import com.eventsphere.model.Usuario;
import com.eventsphere.service.BoletoService;
import com.eventsphere.repository.EventoRepository;
import com.eventsphere.repository.UsuarioRepository;
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
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private EventoRepository eventoRepository;
    
    @PostMapping("/comprar")
    public ResponseEntity<?> comprarBoleto(
            @RequestParam Long usuarioId,
            @RequestParam Long eventoId) {
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            Evento evento = eventoRepository.findById(eventoId)
                    .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
            
            Boleto boleto = boletoService.comprarBoleto(usuario, evento);
            return ResponseEntity.status(HttpStatus.CREATED).body(boleto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Boleto>> listarBoletosPorUsuario(@PathVariable Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(boletoService.listarPorUsuario(usuario));
    }
    
    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<List<Boleto>> listarBoletosPorEvento(@PathVariable Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        return ResponseEntity.ok(boletoService.listarPorEvento(evento));
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
