package com.eventsphere.controller;

import com.eventsphere.model.Mensaje;
import com.eventsphere.model.Usuario;
import com.eventsphere.model.Evento;
import com.eventsphere.service.MensajeService;
import com.eventsphere.repository.UsuarioRepository;
import com.eventsphere.repository.EventoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mensajes")
@CrossOrigin(origins = "*")
public class MensajeController {
    
    @Autowired
    private MensajeService mensajeService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private EventoRepository eventoRepository;
    
    @PostMapping
    public ResponseEntity<?> enviarMensaje(
            @RequestParam Long usuarioId,
            @RequestParam Long eventoId,
            @RequestParam String contenido) {
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            Evento evento = eventoRepository.findById(eventoId)
                    .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
            
            Mensaje mensaje = mensajeService.enviarMensaje(usuario, evento, contenido);
            return ResponseEntity.status(HttpStatus.CREATED).body(mensaje);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<List<Mensaje>> listarPorEvento(@PathVariable Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        return ResponseEntity.ok(mensajeService.listarPorEvento(evento));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> buscarPorId(@PathVariable Long id) {
        return mensajeService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarMensaje(@PathVariable Long id) {
        try {
            mensajeService.eliminarMensaje(id);
            return ResponseEntity.ok("Mensaje eliminado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
