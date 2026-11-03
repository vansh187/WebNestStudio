package com.example.demo.author;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

// A small controller can talk to its repository directly; BookController shows the service layer.
@RestController
@RequestMapping("/api/authors")
public class AuthorController {

    private final AuthorRepository repository;

    public AuthorController(AuthorRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<AuthorResponse> list() {
        return repository.findAll().stream().map(AuthorResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AuthorResponse create(@Valid @RequestBody AuthorRequest request) {
        return AuthorResponse.from(repository.save(new Author(request.name().trim())));
    }

    public record AuthorRequest(
            @NotBlank(message = "name is required")
            @Size(max = 80, message = "name must be at most 80 characters")
            String name) {
    }

    public record AuthorResponse(Long id, String name) {

        static AuthorResponse from(Author author) {
            return new AuthorResponse(author.getId(), author.getName());
        }
    }
}
