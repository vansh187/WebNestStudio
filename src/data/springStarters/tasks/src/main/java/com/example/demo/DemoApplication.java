package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// A task manager in layers. How a request such as POST /api/tasks flows:
//   TaskController (HTTP: path, JSON, status codes)
//     -> TaskService (business rules, one transaction per operation)
//       -> TaskRepository (Spring Data writes the SQL)
//         -> H2 database (the tasks table, created from the Task entity)
// Errors go back through GlobalExceptionHandler as JSON: 400, 404 or 409.
// data.sql adds two tasks when the app starts.
@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
