package com.example.demo.hello;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// @RestController: every method's return value becomes the response body.
// @RequestMapping("/api"): every path below starts with /api.
@RestController
@RequestMapping("/api")
public class HelloController {

    // GET /api/hello?name=Asha  ->  "Hello, Asha!"
    // @RequestParam reads ?name=... from the URL; without it, "World" is used.
    @GetMapping("/hello")
    public String hello(@RequestParam(defaultValue = "World") String name) {
        return "Hello, " + name + "!";
    }

    // GET /api/hello/Asha  ->  the same greeting, with the name in the path.
    // @PathVariable reads the {name} part of the path.
    @GetMapping("/hello/{name}")
    public Map<String, String> helloByPath(@PathVariable String name) {
        return Map.of("greeting", "Hello, " + name + "!", "date", LocalDate.now().toString());
    }

    // POST /api/greetings with a JSON body  ->  the body comes back with a message.
    // @RequestBody turns the JSON into a Greeting; @Valid checks its rules first,
    // and Spring answers 400 Bad Request if they fail (try "times": 0).
    @PostMapping("/greetings")
    public Map<String, Object> greet(@Valid @RequestBody Greeting greeting) {
        String message = ("Hello, " + greeting.name() + "! ").repeat(greeting.times()).trim();
        return Map.of("name", greeting.name(), "times", greeting.times(), "message", message);
    }

    // The shape of the JSON body: {"name": "Asha", "times": 2}
    public record Greeting(@NotBlank String name, @Min(1) int times) {
    }
}
