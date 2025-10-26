// Manejo del navbar según el estado de sesión

function actualizarNavbar() {
    const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
    const navbarNav = document.querySelector('#navbarNav .navbar-nav');
    
    if (!navbarNav) return;
    
    // Remover items de login/registro si existen
    const loginItem = navbarNav.querySelector('[href="login.html"]')?.parentElement;
    const registroItem = navbarNav.querySelector('[href="registro.html"]')?.parentElement;
    
    if (usuario) {
        // Usuario logueado - Mostrar nombre y cerrar sesión
        if (loginItem) loginItem.remove();
        if (registroItem) registroItem.remove();
        
        // Verificar si ya existe el item de usuario para no duplicarlo
        if (!navbarNav.querySelector('#usuarioLogueado')) {
            // Agregar nombre de usuario
            const usuarioItem = document.createElement('li');
            usuarioItem.className = 'nav-item dropdown';
            usuarioItem.id = 'usuarioLogueado';
            usuarioItem.innerHTML = `
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="bi bi-person-circle"></i> ${usuario.username}
                </a>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" href="mi-perfil.html"><i class="bi bi-person"></i> Mi Perfil</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" onclick="cerrarSesion()"><i class="bi bi-box-arrow-right"></i> Cerrar Sesión</a></li>
                </ul>
            `;
            navbarNav.appendChild(usuarioItem);
        }
    } else {
        // Usuario no logueado - Mostrar login y registro
        const usuarioLogueado = navbarNav.querySelector('#usuarioLogueado');
        if (usuarioLogueado) {
            usuarioLogueado.remove();
        }
        
        // Agregar login si no existe
        if (!loginItem && !navbarNav.querySelector('[href="login.html"]')) {
            const loginLi = document.createElement('li');
            loginLi.className = 'nav-item';
            loginLi.innerHTML = '<a class="nav-link" href="login.html">Iniciar Sesión</a>';
            navbarNav.appendChild(loginLi);
        }
        
        // Agregar registro si no existe
        if (!registroItem && !navbarNav.querySelector('[href="registro.html"]')) {
            const registroLi = document.createElement('li');
            registroLi.className = 'nav-item';
            registroLi.innerHTML = '<a class="btn btn-outline-light btn-sm ms-2" href="registro.html">Registrarse</a>';
            navbarNav.appendChild(registroLi);
        }
    }
}

function cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', actualizarNavbar);
