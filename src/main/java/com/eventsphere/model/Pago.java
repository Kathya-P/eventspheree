package com.eventsphere.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
public class Pago {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "boleto_id")
    private Boleto boleto;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    
    @Column(nullable = false)
    private BigDecimal monto;
    
    @Column(name = "metodo_pago", nullable = false)
    private String metodoPago; // TARJETA, PAYPAL, TRANSFERENCIA
    
    @Column(name = "tipo_tarjeta")
    private String tipoTarjeta; // VISA, MASTERCARD, AMEX, null si no es tarjeta
    
    @Column(name = "ultimos_digitos")
    private String ultimosDigitos; // Solo últimos 4 dígitos: "1234"
    
    @Column(nullable = false)
    private String estado; // APROBADO, RECHAZADO, PENDIENTE, CANCELADO
    
    @Column(name = "referencia_pago", unique = true, nullable = false)
    private String referenciaPago; // Código único de transacción
    
    @Column(name = "mensaje_error")
    private String mensajeError; // Si fue rechazado, razón del rechazo
    
    @Column(name = "fecha_pago", nullable = false)
    private LocalDateTime fechaPago;
    
    @Column(name = "email_confirmacion")
    private String emailConfirmacion; // Email al que se envió la confirmación
    
    // Constructores
    public Pago() {
        this.fechaPago = LocalDateTime.now();
        this.estado = "PENDIENTE";
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Boleto getBoleto() {
        return boleto;
    }
    
    public void setBoleto(Boleto boleto) {
        this.boleto = boleto;
    }
    
    public Usuario getUsuario() {
        return usuario;
    }
    
    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }
    
    public BigDecimal getMonto() {
        return monto;
    }
    
    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }
    
    public String getMetodoPago() {
        return metodoPago;
    }
    
    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }
    
    public String getTipoTarjeta() {
        return tipoTarjeta;
    }
    
    public void setTipoTarjeta(String tipoTarjeta) {
        this.tipoTarjeta = tipoTarjeta;
    }
    
    public String getUltimosDigitos() {
        return ultimosDigitos;
    }
    
    public void setUltimosDigitos(String ultimosDigitos) {
        this.ultimosDigitos = ultimosDigitos;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public String getReferenciaPago() {
        return referenciaPago;
    }
    
    public void setReferenciaPago(String referenciaPago) {
        this.referenciaPago = referenciaPago;
    }
    
    public String getMensajeError() {
        return mensajeError;
    }
    
    public void setMensajeError(String mensajeError) {
        this.mensajeError = mensajeError;
    }
    
    public LocalDateTime getFechaPago() {
        return fechaPago;
    }
    
    public void setFechaPago(LocalDateTime fechaPago) {
        this.fechaPago = fechaPago;
    }
    
    public String getEmailConfirmacion() {
        return emailConfirmacion;
    }
    
    public void setEmailConfirmacion(String emailConfirmacion) {
        this.emailConfirmacion = emailConfirmacion;
    }
}
