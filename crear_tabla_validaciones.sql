-- Script para crear la tabla VALIDACIONES_QR y sus secuencias

-- Crear secuencia
CREATE SEQUENCE VALIDACION_QR_SEQ START WITH 1 INCREMENT BY 1;

-- Crear tabla
CREATE TABLE VALIDACIONES_QR (
    id NUMBER(19) PRIMARY KEY,
    boleto_id NUMBER(19),
    validador_id NUMBER(19) NOT NULL,
    fecha_validacion TIMESTAMP NOT NULL,
    resultado VARCHAR2(20) NOT NULL,
    mensaje VARCHAR2(500),
    codigo_qr VARCHAR2(100) NOT NULL,
    CONSTRAINT fk_validacion_boleto FOREIGN KEY (boleto_id) REFERENCES BOLETOS(id),
    CONSTRAINT fk_validacion_validador FOREIGN KEY (validador_id) REFERENCES USUARIOS(id)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_validacion_validador ON VALIDACIONES_QR(validador_id);
CREATE INDEX idx_validacion_fecha ON VALIDACIONES_QR(fecha_validacion);
CREATE INDEX idx_validacion_resultado ON VALIDACIONES_QR(resultado);

-- Comentarios
COMMENT ON TABLE VALIDACIONES_QR IS 'Registro de todas las validaciones de QR realizadas';
COMMENT ON COLUMN VALIDACIONES_QR.resultado IS 'EXITOSO o RECHAZADO';
COMMENT ON COLUMN VALIDACIONES_QR.mensaje IS 'Mensaje de error si fue rechazado';

-- Verificar
SELECT table_name FROM user_tables WHERE table_name = 'VALIDACIONES_QR';
