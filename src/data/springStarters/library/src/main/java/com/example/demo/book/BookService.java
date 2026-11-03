package com.example.demo.book;

import com.example.demo.author.Author;
import com.example.demo.author.AuthorRepository;
import com.example.demo.common.NotFoundException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// The service layer: checks rules and keeps each operation in one transaction.
@Service
public class BookService {

    private final BookRepository books;
    private final AuthorRepository authors;

    public BookService(BookRepository books, AuthorRepository authors) {
        this.books = books;
        this.authors = authors;
    }

    @Transactional(readOnly = true)
    public List<BookResponse> search(String title) {
        List<Book> found = title == null || title.isBlank()
                ? books.findAll()
                : books.findByTitleContainingIgnoreCaseOrderByTitleAsc(title.trim());
        return found.stream().map(BookResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BookResponse> byAuthor(long authorId) {
        if (!authors.existsById(authorId)) {
            throw new NotFoundException("Author " + authorId + " was not found");
        }
        return books.findByAuthor_IdOrderByPublishedYearAsc(authorId).stream().map(BookResponse::from).toList();
    }

    @Transactional
    public BookResponse add(BookRequest request) {
        Author author = authors.findById(request.authorId())
                .orElseThrow(() -> new NotFoundException("Author " + request.authorId() + " was not found"));
        Book book = books.save(new Book(request.title().trim(), request.publishedYear(), author));
        return BookResponse.from(book);
    }

    @Transactional
    public void remove(long id) {
        Book book = books.findById(id).orElseThrow(() -> new NotFoundException("Book " + id + " was not found"));
        books.delete(book);
    }
}
