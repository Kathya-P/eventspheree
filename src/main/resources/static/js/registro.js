// Redirigir si ya está logueado
Utils.redirigirSiLogueado();

// Manejo del formulario de registro
document.getElementById('registroForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validar contraseñas
    if (password !== confirmPassword) {
        Utils.mostrarAlerta('alertContainer', 'Las contraseñas no coinciden', 'warning');
        return;
    }
    
    if (password.length < 6) {
        Utils.mostrarAlerta('alertContainer', 'La contraseña debe tener al menos 6 caracteres', 'warning');
        return;
    }
    
    // Crear usuario
    const usuario = {
        username: username,
        email: email,
        password: password,
        rol: 'USER'
    };
    
    try {
        const response = await UsuarioAPI.crear(usuario);
        
        if (response.ok) {
            const nuevoUsuario = await response.json();
            Utils.mostrarAlerta('alertContainer', '¡Registro exitoso! Redirigiendo...', 'success');
            
            // Guardar usuario y redirigir
            Utils.guardarUsuarioLocal(nuevoUsuario);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            const error = await response.text();
            Utils.mostrarAlerta('alertContainer', error || 'Error al registrar usuario', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        Utils.mostrarAlerta('alertContainer', 'Error de conexión. Intenta nuevamente.', 'danger');
    }
});
