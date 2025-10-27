package com.eventsphere.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

@Service
public class QRService {
    
    private static final int QR_CODE_WIDTH = 300;
    private static final int QR_CODE_HEIGHT = 300;
    
    /**
     * Genera un código QR como imagen en Base64
     * @param contenido El contenido a codificar en el QR (código del boleto)
     * @return String con la imagen QR en formato Base64
     */
    public String generarQRBase64(String contenido) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(
                contenido, 
                BarcodeFormat.QR_CODE, 
                QR_CODE_WIDTH, 
                QR_CODE_HEIGHT
            );
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            byte[] qrBytes = outputStream.toByteArray();
            
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(qrBytes);
            
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Error al generar código QR", e);
        }
    }
    
    /**
     * Genera un código único para el boleto
     * @param boletoId ID del boleto
     * @param usuarioId ID del usuario
     * @param eventoId ID del evento
     * @return String con el código único
     */
    public String generarCodigoUnico(Long boletoId, Long usuarioId, Long eventoId) {
        long timestamp = System.currentTimeMillis();
        return String.format("EVT-%d-%d-%d-%d", eventoId, usuarioId, boletoId, timestamp);
    }
}
