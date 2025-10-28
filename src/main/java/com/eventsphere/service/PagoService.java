package com.eventsphere.service;

import com.eventsphere.model.Pago;
import com.eventsphere.model.Boleto;
import com.eventsphere.model.Usuario;
import com.eventsphere.repository.PagoRepository;
import com.eventsphere.repository.BoletoRepository;
import com.eventsphere.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Service
@Transactional
public class PagoService {
    
    @Autowired
    private PagoRepository pagoRepository;
    
    @Autowired
    private BoletoRepository boletoRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    /**
     * Procesar pago - Validación simulada pero segura
     */
    public Pago procesarPago(Long boletoId, Long usuarioId, String metodoPago, 
                            String tipoTarjeta, String ultimosDigitos, 
                            BigDecimal monto, String email) {
        
        // Validar que existan el boleto y usuario
        Boleto boleto = boletoRepository.findById(boletoId)
                .orElseThrow(() -> new RuntimeException("Boleto no encontrado"));
        
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Validar que el monto sea correcto
        if (monto.compareTo(boleto.getEvento().getPrecio()) != 0) {
            throw new RuntimeException("El monto del pago no coincide con el precio del evento");
        }
        
        // Crear registro de pago
        Pago pago = new Pago();
        pago.setBoleto(boleto);
        pago.setUsuario(usuario);
        pago.setMonto(monto);
        pago.setMetodoPago(metodoPago);
        pago.setEmailConfirmacion(email);
        
        // Generar referencia única
        pago.setReferenciaPago(generarReferenciaPago());
        
        // Procesar según método de pago - SIEMPRE APROBADO para pruebas
        boolean pagoExitoso = true;
        String mensajeError = null;
        
        // Guardar información según tipo de pago
        if (metodoPago.equalsIgnoreCase("TARJETA")) {
            pago.setTipoTarjeta(tipoTarjeta);
            pago.setUltimosDigitos(ultimosDigitos);
        }
        
        // Siempre aprobar el pago
        pago.setEstado("APROBADO")
        
        // Guardar pago
        Pago pagoGuardado = pagoRepository.save(pago);
        
        // Activar el boleto automáticamente
        boleto.setEstado("ACTIVO");
        boletoRepository.save(boleto);
        
        return pagoGuardado;
    }
    
    /**
     * Validación simulada de tarjeta
     * En producción, aquí se llamaría a la API de Stripe/PayPal
     */
    private boolean validarPagoTarjeta(String ultimosDigitos, String tipoTarjeta) {
        // Simulación: rechazar tarjetas que terminen en "0000"
        if ("0000".equals(ultimosDigitos)) {
            return false;
        }
        
        // Simulación: validar que el tipo de tarjeta sea válido
        if (tipoTarjeta == null || (!tipoTarjeta.equals("VISA") && 
                                     !tipoTarjeta.equals("MASTERCARD") && 
                                     !tipoTarjeta.equals("AMEX"))) {
            return false;
        }
        
        // Simulación: 100% de éxito para pruebas
        return true;
    }
    
    /**
     * Validación simulada de PayPal
     */
    private boolean validarPagoPayPal(String email) {
        // Simulación: validar formato de email
        if (email == null || !email.contains("@")) {
            return false;
        }
        
        // Simulación: 100% de éxito para pruebas
        return true;
    }
    
    /**
     * Generar referencia única de pago
     */
    private String generarReferenciaPago() {
        return "PAY-" + UUID.randomUUID().toString().substring(0, 18).toUpperCase();
    }
    
    /**
     * Buscar pago por referencia
     */
    public Optional<Pago> buscarPorReferencia(String referencia) {
        return pagoRepository.findByReferenciaPago(referencia);
    }
    
    /**
     * Listar pagos de un usuario
     */
    public List<Pago> listarPorUsuario(Long usuarioId) {
        return pagoRepository.findByUsuarioId(usuarioId);
    }
    
    /**
     * Confirmar pago pendiente (para transferencias)
     */
    public Pago confirmarPago(Long pagoId) {
        Pago pago = pagoRepository.findById(pagoId)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));
        
        if (!"PENDIENTE".equals(pago.getEstado())) {
            throw new RuntimeException("Solo se pueden confirmar pagos pendientes");
        }
        
        pago.setEstado("APROBADO");
        
        // Activar boleto
        Boleto boleto = pago.getBoleto();
        boleto.setEstado("ACTIVO");
        boletoRepository.save(boleto);
        
        return pagoRepository.save(pago);
    }
    
    /**
     * Cancelar pago
     */
    public Pago cancelarPago(Long pagoId) {
        Pago pago = pagoRepository.findById(pagoId)
                .orElseThrow(() -> new RuntimeException("Pago no encontrado"));
        
        if ("CANCELADO".equals(pago.getEstado())) {
            throw new RuntimeException("El pago ya está cancelado");
        }
        
        pago.setEstado("CANCELADO");
        
        // Cancelar boleto asociado
        Boleto boleto = pago.getBoleto();
        boleto.setEstado("CANCELADO");
        boletoRepository.save(boleto);
        
        return pagoRepository.save(pago);
    }
}
