package com.eventsphere.controller;

import com.eventsphere.model.Evento;
import com.eventsphere.model.Categoria;
import com.eventsphere.model.Usuario;
import com.eventsphere.service.EventoService;
import com.eventsphere.service.ImageStorageService;
import com.eventsphere.repository.CategoriaRepository;
import com.eventsphere.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/eventos")
@CrossOrigin(origins = "*")
public class EventoController {
    
    @Autowired
    private EventoService eventoService;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ImageStorageService imageStorageService;
    
    @PostMapping("/crear-con-imagen")
    public ResponseEntity<?> crearEventoConImagen(
            @RequestParam("titulo") String titulo,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("fechaEvento") String fechaEvento,
            @RequestParam("lugar") String lugar,
            @RequestParam("direccion") String direccion,
            @RequestParam("capacidad") Integer capacidad,
            @RequestParam("precio") Double precio,
            @RequestParam("estado") String estado,
            @RequestParam("organizadorId") Long organizadorId,
            @RequestParam("categoriaId") Long categoriaId,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        
        try {
            // Buscar organizador y categoría
            Usuario organizador = usuarioRepository.findById(organizadorId)
                    .orElseThrow(() -> new RuntimeException("Usuario organizador no encontrado"));
            
            Categoria categoria = categoriaRepository.findById(categoriaId)
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            
            // Crear evento
            Evento evento = new Evento();
            evento.setTitulo(titulo);
            evento.setDescripcion(descripcion);
            evento.setFechaEvento(LocalDateTime.parse(fechaEvento, DateTimeFormatter.ISO_DATE_TIME));
            evento.setLugar(lugar);
            evento.setDireccion(direccion);
            evento.setCapacidad(capacidad);
            evento.setPrecio(BigDecimal.valueOf(precio));
            evento.setEstado(estado);
            evento.setOrganizador(organizador);
            evento.setCategoria(categoria);
            
            // Guardar imagen como archivo
            if (imagen != null && !imagen.isEmpty()) {
                String imagenUrl = imageStorageService.guardarImagenEvento(imagen);
                evento.setImagenUrl(imagenUrl);
            }
            
            Evento nuevoEvento = eventoService.crearEvento(evento);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoEvento);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al guardar la imagen: " + e.getMessage());
        }
    }
    
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
    
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Evento>> listarEventosPorUsuario(@PathVariable Long usuarioId) {
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            List<Evento> eventos = eventoService.listarPorOrganizador(usuario);
            return ResponseEntity.ok(eventos);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
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
    
    @PutMapping("/actualizar-con-imagen/{id}")
    public ResponseEntity<?> actualizarEventoConImagen(
            @PathVariable Long id,
            @RequestParam("titulo") String titulo,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("fechaEvento") String fechaEvento,
            @RequestParam("lugar") String lugar,
            @RequestParam("direccion") String direccion,
            @RequestParam("capacidad") Integer capacidad,
            @RequestParam("precio") Double precio,
            @RequestParam("estado") String estado,
            @RequestParam("organizadorId") Long organizadorId,
            @RequestParam("categoriaId") Long categoriaId,
            @RequestParam(value = "imagen", required = false) MultipartFile imagen) {
        
        try {
            // Buscar evento existente
            Evento evento = eventoService.buscarPorId(id)
                    .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
            
            // Buscar organizador y categoría
            Usuario organizador = usuarioRepository.findById(organizadorId)
                    .orElseThrow(() -> new RuntimeException("Usuario organizador no encontrado"));
            
            Categoria categoria = categoriaRepository.findById(categoriaId)
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            
            // Actualizar datos
            evento.setTitulo(titulo);
            evento.setDescripcion(descripcion);
            evento.setFechaEvento(LocalDateTime.parse(fechaEvento, DateTimeFormatter.ISO_DATE_TIME));
            evento.setLugar(lugar);
            evento.setDireccion(direccion);
            evento.setCapacidad(capacidad);
            evento.setPrecio(BigDecimal.valueOf(precio));
            evento.setEstado(estado);
            evento.setOrganizador(organizador);
            evento.setCategoria(categoria);
            
            // Actualizar imagen si se proporcionó una nueva
            if (imagen != null && !imagen.isEmpty()) {
                imageStorageService.eliminarImagen(evento.getImagenUrl());
                
                String nuevaImagenUrl = imageStorageService.guardarImagenEvento(imagen);
                evento.setImagenUrl(nuevaImagenUrl);
            }
            
            Evento eventoActualizado = eventoService.actualizarEvento(id, evento);
            return ResponseEntity.ok(eventoActualizado);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al guardar la imagen: " + e.getMessage());
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
            // Buscar evento para obtener la URL de la imagen
            eventoService.buscarPorId(id).ifPresent(evento -> {
                try {
                    imageStorageService.eliminarImagen(evento.getImagenUrl());
                } catch (IOException e) {
                    throw new RuntimeException("No se pudo eliminar la imagen del evento", e);
                }
            });
            
            eventoService.eliminarEvento(id);
            return ResponseEntity.ok("Evento eliminado correctamente");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
