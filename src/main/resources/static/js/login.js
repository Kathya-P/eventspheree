// Manejo del formulario de login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    try {
        // Buscar usuario por username
        const usuario = await UsuarioAPI.buscarPorUsername(username);
        
        if (usuario && usuario.password === password) {
            Utils.mostrarAlerta('alertContainer', '¡Bienvenido! Redirigiendo...', 'success');
            Utils.guardarUsuarioLocal(usuario);
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            Utils.mostrarAlerta('alertContainer', 'Usuario o contraseña incorrectos', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        Utils.mostrarAlerta('alertContainer', 'Error de conexión. Intenta nuevamente.', 'danger');
    }
});
