package com.tripti.expensetracker.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tripti.expensetracker.service.BudgetService;

@RestController
@RequestMapping("/api/budget")
@CrossOrigin(origins = "http://localhost:3000")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @PostMapping("/overall")
    public ResponseEntity<?> setOverallLimit(
            @RequestBody Map<String, Object> request,
            Authentication auth) {
        try {
            String email = auth.getName();
            Double limitAmount = Double.valueOf(request.get("limitAmount").toString());
            budgetService.setOverallLimit(email, limitAmount);
            return ResponseEntity.ok(Map.of("message", "Overall limit updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/category")
    public ResponseEntity<?> setCategoryLimit(
            @RequestBody Map<String, Object> request,
            Authentication auth) {
        try {
            String email = auth.getName();
            String category = request.get("category").toString();
            Double limitAmount = Double.valueOf(request.get("limitAmount").toString());
            budgetService.setCategoryLimit(email, category, limitAmount);
            return ResponseEntity.ok(Map.of("message", "Category limit updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status")
    public ResponseEntity<?> getBudgetStatus(Authentication auth) {
        try {
            String email = auth.getName();
            Map<String, Object> status = budgetService.getBudgetStatus(email);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}