package com.qpgs.backend.controller;

import com.qpgs.backend.dto.AuthResponse;
import com.qpgs.backend.dto.LoginRequest;
import com.qpgs.backend.dto.RefreshTokenRequest;
import com.qpgs.backend.dto.RegisterRequest;
import com.qpgs.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // update to match your frontend port
public class AuthController {

    @Autowired
    private AuthService authService;

    // POST register new user (admin or faculty)
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // POST login existing user
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // POST exchange a valid refresh token for a new access token
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshAccessToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    // POST invalidate the refresh token (called on logout)
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        try {
            authService.logout(request.getRefreshToken());
        } catch (Exception ignored) {
            // token already invalid/expired - logout should succeed either way
        }
        return ResponseEntity.noContent().build();
    }
}