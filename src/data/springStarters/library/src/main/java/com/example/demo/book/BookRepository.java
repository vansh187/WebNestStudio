package com.example.demo.book;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookRepository extends JpaRepository<Book, Long> {

    // "Author_Id" follows the relationship: WHERE author_id = ?
    List<Book> findByAuthor_IdOrderByPublishedYearAsc(Long authorId);

    List<Book> findByTitleContainingIgnoreCaseOrderByTitleAsc(String text);
}
