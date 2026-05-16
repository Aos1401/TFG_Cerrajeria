const token = localStorage.getItem('token');
const rol   = localStorage.getItem('rol');

if (!token || rol !== 'ROLE_ADMIN') {
    window.location.href = '/login.html';
}

const headers = () => ({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
});

// ── NAVEGACIÓN SIDEBAR ────────────────────────────────────────────────
document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
    link.addEventListener('click', () => {
        document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('activo'));
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('visible'));
        link.classList.add('activo');
        document.getElementById(link.dataset.section).classList.add('visible');
    });
});

// ── LOGOUT ────────────────────────────────────────────────────────────
document.getElementById('btn-logout-admin').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '/index.html';
});

// ══════════════════════════════════════════════════════════════════════
// PRESUPUESTOS
// ══════════════════════════════════════════════════════════════════════
let presupuestos = [];

async function cargarPresupuestos() {
    const res = await fetch('/api/admin/presupuestos', { headers: headers() });
    if (!res.ok) return;
    presupuestos = await res.json();
    renderPresupuestos();
    actualizarStatsPresupuestos();
}

function actualizarStatsPresupuestos() {
    document.getElementById('stat-total-presup').textContent = presupuestos.length;
    document.getElementById('stat-pendientes').textContent =
        presupuestos.filter(p => p.estado === 'PENDIENTE').length;
    document.getElementById('stat-en-revision').textContent =
        presupuestos.filter(p => p.estado === 'EN_REVISION').length;
    document.getElementById('stat-respondidos').textContent =
        presupuestos.filter(p => p.estado === 'RESPONDIDO').length;
}

function badgeEstado(estado) {
    const map = { PENDIENTE: 'badge-pendiente', EN_REVISION: 'badge-revision', RESPONDIDO: 'badge-respondido' };
    const txt = { PENDIENTE: 'Pendiente', EN_REVISION: 'En revisión', RESPONDIDO: 'Respondido' };
    return `<span class="badge ${map[estado] || ''}">${txt[estado] || estado}</span>`;
}

