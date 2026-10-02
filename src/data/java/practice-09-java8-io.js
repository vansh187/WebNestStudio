// Practice blocks for the Java 8+ and I/O module. Merged onto the lesson entries in
// index.js by slug, so the lesson prose files stay unchanged.
// I/O exercises read and write in memory or in a temporary file, and date exercises use
// fixed dates, so the output is the same on every run.
export const practice09Java8Io = {
  'lambda-expressions': {
    whyItMatters: `Lambdas changed how Java is written. Streams, comparators, event handlers, thread tasks and most of the Spring API expect you to pass behaviour as a short function. Code written since Java 8 is hard to read, and harder to write, without being comfortable with the <code>-&gt;</code> syntax.`,
    exercise: {
      prompt: `Sort the words by length, shortest first, by passing a lambda to <code>sort</code>.

Expected output: <code>[fig, kiwi, mango]</code>`,
      starterCode: `import java.util.ArrayList;
import java.util.List;

public class SortByLength {
    public static void main(String[] args) {
        List<String> words = new ArrayList<>(List.of("mango", "fig", "kiwi"));

        // TODO: sort the list by word length using a lambda

        System.out.println(words);
    }
}`,
      hints: [
        '<code>words.sort(...)</code> takes a <code>Comparator</code>, which has one method with two parameters.',
        'The lambda <code>(a, b) -&gt; Integer.compare(a.length(), b.length())</code> compares two words by length.',
      ],
      solution: `import java.util.ArrayList;
import java.util.List;

public class SortByLength {
    public static void main(String[] args) {
        List<String> words = new ArrayList<>(List.of("mango", "fig", "kiwi"));

        words.sort((a, b) -> Integer.compare(a.length(), b.length()));

        System.out.println(words); // [fig, kiwi, mango]
    }
}`,
    },
    quiz: [
      {
        question: 'Which of these is a valid lambda for a method that takes two ints and returns their sum?',
        options: ['(a, b) -> return a + b', '(a, b) => a + b', 'a, b -> a + b', '(a, b) -> a + b'],
        answer: 3,
        explanation: 'Java uses ->. Several parameters need parentheses, and return is only allowed inside a block with braces.',
      },
      {
        question: 'A lambda uses a local variable from the enclosing method. What must be true of that variable?',
        options: ['It must be final or effectively final', 'It must be static', 'It must be a primitive', 'It must be declared inside the lambda'],
        answer: 0,
        explanation: 'The variable may not be reassigned after it is first given a value.',
      },
      {
        question: 'What can a lambda expression be assigned to?',
        options: ['Any class', 'A functional interface, which has exactly one abstract method', 'Any interface', 'Only Runnable'],
        answer: 1,
        explanation: 'The lambda supplies the body of that one abstract method.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a lambda expression?',
        answer: `A lambda is a short way to write an implementation of a functional interface: a parameter list, an arrow and a body. It lets you pass behaviour to a method as an argument, for example a comparison to <code>sort</code> or a task to a thread, without declaring a class.`,
      },
      {
        question: 'How does a lambda differ from an anonymous inner class?',
        answer: `An anonymous class can implement an interface with several methods and can have its own fields; a lambda can only implement a functional interface and has no state of its own. Inside an anonymous class, <code>this</code> refers to the anonymous object, while inside a lambda it refers to the enclosing object. The compiler also produces no separate class file for a lambda.`,
      },
      {
        question: 'Why must local variables captured by a lambda be effectively final?',
        answer: `The lambda may run later, possibly on another thread, after the method that created it has returned and its local variables are gone. Java therefore copies the value into the lambda. If the variable could change afterwards, the copy and the original would disagree, so the language forbids reassigning it.`,
      },
    ],
  },

  'functional-interfaces': {
    whyItMatters: `Every lambda has a type, and that type is a functional interface. The four you will meet constantly are <code>Predicate</code>, <code>Function</code>, <code>Consumer</code> and <code>Supplier</code>: they are the parameter types of the Stream API and of much of modern Java. Recognising them tells you at once what kind of lambda a method expects.`,
    exercise: {
      prompt: `Define a <code>Predicate</code> that tests whether a number is even and a <code>Function</code> that squares a number. Print the result of testing 4, of squaring 5, and of testing 4 with the predicate negated.

Expected output: <code>true</code>, <code>25</code>, <code>false</code> (one per line)`,
      starterCode: `import java.util.function.Function;
import java.util.function.Predicate;

public class BuiltInInterfaces {
    public static void main(String[] args) {
        // TODO: Predicate<Integer> isEven
        // TODO: Function<Integer, Integer> square

        // TODO: print isEven for 4, square of 5, and the negated predicate for 4
    }
}`,
      hints: [
        'A <code>Predicate</code> is called with <code>test(value)</code> and a <code>Function</code> with <code>apply(value)</code>.',
        '<code>isEven.negate()</code> returns a new predicate that gives the opposite answer.',
      ],
      solution: `import java.util.function.Function;
import java.util.function.Predicate;

public class BuiltInInterfaces {
    public static void main(String[] args) {
        Predicate<Integer> isEven = n -> n % 2 == 0;
        Function<Integer, Integer> square = n -> n * n;

        System.out.println(isEven.test(4));          // true
        System.out.println(square.apply(5));         // 25
        System.out.println(isEven.negate().test(4)); // false
    }
}`,
    },
    quiz: [
      {
        question: 'Which interface takes no argument and returns a value?',
        options: ['Consumer', 'Predicate', 'Supplier', 'Function'],
        answer: 2,
        explanation: 'A Supplier has one method, get(), that takes nothing and returns a result.',
      },
      {
        question: 'Can a functional interface have default methods?',
        options: ['No', 'Only if they are private', 'Only one', 'Yes, any number, as long as it has exactly one abstract method'],
        answer: 3,
        explanation: 'Only abstract methods count. Predicate, for example, has default methods and(), or() and negate().',
      },
      {
        question: 'What does the <code>@FunctionalInterface</code> annotation do?',
        options: ['Makes the compiler report an error if the interface does not have exactly one abstract method', 'Makes the interface functional', 'Makes the interface run faster', 'It is required for lambdas to work'],
        answer: 0,
        explanation: 'It is optional. It documents the intent and guards against someone adding a second abstract method.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a functional interface?',
        answer: `An interface with exactly one abstract method. It can also have default and static methods. Because there is only one method to implement, a lambda or method reference can be used wherever the interface is expected. <code>Runnable</code>, <code>Comparator</code> and <code>Callable</code> are examples that existed before Java 8.`,
      },
      {
        question: 'Explain Predicate, Function, Consumer and Supplier.',
        answer: `<code>Predicate&lt;T&gt;</code> takes a value and returns a boolean; it is used for filtering. <code>Function&lt;T, R&gt;</code> takes a value and returns another value; it is used for transforming. <code>Consumer&lt;T&gt;</code> takes a value and returns nothing; it is used for actions such as printing. <code>Supplier&lt;T&gt;</code> takes nothing and returns a value; it is used to produce or defer a value.`,
      },
    ],
  },

  'stream-api': {
    whyItMatters: `Filtering a list, converting each element, grouping and totalling are the most common things done to data, and the Stream API expresses all of them as a short pipeline. Stream code is in every modern Java codebase, and stream questions are in almost every Java interview from junior level upwards.`,
    exercise: {
      prompt: `From the list of numbers, keep those greater than 6, double each one, sort the result and collect it into a list. Then print the sum of that list.

Expected output: <code>[16, 24, 40]</code> then <code>80</code>`,
      starterCode: `import java.util.List;
import java.util.stream.Collectors;

public class StreamPipeline {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(5, 12, 8, 3, 20);

        // TODO: filter (> 6), map (double), sorted, collect to a list
        // TODO: print the list
        // TODO: print the sum of the list
    }
}`,
      hints: [
        'Chain <code>filter</code>, <code>map</code> and <code>sorted</code>, and finish with <code>collect(Collectors.toList())</code>.',
        'For the sum, <code>mapToInt(Integer::intValue).sum()</code> works on a stream of the result.',
      ],
      solution: `import java.util.List;
import java.util.stream.Collectors;

public class StreamPipeline {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(5, 12, 8, 3, 20);

        List<Integer> result = numbers.stream()
                .filter(n -> n > 6)
                .map(n -> n * 2)
                .sorted()
                .collect(Collectors.toList());

        System.out.println(result); // [16, 24, 40]

        int sum = result.stream().mapToInt(Integer::intValue).sum();
        System.out.println(sum); // 80
    }
}`,
    },
    quiz: [
      {
        question: 'A pipeline has <code>filter</code> and <code>map</code> but no terminal operation. What runs?',
        options: ['Both operations', 'Only filter', 'Nothing', 'It does not compile'],
        answer: 2,
        explanation: 'Intermediate operations are lazy. They run only when a terminal operation asks for results.',
      },
      {
        question: 'What happens if you call a terminal operation twice on the same stream?',
        options: ['The pipeline runs again', 'IllegalStateException is thrown', 'The second call returns an empty result', 'It does not compile'],
        answer: 1,
        explanation: 'A stream can be used once. Create a new stream from the source to run the pipeline again.',
      },
      {
        question: 'Does <code>list.stream().filter(...)</code> remove elements from <code>list</code>?',
        options: ['Yes', 'Only for an ArrayList', 'No; a stream does not change its source', 'Only if collect is called'],
        answer: 2,
        explanation: 'The pipeline produces a new result and leaves the original collection as it was.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between intermediate and terminal operations?',
        answer: `Intermediate operations, such as <code>filter</code>, <code>map</code> and <code>sorted</code>, return another stream and are lazy: they only describe what should happen. A terminal operation, such as <code>collect</code>, <code>forEach</code>, <code>count</code> or <code>reduce</code>, produces a result or a side effect and causes the whole pipeline to run. A pipeline has any number of intermediate operations and exactly one terminal operation.`,
      },
      {
        question: 'What is the difference between map and flatMap?',
        answer: `<code>map</code> turns each element into exactly one new element. <code>flatMap</code> turns each element into a stream of elements and joins all those streams into one. Mapping a list of orders to their item lists gives a stream of lists; <code>flatMap</code> gives a single stream of items.`,
      },
      {
        question: 'How is a Stream different from a Collection?',
        answer: `A collection stores elements in memory and can be read many times. A stream stores nothing: it carries elements from a source through a pipeline of operations, computes them on demand, can be used only once, and does not modify the source.`,
      },
    ],
  },

  'method-references': {
    whyItMatters: `Method references are the shortest way to pass an existing method where a lambda is expected, and stream code is full of them: <code>String::toUpperCase</code>, <code>System.out::println</code>, <code>ArrayList::new</code>. You need to be able to read them at a glance and to know which of the four forms you are looking at.`,
    exercise: {
      prompt: `Replace both lambdas with method references. The output must not change.

Expected output: <code>ASHA</code> then <code>RAVI</code>`,
      starterCode: `import java.util.List;

public class UseMethodReferences {
    public static void main(String[] args) {
        List<String> names = List.of("asha", "ravi");

        names.stream()
                .map(name -> name.toUpperCase())          // TODO: method reference
                .forEach(name -> System.out.println(name)); // TODO: method reference
    }
}`,
      hints: [
        'A lambda that only calls a method on its parameter becomes <code>ClassName::methodName</code>.',
        'A lambda that passes its parameter to a method of an existing object becomes <code>object::methodName</code>.',
      ],
      solution: `import java.util.List;

public class UseMethodReferences {
    public static void main(String[] args) {
        List<String> names = List.of("asha", "ravi");

        names.stream()
                .map(String::toUpperCase)
                .forEach(System.out::println); // ASHA, RAVI
    }
}`,
    },
    quiz: [
      {
        question: 'Which lambda is equivalent to <code>Integer::parseInt</code>?',
        options: ['s -> s.parseInt()', 's -> new Integer(s)', '() -> Integer.parseInt()', 's -> Integer.parseInt(s)'],
        answer: 3,
        explanation: 'parseInt is a static method, so the argument of the lambda is passed to it.',
      },
      {
        question: 'What kind of method reference is <code>ArrayList::new</code>?',
        options: ['Constructor reference', 'Reference to a method of a particular object', 'Static method reference', 'It is not valid'],
        answer: 0,
        explanation: 'ClassName::new refers to a constructor, for example as a Supplier that creates a new list.',
      },
      {
        question: 'In <code>String::length</code>, on which object is <code>length()</code> called?',
        options: ['On the String class', 'On the first argument passed to the function', 'On an empty string', 'On the current object'],
        answer: 1,
        explanation: 'For an instance method referenced through its class, the first argument becomes the object the method is called on.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the four kinds of method reference?',
        answer: `A static method, as in <code>Integer::parseInt</code>. An instance method of a particular object, as in <code>System.out::println</code>. An instance method of an arbitrary object of a given type, as in <code>String::toUpperCase</code>, where the first argument is the object the method is called on. And a constructor, as in <code>ArrayList::new</code>.`,
      },
      {
        question: 'When should you use a lambda instead of a method reference?',
        answer: `When the body does more than forward its arguments to one existing method, for example when it adds a calculation, passes extra arguments, or combines two calls. A method reference is only clearer when the lambda would be a single plain method call.`,
      },
    ],
  },

  'optional-class': {
    whyItMatters: `<code>NullPointerException</code> is the most common runtime error in Java, and it usually happens because a method returned <code>null</code> and the caller did not expect it. Returning an <code>Optional</code> states in the method signature that there may be no result, and the caller has to decide what to do in that case. Spring Data repositories, for example, return <code>Optional</code> from <code>findById</code>.`,
    exercise: {
      prompt: `Complete <code>findEmail</code> so that it returns an <code>Optional</code> that is empty when the user has no email. The <code>main</code> method prints the email in upper case, or <code>no email</code> when there is none.

Expected output: <code>ASHA@EXAMPLE.COM</code> then <code>no email</code>`,
      starterCode: `import java.util.Map;
import java.util.Optional;

public class FindEmail {
    static final Map<String, String> EMAILS = Map.of("asha", "asha@example.com");

    static Optional<String> findEmail(String user) {
        // TODO: return an Optional holding the email, or an empty Optional
        return null;
    }

    public static void main(String[] args) {
        System.out.println(findEmail("asha").map(String::toUpperCase).orElse("no email"));
        System.out.println(findEmail("ravi").map(String::toUpperCase).orElse("no email"));
    }
}`,
      hints: [
        '<code>EMAILS.get(user)</code> returns <code>null</code> when the user is not in the map.',
        '<code>Optional.ofNullable(value)</code> gives an empty Optional for <code>null</code> and a filled one otherwise.',
      ],
      solution: `import java.util.Map;
import java.util.Optional;

public class FindEmail {
    static final Map<String, String> EMAILS = Map.of("asha", "asha@example.com");

    static Optional<String> findEmail(String user) {
        return Optional.ofNullable(EMAILS.get(user));
    }

    public static void main(String[] args) {
        System.out.println(findEmail("asha").map(String::toUpperCase).orElse("no email")); // ASHA@EXAMPLE.COM
        System.out.println(findEmail("ravi").map(String::toUpperCase).orElse("no email")); // no email
    }
}`,
    },
    quiz: [
      {
        question: 'What does <code>Optional.of(null)</code> do?',
        options: ['Returns an empty Optional', 'Returns null', 'Throws NullPointerException', 'Does not compile'],
        answer: 2,
        explanation: 'Optional.of requires a non-null value. Use Optional.ofNullable when the value may be null.',
      },
      {
        question: 'What happens when <code>get()</code> is called on an empty Optional?',
        options: ['It returns null', 'It throws NullPointerException', 'It returns an empty string', 'It throws NoSuchElementException'],
        answer: 3,
        explanation: 'This is why orElse, orElseGet, map and ifPresent are preferred to get().',
      },
      {
        question: 'Which is the recommended use of <code>Optional</code>?',
        options: ['As a return type for a method that may have no result', 'As a method parameter', 'As a field type', 'As an element of a list'],
        answer: 0,
        explanation: 'Optional was designed for return types. Elsewhere it adds overhead without making the code safer.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What problem does Optional solve?',
        answer: `It makes the possible absence of a value part of the method's return type. A method that returns <code>User</code> might return <code>null</code>, and nothing warns the caller. A method that returns <code>Optional&lt;User&gt;</code> tells the caller that there may be no user and provides methods such as <code>map</code>, <code>orElse</code> and <code>ifPresent</code> to handle both cases without a null check.`,
      },
      {
        question: 'What is the difference between orElse and orElseGet?',
        answer: `<code>orElse(value)</code> takes a value, and the expression that produces that value is always evaluated, even when the Optional is not empty. <code>orElseGet(supplier)</code> takes a <code>Supplier</code> that is called only when the Optional is empty. Use <code>orElseGet</code> when the default is costly to create, such as a database call.`,
      },
    ],
  },

  'date-and-time-api': {
    whyItMatters: `Dates appear in almost every application: due dates, bookings, subscriptions, reports. The old <code>Date</code> and <code>Calendar</code> classes were mutable and easy to misuse, and they still appear in legacy code. The <code>java.time</code> API is what you should write today, and its immutability and clear class names remove most date bugs.`,
    exercise: {
      prompt: `Starting from 31 January 2024, add one month and print the result, then print that date in the pattern <code>dd/MM/yyyy</code>. Finally print the number of days from 1 January 2024 to 1 March 2024.

Expected output: <code>2024-02-29</code>, <code>29/02/2024</code>, <code>60</code> (one per line)`,
      starterCode: `import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class DatePractice {
    public static void main(String[] args) {
        LocalDate start = LocalDate.of(2024, 1, 31);

        // TODO: add one month and print the new date
        // TODO: print the new date formatted as dd/MM/yyyy
        // TODO: print the days between 2024-01-01 and 2024-03-01
    }
}`,
      hints: [
        '<code>plusMonths(1)</code> returns a new date. February has no day 31, so the result is the last valid day of the month.',
        '<code>ChronoUnit.DAYS.between(from, to)</code> returns the number of days as a <code>long</code>.',
      ],
      solution: `import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class DatePractice {
    public static void main(String[] args) {
        LocalDate start = LocalDate.of(2024, 1, 31);

        LocalDate next = start.plusMonths(1);
        System.out.println(next); // 2024-02-29 (2024 is a leap year)

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        System.out.println(next.format(formatter)); // 29/02/2024

        long days = ChronoUnit.DAYS.between(LocalDate.of(2024, 1, 1), LocalDate.of(2024, 3, 1));
        System.out.println(days); // 60
    }
}`,
    },
    quiz: [
      {
        question: 'After <code>LocalDate d = LocalDate.of(2024, 1, 1); d.plusDays(5);</code> what is the value of <code>d</code>?',
        options: ['2024-01-06', '2024-01-01', '2024-01-05', 'It throws an exception'],
        answer: 1,
        explanation: 'LocalDate is immutable. plusDays returns a new object, and here the result is discarded.',
      },
      {
        question: 'Which class measures an amount of time in hours, minutes and seconds?',
        options: ['Period', 'LocalDate', 'Duration', 'DateTimeFormatter'],
        answer: 2,
        explanation: 'Duration is time-based. Period is date-based: years, months and days.',
      },
      {
        question: 'Which class should represent a date of birth?',
        options: ['LocalDateTime', 'Instant', 'ZonedDateTime', 'LocalDate'],
        answer: 3,
        explanation: 'A date of birth has no time of day and no time zone.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why was the java.time API introduced?',
        answer: `<code>java.util.Date</code> and <code>Calendar</code> are mutable, so a date passed to a method can be changed by it, and they are not thread-safe; <code>SimpleDateFormat</code> in particular fails when shared between threads. Their design is also confusing: months start at 0 and a <code>Date</code> is really a timestamp. The <code>java.time</code> classes are immutable, thread-safe, and separate the concepts of date, time, timestamp and time zone into different classes.`,
      },
      {
        question: 'What is the difference between LocalDateTime, ZonedDateTime and Instant?',
        answer: `<code>LocalDateTime</code> is a date and time with no time zone, like the reading on a wall clock; it does not identify a single moment. <code>ZonedDateTime</code> adds a time zone, so it does. <code>Instant</code> is a point on the UTC timeline, counted from 1 January 1970, and is the usual choice for storing when something happened.`,
      },
    ],
  },

  'java-i-o-streams-fundamentals': {
    whyItMatters: `Reading files, handling uploads, calling other services and writing logs all go through streams. The whole of <code>java.io</code> follows from two ideas covered here: bytes versus characters, and wrapping one stream in another to add a feature such as buffering. Closing streams correctly is also what prevents resource leaks in long-running programs.`,
    exercise: {
      prompt: `Copy every byte from the input stream to the output stream using a small buffer, then print the copied text. Both streams are in memory, so no file is needed. Use try-with-resources.

Expected output: <code>hello streams</code>`,
      starterCode: `import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class CopyBytes {
    public static void main(String[] args) throws IOException {
        byte[] source = "hello streams".getBytes(StandardCharsets.UTF_8);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (InputStream in = new ByteArrayInputStream(source)) {
            byte[] buffer = new byte[4];
            // TODO: read into the buffer until read() returns -1,
            //       writing only the bytes that were actually read
        }

        System.out.println(new String(out.toByteArray(), StandardCharsets.UTF_8));
    }
}`,
      hints: [
        '<code>in.read(buffer)</code> returns how many bytes it placed in the buffer, or <code>-1</code> at the end.',
        'Write with <code>out.write(buffer, 0, count)</code>. Writing the whole buffer would repeat old bytes on the last, shorter read.',
      ],
      solution: `import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class CopyBytes {
    public static void main(String[] args) throws IOException {
        byte[] source = "hello streams".getBytes(StandardCharsets.UTF_8);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try (InputStream in = new ByteArrayInputStream(source)) {
            byte[] buffer = new byte[4];
            int count;
            while ((count = in.read(buffer)) != -1) {
                out.write(buffer, 0, count); // only the bytes just read
            }
        }

        System.out.println(new String(out.toByteArray(), StandardCharsets.UTF_8)); // hello streams
    }
}`,
    },
    quiz: [
      {
        question: 'What does <code>read()</code> return when the end of a stream is reached?',
        options: ['-1', '0', 'null', 'It throws EOFException'],
        answer: 0,
        explanation: 'The value -1 marks the end, which is why read loops test for it.',
      },
      {
        question: 'Which kind of stream should be used to read a text file?',
        options: ['A character stream (Reader), which decodes bytes into characters', 'A byte stream, always', 'Either; there is no difference', 'An object stream'],
        answer: 0,
        explanation: 'A character in an encoding such as UTF-8 may take several bytes. A Reader handles the decoding.',
      },
      {
        question: 'What does try-with-resources guarantee?',
        options: ['The code never throws', 'The file is deleted afterwards', 'Each resource is closed when the block ends, including when an exception is thrown', 'The stream is buffered'],
        answer: 2,
        explanation: 'close() is called automatically, in the reverse of the order in which the resources were declared.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between byte streams and character streams?',
        answer: `Byte streams, the <code>InputStream</code> and <code>OutputStream</code> classes, read and write raw 8-bit bytes and are used for binary data such as images and archives. Character streams, the <code>Reader</code> and <code>Writer</code> classes, read and write characters and convert between bytes and characters using a character encoding, so they are used for text.`,
      },
      {
        question: 'Why wrap a stream in a buffered stream?',
        answer: `Without a buffer, each <code>read()</code> or <code>write()</code> call may go to the operating system, which is slow. A buffered stream reads or writes a large block at a time and serves individual calls from memory, which greatly reduces the number of system calls. A buffered output stream must be flushed or closed for the last block to be written.`,
      },
    ],
  },

  'scanner-and-reading-user-input': {
    whyItMatters: `Reading input is the first interactive thing most programs do, and almost everyone who uses <code>Scanner</code> meets the same bug: a name that comes back empty after a number was read. Understanding why it happens takes a few minutes and saves hours, in practice programs and in coding tests alike.`,
    exercise: {
      prompt: `The input contains an age on the first line and a full name on the second. As written, the program prints an empty name because <code>nextLine()</code> reads the rest of the first line. Fix it. The <code>Scanner</code> reads from a string here so the result is the same on every run; the fix is identical for <code>System.in</code>.

Expected output: <code>Asha Rao, 25</code>`,
      starterCode: `import java.util.Scanner;

public class ReadAgeAndName {
    public static void main(String[] args) {
        Scanner scanner = new Scanner("25\\nAsha Rao");

        int age = scanner.nextInt();
        // TODO: the line break after 25 is still unread at this point
        String name = scanner.nextLine();

        System.out.println(name + ", " + age);
    }
}`,
      hints: [
        '<code>nextInt()</code> reads the digits and stops before the line break.',
        'Add one <code>scanner.nextLine()</code> call after <code>nextInt()</code> to consume the rest of that line.',
      ],
      solution: `import java.util.Scanner;

public class ReadAgeAndName {
    public static void main(String[] args) {
        Scanner scanner = new Scanner("25\\nAsha Rao");

        int age = scanner.nextInt();
        scanner.nextLine(); // consume the line break left after the number
        String name = scanner.nextLine();

        System.out.println(name + ", " + age); // Asha Rao, 25
    }
}`,
    },
    quiz: [
      {
        question: 'The user types <code>Asha Rao</code> and presses Enter. What does <code>scanner.next()</code> return?',
        options: ['Asha Rao', 'An empty string', 'Rao', 'Asha'],
        answer: 3,
        explanation: 'next() reads one token, up to the next whitespace. nextLine() reads the whole line.',
      },
      {
        question: 'What does <code>nextInt()</code> throw when the next token is not a number?',
        options: ['InputMismatchException', 'NumberFormatException', 'IOException', 'It returns 0'],
        answer: 0,
        explanation: 'Check with hasNextInt() first, or catch InputMismatchException.',
      },
      {
        question: 'What is the effect of closing a <code>Scanner</code> that wraps <code>System.in</code>?',
        options: ['Nothing', 'The program exits', 'System.in is closed as well and cannot be read again in that program', 'The input buffer is cleared'],
        answer: 2,
        explanation: 'Closing the Scanner closes the stream it wraps, so one Scanner is normally used for the whole program.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between Scanner and BufferedReader?',
        answer: `<code>Scanner</code> parses input into tokens and types, with methods such as <code>nextInt()</code> and <code>nextDouble()</code>, and does not throw checked exceptions. <code>BufferedReader</code> only reads characters and lines, so numbers must be parsed by hand and <code>IOException</code> must be handled, but it is faster for large input because it does no parsing.`,
      },
      {
        question: 'Why does nextLine() return an empty string after nextInt()?',
        answer: `<code>nextInt()</code> reads only the digits and leaves the line break in the input. <code>nextLine()</code> reads up to the next line break, which is the one left behind, so it returns an empty string. The fix is an extra <code>nextLine()</code> after <code>nextInt()</code>, or reading every line with <code>nextLine()</code> and converting with <code>Integer.parseInt</code>.`,
      },
    ],
  },

  'java-byte-stream-classes-fileinputstream-fileoutputstream-bufferedstream-bytearraystream-datastream-objectstream-and-printstream': {
    whyItMatters: `The byte stream classes look like a long list, but they are one idea applied repeatedly: a basic stream that knows where the bytes go, wrapped by streams that each add one feature. Seeing that pattern lets you read a line like <code>new DataInputStream(new BufferedInputStream(new FileInputStream(f)))</code> without difficulty, and choose the right wrapper yourself.`,
    exercise: {
      prompt: `Write an <code>int</code>, a <code>double</code> and a string to an in-memory byte array with <code>DataOutputStream</code>, then read them back with <code>DataInputStream</code> and print them on one line. The values must be read in the same order in which they were written.

Expected output: <code>42 9.5 ok</code>`,
      starterCode: `import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;

public class PrimitivesRoundTrip {
    public static void main(String[] args) throws IOException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();

        try (DataOutputStream out = new DataOutputStream(bytes)) {
            // TODO: write the int 42, the double 9.5 and the string "ok"
        }

        try (DataInputStream in = new DataInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
            // TODO: read the three values back in the same order and print them
        }
    }
}`,
      hints: [
        'The writing methods are <code>writeInt</code>, <code>writeDouble</code> and <code>writeUTF</code>.',
        'The matching reading methods are <code>readInt</code>, <code>readDouble</code> and <code>readUTF</code>.',
      ],
      solution: `import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;

public class PrimitivesRoundTrip {
    public static void main(String[] args) throws IOException {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();

        try (DataOutputStream out = new DataOutputStream(bytes)) {
            out.writeInt(42);
            out.writeDouble(9.5);
            out.writeUTF("ok");
        }

        try (DataInputStream in = new DataInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
            int number = in.readInt();
            double amount = in.readDouble();
            String text = in.readUTF();
            System.out.println(number + " " + amount + " " + text); // 42 9.5 ok
        }
    }
}`,
    },
    quiz: [
      {
        question: 'What is the type of <code>System.out</code>?',
        options: ['OutputStream', 'PrintWriter', 'PrintStream', 'BufferedWriter'],
        answer: 2,
        explanation: 'PrintStream supplies the print, println and printf methods.',
      },
      {
        question: 'Data written with <code>writeInt</code> then <code>writeDouble</code> is read back with <code>readDouble</code> then <code>readInt</code>. What happens?',
        options: ['The values read are wrong, because the bytes are interpreted in the wrong order', 'The values are converted automatically', 'It does not compile', 'Nothing is read'],
        answer: 0,
        explanation: 'The stream holds only bytes with no type information. Reads must mirror the writes exactly.',
      },
      {
        question: 'Which stream writes to memory instead of to a file?',
        options: ['ByteArrayOutputStream', 'FileOutputStream', 'ObjectOutputStream', 'BufferedOutputStream'],
        answer: 0,
        explanation: 'It collects the bytes in an internal array, available through toByteArray().',
      },
    ],
    interviewQuestions: [
      {
        question: 'Which design pattern does java.io use for its stream classes?',
        answer: `The decorator pattern. A basic stream such as <code>FileInputStream</code> provides the bytes, and other streams wrap it to add one capability each: <code>BufferedInputStream</code> adds buffering, <code>DataInputStream</code> adds reading of primitives, <code>ObjectInputStream</code> adds reading of objects. Each wrapper is itself an <code>InputStream</code>, so wrappers can be combined in any order.`,
      },
      {
        question: 'What is the difference between DataOutputStream and ObjectOutputStream?',
        answer: `<code>DataOutputStream</code> writes primitives and strings in a fixed binary format, and the reader must know the exact order and types. <code>ObjectOutputStream</code> writes whole objects that implement <code>Serializable</code>, including the objects they refer to, along with class information so they can be rebuilt with <code>readObject()</code>.`,
      },
    ],
  },

  'java-character-stream-classes-filereader-writer-bufferedreader-writer-chararrayreader-writer-stringreader-writer-and-printwriter': {
    whyItMatters: `Text is the most common thing a program reads: configuration, CSV exports, logs, request bodies. Reading it line by line with <code>BufferedReader</code> is the standard idiom and works the same whether the text comes from a file, a network connection or a string. The in-memory readers and writers are also what make text-handling code easy to test.`,
    exercise: {
      prompt: `Read the text line by line with a <code>BufferedReader</code> and print the number of lines and the total number of words. The reader wraps a <code>StringReader</code>, so no file is needed.

Expected output: <code>3</code> then <code>6</code>`,
      starterCode: `import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;

public class CountLinesAndWords {
    public static void main(String[] args) throws IOException {
        String text = "one two\\nthree\\nfour five six";
        int lines = 0;
        int words = 0;

        try (BufferedReader reader = new BufferedReader(new StringReader(text))) {
            // TODO: read each line until readLine() returns null,
            //       counting the lines and the words on each line
        }

        System.out.println(lines);
        System.out.println(words);
    }
}`,
      hints: [
        'The usual loop is <code>while ((line = reader.readLine()) != null)</code>.',
        'The words on these lines are separated by single spaces, so <code>line.split(" ").length</code> counts them.',
      ],
      solution: `import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;

public class CountLinesAndWords {
    public static void main(String[] args) throws IOException {
        String text = "one two\\nthree\\nfour five six";
        int lines = 0;
        int words = 0;

        try (BufferedReader reader = new BufferedReader(new StringReader(text))) {
            String line;
            while ((line = reader.readLine()) != null) {
                lines++;
                words += line.split(" ").length;
            }
        }

        System.out.println(lines); // 3
        System.out.println(words); // 6
    }
}`,
    },
    quiz: [
      {
        question: 'What does <code>readLine()</code> return at the end of the input?',
        options: ['An empty string', 'null', '-1', 'It throws EOFException'],
        answer: 1,
        explanation: 'An empty string means a blank line. null means there is nothing left to read.',
      },
      {
        question: 'Does the string returned by <code>readLine()</code> include the line break?',
        options: ['Yes', 'Only on Windows', 'No; the line terminator is removed', 'Only for the last line'],
        answer: 2,
        explanation: 'The line terminator is consumed but not returned.',
      },
      {
        question: 'Which class collects written text in memory so it can be retrieved as a String?',
        options: ['FileWriter', 'PushbackReader', 'BufferedWriter', 'StringWriter'],
        answer: 3,
        explanation: 'StringWriter writes into an internal buffer, returned by toString().',
      },
    ],
    interviewQuestions: [
      {
        question: 'What should you watch for when reading a text file with FileReader?',
        answer: `The character encoding. Before Java 18, <code>FileReader</code> used the platform's default encoding unless one was given, so a UTF-8 file could be read incorrectly on a machine with a different default. State the encoding explicitly, for example <code>new FileReader(file, StandardCharsets.UTF_8)</code> from Java 11, or <code>Files.newBufferedReader(path)</code>, which uses UTF-8. Also wrap the reader in a <code>BufferedReader</code>, since <code>FileReader</code> alone is unbuffered.`,
      },
      {
        question: 'How do you read a text file line by line efficiently?',
        answer: `Wrap the reader in a <code>BufferedReader</code> and call <code>readLine()</code> in a loop until it returns <code>null</code>, inside try-with-resources. Only one line is held in memory at a time, so this works for files of any size. <code>Files.lines(path)</code> does the same as a stream.`,
      },
    ],
  },

  'file-handling-file-filereader-filewriter-bufferedreader': {
    whyItMatters: `Saving data to a file and reading it back is among the first practical things a program needs: exporting a report, keeping a log, importing a list. This lesson is the complete basic cycle of create, write, read and delete, and the try-with-resources habit it teaches applies to every resource you will ever open.`,
    exercise: {
      prompt: `Write two lines to a temporary file, read the file back line by line printing each line, and then print how many lines were read. Delete the file at the end.

Expected output: <code>first</code>, <code>second</code>, <code>2</code> (one per line)`,
      starterCode: `import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class WriteThenRead {
    public static void main(String[] args) throws IOException {
        File file = File.createTempFile("notes", ".txt");

        // TODO: write "first" and "second" on separate lines
        // TODO: read the file line by line, printing each line and counting them
        // TODO: print the count

        file.delete();
    }
}`,
      hints: [
        'Wrap a <code>FileWriter</code> in a <code>BufferedWriter</code> and call <code>newLine()</code> after each line.',
        'Open the writer and the reader in separate try-with-resources blocks, so the file is closed and fully written before it is read.',
      ],
      solution: `import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class WriteThenRead {
    public static void main(String[] args) throws IOException {
        File file = File.createTempFile("notes", ".txt");

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file))) {
            writer.write("first");
            writer.newLine();
            writer.write("second");
            writer.newLine();
        }

        int count = 0;
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line); // first, second
                count++;
            }
        }
        System.out.println(count); // 2

        file.delete();
    }
}`,
    },
    quiz: [
      {
        question: 'Does <code>new File("report.txt")</code> create a file on disk?',
        options: ['No; it only creates an object that represents the path', 'Yes', 'Only if the folder exists', 'Only on Windows'],
        answer: 0,
        explanation: 'A File object is a path. The file is created by createNewFile() or by opening a writer on it.',
      },
      {
        question: 'What does <code>new FileWriter("log.txt", true)</code> do if the file already has content?',
        options: ['Replaces the content', 'Adds new text at the end', 'Throws an exception', 'Creates a second file'],
        answer: 1,
        explanation: 'The second argument turns on append mode. Without it the existing content is overwritten.',
      },
      {
        question: 'What happens if a <code>BufferedWriter</code> is neither flushed nor closed?',
        options: ['Nothing; the data is already written', 'The file is deleted', 'Text still in the buffer may never reach the file', 'It throws an exception'],
        answer: 2,
        explanation: 'The buffer is written out on flush() or close(), which is one reason to use try-with-resources.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between File and FileReader?',
        answer: `<code>File</code> represents a path and gives information about it, such as whether it exists, its size and whether it is a directory, and can create, rename or delete it. It never reads or writes content. <code>FileReader</code> is a character stream that opens a file and reads the text inside it.`,
      },
      {
        question: 'How does try-with-resources work?',
        answer: `Any object that implements <code>AutoCloseable</code> can be declared in the parentheses after <code>try</code>. When the block ends, normally or through an exception, <code>close()</code> is called on each resource in reverse order of declaration. If both the block and <code>close()</code> throw, the exception from the block is the one reported and the other is attached to it as a suppressed exception.`,
      },
    ],
  },

  'advanced-file-handling-randomaccessfile-the-path-api-nio-2-and-zip-files': {
    whyItMatters: `New Java code uses <code>Path</code> and <code>Files</code> for file work, not the older <code>File</code> class. One-line methods read or write a whole file, copy and move files, and walk directories, and they report failures with clear exceptions where <code>File</code> methods only return <code>false</code>. This is the API you will see in current projects and documentation.`,
    exercise: {
      prompt: `Using the <code>Files</code> class, write three numbers to a temporary file, one per line, read the lines back and print their total. Then delete the file and print whether it still exists.

Expected output: <code>60</code> then <code>false</code>`,
      starterCode: `import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class SumFromFile {
    public static void main(String[] args) throws IOException {
        Path file = Files.createTempFile("scores", ".txt");

        // TODO: write the lines "10", "20" and "30" to the file
        // TODO: read all lines, add them up and print the total
        // TODO: delete the file and print Files.exists(file)
    }
}`,
      hints: [
        '<code>Files.write(file, List.of("10", "20", "30"))</code> writes each element as a line.',
        '<code>Files.readAllLines(file)</code> returns a <code>List&lt;String&gt;</code>; convert each line with <code>Integer.parseInt</code>.',
      ],
      solution: `import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class SumFromFile {
    public static void main(String[] args) throws IOException {
        Path file = Files.createTempFile("scores", ".txt");

        Files.write(file, List.of("10", "20", "30"));

        int total = 0;
        for (String line : Files.readAllLines(file)) {
            total += Integer.parseInt(line);
        }
        System.out.println(total); // 60

        Files.delete(file);
        System.out.println(Files.exists(file)); // false
    }
}`,
    },
    quiz: [
      {
        question: 'Which method should be used to process a very large text file without loading all of it into memory?',
        options: ['Files.readAllLines(path)', 'Files.readString(path)', 'Files.readAllBytes(path)', 'Files.lines(path)'],
        answer: 3,
        explanation: 'Files.lines returns a stream that reads lines as they are needed. The other three load the whole file.',
      },
      {
        question: 'What does <code>Files.delete(path)</code> do when the file does not exist?',
        options: ['Throws NoSuchFileException', 'Returns false', 'Creates the file', 'Nothing'],
        answer: 0,
        explanation: 'Use Files.deleteIfExists when a missing file is acceptable.',
      },
      {
        question: 'What can <code>RandomAccessFile</code> do that an ordinary input stream cannot?',
        options: ['Read text', 'Jump to any position in the file with seek()', 'Read a zip file', 'Read without opening the file'],
        answer: 1,
        explanation: 'It keeps a file pointer that can be moved, so any part of the file can be read or written directly.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the advantages of Path and Files over the File class?',
        answer: `Methods of <code>Files</code> throw specific exceptions, such as <code>NoSuchFileException</code> and <code>AccessDeniedException</code>, where <code>File</code> methods return <code>false</code> with no reason. <code>Files</code> also has one-line methods to read, write, copy and move files, supports symbolic links and file attributes, and can walk a directory tree. <code>File.toPath()</code> converts old code to the new API.`,
      },
      {
        question: 'Why should the stream returned by Files.lines() be closed?',
        answer: `The stream keeps the file open while lines are read from it. If it is not closed, the file handle stays open until the garbage collector happens to reclaim it, and a program that does this repeatedly can run out of file handles. Declare the stream in try-with-resources.`,
      },
    ],
  },

  'serialization': {
    whyItMatters: `Serialization is how an object leaves the JVM: to a file, a cache such as Redis, an HTTP session store or another service. Java's built-in mechanism is in a great deal of existing code, and the ideas behind it, such as which fields are saved, what happens when the class changes, and why untrusted input is dangerous, apply equally to JSON and every other format.`,
    exercise: {
      prompt: `The program fails with <code>NotSerializableException</code> because a <code>Customer</code> holds an <code>Address</code> that cannot be serialized. Change the classes so the whole object can be saved and restored, and give <code>Customer</code> an explicit <code>serialVersionUID</code>.

Expected output: <code>Asha, Pune</code>`,
      starterCode: `import java.io.*;

class Address {
    String city;

    Address(String city) {
        this.city = city;
    }
}

class Customer implements Serializable {
    String name;
    Address address;

    Customer(String name, Address address) {
        this.name = name;
        this.address = address;
    }
}

public class SaveCustomer {
    public static void main(String[] args) throws Exception {
        Customer original = new Customer("Asha", new Address("Pune"));

        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(original);
        }

        Customer restored;
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
            restored = (Customer) in.readObject();
        }

        System.out.println(restored.name + ", " + restored.address.city);
    }
}`,
      hints: [
        'Every object reachable from the one being written must itself be serializable.',
        'The version field is declared as <code>private static final long serialVersionUID = 1L;</code>',
      ],
      solution: `import java.io.*;

class Address implements Serializable {
    private static final long serialVersionUID = 1L;
    String city;

    Address(String city) {
        this.city = city;
    }
}

class Customer implements Serializable {
    private static final long serialVersionUID = 1L;
    String name;
    Address address;

    Customer(String name, Address address) {
        this.name = name;
        this.address = address;
    }
}

public class SaveCustomer {
    public static void main(String[] args) throws Exception {
        Customer original = new Customer("Asha", new Address("Pune"));

        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        try (ObjectOutputStream out = new ObjectOutputStream(bytes)) {
            out.writeObject(original);
        }

        Customer restored;
        try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
            restored = (Customer) in.readObject();
        }

        System.out.println(restored.name + ", " + restored.address.city); // Asha, Pune
    }
}`,
    },
    quiz: [
      {
        question: 'How many methods does the <code>Serializable</code> interface declare?',
        options: ['None; it is a marker interface', 'One: serialize()', 'Two: writeObject() and readObject()', 'Three'],
        answer: 0,
        explanation: 'Implementing it only marks the class as allowed to be serialized.',
      },
      {
        question: 'An object is saved, the class is then changed and its <code>serialVersionUID</code> is different. What happens when the old data is read?',
        options: ['The new fields are null', 'The old class is loaded', 'InvalidClassException is thrown', 'ClassCastException is thrown'],
        answer: 2,
        explanation: 'The UID in the stream must match the UID of the class that is loaded.',
      },
      {
        question: 'Is the constructor of a <code>Serializable</code> class called when an object of it is deserialized?',
        options: ['Yes, always', 'Only if it is public', 'Only the no-argument constructor', 'No; the object is rebuilt from the stream without running its constructor'],
        answer: 3,
        explanation: 'Only the no-argument constructor of the nearest non-serializable superclass runs.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is serialVersionUID and why declare it explicitly?',
        answer: `It is a version number for a serializable class, written into the stream with each object and checked when the object is read. If it is not declared, the JVM computes one from the structure of the class, and almost any change to the class, such as adding a method, changes it, making previously saved data unreadable. Declaring it yourself lets you make compatible changes, such as adding a field, without breaking old data.`,
      },
      {
        question: 'What is the difference between Serializable and Externalizable?',
        answer: `With <code>Serializable</code> the JVM saves and restores all non-transient fields automatically. <code>Externalizable</code> extends it and requires the class to implement <code>writeExternal</code> and <code>readExternal</code>, giving full control over what is written. An <code>Externalizable</code> class must have a public no-argument constructor, which is called during deserialization.`,
      },
      {
        question: 'Why is Java serialization avoided for data from untrusted sources?',
        answer: `Deserialization creates objects of whatever classes the stream names and runs code in them as it does so. A crafted stream can combine classes already on the classpath to execute commands, and this has been the cause of many serious vulnerabilities. For data exchanged with other systems, formats such as JSON are used instead, and where Java serialization remains, a deserialization filter restricts the classes that may be read.`,
      },
    ],
  },

  'modern-java-features-var-records-sealed-classes-pattern-matching-and-text-blocks': {
    whyItMatters: `Most teams now run Java 17 or 21, and these features are in everyday use. A record replaces dozens of lines of constructor, getters, <code>equals</code>, <code>hashCode</code> and <code>toString</code>; pattern matching removes casts. Being able to read and write them shows an interviewer that your Java is current.`,
    exercise: {
      prompt: `Declare a record <code>Product</code> with a <code>name</code> and a <code>price</code>. Create two products with the same values, then print the first one, whether the two are equal, and the name of the first.

Expected output: <code>Product[name=Pen, price=10.0]</code>, <code>true</code>, <code>Pen</code> (one per line)`,
      starterCode: `public class RecordPractice {

    // TODO: declare a record Product with a String name and a double price

    public static void main(String[] args) {
        // TODO: create two products, both "Pen" at 10.0
        // TODO: print the first product
        // TODO: print whether the two are equal
        // TODO: print the name of the first product
    }
}`,
      hints: [
        'A record is declared in one line: <code>record Product(String name, double price) { }</code>.',
        'The accessor has the name of the component, with no <code>get</code> prefix: <code>product.name()</code>.',
      ],
      solution: `public class RecordPractice {

    record Product(String name, double price) { }

    public static void main(String[] args) {
        var first = new Product("Pen", 10.0);
        var second = new Product("Pen", 10.0);

        System.out.println(first);                // Product[name=Pen, price=10.0]
        System.out.println(first.equals(second)); // true
        System.out.println(first.name());         // Pen
    }
}`,
    },
    quiz: [
      {
        question: 'Where can <code>var</code> be used?',
        options: ['For local variables that are initialised when declared', 'For method parameters', 'For fields', 'Anywhere a type is expected'],
        answer: 0,
        explanation: 'The compiler infers the type from the initialiser, so there must be one, and it is allowed only for local variables.',
      },
      {
        question: 'Can the fields of a record be changed after the record is created?',
        options: ['Yes, through setters', 'No; the fields are final', 'Only if declared with var', 'Only inside the record'],
        answer: 1,
        explanation: 'A record is an immutable data carrier. To change a value, create a new record.',
      },
      {
        question: 'What does <code>sealed interface Shape permits Circle, Square</code> mean?',
        options: ['Shape cannot be implemented', 'Circle and Square are private', 'Only Circle and Square may implement Shape', 'Shape has no methods'],
        answer: 2,
        explanation: 'The compiler knows the full set of subtypes, so a switch over them can be checked for completeness.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a record and how does it differ from a class?',
        answer: `A record is a short declaration for a class whose purpose is to hold data. From the list of components the compiler generates private final fields, a constructor, an accessor for each component, and <code>equals</code>, <code>hashCode</code> and <code>toString</code>. A record is implicitly final, cannot extend another class, and cannot declare extra instance fields, though it can implement interfaces and have methods.`,
      },
      {
        question: 'Does var make Java dynamically typed?',
        answer: `No. The type is worked out by the compiler from the initialiser and is fixed from then on, so <code>var count = 5;</code> is an <code>int</code> and assigning a string to it is a compile-time error. <code>var</code> only saves writing the type; it changes nothing at runtime.`,
      },
      {
        question: 'What is pattern matching for instanceof?',
        answer: `It combines the type test and the cast. In <code>if (obj instanceof String s)</code>, the variable <code>s</code> is declared and already holds <code>obj</code> as a <code>String</code> inside the block, so no separate cast is needed. From Java 21 the same patterns can be used as the cases of a <code>switch</code>.`,
      },
    ],
  },
}
