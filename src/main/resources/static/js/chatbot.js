(function () {
    // Inyectar HTML del widget
    const widget = document.createElement('div');
    widget.innerHTML = `
        <button class="chatbot-btn" id="chatbot-btn" aria-label="Abrir chat de ayuda">
            <i class="fa-solid fa-robot"></i>
            ¿Necesitas ayuda?
        </button>

        <div class="chatbot-ventana" id="chatbot-ventana" role="dialog" aria-label="Chat de asistencia">
            <div class="chatbot-header">
                <div class="chatbot-header-info">
                    <div class="chatbot-avatar"><i class="fa-solid fa-robot"></i></div>
                    <div class="chatbot-header-texto">
                        <strong>Asistente virtual</strong>
                        <span>Cerrajería Ortega</span>
                    </div>
                </div>
                <button class="chatbot-btn-cerrar" id="chatbot-cerrar" aria-label="Cerrar chat">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div class="chatbot-mensajes" id="chatbot-mensajes"></div>

            <div class="chatbot-input">
                <input type="text" id="chatbot-input" placeholder="Escribe tu pregunta..." maxlength="300" autocomplete="off">
                <button class="chatbot-btn-enviar" id="chatbot-enviar" aria-label="Enviar mensaje">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(widget);

    // Referencias
    const btn        = document.getElementById('chatbot-btn');
    const ventana    = document.getElementById('chatbot-ventana');
    const cerrar     = document.getElementById('chatbot-cerrar');
    const mensajesEl = document.getElementById('chatbot-mensajes');
    const inputEl    = document.getElementById('chatbot-input');
    const enviarBtn  = document.getElementById('chatbot-enviar');

    let abierto = false;
    let esperando = false;

    // Mensaje inicial
    agregarMensajeBot('¡Hola! Soy el asistente de Cerrajería Ortega. ¿En qué puedo ayudarte hoy?');

    // Eventos
    btn.addEventListener('click', toggleVentana);
    cerrar.addEventListener('click', toggleVentana);

    enviarBtn.addEventListener('click', enviar);
    inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviar();
        }
    });

    // Funciones

    function toggleVentana() {
        abierto = !abierto;
        ventana.classList.toggle('abierto', abierto);
        if (abierto) {
            inputEl.focus();
            btn.querySelector('span') && (btn.querySelector('span').textContent = '');
        }
    }

    async function enviar() {
        const texto = inputEl.value.trim();
        if (!texto || esperando) return;

        inputEl.value = '';
        agregarMensajeUsuario(texto);
        mostrarEscribiendo();

        esperando = true;
        enviarBtn.disabled = true;

        try {
            const response = await fetch('/api/chatbot/mensaje', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensaje: texto })
            });

            quitarEscribiendo();

            if (response.ok) {
                const data = await response.json();
                agregarMensajeBot(data.respuesta);
            } else {
                agregarMensajeBot('Lo siento, ha ocurrido un error. Puedes llamarnos al 600 123 456.');
            }
        } catch (err) {
            quitarEscribiendo();
            agregarMensajeBot('Sin conexión con el servidor. Para urgencias llama al 600 123 456.');
        } finally {
            esperando = false;
            enviarBtn.disabled = false;
            inputEl.focus();
        }
    }

    function agregarMensajeUsuario(texto) {
        const burbuja = document.createElement('div');
        burbuja.className = 'chat-burbuja usuario';
        burbuja.textContent = texto;
        mensajesEl.appendChild(burbuja);
        scrollAbajo();
    }

    const PAGINAS = {
        '/index.html':      'Ir al inicio',
        '/servicios.html':  'Ver servicios',
        '/ubicacion.html':  'Ver ubicación',
        '/presupuesto.html':'Pedir presupuesto',
        '/tienda.html':     'Ir a la tienda',
        '/login.html':      'Iniciar sesión',
        '/registro.html':   'Registrarse'
    };

    function textoConEnlaces(texto) {
        const escapado = texto.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        return escapado.replace(/\/[\w-]+\.html/g, function (ruta) {
            const etiqueta = PAGINAS[ruta] || ruta;
            return `<a href="${ruta}" class="chat-enlace">${etiqueta}</a>`;
        });
    }

    function agregarMensajeBot(texto) {
        const burbuja = document.createElement('div');
        burbuja.className = 'chat-burbuja bot';
        burbuja.innerHTML = textoConEnlaces(texto);
        mensajesEl.appendChild(burbuja);
        scrollAbajo();
    }

    function mostrarEscribiendo() {
        const escribiendo = document.createElement('div');
        escribiendo.className = 'chat-burbuja bot chat-escribiendo';
        escribiendo.id = 'chat-escribiendo';
        escribiendo.innerHTML = '<span></span><span></span><span></span>';
        mensajesEl.appendChild(escribiendo);
        scrollAbajo();
    }

    function quitarEscribiendo() {
        const el = document.getElementById('chat-escribiendo');
        if (el) el.remove();
    }

    function scrollAbajo() {
        mensajesEl.scrollTop = mensajesEl.scrollHeight;
    }
})();
