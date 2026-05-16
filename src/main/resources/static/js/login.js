document.getElementById('form-login').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.textContent = 'Entrando...';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('email', data.email);
            localStorage.setItem('rol', data.rol);
            mostrarMensaje('¡Bienvenido! Redirigiendo...', 'exito');
            setTimeout(() => window.location.href = '/index.html', 1500);
        } else {
            mostrarMensaje('Email o contraseña incorrectos.', 'error');
            btn.disabled = false;
            btn.textContent = 'Iniciar sesión';
        }
    } catch (err) {
        mostrarMensaje('Error de conexión. Comprueba que el servidor está activo.', 'error');
        btn.disabled = false;
        btn.textContent = 'Iniciar sesión';
    }
});

function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = texto;
    mensaje.className = 'mensaje ' + tipo;
}
