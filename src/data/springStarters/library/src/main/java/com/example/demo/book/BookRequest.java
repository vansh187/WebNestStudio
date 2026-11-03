package com.example.demo.book;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// The JSON a client sends to add a book: {"title": "...", "publishedYear": 2020, "authorId": 1}
public record BookRequest(
        @NotBlank(message = "title is required")
        @Size(max = 120, message = "title must be at most 120 characters")
        String title,
        @Min(value = 1450, message = "publishedYear must be 1450 or later")
        @Max(value = 2100, message = "publishedYear must be 2100 or earlier")
        int publishedYear,
        @NotNull(message = "authorId is required")
        Long authorId) {
}
