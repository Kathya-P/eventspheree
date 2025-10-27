# Script PowerShell para actualizar la base de datos en Docker
# Agrega la columna 'asistio' a la tabla BOLETOS

Write-Host "Actualizando base de datos en contenedor Docker..." -ForegroundColor Cyan

$sqlScript = @"
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

UPDATE BOLETOS SET asistio = 0 WHERE asistio IS NULL;
COMMIT;

SELECT COUNT(*) as total_boletos FROM BOLETOS;
SELECT column_name, data_type, data_default 
FROM user_tab_columns 
WHERE table_name = 'BOLETOS' AND column_name = 'ASISTIO';

QUIT;
"@

# Ejecutar en el contenedor Docker
$sqlScript | docker exec -i oracle-xe sqlplus -s eventsphere/eventpass123@XE

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nBase de datos actualizada correctamente!" -ForegroundColor Green
} else {
    Write-Host "`nError al actualizar la base de datos" -ForegroundColor Red
}
