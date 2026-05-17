document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');

    const avisoLogin = document.getElementById('aviso-login');
    const formCard   = document.getElementById('form-card');

    if (!token) {
        avisoLogin.style.display = 'block';
        formCard.style.display   = 'none';
        return;
    }

    avisoLogin.style.display = 'none';
    formCard.style.display   = 'block';

    cargarMisSolicitudes(token);

    const inputEmail = document.getElementById('email');
    if (inputEmail && email) inputEmail.value = email;

    // Teléfono
    const inputTel  = document.getElementById('telefono');
    const selectPre = document.getElementById('telefono-prefijo');

    // Prerellenar con datos del perfil
    cargarPerfil(token);

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

    // Zona de foto
    const fotoZona       = document.getElementById('foto-zona');
    const fotoInput      = document.getElementById('foto');
    const fotoPlaceholder = document.getElementById('foto-placeholder');
    const fotoPreviewWrap = document.getElementById('foto-preview-wrap');
    const fotoPreview    = document.getElementById('foto-preview');
    const btnQuitarFoto  = document.getElementById('btn-quitar-foto');

    fotoZona.addEventListener('click', function (e) {
        if (e.target === btnQuitarFoto || btnQuitarFoto.contains(e.target)) return;
        fotoInput.click();
    });

    fotoInput.addEventListener('change', function () {
        const archivo = fotoInput.files[0];
        if (!archivo) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            fotoPreview.src = e.target.result;
            fotoPlaceholder.style.display = 'none';
            fotoPreviewWrap.style.display = 'flex';
        };
        reader.readAsDataURL(archivo);
    });

    btnQuitarFoto.addEventListener('click', function () {
        fotoInput.value = '';
        fotoPreview.src = '';
        fotoPreviewWrap.style.display = 'none';
        fotoPlaceholder.style.display = 'flex';
    });

    // Envío del formulario
    document.getElementById('form-presupuesto').addEventListener('submit', async function (e) {
        e.preventDefault();

        const nombre            = document.getElementById('nombre').value.trim();
        const telefonoDigits    = document.getElementById('telefono').value.replace(/\s/g, '');
        const prefijo           = document.getElementById('telefono-prefijo').value;
        const direccionServicio = document.getElementById('direccionServicio').value.trim();
        const tipoServicio      = document.getElementById('tipoServicio').value;
        const descripcion       = document.getElementById('descripcion').value.trim();

        if (prefijo === '+34' && !/^[6789]\d{8}$/.test(telefonoDigits)) {
            mostrarMensaje('El teléfono español debe tener 9 dígitos y empezar por 6, 7, 8 o 9.', 'error');
            return;
        }
        if (prefijo !== '+34' && telefonoDigits.length < 6) {
            mostrarMensaje('El número de teléfono no parece válido.', 'error');
            return;
        }

        if (!tipoServicio) {
            mostrarMensaje('Selecciona el tipo de servicio.', 'error');
            return;
        }
        if (descripcion.length < 20) {
            mostrarMensaje('Describe el problema con un poco más de detalle (mínimo 20 caracteres).', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('telefono', prefijo + telefonoDigits);
        formData.append('direccionServicio', direccionServicio);
        formData.append('tipoServicio', tipoServicio);
        formData.append('descripcion', descripcion);
        if (fotoInput.files[0]) {
            formData.append('foto', fotoInput.files[0]);
        }

        const btn = document.getElementById('btn-submit');
        btn.disabled = true;
        btn.textContent = 'Enviando...';

        try {
            const response = await fetch('/api/presupuestos', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token },
                body: formData
            });

            if (response.ok) {
                mostrarMensaje('¡Solicitud enviada! Te responderemos en menos de 24 horas.', 'exito');
                document.getElementById('form-presupuesto').reset();
                if (inputEmail && email) inputEmail.value = email;
                fotoInput.value = '';
                fotoPreviewWrap.style.display = 'none';
                fotoPlaceholder.style.display = 'flex';
                await cargarMisSolicitudes(token);
            } else if (response.status === 401 || response.status === 403) {
                mostrarMensaje('Tu sesión ha expirado. Vuelve a iniciar sesión.', 'error');
                localStorage.clear();
                setTimeout(() => window.location.href = '/login.html', 2000);
            } else {
                const texto = await response.text();
                mostrarMensaje(texto || 'Error al enviar la solicitud. Inténtalo de nuevo.', 'error');
            }
        } catch (err) {
            mostrarMensaje('Error de conexión. Comprueba que el servidor está activo.', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Enviar solicitud';
        }
    });
});

