package com.tripti.expensetracker.service;

import com.tripti.expensetracker.model.User;
import com.tripti.expensetracker.repository.UserRepository;
import com.tripti.expensetracker.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public Map<String, String> register(String name, String email, String password, String role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists!");
        }

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(User.Role.valueOf(role.toUpperCase()));

        userRepository.save(user);

        String token = jwtUtil.generateToken(email);
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole().toString());
        response.put("name", user.getName());
        return response;
    }

    public Map<String, String> login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password!");
        }

        String token = jwtUtil.generateToken(email);
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole().toString());
        response.put("name", user.getName());
        return response;
    }
}