function renderPresupuestos() {
    const tbody = document.getElementById('tbody-presupuestos');
    if (!presupuestos.length) {
        tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-inbox"></i><p>No hay presupuestos todavía</p></div></td></tr>';
        return;
    }
    tbody.innerHTML = presupuestos.map(p => `
        <tr>
            <td>#${p.id}</td>
            <td>${escHtml(p.nombre)}</td>
            <td>${escHtml(p.email)}</td>
            <td>${escHtml(p.tipoServicio)}</td>
            <td>${badgeEstado(p.estado)}</td>
            <td>${formatFecha(p.fechaSolicitud)}</td>
            <td>
                <button class="btn-edit" onclick="abrirModalPresupuesto(${p.id})">
                    <i class="fa-solid fa-eye"></i> Ver
                </button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('buscador-presupuestos').addEventListener('input', function () {
    const q = this.value.toLowerCase().trim();
    document.querySelectorAll('#tbody-presupuestos tr').forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
});

async function abrirModalPresupuesto(id) {
    const p = presupuestos.find(x => x.id === id);
    if (!p) return;

    if (p.estado === 'PENDIENTE') {
        await fetch(`/api/admin/presupuestos/${id}`, {
            method: 'PATCH',
            headers: headers(),
            body: JSON.stringify({ estado: 'EN_REVISION', respuesta: p.respuesta || '' })
        });
        p.estado = 'EN_REVISION';
        actualizarStatsPresupuestos();
        renderPresupuestos();
    }

    document.getElementById('modal-presup-id').value = p.id;
    document.getElementById('presup-detalle').innerHTML = `
        <dl>
            <dt>Nombre</dt><dd>${escHtml(p.nombre)}</dd>
            <dt>Email</dt><dd>${escHtml(p.email)}</dd>
            <dt>Teléfono</dt><dd>${escHtml(p.telefono)}</dd>
            <dt>Dirección</dt><dd>${escHtml(p.direccionServicio)}</dd>
            <dt>Servicio</dt><dd>${escHtml(p.tipoServicio)}</dd>
            <dt>Descripción</dt><dd>${escHtml(p.descripcion)}</dd>
            <dt>Fecha</dt><dd>${formatFecha(p.fechaSolicitud)}</dd>
        </dl>
        ${p.fotoNombre ? `<img src="/uploads/${escHtml(p.fotoNombre)}" class="presup-foto" alt="Foto adjunta">` : ''}
    `;
    document.getElementById('presup-estado').value = p.estado;
    document.getElementById('presup-respuesta').value = p.respuesta || '';
    document.getElementById('modal-presupuesto').classList.add('visible');
}

document.getElementById('presup-respuesta').addEventListener('input', function () {
    const estadoSelect = document.getElementById('presup-estado');
    if (this.value.trim() && estadoSelect.value === 'PENDIENTE') {
        estadoSelect.value = 'RESPONDIDO';
    }
});

document.getElementById('form-presupuesto').addEventListener('submit', async e => {
    e.preventDefault();
    const id        = document.getElementById('modal-presup-id').value;
    const estado    = document.getElementById('presup-estado').value;
    const respuesta = document.getElementById('presup-respuesta').value;
    const btn       = e.target.querySelector('button[type="submit"]');

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Guardando...';

    try {
        const res = await fetch(`/api/admin/presupuestos/${id}`, {
            method: 'PATCH',
            headers: headers(),
            body: JSON.stringify({ estado, respuesta })
        });
        if (res.ok) {
            cerrarModal('modal-presupuesto');
            await cargarPresupuestos();
        } else {
            alert(`Error al guardar (${res.status}). Comprueba que sigues autenticado como admin.`);
        }
    } catch (err) {
        alert('Error de red al guardar el presupuesto.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar';
    }
});

// ══════════════════════════════════════════════════════════════════════
// PRODUCTOS
// ══════════════════════════════════════════════════════════════════════
let productos = [];
let editandoProductoId = null;

async function cargarProductos() {
    const res = await fetch('/api/admin/productos', { headers: headers() });
    if (!res.ok) return;
    productos = await res.json();
    renderProductos();
    actualizarStatsProductos();
}

function actualizarStatsProductos() {
    document.getElementById('stat-total-prod').textContent = productos.length;
    document.getElementById('stat-activos').textContent =
        productos.filter(p => p.activo).length;
    document.getElementById('stat-sin-stock').textContent =
        productos.filter(p => p.stock === 0).length;
}

function renderProductos() {
    const tbody = document.getElementById('tbody-productos');
    if (!productos.length) {
        tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><i class="fa-solid fa-box-open"></i><p>No hay productos</p></div></td></tr>';
        return;
    }
    tbody.innerHTML = productos.map(p => `
        <tr>
            <td>#${p.id}</td>
            <td>
                <div style="display:flex;align-items:center;gap:.6rem">
                    ${p.imagenNombre
                        ? `<img src="/uploads/${escHtml(p.imagenNombre)}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;flex-shrink:0;" alt="">`
                        : `<div style="width:40px;height:40px;background:linear-gradient(135deg,#1a2e4a,#243b55);border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fa-solid fa-box" style="color:#c9a84c;font-size:14px;"></i></div>`}
                    <div><strong>${escHtml(p.nombre)}</strong><br><small style="color:#6b7280">${escHtml(p.categoria || '')}</small></div>
                </div>
            </td>
            <td>${parseFloat(p.precio).toFixed(2)} €</td>
            <td>
                <span style="font-weight:600;color:${p.stock === 0 ? '#dc2626' : p.stock < 5 ? '#d97706' : '#16a34a'}">
                    ${p.stock}
                </span>
            </td>
            <td>${p.activo
                ? '<span class="badge badge-activo">Activo</span>'
                : '<span class="badge badge-inactivo">Inactivo</span>'}</td>
            <td>
                <button class="btn-edit" onclick="abrirModalProducto(${p.id})">
                    <i class="fa-solid fa-pen"></i> Editar
                </button>
                ${p.activo
                    ? `<button class="btn-danger" onclick="desactivarProducto(${p.id})" style="margin-left:.4rem" title="Desactivar">
                           <i class="fa-solid fa-ban"></i>
                       </button>`
                    : `<button class="btn-success" onclick="activarProducto(${p.id})" style="margin-left:.4rem" title="Reactivar">
                           <i class="fa-solid fa-rotate-left"></i> Reactivar
                       </button>`}
                <button class="btn-danger" onclick="eliminarProducto(${p.id}, '${escHtml(p.nombre)}')" style="margin-left:.4rem" title="Eliminar">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function abrirModalProducto(id) {
    const p = id ? productos.find(x => x.id === id) : null;
    editandoProductoId = id || null;

    document.getElementById('modal-prod-titulo').textContent = p ? 'Editar producto' : 'Nuevo producto';
    document.getElementById('prod-nombre').value      = p ? p.nombre      : '';
    document.getElementById('prod-descripcion').value = p ? (p.descripcion || '') : '';
    document.getElementById('prod-precio').value      = p ? p.precio      : '';
    document.getElementById('prod-stock').value       = p ? p.stock       : '';
    document.getElementById('prod-categoria').value   = p ? (p.categoria || '') : '';
    document.getElementById('prod-activo').value      = p ? String(p.activo) : 'true';

    // Imagen
    document.getElementById('prod-imagen-input').value = '';
    const preview     = document.getElementById('prod-imagen-preview');
    const placeholder = document.getElementById('img-upload-placeholder');
    if (p && p.imagenNombre) {
        preview.src = '/uploads/' + p.imagenNombre;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
    } else {
        preview.src = '';
        preview.style.display = 'none';
        placeholder.style.display = 'flex';
    }

    document.getElementById('modal-producto').classList.add('visible');
}

document.getElementById('img-upload-zona').addEventListener('click', () => {
    document.getElementById('prod-imagen-input').click();
});

document.getElementById('prod-imagen-input').addEventListener('change', function () {
    const archivo = this.files[0];
    if (!archivo) return;
    const reader = new FileReader();
    reader.onload = e => {
        const preview = document.getElementById('prod-imagen-preview');
        preview.src = e.target.result;
        preview.style.display = 'block';
        document.getElementById('img-upload-placeholder').style.display = 'none';
    };
    reader.readAsDataURL(archivo);
});

document.getElementById('btn-nuevo-producto').addEventListener('click', () => abrirModalProducto(null));

document.getElementById('form-producto').addEventListener('submit', async e => {
    e.preventDefault();
    const datos = {
        nombre:      document.getElementById('prod-nombre').value,
        descripcion: document.getElementById('prod-descripcion').value,
        precio:      parseFloat(document.getElementById('prod-precio').value),
        stock:       parseInt(document.getElementById('prod-stock').value),
        categoria:   document.getElementById('prod-categoria').value,
        activo:      document.getElementById('prod-activo').value === 'true'
    };

    const url    = editandoProductoId ? `/api/admin/productos/${editandoProductoId}` : '/api/admin/productos';
    const method = editandoProductoId ? 'PUT' : 'POST';

    const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(datos) });
    if (res.ok) {
        const productoGuardado = await res.json();
        const archivoImagen = document.getElementById('prod-imagen-input').files[0];
        if (archivoImagen) {
            const formData = new FormData();
            formData.append('imagen', archivoImagen);
            await fetch(`/api/admin/productos/${productoGuardado.id}/imagen`, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token },
                body: formData
            });
        }
        cerrarModal('modal-producto');
        await cargarProductos();
    }
});

