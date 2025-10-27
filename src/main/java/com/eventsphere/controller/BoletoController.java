package com.eventsphere.controller;

import com.eventsphere.model.Boleto;
import com.eventsphere.model.Evento;
import com.eventsphere.model.Usuario;
import com.eventsphere.model.ValidacionQR;
import com.eventsphere.service.BoletoService;
import com.eventsphere.repository.EventoRepository;
import com.eventsphere.repository.UsuarioRepository;
import com.eventsphere.repository.ValidacionQRRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.LocalDate;
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
    
    @Autowired
    private com.eventsphere.service.QRService qrService;
    
    @Autowired
    private ValidacionQRRepository validacionQRRepository;
    
    @PostMapping("/comprar")
    public ResponseEntity<?> comprarBoleto(
            @RequestParam Long usuarioId,
            @RequestParam Long eventoId,
            @RequestParam(defaultValue = "1") Integer cantidad) {
        try {
            // Validar cantidad
            if (cantidad < 1 || cantidad > 10) {
                return ResponseEntity.badRequest().body("La cantidad debe estar entre 1 y 10 boletos");
            }
            
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            Evento evento = eventoRepository.findById(eventoId)
                    .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
            
            // Validar disponibilidad
            int disponibles = evento.getCapacidad() - evento.getEntradasVendidas();
            if (cantidad > disponibles) {
                return ResponseEntity.badRequest()
                    .body("Solo hay " + disponibles + " boletos disponibles");
            }
            
            // Comprar múltiples boletos
            List<Boleto> boletos = new java.util.ArrayList<>();
            for (int i = 0; i < cantidad; i++) {
                Boleto boleto = boletoService.comprarBoleto(usuario, evento);
                boletos.add(boleto);
            }
            
            // Si solo es 1 boleto, devolver el objeto, si son varios devolver la lista
            if (cantidad == 1) {
                return ResponseEntity.status(HttpStatus.CREATED).body(boletos.get(0));
            } else {
                return ResponseEntity.status(HttpStatus.CREATED).body(boletos);
            }
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
    
    /**
     * Genera la imagen QR en Base64 para un boleto
     */
    @GetMapping("/{id}/qr-image")
    public ResponseEntity<?> obtenerImagenQR(@PathVariable Long id) {
        try {
            Boleto boleto = boletoService.buscarPorId(id)
                    .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));
            
            String qrBase64 = qrService.generarQRBase64(boleto.getCodigoQR());
            
            return ResponseEntity.ok(new java.util.HashMap<String, String>() {{
                put("codigoQR", boleto.getCodigoQR());
                put("imagenQR", qrBase64);
            }});
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Valida un código QR y registra check-in
     */
    @PostMapping("/validar-qr")
    public ResponseEntity<?> validarQR(
            @RequestParam String codigoQR,
            @RequestParam Long organizadorId) {
        try {
            Boleto boleto = boletoService.validarQR(codigoQR, organizadorId);
            
            return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
                put("success", true);
                put("mensaje", "Boleto validado exitosamente");
                put("boleto", boleto);
                put("evento", boleto.getEvento().getTitulo());
                put("usuario", boleto.getUsuario().getNombre());
            }});
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new java.util.HashMap<String, Object>() {{
                put("success", false);
                put("mensaje", e.getMessage());
            }});
        }
    }
    
    /**
     * Obtener historial de validaciones de un usuario
     */
    @GetMapping("/validaciones/historial/{usuarioId}")
    public ResponseEntity<?> obtenerHistorialValidaciones(@PathVariable Long usuarioId) {
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            List<ValidacionQR> validaciones = validacionQRRepository
                    .findTop10ByValidadorOrderByFechaValidacionDesc(usuario);
            
            return ResponseEntity.ok(validaciones);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Obtener estadísticas de validaciones de hoy
     */
    @GetMapping("/validaciones/estadisticas/{usuarioId}")
    public ResponseEntity<?> obtenerEstadisticasHoy(@PathVariable Long usuarioId) {
        try {
            Usuario usuario = usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            
            LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
            
            Long exitosas = validacionQRRepository.contarExitosasHoy(usuario, inicioDia);
            Long rechazadas = validacionQRRepository.contarRechazadasHoy(usuario, inicioDia);
            
            return ResponseEntity.ok(new java.util.HashMap<String, Object>() {{
                put("exitosas", exitosas);
                put("rechazadas", rechazadas);
                put("total", exitosas + rechazadas);
            }});
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
