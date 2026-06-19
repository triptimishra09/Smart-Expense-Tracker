package com.tripti.expensetracker.service;

import com.tripti.expensetracker.model.Expense;
import com.tripti.expensetracker.model.User;
import com.tripti.expensetracker.repository.ExpenseRepository;
import com.tripti.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));
    }

    public Expense addExpense(String email, String title, String description,
                              Double amount, String category, LocalDate date) {
        User user = getUser(email);
        Expense expense = new Expense();
        expense.setTitle(title);
        expense.setDescription(description);
        expense.setAmount(amount);
        expense.setCategory(category);
        expense.setDate(date);
        expense.setUser(user);
        return expenseRepository.save(expense);
    }

    public List<Expense> getAllExpenses(String email) {
        User user = getUser(email);
        return expenseRepository.findByUser(user);
    }

    public Expense updateExpense(String email, Long expenseId, String title,
                                  String description, Double amount,
                                  String category, LocalDate date) {
        User user = getUser(email);
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found!"));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized!");
        }

        expense.setTitle(title);
        expense.setDescription(description);
        expense.setAmount(amount);
        expense.setCategory(category);
        expense.setDate(date);
        return expenseRepository.save(expense);
    }

    public void deleteExpense(String email, Long expenseId) {
        User user = getUser(email);
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found!"));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized!");
        }
        expenseRepository.delete(expense);
    }

    public List<Expense> getExpensesByDateRange(String email, LocalDate start, LocalDate end) {
        User user = getUser(email);
        return expenseRepository.findByUserAndDateBetween(user, start, end);
    }

    public List<Expense> getExpensesByCategory(String email, String category) {
        User user = getUser(email);
        return expenseRepository.findByUserAndCategory(user, category);
    }

    public Map<String, Object> getAnalytics(String email) {
        User user = getUser(email);
        Map<String, Object> analytics = new HashMap<>();

        Double total = expenseRepository.findTotalAmountByUser(user);
        analytics.put("totalExpenses", total != null ? total : 0.0);

        List<Object[]> categoryData = expenseRepository.findAmountByCategoryForUser(user);
        Map<String, Double> categoryMap = new HashMap<>();
        for (Object[] row : categoryData) {
            categoryMap.put((String) row[0], (Double) row[1]);
        }
        analytics.put("categoryWise", categoryMap);

        return analytics;
    }
}