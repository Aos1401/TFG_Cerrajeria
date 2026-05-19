# TFG Cerrajería Ortega

Aplicación web para una cerrajería. Desarrollada como Trabajo de Fin de Grado del ciclo DAW.

## Tecnologías

- **Backend:** Spring Boot 3.4.2 + Spring Security + JWT
- **Base de datos:** MySQL (vía XAMPP)
- **Frontend:** HTML, CSS, JavaScript vanilla
- **Chatbot:** Groq API (llama3)

## Módulos

- Autenticación y registro de usuarios
- Catálogo de productos
- Carrito de compra
- Solicitud de presupuestos
- Chatbot de atención al cliente
- Panel de administración

## Requisitos previos

- [Java 21+](https://adoptium.net/)
- [XAMPP](https://www.apachefriends.org/es/index.html) — solo se necesita el módulo **MySQL** (Apache no hace falta)
- Cuenta en [Groq](https://console.groq.com/keys) para obtener la API key del chatbot

## Dónde colocar el proyecto

Clona el repositorio en cualquier carpeta de tu equipo. **No hace falta colocarlo dentro de htdocs de XAMPP**, ya que el frontend lo sirve directamente Spring Boot.

```
git clone https://github.com/Aos1401/TFG_Cerrajeria.git
cd TFG_Cerrajeria
```

## Configuración

### 1. Arrancar MySQL con XAMPP

Abre el **Panel de Control de XAMPP** y pulsa **Start** en el módulo **MySQL**. Solo MySQL, Apache no es necesario.

### 2. Configurar application.properties

Copia el fichero de ejemplo y rellena tus valores:

```
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

Valores que debes rellenar:

| Propiedad | Descripción |
|---|---|
| `spring.datasource.password` | Contraseña de root en XAMPP (por defecto vacía: `""`) |
| `jwt.secret` | Cadena larga y aleatoria para firmar los tokens |
| `groq.api.key` | Tu clave de Groq (obtenla en https://console.groq.com/keys) |
| `app.admin.emails` | Email(s) que tendrán rol de administrador |

La base de datos `cerrajeria_db` se crea automáticamente al arrancar la aplicación si no existe.

### 3. Arrancar la aplicación

```
./mvnw spring-boot:run
```

El servidor arranca en `http://localhost:8081`
