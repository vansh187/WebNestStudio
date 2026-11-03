package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Authors and books: two tables linked by a foreign key.
// How a request flows:
//   BookController (HTTP)  ->  BookService (rules, transactions)  ->  BookRepository (SQL)  ->  H2 database
// Each book row has an author_id column; JPA's @ManyToOne turns it into book.getAuthor().
// data.sql adds two authors and three books when the app starts.
@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
