package com.eventsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasEventoDTO {
    private Long eventoId;
    private String tituloEvento;
    private Integer totalBoletos;
    private Integer boletosVendidos;
    private Integer boletosDisponibles;
    private Double porcentajeOcupacion;
    private BigDecimal ingresosTotales;
    private Integer totalResenas;
    private Double promedioCalificacion;
    private Integer totalFotos;
    private Integer totalMensajes;
    private String estadoEvento;
}
