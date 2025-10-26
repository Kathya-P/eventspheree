package com.eventsphere.validator;

import com.eventsphere.model.Evento;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class EventoValidator {
    
    /**
     * Valida todos los campos de un evento
     * @return Lista de errores encontrados (vacía si no hay errores)
     */
    public List<String> validar(Evento evento) {
        List<String> errores = new ArrayList<>();
        
        // Validar título
        if (evento.getTitulo() == null || evento.getTitulo().trim().isEmpty()) {
            errores.add("El título es obligatorio");
        } else if (evento.getTitulo().length() < 5) {
            errores.add("El título debe tener al menos 5 caracteres");
        } else if (evento.getTitulo().length() > 200) {
            errores.add("El título no puede exceder 200 caracteres");
        }
        
        // Validar descripción
        if (evento.getDescripcion() == null || evento.getDescripcion().trim().isEmpty()) {
            errores.add("La descripción es obligatoria");
        } else if (evento.getDescripcion().length() < 20) {
            errores.add("La descripción debe tener al menos 20 caracteres");
        } else if (evento.getDescripcion().length() > 2000) {
            errores.add("La descripción no puede exceder 2000 caracteres");
        }
        
        // Validar fecha
        if (evento.getFechaEvento() == null) {
            errores.add("La fecha del evento es obligatoria");
        } else if (evento.getFechaEvento().isBefore(LocalDateTime.now())) {
            errores.add("La fecha del evento no puede ser en el pasado");
        } else if (evento.getFechaEvento().isAfter(LocalDateTime.now().plusYears(5))) {
            errores.add("La fecha del evento no puede ser mayor a 5 años en el futuro");
        }
        
        // Validar lugar
        if (evento.getLugar() == null || evento.getLugar().trim().isEmpty()) {
            errores.add("El lugar es obligatorio");
        } else if (evento.getLugar().length() > 200) {
            errores.add("El lugar no puede exceder 200 caracteres");
        }
        
        // Validar capacidad
        if (evento.getCapacidad() == null || evento.getCapacidad() <= 0) {
            errores.add("La capacidad debe ser mayor a 0");
        } else if (evento.getCapacidad() > 100000) {
            errores.add("La capacidad no puede exceder 100,000 personas");
        }
        
        // Validar entradas vendidas
        if (evento.getEntradasVendidas() != null && evento.getEntradasVendidas() < 0) {
            errores.add("Las entradas vendidas no pueden ser negativas");
        }
        
        if (evento.getEntradasVendidas() != null && evento.getCapacidad() != null 
                && evento.getEntradasVendidas() > evento.getCapacidad()) {
            errores.add("Las entradas vendidas no pueden exceder la capacidad");
        }
        
        // Validar precio
        if (evento.getPrecio() == null || evento.getPrecio().doubleValue() < 0) {
            errores.add("El precio debe ser mayor o igual a 0");
        } else if (evento.getPrecio().doubleValue() > 100000) {
            errores.add("El precio no puede exceder $100,000");
        }
        
        // Validar estado
        if (evento.getEstado() == null || evento.getEstado().trim().isEmpty()) {
            errores.add("El estado es obligatorio");
        } else {
            String estado = evento.getEstado().toUpperCase();
            if (!estado.equals("ACTIVO") && !estado.equals("CANCELADO") && !estado.equals("FINALIZADO")) {
                errores.add("El estado debe ser ACTIVO, CANCELADO o FINALIZADO");
            }
        }
        
        // Validar organizador
        if (evento.getOrganizador() == null) {
            errores.add("El organizador es obligatorio");
        }
        
        // Validar categoría
        if (evento.getCategoria() == null) {
            errores.add("La categoría es obligatoria");
        }
        
        return errores;
    }
    
    /**
     * Verifica si un evento es válido
     */
    public boolean esValido(Evento evento) {
        return validar(evento).isEmpty();
    }
    
    /**
     * Valida si un evento puede ser cancelado
     */
    public boolean puedeCancelarse(Evento evento) {
        if (evento == null) {
            return false;
        }
        
        // No se puede cancelar si ya está cancelado o finalizado
        if ("CANCELADO".equals(evento.getEstado()) || "FINALIZADO".equals(evento.getEstado())) {
            return false;
        }
        
        // No se puede cancelar si la fecha ya pasó
        if (evento.getFechaEvento().isBefore(LocalDateTime.now())) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Valida si un evento puede ser editado
     */
    public boolean puedeEditarse(Evento evento) {
        if (evento == null) {
            return false;
        }
        
        // No se puede editar si ya finalizó
        if ("FINALIZADO".equals(evento.getEstado())) {
            return false;
        }
        
        // No se puede editar si la fecha ya pasó
        if (evento.getFechaEvento().isBefore(LocalDateTime.now())) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Valida si se pueden comprar boletos para un evento
     */
    public boolean puedePurchasearse(Evento evento) {
        if (evento == null || !"ACTIVO".equals(evento.getEstado())) {
            return false;
        }
        
        // No se pueden comprar boletos si la fecha ya pasó
        if (evento.getFechaEvento().isBefore(LocalDateTime.now())) {
            return false;
        }
        
        // No se pueden comprar si no hay capacidad
        if (evento.getEntradasVendidas() >= evento.getCapacidad()) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Calcula cuántos boletos están disponibles
     */
    public int calcularBoletosDisponibles(Evento evento) {
        if (evento == null) {
            return 0;
        }
        return Math.max(0, evento.getCapacidad() - evento.getEntradasVendidas());
    }
}
