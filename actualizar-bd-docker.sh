#!/bin/bash
# Script para actualizar la base de datos en Docker con la nueva columna asistio

echo "Actualizando base de datos en contenedor Docker..."

# Conectar a Oracle y ejecutar el script
docker exec -i oracle-xe sqlplus eventsphere/eventpass123@XE <<EOF

-- Agregar columna asistio si no existe
DECLARE
    column_exists NUMBER := 0;
BEGIN
    SELECT COUNT(*) INTO column_exists
    FROM user_tab_columns
    WHERE table_name = 'BOLETOS' AND column_name = 'ASISTIO';
    
    IF column_exists = 0 THEN
        EXECUTE IMMEDIATE 'ALTER TABLE BOLETOS ADD asistio NUMBER(1) DEFAULT 0';
        DBMS_OUTPUT.PUT_LINE('Columna ASISTIO agregada exitosamente');
    ELSE
        DBMS_OUTPUT.PUT_LINE('La columna ASISTIO ya existe');
    END IF;
END;
/

-- Actualizar boletos existentes
UPDATE BOLETOS SET asistio = 0 WHERE asistio IS NULL;
COMMIT;

-- Verificar
SELECT COUNT(*) as total_boletos FROM BOLETOS;
SELECT column_name, data_type, data_default 
FROM user_tab_columns 
WHERE table_name = 'BOLETOS' AND column_name = 'ASISTIO';

QUIT;
EOF

echo "Base de datos actualizada correctamente!"
