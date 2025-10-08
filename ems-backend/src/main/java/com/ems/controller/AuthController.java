package com.ems.controller;

import com.ems.model.User;
import com.ems.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        return authService.register(user);
    }

     @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User user) {
        return authService.login(user);
    }
}
