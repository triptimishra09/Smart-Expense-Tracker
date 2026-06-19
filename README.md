# Smart Expense Tracker

A full-stack expense tracking application with budget management, real-time alerts, and category-wise analytics.

## Project Structure

- backend/ — Spring Boot REST API (Java, MySQL, JWT authentication)
- frontend/ — React frontend (Recharts for analytics, Axios for API calls)

## Features

- User Register/Login with JWT-based authentication
- Add, view, update, delete expenses
- Category-wise spending analytics (pie chart)
- Set monthly budget limits (overall + category-wise)
- Real-time color-coded alerts (Green/Yellow/Red) when nearing or exceeding budget

## Tech Stack

Backend: Java 21, Spring Boot 4.0.6, Spring Security, JPA/Hibernate, MySQL
Frontend: React, React Router, Axios, Recharts

## How to Run

### Backend
cd backend
./mvnw spring-boot:run

Runs on http://localhost:8080

### Frontend
cd frontend
npm install
npm start

Runs on http://localhost:3000

