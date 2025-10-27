-- Script para agregar la columna asistio a la tabla BOLETOS
-- Ejecutar este script en tu base de datos Oracle

-- Agregar columna asistio
ALTER TABLE BOLETOS ADD asistio NUMBER(1) DEFAULT 0;

-- Comentario de la columna
COMMENT ON COLUMN BOLETOS.asistio IS 'Indica si el usuario asistió al evento (0=No, 1=Sí)';

-- Verificar que se agregó correctamente
SELECT column_name, data_type, data_default 
FROM user_tab_columns 
WHERE table_name = 'BOLETOS' AND column_name = 'ASISTIO';

-- Actualizar boletos existentes (opcional)
UPDATE BOLETOS SET asistio = 0 WHERE asistio IS NULL;
COMMIT;
