const token = localStorage.getItem('token');

// Estado en memoria
let carritoItems = [];
let productosData = [];

document.addEventListener('DOMContentLoaded', async function () {
    await cargarProductos();
    if (token) await cargarCarrito();
    actualizarBadge();

    document.getElementById('btn-abrir-carrito').addEventListener('click', abrirCarrito);
    document.getElementById('btn-cerrar-carrito').addEventListener('click', cerrarCarrito);
    document.getElementById('carrito-overlay').addEventListener('click', cerrarCarrito);
});

// PRODUCTOS

async function cargarProductos() {
    const grid = document.getElementById('productos-grid');

    try {
        const response = await fetch('/api/catalogo/productos');
        const productos = await response.json();

        if (productos.length === 0) {
            grid.innerHTML = `
                <div class="estado-vacio">
                    <i class="fa-solid fa-box-open"></i>
                    <p>No hay productos disponibles en este momento.</p>
                </div>`;
            return;
        }

        productosData = productos;
        document.getElementById('productos-count').textContent = productos.length + ' productos';
        grid.innerHTML = productos.map(p => renderProducto(p)).join('');

        grid.querySelectorAll('.btn-agregar').forEach(btn => {
            btn.addEventListener('click', function () {
                if (!token) {
                    window.location.href = '/login.html';
                    return;
                }
                const productoId = parseInt(this.dataset.id);
                agregarAlCarrito(productoId, this);
            });
        });

    } catch (err) {
        grid.innerHTML = `
            <div class="estado-vacio">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>Error al cargar los productos. Comprueba que el servidor está activo.</p>
            </div>`;
    }
}

function iconoCategoria(categoria) {
    const iconos = {
        'Cerraduras': 'fa-lock',
        'Bombines':   'fa-circle-dot',
        'Candados':   'fa-unlock',
        'Cerrojos':   'fa-shield-halved',
        'Accesorios': 'fa-screwdriver-wrench',
        'Llaves':     'fa-key',
    };
    return iconos[categoria] || 'fa-key';
}

function renderProducto(p) {
    const estaEnCarrito = carritoItems.some(i => i.productoId === p.id);
    const sinStock = p.stock === 0;
    const btnClase = sinStock ? 'agotado' : (!token ? 'login-requerido' : '');
    const btnTexto = sinStock
        ? '<i class="fa-solid fa-ban"></i> Agotado'
        : !token
            ? '<i class="fa-solid fa-user-lock"></i> Inicia sesión para comprar'
            : estaEnCarrito
                ? '<i class="fa-solid fa-check"></i> En el carrito'
                : '<i class="fa-solid fa-cart-plus"></i> Añadir al carrito';

    return `
    <div class="producto-card${sinStock ? ' producto-agotado' : ''}">
        <div class="producto-imagen">
            ${p.imagenNombre
                ? `<img src="/uploads/${p.imagenNombre}" alt="${p.nombre}">`
                : `<img src="/images/${p.nombre.replace(/ /g, '_')}.jpg" alt="${p.nombre}" onerror="this.style.display='none'">`}
            ${sinStock ? '<span class="badge-agotado">AGOTADO</span>' : ''}
        </div>
        <div class="producto-info">
            <span class="producto-categoria">${p.categoria || 'Producto'}</span>
            <h3 class="producto-nombre">${p.nombre}</h3>
            <p class="producto-descripcion">${p.descripcion}</p>
        </div>
        <div class="producto-footer">
            <div class="producto-precio">${parseFloat(p.precio).toFixed(2)} <span>€</span></div>
            <span class="producto-stock ${sinStock ? 'sin-stock' : ''}">${sinStock ? 'Sin stock' : 'En stock'}</span>
        </div>
        <button class="btn-agregar ${btnClase}" data-id="${p.id}" ${sinStock ? 'disabled' : ''}>
            ${btnTexto}
        </button>
    </div>`;
}

// CARRITO

async function cargarCarrito() {
    try {
        const response = await fetch('/api/carrito', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (response.ok) {
            carritoItems = await response.json();
        }
    } catch (err) {
        // sin conexión, carrito vacío
    }
}

async function agregarAlCarrito(productoId, btn) {
    const textoOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Añadiendo...';

    try {
        const response = await fetch('/api/carrito/agregar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ productoId, cantidad: 1 })
        });

        if (response.ok) {
            await cargarCarrito();
            actualizarBadge();
            btn.innerHTML = '<i class="fa-solid fa-check"></i> En el carrito';
        } else if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = '/login.html';
        } else {
            const error = await response.text();
            btn.innerHTML = textoOriginal;
            btn.disabled = false;
            if (error.toLowerCase().includes('stock')) {
                Swal.fire({ icon: 'warning', title: 'Stock máximo alcanzado', text: error, confirmButtonColor: '#c9a84c' });
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: error || 'No se pudo añadir el producto.', confirmButtonColor: '#c9a84c' });
            }
        }
    } catch (err) {
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    }
}

