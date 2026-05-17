// ÍNDICE DE BÚSQUEDA
const INDICE = [
    // Páginas
    { titulo: 'Inicio',          subtitulo: 'Página principal',                url: '/index.html',       icono: 'fa-house',             tipo: 'Página',    keywords: ['home','principal'] },
    { titulo: 'Servicios',       subtitulo: 'Todos nuestros servicios',         url: '/servicios.html',   icono: 'fa-wrench',            tipo: 'Página',    keywords: ['trabajos','ofertas'] },
    { titulo: 'Tienda',          subtitulo: 'Comprar productos de cerrajería',  url: '/tienda.html',      icono: 'fa-shop',              tipo: 'Página',    keywords: ['comprar','productos','catalogo'] },
    { titulo: 'Solicitar presupuesto', subtitulo: 'Presupuesto gratuito sin compromiso', url: '/presupuesto.html', icono: 'fa-file-invoice', tipo: 'Página', keywords: ['precio','coste','cuanto','oferta'] },
    { titulo: 'Dónde estamos',   subtitulo: 'Ubicación y horario de apertura', url: '/ubicacion.html',   icono: 'fa-location-dot',      tipo: 'Página',    keywords: ['mapa','direccion','horario','cuando','donde'] },
    // Servicios
    { titulo: 'Urgencias 24h',           subtitulo: 'Servicio urgente, disponible siempre',    url: '/servicios.html', icono: 'fa-triangle-exclamation', tipo: 'Servicio', keywords: ['emergencia','urgente','noche','rapido','fin semana'] },
    { titulo: 'Apertura de puertas',     subtitulo: 'Apertura sin daños ni rotura',            url: '/servicios.html', icono: 'fa-door-open',            tipo: 'Servicio', keywords: ['abrir','puerta','pillado','cerrado','abri','bloqueado'] },
    { titulo: 'Extracción de llave rota',subtitulo: 'Llave partida dentro de la cerradura',   url: '/servicios.html', icono: 'fa-key',                  tipo: 'Servicio', keywords: ['llave partida','llave rota','dentro','cerradura'] },
    { titulo: 'Cambio de cerraduras',    subtitulo: 'Sustitución de cerraduras',               url: '/servicios.html', icono: 'fa-lock',                 tipo: 'Servicio', keywords: ['cerradura nueva','sustituir','robo','seguridad'] },
    { titulo: 'Cambio de bombín',        subtitulo: 'Sustitución del bombín de la cerradura',  url: '/servicios.html', icono: 'fa-circle-dot',           tipo: 'Servicio', keywords: ['bombin','cilindro','repuesto'] },
    { titulo: 'Instalación de seguridad',subtitulo: 'Cerraduras de alta seguridad',            url: '/servicios.html', icono: 'fa-shield-halved',        tipo: 'Servicio', keywords: ['alta seguridad','blindada','multipoint','antipalacha'] },
    { titulo: 'Instalación de rejas y vallas', subtitulo: 'Protección perimetral para tu hogar', url: '/servicios.html', icono: 'fa-border-all',       tipo: 'Servicio', keywords: ['reja','valla','verja','proteger','exterior'] },
    { titulo: 'Mantenimiento de comunidades', subtitulo: 'Mantenimiento de comunidades de propietarios', url: '/servicios.html', icono: 'fa-building', tipo: 'Servicio', keywords: ['comunidad','portal','edificio','vecinos','propietarios'] },
    { titulo: 'Instalación de ventanas de aluminio', subtitulo: 'Ventanas y carpintería de aluminio', url: '/servicios.html', icono: 'fa-window-maximize', tipo: 'Servicio', keywords: ['ventana','aluminio','carpinteria','marco'] },
];

let productosCache = null;
let resultadoActivo = -1;

async function obtenerProductos() {
    if (productosCache !== null) return productosCache;
    try {
        const res = await fetch('/api/catalogo/productos');
        productosCache = res.ok ? await res.json() : [];
    } catch (_) { productosCache = []; }
    return productosCache;
}

function iconoCategoria(cat) {
    const m = { Cerraduras:'fa-lock', Bombines:'fa-circle-dot', Candados:'fa-unlock', Cerrojos:'fa-shield-halved', Accesorios:'fa-screwdriver-wrench', Llaves:'fa-key' };
    return m[cat] || 'fa-key';
}

async function buscar(q) {
    const t = q.toLowerCase().trim();
    if (!t) return [];

    const productos = await obtenerProductos();
    const indice = [
        ...INDICE,
        ...productos.map(p => ({
            titulo: p.nombre,
            subtitulo: p.descripcion ? p.descripcion.slice(0, 60) : p.categoria,
            url: '/tienda.html',
            icono: iconoCategoria(p.categoria),
            tipo: 'Producto',
            keywords: [p.categoria, p.descripcion].filter(Boolean).map(s => s.toLowerCase())
        }))
    ];

    return indice.filter(item => {
        const haystack = [item.titulo, item.subtitulo, ...(item.keywords || [])].join(' ').toLowerCase();
        return t.split(' ').every(w => haystack.includes(w));
    }).slice(0, 8);
}

