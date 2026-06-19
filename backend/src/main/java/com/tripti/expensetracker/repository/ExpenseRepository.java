package com.tripti.expensetracker.repository;

import com.tripti.expensetracker.model.Expense;
import com.tripti.expensetracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByUser(User user);

    List<Expense> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);

    List<Expense> findByUserAndCategory(User user, String category);

    @Query("SELECT e FROM Expense e WHERE e.user = :user AND e.category = :category AND e.date BETWEEN :startDate AND :endDate")
    List<Expense> findByUserAndCategoryAndDateBetween(
            @Param("user") User user,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user = :user")
    Double findTotalAmountByUser(User user);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user = :user GROUP BY e.category")
    List<Object[]> findAmountByCategoryForUser(User user);
}