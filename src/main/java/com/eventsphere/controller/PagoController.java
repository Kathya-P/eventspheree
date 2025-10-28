package com.eventsphere.controller;

import com.eventsphere.model.Pago;
import com.eventsphere.service.PagoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
     */
    @PostMapping("/procesar")
    public ResponseEntity<?> procesarPago(@RequestBody Map<String, Object> datosPago) {
        try {
            Long boletoId = Long.parseLong(datosPago.get("boletoId").toString());
            Long usuarioId = Long.parseLong(datosPago.get("usuarioId").toString());
            String metodoPago = datosPago.get("metodoPago").toString();
            BigDecimal monto = new BigDecimal(datosPago.get("monto").toString());
            String email = datosPago.get("email").toString();
            
            // Datos opcionales para tarjeta
            String tipoTarjeta = datosPago.get("tipoTarjeta") != null ? 
                                datosPago.get("tipoTarjeta").toString() : null;
            String ultimosDigitos = datosPago.get("ultimosDigitos") != null ? 
                                   datosPago.get("ultimosDigitos").toString() : null;
            
            Pago pago = pagoService.procesarPago(boletoId, usuarioId, metodoPago, 
                                                tipoTarjeta, ultimosDigitos, monto, email);
            
            return ResponseEntity.ok(pago);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", true,
                "mensaje", e.getMessage()
            ));
        }
    }
    
    /**
     * Buscar pago por referencia
     */
    @GetMapping("/referencia/{referencia}")
    public ResponseEntity<?> buscarPorReferencia(@PathVariable String referencia) {
        return pagoService.buscarPorReferencia(referencia)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Listar pagos de un usuario
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Pago>> listarPorUsuario(@PathVariable Long usuarioId) {
        List<Pago> pagos = pagoService.listarPorUsuario(usuarioId);
        return ResponseEntity.ok(pagos);
    }
    
    /**
     * Confirmar pago pendiente (para transferencias)
     */
    @PutMapping("/{pagoId}/confirmar")
    public ResponseEntity<?> confirmarPago(@PathVariable Long pagoId) {
        try {
            Pago pago = pagoService.confirmarPago(pagoId);
            return ResponseEntity.ok(pago);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", true,
                "mensaje", e.getMessage()
            ));
        }
    }
    
    /**
     * Cancelar pago
     */
    @PutMapping("/{pagoId}/cancelar")
    public ResponseEntity<?> cancelarPago(@PathVariable Long pagoId) {
        try {
            Pago pago = pagoService.cancelarPago(pagoId);
            return ResponseEntity.ok(pago);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", true,
                "mensaje", e.getMessage()
            ));
        }
    }
}