async function desactivarProducto(id) {
    const result = await Swal.fire({
        icon: 'question',
        title: '¿Desactivar producto?',
        text: 'Dejará de aparecer en la tienda pero podrás reactivarlo cuando quieras.',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '<i class="fa-solid fa-ban"></i> Desactivar',
        cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`/api/admin/productos/${id}`, { method: 'DELETE', headers: headers() });
    if (res.ok) {
        await cargarProductos();
        Swal.fire({ icon: 'success', title: 'Desactivado', text: 'El producto ya no es visible en la tienda.', timer: 1800, showConfirmButton: false });
    }
}

async function activarProducto(id) {
    const res = await fetch(`/api/admin/productos/${id}/activar`, { method: 'PATCH', headers: headers() });
    if (res.ok) await cargarProductos();
}

async function eliminarProducto(id, nombre) {
    const result = await Swal.fire({
        icon: 'warning',
        title: '¿Eliminar producto?',
        html: `Esta acción es <strong>irreversible</strong>.<br><small style="color:#6b7280">«${nombre}» será eliminado permanentemente.</small>`,
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: '<i class="fa-solid fa-trash"></i> Eliminar',
        cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;
    const res = await fetch(`/api/admin/productos/${id}/eliminar`, { method: 'DELETE', headers: headers() });
    if (res.ok) {
        await cargarProductos();
        Swal.fire({ icon: 'success', title: 'Eliminado', text: 'El producto ha sido eliminado.', timer: 1800, showConfirmButton: false });
    } else {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el producto.' });
    }
}

// ── UTILIDADES ────────────────────────────────────────────────────────
function cerrarModal(id) { document.getElementById(id).classList.remove('visible'); }

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('visible');
    });
});

document.querySelectorAll('.btn-cerrar-modal').forEach(btn => {
    btn.addEventListener('click', () => cerrarModal(btn.dataset.modal));
});

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function formatFecha(iso) {
    if (!iso) return '-';
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day:'2-digit', month:'2-digit', year:'numeric' })
        + ' ' + d.toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' });
}

// ── INIT ──────────────────────────────────────────────────────────────
document.getElementById('admin-email-display').textContent = localStorage.getItem('email') || '';
cargarPresupuestos();
cargarProductos();
