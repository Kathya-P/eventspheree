package com.eventsphere.service;

import com.eventsphere.model.Boleto;
import com.eventsphere.model.Usuario;
import com.eventsphere.model.Evento;
import com.eventsphere.repository.BoletoRepository;
import com.eventsphere.repository.EventoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BoletoService {
    
    @Autowired
    private BoletoRepository boletoRepository;
    
    @Autowired
    private EventoRepository eventoRepository;
    
    @Autowired
    private QRService qrService;
    
    public Boleto comprarBoleto(Usuario usuario, Evento evento) {
        // Validaciones
        if (!evento.getEstado().equals("ACTIVO")) {
            throw new RuntimeException("El evento no está disponible");
        }
        
        if (evento.getFechaEvento().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El evento ya pasó");
        }
        
        if (evento.getEntradasVendidas() >= evento.getCapacidad()) {
            throw new RuntimeException("No hay entradas disponibles");
        }
        
        // Permitir múltiples boletos por usuario
        // Comentado: if (boletoRepository.existsByUsuarioAndEvento(usuario, evento)) {
        //     throw new RuntimeException("Ya tienes un boleto para este evento");
        // }
        
        // Crear boleto
        Boleto boleto = new Boleto();
        boleto.setUsuario(usuario);
        boleto.setEvento(evento);
        boleto.setEstado("ACTIVO");
        
        // Guardar primero para obtener el ID
        boleto = boletoRepository.save(boleto);
        
        // Generar código QR único después de tener el ID
        String codigoUnico = qrService.generarCodigoUnico(
            boleto.getId(), 
            usuario.getId(), 
            evento.getId()
        );
        boleto.setCodigoQR(codigoUnico);
        
        // Actualizar entradas vendidas
        evento.setEntradasVendidas(evento.getEntradasVendidas() + 1);
        eventoRepository.save(evento);
        
        return boletoRepository.save(boleto);
    }
    
    public Optional<Boleto> buscarPorId(Long id) {
        return boletoRepository.findById(id);
    }
    
    public Optional<Boleto> buscarPorCodigoQR(String codigoQR) {
        return boletoRepository.findByCodigoQR(codigoQR);
    }
    
    public List<Boleto> listarPorUsuario(Usuario usuario) {
        return boletoRepository.findByUsuario(usuario);
    }
    
    public List<Boleto> listarPorEvento(Evento evento) {
        return boletoRepository.findByEvento(evento);
    }
    
    public Boleto usarBoleto(String codigoQR) {
        Boleto boleto = boletoRepository.findByCodigoQR(codigoQR)
                .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));
        
        if (!boleto.getEstado().equals("ACTIVO")) {
            throw new RuntimeException("El boleto ya fue usado o está cancelado");
        }
        
        boleto.setEstado("USADO");
        boleto.setFechaUso(LocalDateTime.now());
        return boletoRepository.save(boleto);
    }
    
    /**
     * Valida un QR y registra el check-in (asistencia)
     */
    public Boleto validarQR(String codigoQR, Long organizadorId) {
        Boleto boleto = boletoRepository.findByCodigoQR(codigoQR)
                .orElseThrow(() -> new RuntimeException("Código QR inválido"));
        
        // Verificar que el organizador sea el dueño del evento
        if (!boleto.getEvento().getOrganizador().getId().equals(organizadorId)) {
            throw new RuntimeException("No tienes permiso para validar este boleto");
        }
        
        // Verificar que el boleto esté activo
        if (!boleto.getEstado().equals("ACTIVO")) {
            throw new RuntimeException("Este boleto ya fue usado o está cancelado");
        }
        
        // Verificar que no haya asistido ya
        if (Boolean.TRUE.equals(boleto.getAsistio())) {
            throw new RuntimeException("Este boleto ya fue validado anteriormente");
        }
        
        // Registrar asistencia
        boleto.setAsistio(true);
        boleto.setFechaUso(LocalDateTime.now());
        boleto.setEstado("USADO");
        
        return boletoRepository.save(boleto);
    }
    
    public void cancelarBoleto(Long id) {
        Boleto boleto = boletoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));
        
        if (!boleto.getEstado().equals("ACTIVO")) {
            throw new RuntimeException("El boleto no puede ser cancelado");
        }
        
        boleto.setEstado("CANCELADO");
        boletoRepository.save(boleto);
        
        // Liberar entrada
        Evento evento = boleto.getEvento();
        evento.setEntradasVendidas(evento.getEntradasVendidas() - 1);
        eventoRepository.save(evento);
    }
}