async function sumarCantidad(productoId) {
    const producto = productosData.find(p => p.id === productoId);
    const itemEnCarrito = carritoItems.find(i => i.productoId === productoId);
    if (producto && itemEnCarrito && itemEnCarrito.cantidad >= producto.stock) {
        Swal.fire({
            icon: 'warning',
            title: 'Stock máximo alcanzado',
            text: `Solo hay ${producto.stock} unidad${producto.stock === 1 ? '' : 'es'} disponible${producto.stock === 1 ? '' : 's'} de este producto.`,
            confirmButtonColor: '#c9a84c'
        });
        return;
    }

    try {
        const response = await fetch('/api/carrito/agregar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ productoId, cantidad: 1 })
        });
        if (response.ok) {
            await cargarCarrito();
            actualizarBadge();
            renderCarrito();
        } else if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = '/login.html';
        } else {
            const msg = await response.text();
            Swal.fire({ icon: 'warning', title: 'Stock máximo alcanzado', text: msg || 'No se pudo añadir más unidades.', confirmButtonColor: '#c9a84c' });
        }
    } catch (err) {
        // error silencioso
    }
}

async function restarCantidad(itemId, productoId) {
    const item = carritoItems.find(i => i.itemId === itemId);
    try {
        const response = await fetch('/api/carrito/' + itemId + '/uno', {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (response.ok) {
            await cargarCarrito();
            actualizarBadge();
            renderCarrito();
            if (item && item.cantidad <= 1) {
                const btn = document.querySelector(`.btn-agregar[data-id="${productoId}"]`);
                if (btn) {
                    btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Añadir al carrito';
                    btn.disabled = false;
                }
            }
        }
    } catch (err) {
        // error silencioso
    }
}

async function eliminarItem(itemId) {
    const item = carritoItems.find(i => i.itemId === itemId);
    try {
        const response = await fetch('/api/carrito/' + itemId, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (response.ok) {
            await cargarCarrito();
            actualizarBadge();
            renderCarrito();
            if (item) {
                const btn = document.querySelector(`.btn-agregar[data-id="${item.productoId}"]`);
                if (btn) {
                    btn.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Añadir al carrito';
                    btn.disabled = false;
                }
            }
        }
    } catch (err) {
        // error silencioso
    }
}

function carritoImgError(img) {
    img.parentElement.className = 'carrito-item-icono';
    img.outerHTML = '<i class="fa-solid fa-key"></i>';
}

function actualizarBadge() {
    const badge = document.getElementById('carrito-badge');
    const total = carritoItems.length;
    badge.textContent = total;
    badge.style.display = total > 0 ? 'flex' : 'none';
}

function abrirCarrito() {
    renderCarrito();
    document.getElementById('carrito-overlay').classList.add('abierto');
    document.getElementById('carrito-drawer').classList.add('abierto');
    document.body.style.overflow = 'hidden';
}

function cerrarCarrito() {
    document.getElementById('carrito-overlay').classList.remove('abierto');
    document.getElementById('carrito-drawer').classList.remove('abierto');
    document.body.style.overflow = '';
}

function renderCarrito() {
    const contenedor = document.getElementById('carrito-items');
    const totalEl    = document.getElementById('carrito-total');
    const btnComprar = document.getElementById('btn-comprar');

    if (!token) {
        contenedor.innerHTML = `
            <div class="carrito-vacio">
                <i class="fa-solid fa-user-lock"></i>
                <p>Inicia sesión para usar el carrito.</p>
            </div>`;
        totalEl.textContent = '0,00 €';
        btnComprar.disabled = true;
        return;
    }

    if (carritoItems.length === 0) {
        contenedor.innerHTML = `
            <div class="carrito-vacio">
                <i class="fa-solid fa-cart-shopping"></i>
                <p>Tu carrito está vacío.</p>
            </div>`;
        totalEl.textContent = '0,00 €';
        btnComprar.disabled = true;
        return;
    }

    const total = carritoItems.reduce((acc, i) => acc + parseFloat(i.subtotal), 0);

    contenedor.innerHTML = carritoItems.map(item => {
        const producto = productosData.find(p => p.id === item.productoId);
        const imagenSrc = producto?.imagenNombre
            ? `/uploads/${producto.imagenNombre}`
            : (producto ? `/images/${producto.nombre.replace(/ /g, '_')}.jpg` : null);
        const miniatura = imagenSrc
            ? `<img src="${imagenSrc}" alt="${item.nombreProducto}" class="carrito-item-img" onerror="carritoImgError(this)">`
            : `<i class="fa-solid fa-key"></i>`;
        const iconoClase = imagenSrc ? 'carrito-item-icono con-imagen' : 'carrito-item-icono';
        return `
        <div class="carrito-item">
            <div class="${iconoClase}">${miniatura}</div>
            <div class="carrito-item-info">
                <div class="carrito-item-nombre">${item.nombreProducto}</div>
                <div class="carrito-item-precio">${parseFloat(item.precioUnitario).toFixed(2)} € / ud</div>
            </div>
            <div class="carrito-item-cantidad">
                <button class="btn-qty" onclick="restarCantidad(${item.itemId}, ${item.productoId})">−</button>
                <span>${item.cantidad}</span>
                <button class="btn-qty" onclick="sumarCantidad(${item.productoId})">+</button>
            </div>
            <span class="carrito-item-subtotal">${parseFloat(item.subtotal).toFixed(2)} €</span>
            <button class="btn-eliminar-item" onclick="eliminarItem(${item.itemId})" title="Eliminar">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>`;
    }).join('');

    totalEl.textContent = total.toFixed(2).replace('.', ',') + ' €';
    btnComprar.disabled = false;
    btnComprar.onclick = () => window.location.href = '/pago.html';
}
