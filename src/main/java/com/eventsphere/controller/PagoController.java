package com.eventsphere.controller;

import com.eventsphere.model.Pago;
import com.eventsphere.service.PagoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@CrossOrigin(origins = "*")
public class PagoController {
    
    @Autowired
    private PagoService pagoService;
    
    /**
     * Procesar un nuevo pago
     * POST /api/pagos/procesar
     */
    @PostMapping("/procesar")
    public ResponseEntity<?> procesarPago(@RequestBody Map<String, Object> request) {
        try {
            Long usuarioId = Long.valueOf(request.get("usuarioId").toString());
            Long boletoId = Long.valueOf(request.get("boletoId").toString());
            BigDecimal monto = new BigDecimal(request.get("monto").toString());
            String metodoPago = request.get("metodoPago").toString();
            String email = request.get("email") != null ? request.get("email").toString() : null;
            
            // Datos de tarjeta (si aplica)
            String tipoTarjeta = request.get("tipoTarjeta") != null ? request.get("tipoTarjeta").toString() : null;
            String ultimosDigitos = request.get("ultimosDigitos") != null ? request.get("ultimosDigitos").toString() : null;
            
            Pago pago = pagoService.procesarPago(
                boletoId,
                usuarioId, 
                metodoPago,
                tipoTarjeta,
                ultimosDigitos,
                monto,
                email
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("pago", pago);
            response.put("mensaje", "Pago procesado exitosamente");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Obtener pagos de un usuario
     * GET /api/pagos/usuario/{usuarioId}
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Pago>> obtenerPagosPorUsuario(@PathVariable Long usuarioId) {
        try {
            List<Pago> pagos = pagoService.obtenerPagosPorUsuario(usuarioId);
            return ResponseEntity.ok(pagos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Obtener un pago por su referencia
     * GET /api/pagos/referencia/{referencia}
     */
    @GetMapping("/referencia/{referencia}")
    public ResponseEntity<?> obtenerPagoPorReferencia(@PathVariable String referencia) {
        try {
            Pago pago = pagoService.obtenerPagoPorReferencia(referencia);
            return ResponseEntity.ok(pago);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Obtener todos los pagos de un usuario
     * GET /api/pagos/historial/{usuarioId}
     */
    @GetMapping("/historial/{usuarioId}")
    public ResponseEntity<List<Pago>> obtenerHistorialPagos(@PathVariable Long usuarioId) {
        try {
            List<Pago> pagos = pagoService.obtenerHistorialPagos(usuarioId);
            return ResponseEntity.ok(pagos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Verificar estado de un pago
     * GET /api/pagos/{id}/estado
     */
    @GetMapping("/{id}/estado")
    public ResponseEntity<?> verificarEstadoPago(@PathVariable Long id) {
        try {
            Pago pago = pagoService.obtenerPagoPorId(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", pago.getId());
            response.put("estado", pago.getEstado());
            response.put("referencia", pago.getReferenciaPago());
            response.put("monto", pago.getMonto());
            response.put("metodoPago", pago.getMetodoPago());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Pago no encontrado");
            return ResponseEntity.notFound().build();
        }
    }
}
