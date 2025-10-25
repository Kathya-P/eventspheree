package com.eventsphere.controller;

import com.eventsphere.model.Evento;
import com.eventsphere.service.EventoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/eventos")
@CrossOrigin(origins = "*")
public class EventoController {
    
    @Autowired
    private EventoService eventoService;
    
    @PostMapping
    public ResponseEntity<?> crearEvento(@RequestBody Evento evento) {
        try {
            Evento nuevoEvento = eventoService.crearEvento(evento);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoEvento);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Evento>> listarEventos() {
        return ResponseEntity.ok(eventoService.listarTodos());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarEventoPorId(@PathVariable Long id) {
        return eventoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/proximos")
    public ResponseEntity<List<Evento>> listarEventosProximos() {
        return ResponseEntity.ok(eventoService.listarEventosProximos());
    }
    
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<Evento>> listarPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(eventoService.listarPorEstado(estado));
    }
    
    @GetMapping("/buscar")
    public ResponseEntity<List<Evento>> buscarPorTitulo(@RequestParam String keyword) {
        return ResponseEntity.ok(eventoService.buscarPorTitulo(keyword));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarEvento(@PathVariable Long id, @RequestBody Evento evento) {
        try {
            Evento eventoActualizado = eventoService.actualizarEvento(id, evento);
            return ResponseEntity.ok(eventoActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/{id}/cancelar")
    public ResponseEntity<?> cancelarEvento(@PathVariable Long id) {
        try {
            eventoService.cancelarEvento(id);
            return ResponseEntity.ok("Evento cancelado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarEvento(@PathVariable Long id) {
        try {
            eventoService.eliminarEvento(id);
            return ResponseEntity.ok("Evento eliminado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
