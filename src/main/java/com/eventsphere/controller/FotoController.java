package com.eventsphere.controller;

import com.eventsphere.model.Evento;
import com.eventsphere.model.Foto;
import com.eventsphere.model.Usuario;
import com.eventsphere.repository.EventoRepository;
import com.eventsphere.repository.UsuarioRepository;
import com.eventsphere.service.FotoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fotos")
@CrossOrigin(origins = "*")
public class FotoController {
    
    @Autowired
    private FotoService fotoService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private EventoRepository eventoRepository;
    
    @PostMapping
    public ResponseEntity<?> subirFoto(
            @RequestParam("usuarioId") Long usuarioId,
            @RequestParam("eventoId") Long eventoId,
            @RequestParam("imagen") MultipartFile imagen,
            @RequestParam(value = "descripcion", required = false) String descripcion) {
        
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            Evento evento = eventoRepository.findById(eventoId)
                    .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
            
            Foto foto = fotoService.subirFoto(usuario, evento, imagen, descripcion);
            
            return ResponseEntity.ok(foto);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al subir la imagen: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<List<Foto>> listarPorEvento(@PathVariable Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        
        List<Foto> fotos = fotoService.listarPorEvento(evento);
        return ResponseEntity.ok(fotos);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Foto> buscarPorId(@PathVariable Long id) {
        Foto foto = fotoService.buscarPorId(id);
        return ResponseEntity.ok(foto);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarFoto(@PathVariable Long id) {
        try {
            fotoService.eliminarFoto(id);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Foto eliminada exitosamente");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar la imagen: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/evento/{eventoId}/count")
    public ResponseEntity<Map<String, Long>> contarFotos(@PathVariable Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        
        long cantidad = fotoService.contarFotosPorEvento(evento);
        
        Map<String, Long> response = new HashMap<>();
        response.put("cantidad", cantidad);
        
        return ResponseEntity.ok(response);
    }
}
