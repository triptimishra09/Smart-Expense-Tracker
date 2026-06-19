package com.tripti.expensetracker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tripti.expensetracker.model.BudgetLimit;
import com.tripti.expensetracker.model.User;

public interface BudgetLimitRepository extends JpaRepository<BudgetLimit, Long> {

    List<BudgetLimit> findByUser(User user);

    Optional<BudgetLimit> findByUserAndCategory(User user, String category);
}