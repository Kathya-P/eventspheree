// Modal de Pago - Manejo de métodos de pago seguros

class ModalPago {
    constructor(evento, usuario, cantidad = 1) {
        this.evento = evento;
        this.usuario = usuario;
        this.cantidad = cantidad;
        this.montoTotal = evento.precio * cantidad;
        this.metodoPagoSeleccionado = 'TARJETA';
    }

    mostrar() {
        const modalHTML = `
            <div class="modal fade" id="modalPago" tabindex="-1" data-bs-backdrop="static">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title">
                                <i class="bi bi-credit-card"></i> Completar Pago
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Resumen de compra -->
                            <div class="card bg-light mb-4">
                                <div class="card-body">
                                    <h6 class="card-title text-primary">
                                        <i class="bi bi-cart3"></i> Resumen de Compra
                                    </h6>
                                    <div class="row">
                                        <div class="col-md-8">
                                            <p class="mb-1"><strong>${this.evento.titulo}</strong></p>
                                            <p class="mb-1 text-muted small">
                                                <i class="bi bi-calendar3"></i> ${Utils.formatearFecha(this.evento.fechaEvento)}
                                            </p>
                                            <p class="mb-0 text-muted small">
                                                <i class="bi bi-ticket-perforated"></i> Cantidad: ${this.cantidad} boleto(s)
                                            </p>
                                        </div>
                                        <div class="col-md-4 text-end">
                                            <h4 class="text-success mb-0">${Utils.formatearPrecio(this.montoTotal)}</h4>
                                            <small class="text-muted">Total a pagar</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Selección de método de pago -->
                            <h6 class="mb-3">
                                <i class="bi bi-wallet2"></i> Método de Pago
                            </h6>
                            <div class="btn-group w-100 mb-4" role="group">
                                <input type="radio" class="btn-check" name="metodoPago" id="metodoTarjeta" value="TARJETA" checked>
                                <label class="btn btn-outline-primary" for="metodoTarjeta">
                                    <i class="bi bi-credit-card"></i> Tarjeta
                                </label>

                                <input type="radio" class="btn-check" name="metodoPago" id="metodoPayPal" value="PAYPAL">
                                <label class="btn btn-outline-primary" for="metodoPayPal">
                                    <i class="bi bi-paypal"></i> PayPal
                                </label>

                                <input type="radio" class="btn-check" name="metodoPago" id="metodoTransferencia" value="TRANSFERENCIA">
                                <label class="btn btn-outline-primary" for="metodoTransferencia">
                                    <i class="bi bi-bank"></i> Transferencia
                                </label>
                            </div>

                            <!-- Formulario de pago -->
                            <div id="formPagoContainer">
                                ${this.generarFormularioTarjeta()}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                Cancelar
                            </button>
                            <button type="button" class="btn btn-success btn-lg" id="btnConfirmarPago">
                                <i class="bi bi-check-circle"></i> Pagar ${Utils.formatearPrecio(this.montoTotal)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Eliminar modal existente si hay
        const modalExistente = document.getElementById('modalPago');
        if (modalExistente) {
            modalExistente.remove();
        }

        // Insertar modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Inicializar eventos
        this.inicializarEventos();

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('modalPago'));
        modal.show();
    }

    generarFormularioTarjeta() {
        return `
            <div id="formTarjeta">
                <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label">Número de Tarjeta</label>
                        <input type="text" class="form-control" id="numeroTarjeta" 
                               placeholder="1234 5678 9012 3456" maxlength="19" required>
                        <div class="invalid-feedback">Ingresa un número de tarjeta válido</div>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Nombre del Titular</label>
                        <input type="text" class="form-control" id="nombreTitular" 
                               placeholder="Como aparece en la tarjeta" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Fecha de Expiración</label>
                        <input type="text" class="form-control" id="fechaExpiracion" 
                               placeholder="MM/AA" maxlength="5" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">CVV</label>
                        <input type="password" class="form-control" id="cvv" 
                               placeholder="123" maxlength="4" required>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Email para Confirmación</label>
                        <input type="email" class="form-control" id="emailConfirmacion" 
                               value="${this.usuario.email}" required>
                    </div>
                </div>
            </div>
        `;
    }

    generarFormularioPayPal() {
        return `
            <div id="formPayPal">
                <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label">Email de PayPal</label>
                        <input type="email" class="form-control" id="emailPayPal" 
                               value="${this.usuario.email}" required>
                        <small class="text-muted">
                            Usa el email asociado a tu cuenta de PayPal
                        </small>
                    </div>
                </div>
            </div>
        `;
    }

    generarFormularioTransferencia() {
        return `
            <div id="formTransferencia">
                <div class="alert alert-warning">
                    <h6><i class="bi bi-info-circle"></i> Instrucciones de Transferencia</h6>
                    <p class="mb-2">Por favor realiza la transferencia a:</p>
                    <ul class="mb-0">
                        <li><strong>Banco:</strong> Banco Nacional</li>
                        <li><strong>Cuenta:</strong> 1234-5678-9012-3456</li>
                        <li><strong>CLABE:</strong> 012345678901234567</li>
                        <li><strong>Titular:</strong> EventSphere</li>
                        <li><strong>Monto:</strong> ${Utils.formatearPrecio(this.montoTotal)}</li>
                    </ul>
                </div>
                <div class="row g-3">
                    <div class="col-12">
                        <label class="form-label">Número de Referencia (opcional)</label>
                        <input type="text" class="form-control" id="referenciaTransferencia" 
                               placeholder="Referencia de tu transferencia">
                        <small class="text-muted">
                            Tu boleto se activará una vez confirmemos el pago (24-48 hrs)
                        </small>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Email para Confirmación</label>
                        <input type="email" class="form-control" id="emailConfirmacion" 
                               value="${this.usuario.email}" required>
                    </div>
                </div>
            </div>
        `;
    }

    inicializarEventos() {
        // Cambiar formulario según método de pago
        document.querySelectorAll('input[name="metodoPago"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.metodoPagoSeleccionado = e.target.value;
                const container = document.getElementById('formPagoContainer');
                
                switch(e.target.value) {
                    case 'TARJETA':
                        container.innerHTML = this.generarFormularioTarjeta();
                        this.inicializarValidacionTarjeta();
                        break;
                    case 'PAYPAL':
                        container.innerHTML = this.generarFormularioPayPal();
                        break;
                    case 'TRANSFERENCIA':
                        container.innerHTML = this.generarFormularioTransferencia();
                        break;
                }
            });
        });

        // Inicializar validación de tarjeta
        this.inicializarValidacionTarjeta();

        // Botón confirmar pago
        document.getElementById('btnConfirmarPago').addEventListener('click', () => {
            this.procesarPago();
        });
    }

    inicializarValidacionTarjeta() {
        const numeroTarjeta = document.getElementById('numeroTarjeta');
        if (numeroTarjeta) {
            // Formatear número de tarjeta
            numeroTarjeta.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });

            // Validar solo números
            numeroTarjeta.addEventListener('keypress', (e) => {
                if (!/[0-9\s]/.test(e.key)) {
                    e.preventDefault();
                }
            });
        }

        const fechaExpiracion = document.getElementById('fechaExpiracion');
        if (fechaExpiracion) {
            fechaExpiracion.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                }
                e.target.value = value;
            });
        }

        const cvv = document.getElementById('cvv');
        if (cvv) {
            cvv.addEventListener('keypress', (e) => {
                if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                }
            });
        }
    }

    async procesarPago() {
        const btnPagar = document.getElementById('btnConfirmarPago');
        btnPagar.disabled = true;
        btnPagar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Procesando...';

        try {
            // Primero crear el boleto
            const responseBoleto = await BoletoAPI.comprar(this.usuario.id, this.evento.id, this.cantidad);
            
            if (!responseBoleto.ok) {
                throw new Error('Error al crear el boleto');
            }

            const boleto = await responseBoleto.json();

            // Preparar datos de pago según método
            let datosPago = {
                boletoId: boleto.id,
                usuarioId: this.usuario.id,
                metodoPago: this.metodoPagoSeleccionado,
                monto: this.montoTotal,
                email: document.getElementById('emailConfirmacion')?.value || this.usuario.email
            };

            // Agregar datos específicos según método
            if (this.metodoPagoSeleccionado === 'TARJETA') {
                const numeroTarjeta = document.getElementById('numeroTarjeta').value.replace(/\s/g, '');
                
                if (!this.validarNumeroTarjeta(numeroTarjeta)) {
                    throw new Error('Número de tarjeta inválido');
                }

                datosPago.tipoTarjeta = this.detectarTipoTarjeta(numeroTarjeta);
                datosPago.ultimosDigitos = numeroTarjeta.slice(-4);
            }

            // Procesar pago
            const resultadoPago = await PagoAPI.procesar(datosPago);

            if (resultadoPago.error) {
                throw new Error(resultadoPago.mensaje);
            }

            // Cerrar modal
            bootstrap.Modal.getInstance(document.getElementById('modalPago')).hide();

            // Mostrar resultado
            this.mostrarResultadoPago(resultadoPago);

        } catch (error) {
            console.error('Error al procesar pago:', error);
            alert('Error al procesar el pago: ' + error.message);
            btnPagar.disabled = false;
            btnPagar.innerHTML = '<i class="bi bi-check-circle"></i> Pagar ' + Utils.formatearPrecio(this.montoTotal);
        }
    }

    validarNumeroTarjeta(numero) {
        // Validación básica de longitud
        if (numero.length < 13 || numero.length > 19) {
            return false;
        }

        // Algoritmo de Luhn
        let sum = 0;
        let isEven = false;
        
        for (let i = numero.length - 1; i >= 0; i--) {
            let digit = parseInt(numero[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }

    detectarTipoTarjeta(numero) {
        if (numero.startsWith('4')) return 'VISA';
        if (numero.startsWith('5')) return 'MASTERCARD';
        if (numero.startsWith('37') || numero.startsWith('34')) return 'AMEX';
        return 'OTRA';
    }

    mostrarResultadoPago(pago) {
        const estadoClass = pago.estado === 'APROBADO' ? 'success' : 
                           pago.estado === 'PENDIENTE' ? 'warning' : 'danger';
        
        const icono = pago.estado === 'APROBADO' ? 'check-circle' : 
                     pago.estado === 'PENDIENTE' ? 'clock' : 'x-circle';

        const mensaje = pago.estado === 'APROBADO' ? 
            '¡Pago aprobado! Tu boleto ha sido generado con éxito.' :
            pago.estado === 'PENDIENTE' ?
            'Pago pendiente de confirmación. Te notificaremos cuando se confirme.' :
            'Pago rechazado: ' + (pago.mensajeError || 'Intenta con otro método de pago');

        const resultadoHTML = `
            <div class="modal fade" id="modalResultado" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-body text-center py-5">
                            <i class="bi bi-${icono} display-1 text-${estadoClass}"></i>
                            <h4 class="mt-4">${mensaje}</h4>
                            ${pago.estado === 'APROBADO' ? `
                                <p class="text-muted">Referencia: <code>${pago.referenciaPago}</code></p>
                                <div class="d-grid gap-2 mt-4">
                                    <a href="mi-perfil.html" class="btn btn-primary">
                                        <i class="bi bi-ticket"></i> Ver Mis Boletos
                                    </a>
                                    <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                        Seguir Explorando
                                    </button>
                                </div>
                            ` : `
                                <button class="btn btn-primary mt-4" data-bs-dismiss="modal">
                                    Entendido
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', resultadoHTML);
        const modal = new bootstrap.Modal(document.getElementById('modalResultado'));
        modal.show();

        // Limpiar al cerrar
        document.getElementById('modalResultado').addEventListener('hidden.bs.modal', function() {
            this.remove();
            if (pago.estado === 'APROBADO') {
                window.location.reload();
            }
        });
    }
}
