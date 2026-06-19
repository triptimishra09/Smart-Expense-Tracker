package com.tripti.expensetracker.service;

import com.tripti.expensetracker.model.BudgetLimit;
import com.tripti.expensetracker.model.Expense;
import com.tripti.expensetracker.model.User;
import com.tripti.expensetracker.repository.BudgetLimitRepository;
import com.tripti.expensetracker.repository.ExpenseRepository;
import com.tripti.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BudgetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BudgetLimitRepository budgetLimitRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    public void setOverallLimit(String email, Double limitAmount) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setMonthlyOverallLimit(limitAmount);
        userRepository.save(user);
    }

    public void setCategoryLimit(String email, String category, Double limitAmount) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BudgetLimit budgetLimit = budgetLimitRepository
                .findByUserAndCategory(user, category)
                .orElse(new BudgetLimit());

        budgetLimit.setUser(user);
        budgetLimit.setCategory(category);
        budgetLimit.setLimitAmount(limitAmount);

        budgetLimitRepository.save(budgetLimit);
    }

    public Map<String, Object> getBudgetStatus(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);
        LocalDate endOfMonth = today.withDayOfMonth(today.lengthOfMonth());

        Map<String, Object> response = new HashMap<>();

        // Overall budget calculation
        List<Expense> monthExpenses = expenseRepository
                .findByUserAndDateBetween(user, startOfMonth, endOfMonth);

        double totalSpent = monthExpenses.stream()
                .mapToDouble(Expense::getAmount)
                .sum();

        Double overallLimit = user.getMonthlyOverallLimit();

        Map<String, Object> overall = new HashMap<>();
        overall.put("limit", overallLimit);
        overall.put("spent", totalSpent);
        overall.put("percentage", calculatePercentage(totalSpent, overallLimit));
        overall.put("status", calculateStatus(totalSpent, overallLimit));

        response.put("overall", overall);

        // Category-wise budget calculation
        List<BudgetLimit> categoryLimits = budgetLimitRepository.findByUser(user);
        List<Map<String, Object>> categoryStatusList = new ArrayList<>();

        for (BudgetLimit budgetLimit : categoryLimits) {
            String category = budgetLimit.getCategory();

            List<Expense> categoryExpenses = expenseRepository
                    .findByUserAndCategoryAndDateBetween(user, category, startOfMonth, endOfMonth);

            double categorySpent = categoryExpenses.stream()
                    .mapToDouble(Expense::getAmount)
                    .sum();

            Map<String, Object> categoryStatus = new HashMap<>();
            categoryStatus.put("category", category);
            categoryStatus.put("limit", budgetLimit.getLimitAmount());
            categoryStatus.put("spent", categorySpent);
            categoryStatus.put("percentage", calculatePercentage(categorySpent, budgetLimit.getLimitAmount()));
            categoryStatus.put("status", calculateStatus(categorySpent, budgetLimit.getLimitAmount()));

            categoryStatusList.add(categoryStatus);
        }

        response.put("categories", categoryStatusList);

        return response;
    }

    private double calculatePercentage(double spent, Double limit) {
        if (limit == null || limit == 0) {
            return 0;
        }
        return (spent / limit) * 100;
    }

    private String calculateStatus(double spent, Double limit) {
        if (limit == null || limit == 0) {
            return "NO_LIMIT_SET";
        }
        double percentage = (spent / limit) * 100;
        if (percentage < 70) {
            return "GREEN";
        } else if (percentage < 100) {
            return "YELLOW";
        } else {
            return "RED";
        }
    }
}