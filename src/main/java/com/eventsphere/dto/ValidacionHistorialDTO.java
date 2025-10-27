package com.eventsphere.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ValidacionHistorialDTO {
    private String tipo; // "success" o "error"
    private String mensaje;
    private String usuario; // Nombre del que compró el boleto
    private String evento; // Nombre del evento
    private LocalDateTime fecha;
    private String codigoQR;
    
    public ValidacionHistorialDTO(String resultado, String mensaje, 
                                   String nombreUsuario, String nombreEvento, 
                                   LocalDateTime fechaValidacion, String codigoQR) {
        this.tipo = "EXITOSO".equals(resultado) ? "success" : "error";
        this.mensaje = mensaje;
        this.usuario = nombreUsuario != null ? nombreUsuario : "Desconocido";
        this.evento = nombreEvento != null ? nombreEvento : "Sin evento";
        this.fecha = fechaValidacion;
        this.codigoQR = codigoQR;
    }
}
