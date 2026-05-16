package com.TFG.cerrajeria.login.domain;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
