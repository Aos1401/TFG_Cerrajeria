# TFG Cerrajería Ortega

Aplicación web para una cerrajería. Desarrollada como Trabajo de Fin de Grado del ciclo DAW.

## Tecnologías

- **Backend:** Spring Boot 3.4.2 + Spring Security + JWT
- **Base de datos:** MySQL
- **Frontend:** HTML, CSS, JavaScript vanilla
- **Chatbot:** Groq API (llama3)

## Módulos

- Autenticación y registro de usuarios
- Catálogo de productos
- Carrito de compra
- Solicitud de presupuestos
- Chatbot de atención al cliente
- Panel de administración

## Configuración

1. Copia `src/main/resources/application.properties.example` como `application.properties`
2. Rellena las credenciales de base de datos, el secreto JWT y tu clave de Groq (obtenla gratis en https://console.groq.com/keys)
3. Arranca MySQL y ejecuta la aplicación con `./mvnw spring-boot:run`

El servidor arranca en `http://localhost:8081`