function renderResultados(resultados, dropdown) {
    resultadoActivo = -1;
    if (!resultados.length) {
        dropdown.innerHTML = '<div class="busqueda-vacio"><i class="fa-solid fa-magnifying-glass"></i><p>Sin resultados</p></div>';
        return;
    }
    dropdown.innerHTML = resultados.map((r, i) => `
        <a href="${r.url}" class="busqueda-resultado" data-idx="${i}">
            <div class="busqueda-icono"><i class="fa-solid ${r.icono}"></i></div>
            <div class="busqueda-info">
                <div class="busqueda-titulo">${r.titulo}</div>
                <div class="busqueda-sub">${r.subtitulo || ''}</div>
            </div>
            <span class="busqueda-tipo">${r.tipo}</span>
        </a>`).join('');
}

function inyectarBuscador() {
    // Botón en navbar
    const navbar = document.querySelector('.navbar');
    const links  = document.getElementById('nav-links');
    if (!navbar || !links) return;

    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.className = 'nav-busqueda-btn';
    btn.id = 'nav-busqueda-btn';
    btn.setAttribute('aria-label', 'Buscar');
    btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
    li.appendChild(btn);
    links.appendChild(li);

    // Overlay de búsqueda
    const overlay = document.createElement('div');
    overlay.id = 'busqueda-overlay';
    overlay.className = 'busqueda-overlay';
    overlay.innerHTML = `
        <div class="busqueda-panel" id="busqueda-panel">
            <div class="busqueda-input-wrap">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="search" id="busqueda-input" placeholder="Buscar servicios, productos, páginas…" autocomplete="off" spellcheck="false">
                <kbd class="busqueda-kbd">Esc</kbd>
            </div>
            <div class="busqueda-dropdown" id="busqueda-dropdown"></div>
        </div>`;
    document.body.appendChild(overlay);

    const input    = document.getElementById('busqueda-input');
    const dropdown = document.getElementById('busqueda-dropdown');

    function abrir() {
        overlay.classList.add('abierta');
        input.value = '';
        dropdown.innerHTML = '';
        setTimeout(() => input.focus(), 50);
    }
    function cerrar() {
        overlay.classList.remove('abierta');
        resultadoActivo = -1;
    }

    btn.addEventListener('click', abrir);
    overlay.addEventListener('click', e => { if (e.target === overlay) cerrar(); });

    let debounceTimer;
    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            const resultados = await buscar(input.value);
            renderResultados(resultados, dropdown);
        }, 180);
    });

    input.addEventListener('keydown', e => {
        const items = dropdown.querySelectorAll('.busqueda-resultado');
        if (e.key === 'Escape') { cerrar(); return; }
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            resultadoActivo = Math.min(resultadoActivo + 1, items.length - 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            resultadoActivo = Math.max(resultadoActivo - 1, -1);
        } else if (e.key === 'Enter' && resultadoActivo >= 0) {
            e.preventDefault();
            items[resultadoActivo]?.click();
            return;
        } else if (e.key === 'Enter' && items.length === 1) {
            items[0]?.click();
            return;
        }
        items.forEach((el, i) => el.classList.toggle('activo', i === resultadoActivo));
        if (resultadoActivo >= 0) items[resultadoActivo]?.scrollIntoView({ block: 'nearest' });
    });

    // Cerrar al navegar
    dropdown.addEventListener('click', cerrar);

    // Atajo Ctrl+K
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); abrir(); }
    });
}

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('email');

    const seccionInvitado = document.getElementById('nav-invitado');
    const seccionUsuario  = document.getElementById('nav-usuario');
    const emailSpan       = document.getElementById('nav-email');

    if (token && email) {
        if (seccionInvitado) seccionInvitado.style.display = 'none';
        if (seccionUsuario)  {
            seccionUsuario.style.display = 'flex';
            if (emailSpan) emailSpan.textContent = email;
        }
        const rol = localStorage.getItem('rol');
        if (rol === 'ROLE_ADMIN') {
            const adminLink = document.getElementById('nav-admin');
            if (adminLink) adminLink.style.display = 'inline-flex';
        }
    } else {
        if (seccionInvitado) seccionInvitado.style.display = 'flex';
        if (seccionUsuario)  seccionUsuario.style.display = 'none';
    }

    // Cerrar sesión
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function () {
            localStorage.clear();
            window.location.href = '/index.html';
        });
    }

    // Menú hamburguesa
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks   = document.getElementById('nav-links');
    const navAuth    = document.getElementById('nav-auth');

    if (hamburger) {
        hamburger.addEventListener('click', function () {
            navLinks.classList.toggle('abierto');
            navAuth.classList.toggle('abierto');
            const abierto = navLinks.classList.contains('abierto');
            hamburger.querySelector('i').className = abierto
                ? 'fa-solid fa-xmark'
                : 'fa-solid fa-bars';
        });
    }

    // Marcar enlace activo
    const paginaActual = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-links a').forEach(function (link) {
        const href = link.getAttribute('href').replace('/', '');
        if (href === paginaActual) {
            link.classList.add('activo');
        }
    });

    inyectarBuscador();
});
