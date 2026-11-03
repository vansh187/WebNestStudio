package com.example.demo.book;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

// The HTTP layer: reads the request, calls the service, returns JSON.
@RestController
public class BookController {

    private final BookService service;

    public BookController(BookService service) {
        this.service = service;
    }

    // GET /api/books?title=spring  ->  books whose title contains "spring"
    @GetMapping("/api/books")
    public List<BookResponse> search(@RequestParam(required = false) String title) {
        return service.search(title);
    }

    // GET /api/authors/1/books  ->  one author's books, oldest first
    @GetMapping("/api/authors/{authorId}/books")
    public List<BookResponse> byAuthor(@PathVariable long authorId) {
        return service.byAuthor(authorId);
    }

    @PostMapping("/api/books")
    @ResponseStatus(HttpStatus.CREATED)
    public BookResponse add(@Valid @RequestBody BookRequest request) {
        return service.add(request);
    }

    @DeleteMapping("/api/books/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable long id) {
        service.remove(id);
    }
}
