package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// How a request flows in this sample:
//   1. Spring Boot starts and scans this package for classes like @RestController.
//   2. A request such as GET /api/hello?name=Asha arrives at the embedded web server.
//   3. Spring finds the method mapped to that path (HelloController.hello) and calls it.
//   4. The method's return value is turned into the response body (text or JSON).
// Open the API tab, pick an endpoint and press Send.
@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }
}
