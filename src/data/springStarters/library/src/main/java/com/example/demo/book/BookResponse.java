package com.example.demo.book;

// What the API sends back. It copies what it needs from the entities, so the JSON never
// follows the Book -> Author link into a loop, and lazy fields are read inside the service.
public record BookResponse(Long id, String title, int publishedYear, Long authorId, String authorName) {

    static BookResponse from(Book book) {
        return new BookResponse(book.getId(), book.getTitle(), book.getPublishedYear(),
                book.getAuthor().getId(), book.getAuthor().getName());
    }
}
