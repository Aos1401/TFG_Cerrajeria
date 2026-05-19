package com.TFG.cerrajeria.login.infrastructure;

import com.TFG.cerrajeria.login.application.LoginUseCase;
import com.TFG.cerrajeria.login.domain.LoginRequest;
import com.TFG.cerrajeria.login.domain.LoginResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/login")
public class LoginController {

    @Value("${app.admin.emails}")
    private List<String> adminEmails;

    private final LoginUseCase loginUseCase;

    public LoginController(LoginUseCase loginUseCase) {
        this.loginUseCase = loginUseCase;
    }

    @PostMapping
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            String token = loginUseCase.ejecutar(loginRequest.getEmail(), loginRequest.getPassword());
            String rol = adminEmails.stream().anyMatch(a -> a.equalsIgnoreCase(loginRequest.getEmail())) ? "ROLE_ADMIN" : "ROLE_USER";
            return ResponseEntity.ok(new LoginResponse(token, loginRequest.getEmail(), rol));
        } catch (Exception e) {
            return new ResponseEntity<>("Credenciales incorrectas", HttpStatus.UNAUTHORIZED);
        }
    }
}