function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = texto;
    mensaje.className = 'mensaje ' + tipo;
    mensaje.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function cargarMisSolicitudes(token) {
    try {
        const res = await fetch('/api/presupuestos/mis-presupuestos', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) return;
        const solicitudes = await res.json();

        const section = document.getElementById('mis-solicitudes-section');
        const lista   = document.getElementById('mis-solicitudes-lista');

        if (!solicitudes.length) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        lista.innerHTML = solicitudes.map(s => {
            const estadoClase = { PENDIENTE: 'sol-badge-pendiente', EN_REVISION: 'sol-badge-revision', RESPONDIDO: 'sol-badge-respondido' }[s.estado] || '';
            const estadoTexto = { PENDIENTE: 'Pendiente', EN_REVISION: 'En revisión', RESPONDIDO: 'Respondido' }[s.estado] || s.estado;
            const fecha = new Date(s.fechaSolicitud).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
            return `
            <div class="sol-card">
                <div class="sol-card-header">
                    <div class="sol-info">
                        <span class="sol-servicio">${escHtml(s.tipoServicio)}</span>
                        <span class="sol-fecha"><i class="fa-regular fa-calendar"></i> ${fecha}</span>
                    </div>
                    <span class="sol-badge ${estadoClase}">${estadoTexto}</span>
                </div>
                <p class="sol-descripcion">${escHtml(s.descripcion)}</p>
                ${s.respuesta ? `
                <div class="sol-respuesta">
                    <div class="sol-respuesta-titulo"><i class="fa-solid fa-reply"></i> Respuesta del cerrajero</div>
                    <p>${escHtml(s.respuesta)}</p>
                </div>` : ''}
            </div>`;
        }).join('');
    } catch (err) {
        // sin conexión, ignorar
    }
}

async function cargarPerfil(token) {
    try {
        const res = await fetch('/api/usuarios/perfil', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) return;
        const perfil = await res.json();

        const inputNombre = document.getElementById('nombre');
        if (inputNombre && perfil.nombre) {
            inputNombre.value = perfil.nombre + (perfil.apellidos ? ' ' + perfil.apellidos : '');
        }

        if (perfil.telefono) {
            const PREFIJOS = ['+598', '+595', '+593', '+351', '+34', '+44', '+33', '+49', '+39', '+52', '+54', '+57', '+56', '+51', '+58', '+1'];
            let prefijo = '+34', digitos = perfil.telefono;
            for (const p of PREFIJOS) {
                if (perfil.telefono.startsWith(p)) {
                    prefijo  = p;
                    digitos  = perfil.telefono.slice(p.length).replace(/\s/g, '');
                    break;
                }
            }
            const selectPre = document.getElementById('telefono-prefijo');
            const inputTel  = document.getElementById('telefono');
            if (selectPre) selectPre.value = prefijo;
            if (inputTel)  inputTel.dispatchEvent(new Event('input'));
            if (inputTel && digitos) {
                if (prefijo === '+34' && digitos.length === 9) {
                    inputTel.value = digitos.slice(0,3) + ' ' + digitos.slice(3,6) + ' ' + digitos.slice(6);
                } else {
                    inputTel.value = digitos;
                }
            }
        }
    } catch (err) {
        // sin conexión, ignorar
    }
}

function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
