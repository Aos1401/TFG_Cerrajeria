package com.TFG.cerrajeria.chatbot.infrastructure;

import com.TFG.cerrajeria.chatbot.application.ChatbotUseCase;
import com.TFG.cerrajeria.chatbot.domain.ChatMensaje;
import com.TFG.cerrajeria.chatbot.domain.ChatRespuesta;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotUseCase chatbotUseCase;

    public ChatbotController(ChatbotUseCase chatbotUseCase) {
        this.chatbotUseCase = chatbotUseCase;
    }

    @PostMapping("/mensaje")
    public ResponseEntity<ChatRespuesta> enviarMensaje(@RequestBody ChatMensaje chatMensaje) {
        String respuesta = chatbotUseCase.ejecutar(chatMensaje.getMensaje());
        return ResponseEntity.ok(new ChatRespuesta(respuesta));
    }
}
