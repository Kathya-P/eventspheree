package com.eventsphere.controller;

import com.eventsphere.model.Mensaje;
import com.eventsphere.service.MensajeServiceMejorado;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {
    
    @Autowired
    private MensajeServiceMejorado mensajeService;
    
    /**
     * Enviar un nuevo mensaje
     */
    @PostMapping("/enviar")
    public ResponseEntity<?> enviarMensaje(@RequestBody Map<String, Object> datos) {
        try {
            Long usuarioId = Long.parseLong(datos.get("usuarioId").toString());
            Long eventoId = Long.parseLong(datos.get("eventoId").toString());
            String contenido = datos.get("contenido").toString();
            Long respondeAId = datos.get("respondeAId") != null ? 
                               Long.parseLong(datos.get("respondeAId").toString()) : null;
            
            Mensaje mensaje = mensajeService.enviarMensaje(usuarioId, eventoId, contenido, respondeAId);
            return ResponseEntity.ok(mensaje);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", true,
                "mensaje", e.getMessage()
            ));
        }
    }
    
    /**
     * Editar un mensaje
     */
    @PutMapping("/editar/{mensajeId}")
    public ResponseEntity<?> editarMensaje(
            @PathVariable Long mensajeId,
            @RequestBody Map<String, Object> datos) {
        try {
            Long usuarioId = Long.parseLong(datos.get("usuarioId").toString());
            String nuevoContenido = datos.get("contenido").toString();
            
            Mensaje mensaje = mensajeService.editarMensaje(mensajeId, usuarioId, nuevoContenido);
            return ResponseEntity.ok(mensaje);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", true,
                "mensaje", e.getMessage()
            ));
        }
    }
    
    /**
     * Eliminar un mensaje
     */
    @DeleteMapping("/eliminar/{mensajeId}")
    public ResponseEntity<?> eliminarMensaje(
            @PathVariable Long mensajeId,
            @RequestParam Long usuarioId) {
        try {
            Mensaje mensaje = mensajeService.eliminarMensaje(mensajeId, usuarioId);
            return ResponseEntity.ok(mensaje);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", true,
                "mensaje", e.getMessage()
            ));
        }
    }
    
    /**
     * Reaccionar a un mensaje
     */
    @PostMapping("/reaccionar/{mensajeId}")
    public ResponseEntity<?> reaccionar(
            @PathVariable Long mensajeId,
            @RequestBody Map<String, Object> datos) {
        try {
            Long usuarioId = Long.parseLong(datos.get("usuarioId").toString());
            String emoji = datos.get("emoji") != null ? datos.get("emoji").toString() : null;
            
            Mensaje mensaje = mensajeService.reaccionar(mensajeId, usuarioId, emoji);
            return ResponseEntity.ok(mensaje);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", true,
                "mensaje", e.getMessage()
            ));
        }
    }
    
    /**
     * Listar mensajes de un evento
     */
    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<List<Mensaje>> listarMensajes(@PathVariable Long eventoId) {
        try {
            List<Mensaje> mensajes = mensajeService.listarPorEvento(eventoId);
            return ResponseEntity.ok(mensajes);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Contar mensajes de un evento
     */
    @GetMapping("/evento/{eventoId}/contar")
    public ResponseEntity<Map<String, Long>> contarMensajes(@PathVariable Long eventoId) {
        try {
            long total = mensajeService.contarMensajes(eventoId);
            return ResponseEntity.ok(Map.of("total", total));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
