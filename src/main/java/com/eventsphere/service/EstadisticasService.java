package com.eventsphere.service;

import com.eventsphere.dto.EstadisticasEventoDTO;
import com.eventsphere.model.Evento;
import com.eventsphere.repository.EventoRepository;
import com.eventsphere.repository.BoletoRepository;
import com.eventsphere.repository.ResenaRepository;
import com.eventsphere.repository.FotoRepository;
import com.eventsphere.repository.MensajeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class EstadisticasService {
    
    @Autowired
    private EventoRepository eventoRepository;
    
    @Autowired
    private BoletoRepository boletoRepository;
    
    @Autowired
    private ResenaRepository resenaRepository;
    
    @Autowired
    private FotoRepository fotoRepository;
    
    @Autowired
    private MensajeRepository mensajeRepository;
    
    /**
     * Obtiene estadísticas completas de un evento específico
     */
    public EstadisticasEventoDTO obtenerEstadisticasEvento(Long eventoId) {
        Evento evento = eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
        
        EstadisticasEventoDTO stats = new EstadisticasEventoDTO();
        stats.setEventoId(evento.getId());
        stats.setTituloEvento(evento.getTitulo());
        stats.setEstadoEvento(evento.getEstado());
        
        // Estadísticas de boletos
        int boletosVendidos = evento.getEntradasVendidas();
        int capacidad = evento.getCapacidad();
        int disponibles = capacidad - boletosVendidos;
        double porcentaje = capacidad > 0 ? (boletosVendidos * 100.0 / capacidad) : 0;
        
        stats.setTotalBoletos(capacidad);
        stats.setBoletosVendidos(boletosVendidos);
        stats.setBoletosDisponibles(disponibles);
        stats.setPorcentajeOcupacion(Math.round(porcentaje * 100.0) / 100.0);
        
        // Ingresos totales
        BigDecimal ingresos = evento.getPrecio().multiply(new BigDecimal(boletosVendidos));
        stats.setIngresosTotales(ingresos);
        
        // Estadísticas de reseñas
        List<Object[]> resenas = resenaRepository.findByEventoId(eventoId);
        stats.setTotalResenas(resenas.size());
        
        if (!resenas.isEmpty()) {
            double promedio = resenas.stream()
                    .mapToInt(r -> (Integer) r[3]) // calificacion
                    .average()
                    .orElse(0.0);
            stats.setPromedioCalificacion(Math.round(promedio * 10.0) / 10.0);
        } else {
            stats.setPromedioCalificacion(0.0);
        }
        
        // Estadísticas de fotos
        stats.setTotalFotos((int) fotoRepository.countByEventoId(eventoId));
        
        // Estadísticas de mensajes
        stats.setTotalMensajes((int) mensajeRepository.countByEventoId(eventoId));
        
        return stats;
    }
    
    /**
     * Obtiene estadísticas de todos los eventos de un organizador
     */
    public List<EstadisticasEventoDTO> obtenerEstadisticasPorOrganizador(Long organizadorId) {
        List<Evento> eventos = eventoRepository.findByOrganizadorId(organizadorId);
        
        return eventos.stream()
                .map(evento -> obtenerEstadisticasEvento(evento.getId()))
                .collect(Collectors.toList());
    }
    
    /**
     * Calcula el total de ingresos de un organizador
     */
    public BigDecimal calcularIngresosTotalesOrganizador(Long organizadorId) {
        List<EstadisticasEventoDTO> estadisticas = obtenerEstadisticasPorOrganizador(organizadorId);
        
        return estadisticas.stream()
                .map(EstadisticasEventoDTO::getIngresosTotales)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    /**
     * Obtiene el evento más popular (mayor porcentaje de ocupación)
     */
    public EstadisticasEventoDTO obtenerEventoMasPopular() {
        List<Evento> todosEventos = eventoRepository.findAll();
        
        return todosEventos.stream()
                .map(evento -> obtenerEstadisticasEvento(evento.getId()))
                .max((e1, e2) -> Double.compare(e1.getPorcentajeOcupacion(), e2.getPorcentajeOcupacion()))
                .orElse(null);
    }
    
    /**
     * Calcula la ocupación promedio de todos los eventos activos
     */
    public Double calcularOcupacionPromedioGeneral() {
        List<Evento> eventosActivos = eventoRepository.findByEstado("ACTIVO");
        
        if (eventosActivos.isEmpty()) {
            return 0.0;
        }
        
        double sumaOcupacion = eventosActivos.stream()
                .mapToDouble(evento -> {
                    int vendidos = evento.getEntradasVendidas();
                    int capacidad = evento.getCapacidad();
                    return capacidad > 0 ? (vendidos * 100.0 / capacidad) : 0;
                })
                .sum();
        
        return Math.round((sumaOcupacion / eventosActivos.size()) * 100.0) / 100.0;
    }
}
