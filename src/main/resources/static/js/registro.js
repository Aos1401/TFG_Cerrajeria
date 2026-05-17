// FORMATO TELÉFONO
const inputTel  = document.getElementById('telefono');
const selectPre = document.getElementById('telefono-prefijo');

function esEspana() { return selectPre.value === '+34'; }

inputTel.addEventListener('input', function () {
    let digits = this.value.replace(/\D/g, '');
    if (esEspana()) {
        digits = digits.slice(0, 9);
        if (digits.length > 6)      this.value = digits.slice(0,3) + ' ' + digits.slice(3,6) + ' ' + digits.slice(6);
        else if (digits.length > 3) this.value = digits.slice(0,3) + ' ' + digits.slice(3);
        else                        this.value = digits;
    } else {
        this.value = digits.slice(0, 15);
    }
});

inputTel.addEventListener('keydown', function (e) {
    const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab','Home','End'];
    if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault();
});

selectPre.addEventListener('change', function () {
    inputTel.value = '';
    inputTel.placeholder = esEspana() ? '600 000 000' : '000 000 000';
    inputTel.maxLength   = esEspana() ? 11 : 16;
});

// REGISTRO
document.getElementById('form-registro').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre    = document.getElementById('nombre').value.trim();
    const apellidos = document.getElementById('apellidos').value.trim();
    const email     = document.getElementById('email').value.trim();
    const password  = document.getElementById('password').value;
    const prefijo   = document.getElementById('telefono-prefijo').value;
    const telefono  = document.getElementById('telefono').value.trim();
    const direccion = document.getElementById('direccion').value.trim();

    if (password.length < 6) {
        mostrarMensaje('La contraseña debe tener al menos 6 caracteres.', 'error');
        return;
    }

    const telefonoDigits = telefono.replace(/\s/g, '');
    if (telefonoDigits) {
        if (prefijo === '+34' && !/^[6789]\d{8}$/.test(telefonoDigits)) {
            mostrarMensaje('El teléfono español debe tener 9 dígitos y empezar por 6, 7, 8 o 9.', 'error');
            return;
        }
        if (prefijo !== '+34' && telefonoDigits.length < 6) {
            mostrarMensaje('El número de teléfono no parece válido.', 'error');
            return;
        }
    }
    const telefonoCompleto = telefonoDigits ? prefijo + telefonoDigits : '';

    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.textContent = 'Registrando...';

    try {
        const response = await fetch('/api/registro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, apellidos, email, password, telefono: telefonoCompleto, direccion })
        });

        if (response.ok) {
            const loginRes = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (loginRes.ok) {
                const data = await loginRes.json();
                localStorage.setItem('token', data.token);
                localStorage.setItem('email', data.email);
                localStorage.setItem('rol', data.rol);
            }

            await Swal.fire({
                icon: 'success',
                title: `¡Bienvenido/a, ${nombre}!`,
                text: 'Tu cuenta ha sido creada con éxito.',
                confirmButtonText: 'Entrar',
                confirmButtonColor: '#1a2e4a',
                timer: 2500,
                timerProgressBar: true
            });
            window.location.href = '/index.html';
        } else {
            const error = await response.text();
            mostrarMensaje(error || 'Error al crear la cuenta.', 'error');
            btn.disabled = false;
            btn.textContent = 'Registrarse';
        }
    } catch (err) {
        mostrarMensaje('Error de conexión. Comprueba que el servidor está activo.', 'error');
        btn.disabled = false;
        btn.textContent = 'Registrarse';
    }
});

function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = texto;
    mensaje.className = 'mensaje ' + tipo;
}
