package com.eventsphere.controller;

import com.eventsphere.dto.EstadisticasEventoDTO;
import com.eventsphere.service.EstadisticasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/estadisticas")
@CrossOrigin(origins = "*")
public class EstadisticasController {
    
    @Autowired
    private EstadisticasService estadisticasService;
    
    @GetMapping("/evento/{id}")
    public ResponseEntity<EstadisticasEventoDTO> obtenerEstadisticasEvento(@PathVariable Long id) {
        try {
            EstadisticasEventoDTO stats = estadisticasService.obtenerEstadisticasEvento(id);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/organizador/{id}")
    public ResponseEntity<List<EstadisticasEventoDTO>> obtenerEstadisticasOrganizador(@PathVariable Long id) {
        List<EstadisticasEventoDTO> stats = estadisticasService.obtenerEstadisticasPorOrganizador(id);
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/organizador/{id}/ingresos")
    public ResponseEntity<BigDecimal> obtenerIngresosTotales(@PathVariable Long id) {
        BigDecimal ingresos = estadisticasService.calcularIngresosTotalesOrganizador(id);
        return ResponseEntity.ok(ingresos);
    }
    
    @GetMapping("/evento-mas-popular")
    public ResponseEntity<EstadisticasEventoDTO> obtenerEventoMasPopular() {
        EstadisticasEventoDTO evento = estadisticasService.obtenerEventoMasPopular();
        if (evento != null) {
            return ResponseEntity.ok(evento);
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/ocupacion-promedio")
    public ResponseEntity<Double> obtenerOcupacionPromedio() {
        Double ocupacion = estadisticasService.calcularOcupacionPromedioGeneral();
        return ResponseEntity.ok(ocupacion);
    }
}
