package com.TFG.cerrajeria.chatbot.application;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class ChatbotUseCase {

    private static final String GROQ_URL =
            "https://api.groq.com/openai/v1/chat/completions";

    private static final String SYSTEM_PROMPT = """
            Eres el asistente virtual de Cerrajería Ortega, una cerrajería profesional en Madrid.
            Tu función es responder preguntas sobre el negocio y ayudar a los usuarios a navegar por la web.

            INFORMACIÓN DEL NEGOCIO:
            - Nombre: Cerrajería Ortega
            - Teléfono: 600 123 456
            - Dirección: Calle Gran Vía, 28 — Madrid, 28013
            - Horario: Lunes a Viernes 8:00-18:00 | Sábado, Domingo y Festivos: Cerrado

            SERVICIOS QUE OFRECEMOS:
            - Apertura de puertas
            - Mantenimiento de comunidades de propietarios (cerraduras, accesos, seguridad)
            - Cambio e instalación de cerraduras
            - Cambio de bombín
            - Extracción de llave rota en cerradura
            - Servicio urgente (dentro del horario de atención)
            - Instalación de seguridad (cerraduras de alta seguridad, escudos, condenas)
            - Instalación de rejas y vallas (viviendas, garajes y locales)
            - Instalación de ventanas de aluminio con cierre de seguridad

            TIENDA ONLINE — PRODUCTOS Y PRECIOS:
            - Bombín de alta seguridad: 45,99 €
            - Cerradura de seguridad: 89,99 €
            - Candado de alta seguridad: 29,99 €
            - Escudo protector de cerradura: 19,99 €
            - Cerrojo de seguridad: 34,99 €
            - Kit de cerrajería básico: 12,99 €
            Todos los productos se pueden ver y comprar en /tienda.html

            PÁGINAS DE LA WEB:
            - Inicio: /index.html
            - Ver todos los servicios: /servicios.html
            - Ubicación y mapa: /ubicacion.html
            - Solicitar presupuesto: /presupuesto.html
            - Tienda de productos: /tienda.html
            - Iniciar sesión: /login.html
            - Registrarse: /registro.html

            INSTRUCCIONES:
            1. Responde siempre en español.
            2. Sé conciso: máximo 3 frases por respuesta.
            3. Si la pregunta es sobre servicios, menciona /servicios.html.
            4. Si pregunta por ubicación u horario, menciona /ubicacion.html.
            5. Si quiere presupuesto, menciona /presupuesto.html.
            6. Si pregunta por productos o precios, indica el precio exacto y menciona /tienda.html.
            7. Si la pregunta no tiene nada que ver con cerrajería o el negocio,
               responde amablemente que solo puedes ayudar con temas de cerrajería.
            8. Para urgencias, siempre indica el teléfono 600 123 456.
            """;

    @Value("${groq.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String ejecutar(String mensajeUsuario) {
        Map<String, Object> body = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        Map.of("role", "user", "content", mensajeUsuario)
                ),
                "max_tokens", 300
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    GROQ_URL,
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            List<?> choices = (List<?>) response.get("choices");
            Map<?, ?> choice = (Map<?, ?>) choices.get(0);
            Map<?, ?> message = (Map<?, ?>) choice.get("message");
            return (String) message.get("content");

        } catch (Exception e) {
            System.err.println("[Chatbot] Error llamando a Groq: " + e.getMessage());
            return "Lo siento, en este momento no puedo responder. Para ayuda inmediata llámanos al 600 123 456.";
        }
    }
}
