package com.eventsphere.controller;

import com.eventsphere.model.Resena;
import com.eventsphere.model.Usuario;
import com.eventsphere.model.Evento;
import com.eventsphere.service.ResenaService;
import com.eventsphere.repository.UsuarioRepository;
import com.eventsphere.repository.EventoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resenas")
@CrossOrigin(origins = "*")
public class ResenaController {
    
    @Autowired
    private ResenaService resenaService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private EventoRepository eventoRepository;
    
    @PostMapping
    public ResponseEntity<?> crearResena(
            @RequestParam Long usuarioId,
            @RequestParam Long eventoId,
            @RequestParam Integer calificacion,
            @RequestParam(required = false) String comentario) {
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            Evento evento = eventoRepository.findById(eventoId)
                    .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
            
            Resena resena = resenaService.crearResena(usuario, evento, calificacion, comentario);
            return ResponseEntity.status(HttpStatus.CREATED).body(resena);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<List<Resena>> listarPorEvento(@PathVariable Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        return ResponseEntity.ok(resenaService.listarPorEvento(evento));
    }
    
    @GetMapping("/evento/{eventoId}/promedio")
    public ResponseEntity<Map<String, Object>> obtenerPromedioEvento(@PathVariable Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        
        Double promedio = resenaService.calcularPromedioCalificacion(evento);
        List<Resena> resenas = resenaService.listarPorEvento(evento);
        
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("promedio", promedio);
        resultado.put("totalResenas", resenas.size());
        
        return ResponseEntity.ok(resultado);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        return resenaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarResena(
            @PathVariable Long id,
            @RequestParam Integer calificacion,
            @RequestParam(required = false) String comentario) {
        try {
            Resena resena = resenaService.actualizarResena(id, calificacion, comentario);
            return ResponseEntity.ok(resena);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarResena(@PathVariable Long id) {
        try {
            resenaService.eliminarResena(id);
            return ResponseEntity.ok("Reseña eliminada correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
