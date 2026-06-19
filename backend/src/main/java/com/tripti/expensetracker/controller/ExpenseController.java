package com.tripti.expensetracker.controller;

import com.tripti.expensetracker.model.Expense;
import com.tripti.expensetracker.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "http://localhost:3000")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<?> addExpense(@RequestBody Map<String, Object> request,
                                         Authentication auth) {
        try {
            String email = auth.getName();
            Expense expense = expenseService.addExpense(
                email,
                (String) request.get("title"),
                (String) request.get("description"),
                Double.valueOf(request.get("amount").toString()),
                (String) request.get("category"),
                LocalDate.parse((String) request.get("date"))
            );
            return ResponseEntity.ok(expense);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllExpenses(Authentication auth) {
        try {
            String email = auth.getName();
            List<Expense> expenses = expenseService.getAllExpenses(email);
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateExpense(@PathVariable Long id,
                                            @RequestBody Map<String, Object> request,
                                            Authentication auth) {
        try {
            String email = auth.getName();
            Expense expense = expenseService.updateExpense(
                email, id,
                (String) request.get("title"),
                (String) request.get("description"),
                Double.valueOf(request.get("amount").toString()),
                (String) request.get("category"),
                LocalDate.parse((String) request.get("date"))
            );
            return ResponseEntity.ok(expense);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id,
                                            Authentication auth) {
        try {
            String email = auth.getName();
            expenseService.deleteExpense(email, id);
            return ResponseEntity.ok(Map.of("message", "Expense deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/filter")
    public ResponseEntity<?> filterByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            Authentication auth) {
        try {
            String email = auth.getName();
            List<Expense> expenses = expenseService.getExpensesByDateRange(email, start, end);
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<?> filterByCategory(@PathVariable String category,
                                               Authentication auth) {
        try {
            String email = auth.getName();
            List<Expense> expenses = expenseService.getExpensesByCategory(email, category);
            return ResponseEntity.ok(expenses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics(Authentication auth) {
        try {
            String email = auth.getName();
            Map<String, Object> analytics = expenseService.getAnalytics(email);
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}