const token = localStorage.getItem('token');
if (!token) window.location.href = '/login.html';

const authHeaders = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };

let carritoItems = [];
let metodoPago   = null;

// CARGAR CARRITO────
async function cargarResumen() {
    const res = await fetch('/api/carrito', { headers: authHeaders });
    if (!res.ok) return;
    carritoItems = await res.json();

    if (!carritoItems.length) {
        window.location.href = '/tienda.html';
        return;
    }

    const cont = document.getElementById('resumen-items');
    cont.innerHTML = carritoItems.map(i => `
        <div class="resumen-item">
            <div>
                <div class="resumen-item-nombre">${i.nombreProducto}</div>
                <div class="resumen-item-cantidad">× ${i.cantidad}</div>
            </div>
            <div class="resumen-item-precio">${parseFloat(i.subtotal).toFixed(2)} €</div>
        </div>
    `).join('');

    const subtotal = carritoItems.reduce((a, i) => a + parseFloat(i.subtotal), 0);
    const envio    = 0;
    document.getElementById('resumen-subtotal').textContent = subtotal.toFixed(2) + ' €';
    document.getElementById('resumen-envio').textContent    = envio === 0 ? 'Gratis' : envio.toFixed(2) + ' €';
    document.getElementById('resumen-total').textContent    = (subtotal + envio).toFixed(2) + ' €';
    document.getElementById('btn-total-texto').textContent  = 'Pagar ' + (subtotal + envio).toFixed(2) + ' €';
}

// SELECCIÓN DE MÉTODO
document.querySelectorAll('.metodo-label').forEach(label => {
    label.addEventListener('click', () => {
        document.querySelectorAll('.metodo-label').forEach(l => l.classList.remove('seleccionado'));
        document.querySelectorAll('.pago-form-seccion').forEach(s => s.classList.remove('visible'));

        label.classList.add('seleccionado');
        metodoPago = label.dataset.metodo;

        const seccion = document.getElementById('form-' + metodoPago);
        if (seccion) seccion.classList.add('visible');

        document.getElementById('btn-pagar').disabled = false;
    });
});

// SIMULAR PAGO
document.getElementById('btn-pagar').addEventListener('click', async () => {
    if (!metodoPago) return;

    if (!validarFormulario()) return;

    const btn = document.getElementById('btn-pagar');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando pago...';

    await new Promise(r => setTimeout(r, 2000));

    const numeroPedido = 'ORD-' + Date.now().toString().slice(-6);

    await fetch('/api/carrito/confirmar', { method: 'POST', headers: authHeaders });

    await Swal.fire({
        icon: 'success',
        title: '¡Pago completado!',
        html: `
            <p style="color:#6b7280;margin-bottom:.5rem">Tu pedido ha sido confirmado.</p>
            <p style="font-size:1.1rem;font-weight:700;color:#1a2e4a">Nº de pedido: ${numeroPedido}</p>
            <p style="color:#6b7280;font-size:.85rem;margin-top:.5rem">
                Recibirás confirmación en <strong>${localStorage.getItem('email')}</strong>
            </p>`,
        confirmButtonText: 'Volver a la tienda',
        confirmButtonColor: '#1a2e4a',
        allowOutsideClick: false
    });

    window.location.href = '/tienda.html';
});

function validarFormulario() {
    return true;
}

cargarResumen();
