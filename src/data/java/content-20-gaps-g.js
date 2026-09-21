// Java gap-filling module G — file handling, networking, reflection, algorithms, i18n.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content20GapsG = {
  'advanced-file-handling-randomaccessfile-the-path-api-nio-2-and-zip-files': {
    title: 'Advanced File Handling: RandomAccessFile, the Path API (NIO.2), and Zip Files',
    intro: `Basic Java I/O using FileReader, FileWriter, and streams is sequential — you read or write bytes from beginning to end in one direction. Real applications sometimes need more: jumping to an arbitrary byte offset inside a file, working with modern path-based APIs that handle errors more cleanly than the old File class, or reading and writing compressed archives. Java provides dedicated tools for all three needs.

This lesson covers RandomAccessFile for non-sequential access, the NIO.2 Path and Files API introduced in Java 7 (the modern, recommended way to do most file work), a brief mention of FileDescriptor, and creating/reading zip archives with java.util.zip.`,
    sections: [
      {
        heading: 'RandomAccessFile — Seeking to Arbitrary Positions',
        body: `RandomAccessFile treats a file as a large array of bytes that you can move through freely using a file pointer. Unlike FileInputStream/FileOutputStream, a single RandomAccessFile object can both read and write, and you control exactly where the next operation happens with <code>seek(long position)</code>. It also has convenient typed methods like <code>readInt()</code>, <code>writeInt()</code>, <code>readUTF()</code>, and <code>writeUTF()</code> that read/write primitives in a fixed binary format — useful for building simple binary record files (e.g. fixed-size student records you can jump to by index).`,
        list: [
          '<code>new RandomAccessFile("data.dat", "rw")</code> — mode "r" is read-only, "rw" allows reading and writing.',
          '<code>seek(long pos)</code> — moves the file pointer to a byte offset before the next read/write.',
          '<code>getFilePointer()</code> — returns the current position; <code>length()</code> returns the file size.',
          'Always close it (or use try-with-resources) — it holds a native file handle open.',
        ],
      },
      {
        heading: 'The NIO.2 Path and Files API',
        body: `Since Java 7, <code>java.nio.file.Path</code> and the static helper class <code>java.nio.file.Files</code> are the recommended way to do most file operations, replacing much of what the old <code>java.io.File</code> class did. Path represents a filesystem location (it does not have to exist), while Files provides static methods that actually touch the filesystem: <code>Files.exists(path)</code>, <code>Files.readAllLines(path)</code>, <code>Files.write(path, bytesOrLines)</code>, <code>Files.copy(source, target)</code>, <code>Files.delete(path)</code>, and <code>Files.createDirectories(path)</code>. NIO.2 reports errors as specific checked exceptions (like NoSuchFileException) instead of File's old habit of silently returning false or -1, which makes bugs far easier to diagnose.`,
        list: [
          '<code>Paths.get("folder", "file.txt")</code> or <code>Path.of("folder", "file.txt")</code> — build a Path.',
          '<code>Files.readAllLines(path)</code> — reads a whole text file into a List&lt;String&gt; in one call.',
          '<code>Files.write(path, list)</code> — writes lines to a file, creating it if it does not exist.',
          '<code>Files.exists(path)</code> / <code>Files.isDirectory(path)</code> — safe existence and type checks.',
        ],
      },
      {
        heading: 'FileDescriptor — A Low-Level Handle',
        body: `FileDescriptor is a low-level, opaque handle to an open file, socket, or other I/O resource maintained by the operating system. You rarely construct or manipulate it directly; instead you obtain one from an open stream (for example, <code>fileOutputStream.getFD()</code>) and can call <code>fd.sync()</code> to force buffered data to be physically written to storage. Most application code never needs FileDescriptor directly — it exists mainly for interop between different I/O classes and for advanced cases requiring guaranteed disk flush.`,
      },
      {
        heading: 'Reading and Writing Zip Files with java.util.zip',
        body: `The java.util.zip package lets you create and read zip archives without any external library. <code>ZipOutputStream</code> wraps an OutputStream and lets you add entries with <code>putNextEntry(new ZipEntry(name))</code>, then write that entry's bytes before calling <code>closeEntry()</code>. <code>ZipInputStream</code> (or the random-access <code>ZipFile</code> class) reads entries back with <code>getNextEntry()</code> in a loop.`,
      },
    ],
    examples: [
      {
        caption: 'RandomAccessFile: writing then jumping back to read a specific record',
        code: `import java.io.RandomAccessFile;

public class RandomAccessDemo {
    public static void main(String[] args) throws Exception {
        try (RandomAccessFile raf = new RandomAccessFile("scores.dat", "rw")) {
            // Each record is a fixed 4-byte int, so record N starts at byte N * 4
            raf.writeInt(90);  // record 0
            raf.writeInt(75);  // record 1
            raf.writeInt(60);  // record 2

            raf.seek(1 * 4L);           // jump directly to record 1
            System.out.println("Record 1: " + raf.readInt());

            raf.seek(0);                 // jump back to the start
            System.out.println("Record 0: " + raf.readInt());

            System.out.println("File length: " + raf.length() + " bytes");
        }
    }
}`,
        output: `Record 1: 75
Record 0: 90
File length: 12 bytes`,
      },
      {
        caption: 'NIO.2 Path/Files for simple text I/O, and creating a zip file with two entries',
        code: `import java.nio.file.*;
import java.util.*;
import java.util.zip.*;
import java.io.*;

public class NioAndZipDemo {
    public static void main(String[] args) throws Exception {
        // --- NIO.2 Path / Files ---
        Path file = Path.of("notes.txt");
        Files.write(file, List.of("first line", "second line"));
        System.out.println("Exists: " + Files.exists(file));
        List<String> lines = Files.readAllLines(file);
        System.out.println(lines);

        // --- Creating a zip file ---
        try (ZipOutputStream zos = new ZipOutputStream(new FileOutputStream("archive.zip"))) {
            zos.putNextEntry(new ZipEntry("notes.txt"));
            zos.write(Files.readAllBytes(file));
            zos.closeEntry();
        }

        // --- Reading it back ---
        try (ZipInputStream zis = new ZipInputStream(new FileInputStream("archive.zip"))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                System.out.println("Zip entry: " + entry.getName());
            }
        }
    }
}`,
        output: `Exists: true
[first line, second line]
Zip entry: notes.txt`,
      },
    ],
    commonMistakes: [
      'Forgetting that RandomAccessFile\'s "rw" mode will create the file if it does not exist, which can silently mask a typo in the file path.',
      'Mixing up byte offsets with record indexes when calling seek() — you must multiply the record index by the fixed record size.',
      'Still using the legacy File class for new code when Files/Path would give clearer exceptions and a cleaner API.',
      'Forgetting closeEntry() (or putNextEntry() for the next file) when writing multiple entries into a ZipOutputStream.',
    ],
    keyPoints: [
      'RandomAccessFile allows seeking to any byte offset and supports both reading and writing on the same object.',
      'java.nio.file.Path + Files is the modern, recommended replacement for most legacy File-class operations.',
      'FileDescriptor is a low-level OS handle, mostly used internally or for forcing a disk sync.',
      'java.util.zip (ZipOutputStream / ZipInputStream / ZipFile) reads and writes zip archives without external libraries.',
    ],
  },

  'java-networking-sockets-url-urlconnection-httpurlconnection-and-inetaddress': {
    title: 'Java Networking: Sockets, URL, URLConnection, HttpURLConnection, and InetAddress',
    intro: `Java's java.net package provides networking support at two levels of abstraction: low-level TCP sockets for building custom client-server protocols, and higher-level URL-based classes for talking to web resources over HTTP. Most day-to-day networking code (calling a REST API, downloading a file) uses the URL-based classes; raw sockets are used when you need full control over the wire protocol.`,
    sections: [
      {
        heading: 'Socket and ServerSocket — Raw TCP Communication',
        body: `A ServerSocket listens on a port and accepts incoming TCP connections; each accepted connection is represented as a Socket, which exposes an input stream and output stream for sending bytes in both directions. A client creates a Socket pointed at a host and port to connect. This pair is the foundation that HTTP, and most other network protocols, are built on top of.`,
      },
      {
        heading: 'URL and URLConnection',
        body: `The URL class represents a reference to a web resource (a scheme, host, port, path, and query string) — it does not itself open a network connection. Calling <code>url.openConnection()</code> returns a URLConnection, which represents an active (or about-to-be-opened) connection to that resource and lets you read response data, headers, and set request properties before connecting.`,
      },
      {
        heading: 'HttpURLConnection — Making an HTTP Request',
        body: `HttpURLConnection is the HTTP-specific subclass of URLConnection, adding methods like <code>setRequestMethod("GET")</code>, <code>getResponseCode()</code>, and access to request/response headers. It is the classic built-in way to make HTTP calls in Java without a third-party library (though libraries like Apache HttpClient or Java 11's built-in <code>java.net.http.HttpClient</code> are usually nicer for anything beyond a simple GET).`,
      },
      {
        heading: 'InetAddress — Resolving Hostnames',
        body: `InetAddress represents an IP address and provides DNS lookup through static factory methods. <code>InetAddress.getByName("www.example.com")</code> resolves a hostname to its IP address, while <code>InetAddress.getLocalHost()</code> returns the address of the local machine. This is the class underlying hostname resolution used implicitly whenever you connect a Socket or open a URL by hostname.`,
      },
    ],
    examples: [
      {
        caption: 'A minimal TCP echo server and client using Socket/ServerSocket',
        code: `import java.io.*;
import java.net.*;

public class EchoServer {
    public static void main(String[] args) throws IOException {
        try (ServerSocket serverSocket = new ServerSocket(5000)) {
            System.out.println("Server listening on port 5000...");
            try (Socket client = serverSocket.accept();
                 BufferedReader in = new BufferedReader(new InputStreamReader(client.getInputStream()));
                 PrintWriter out = new PrintWriter(client.getOutputStream(), true)) {
                String line = in.readLine();
                out.println("Echo: " + line);
            }
        }
    }
}

// Separate client program:
// try (Socket socket = new Socket("localhost", 5000);
//      PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
//      BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
//     out.println("Hello server");
//     System.out.println(in.readLine()); // prints: Echo: Hello server
// }`,
        output: 'Client prints: Echo: Hello server',
      },
      {
        caption: 'HttpURLConnection GET request and InetAddress hostname resolution',
        code: `import java.io.*;
import java.net.*;

public class HttpAndDnsDemo {
    public static void main(String[] args) throws Exception {
        // --- HttpURLConnection: simple GET ---
        URL url = new URL("https://example.com");
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");

        int responseCode = connection.getResponseCode();
        System.out.println("Response code: " + responseCode);

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(connection.getInputStream()))) {
            String firstLine = reader.readLine();
            System.out.println("First line starts with: " + firstLine.substring(0, 15));
        }
        connection.disconnect();

        // --- InetAddress: hostname resolution ---
        InetAddress address = InetAddress.getByName("example.com");
        System.out.println("Host name: " + address.getHostName());
        System.out.println("Resolved (illustrative, actual IP varies): " + address.getHostAddress());
    }
}`,
        output: `Response code: 200
First line starts with: <!doctype html>
Host name: example.com
Resolved (illustrative, actual IP varies): 93.184.216.34`,
      },
    ],
    commonMistakes: [
      'Forgetting to close sockets and streams, leaking file descriptors under load — always use try-with-resources.',
      'Assuming HttpURLConnection\'s getInputStream() works for error responses (4xx/5xx) — those must be read from getErrorStream() instead.',
      'Blocking indefinitely on socket reads because no timeout was set — use setSoTimeout() on sockets or setConnectTimeout()/setReadTimeout() on URLConnection.',
      'Treating InetAddress.getByName() results as permanent — DNS records can change, and results may also be cached by the JVM for a period.',
    ],
    keyPoints: [
      'Socket and ServerSocket provide raw TCP communication; URL/URLConnection/HttpURLConnection build HTTP on top of that.',
      'URL represents a resource reference; URLConnection/HttpURLConnection represents an actual connection to it.',
      'InetAddress.getByName(host) performs DNS resolution from a hostname to an IP address.',
      'For anything beyond a simple GET, modern code often prefers java.net.http.HttpClient (Java 11+) over HttpURLConnection.',
    ],
  },

  'java-reflection-api-and-the-javap-tool': {
    title: 'Java Reflection API and the javap Tool',
    intro: `Reflection lets a Java program examine and manipulate classes, fields, methods, and constructors at runtime — even ones it did not know about at compile time, and even private members it would not normally be allowed to touch. It is one of the mechanisms that makes frameworks like Spring, Hibernate, and JUnit possible, since they need to inspect arbitrary application classes and wire them together without the application code calling any special API itself.

Alongside runtime reflection, the javap command-line tool lets you inspect a compiled .class file's structure (its method signatures and bytecode-level details) without needing the source code — useful for debugging library behavior or understanding what a compiler actually generated.`,
    sections: [
      {
        heading: 'Core Reflection API',
        body: `Everything starts from a Class object, obtainable via <code>SomeClass.class</code>, <code>object.getClass()</code>, or dynamically via <code>Class.forName("fully.qualified.Name")</code> when you only have the class name as a String. From a Class object you can inspect its members and even construct instances and invoke methods without static references to the class at all.`,
        list: [
          '<code>getDeclaredFields()</code> / <code>getDeclaredMethods()</code> — list all fields/methods declared directly on the class, including private ones (unlike getFields()/getMethods(), which only return public members, including inherited ones).',
          '<code>clazz.getDeclaredConstructor().newInstance()</code> — creates a new instance reflectively.',
          '<code>field.setAccessible(true)</code> / <code>method.setAccessible(true)</code> — bypasses normal Java access checks so private members can be read or invoked from outside the class.',
          '<code>method.invoke(instance, args...)</code> — calls a method reflectively, given a target object and its arguments.',
        ],
      },
      {
        heading: 'Real-World Use Cases',
        body: `Reflection is the backbone of many frameworks you use daily without noticing: Spring uses it to instantiate beans and inject dependencies into fields annotated with @Autowired; JUnit uses it to find and invoke methods annotated with @Test; Jackson and Gson use it to read and write object fields when serializing to/from JSON. Application code rarely needs reflection directly, but understanding it explains how these frameworks work "by magic."`,
      },
      {
        heading: 'Performance and Safety Caveats',
        body: `Reflective calls are noticeably slower than direct calls because the JVM cannot apply the same compile-time optimizations, and each call involves extra security and type checks. setAccessible(true) also breaks encapsulation deliberately — it can violate a class's intended invariants and may be restricted or blocked entirely under the Java Platform Module System's strong encapsulation in modern Java versions. Reflection should be reserved for frameworks and tooling, not routine application logic.`,
      },
      {
        heading: 'The javap Tool',
        body: `javap disassembles a compiled .class file and prints its structure — the class's fields and method signatures, and optionally full bytecode instructions with the <code>-c</code> flag. It is useful for confirming exactly what a compiler generated (for example, checking a generic method's erased signature, or verifying a compiler-generated bridge method exists) without needing the original .java source. Usage: run <code>javap ClassName</code> against a compiled class on the classpath, or <code>javap -c -p ClassName</code> to include bytecode and private members.`,
      },
    ],
    examples: [
      {
        caption: 'Inspecting a class and invoking a private method via reflection',
        code: `import java.lang.reflect.*;

class Greeter {
    private String greet(String name) {
        return "Hello, " + name + "!";
    }
}

public class ReflectionDemo {
    public static void main(String[] args) throws Exception {
        Class<?> clazz = Class.forName("Greeter");

        System.out.println("Declared methods:");
        for (Method m : clazz.getDeclaredMethods()) {
            System.out.println("  " + m.getName());
        }

        Object greeterInstance = clazz.getDeclaredConstructor().newInstance();

        Method greetMethod = clazz.getDeclaredMethod("greet", String.class);
        greetMethod.setAccessible(true); // bypass "private" access check

        String result = (String) greetMethod.invoke(greeterInstance, "Reflection");
        System.out.println(result);
    }
}`,
        output: `Declared methods:
  greet
Hello, Reflection!`,
      },
      {
        caption: 'Using javap to inspect a compiled class file from the command line',
        code: `// Greeter.java compiles to Greeter.class in the current directory.
// Terminal command:
//   javap Greeter
//
// Typical output:
//   class Greeter {
//     Greeter();
//   }
//
// Adding -p to include private members and -c to show bytecode:
//   javap -p -c Greeter
//
// This reveals the private "greet" method signature and its bytecode
// instructions, even though no .java source file is being read directly.`,
        output: `class Greeter {
  Greeter();
  private java.lang.String greet(java.lang.String);
}`,
      },
    ],
    commonMistakes: [
      'Calling setAccessible(true) freely in application code, silently breaking encapsulation the original author relied on.',
      'Using reflection for a task a normal interface or polymorphism could solve more simply and faster.',
      'Confusing getFields()/getMethods() (public only, including inherited) with getDeclaredFields()/getDeclaredMethods() (all declared members, including private, but not inherited).',
      'Forgetting that reflective calls have real performance overhead and using them inside hot loops.',
    ],
    keyPoints: [
      'Class.forName, getDeclaredFields/Methods, newInstance, and invoke let code inspect and manipulate classes at runtime.',
      'setAccessible(true) bypasses Java\'s normal access control, enabling access to private members from outside the class.',
      'Frameworks like Spring and JUnit rely heavily on reflection; ordinary application code rarely needs it directly.',
      'javap disassembles a compiled .class file to show its method signatures (and, with -c, its bytecode) without needing source code.',
    ],
  },

  'java-rmi-remote-method-invocation': {
    title: 'Java RMI (Remote Method Invocation)',
    intro: `Remote Method Invocation (RMI) is a Java-specific mechanism that lets an object living in one Java Virtual Machine call a method on an object living in a different JVM — potentially on an entirely different machine — as though it were a normal local method call. RMI handles the underlying network communication, parameter serialization, and result marshaling transparently.

RMI was a significant part of enterprise Java in the late 1990s and early 2000s, and it still appears in legacy systems and in interview questions about distributed computing concepts. However, it is largely legacy technology today: modern distributed systems overwhelmingly use REST APIs, gRPC, or message queues instead, because those approaches are language-agnostic, easier to secure across networks, and better supported by modern tooling. This lesson presents RMI as historical/interview knowledge rather than a current best practice.`,
    sections: [
      {
        heading: 'The Basic Pieces of RMI',
        body: `An RMI application is built from a small number of cooperating pieces.`,
        list: [
          '<strong>Remote interface</strong> — an interface extending <code>java.rmi.Remote</code>, whose methods each declare <code>throws RemoteException</code> to account for network failures.',
          '<strong>Remote implementation</strong> — a class implementing that interface, typically extending <code>UnicastRemoteObject</code>, which provides the machinery to receive and respond to remote calls.',
          '<strong>RMI Registry</strong> — a simple naming service (started with the <code>rmiregistry</code> tool, or <code>LocateRegistry.createRegistry()</code>) where a server binds a name to a remote object reference, and a client looks that name up to obtain a proxy (stub) for the remote object.',
          '<strong>Stub</strong> — a client-side proxy object that implements the same remote interface; calling a method on the stub actually serializes the call and sends it over the network to the real object.',
        ],
      },
      {
        heading: 'How a Call Flows',
        body: `A server creates an instance of the remote implementation and binds it to a name in the RMI registry. A client looks up that name in the registry (given the server's host and port) and receives a stub object implementing the shared remote interface. When the client calls a method on the stub, RMI serializes the method name and arguments, sends them over TCP to the server's JVM, the server executes the real method, and the result is serialized back to the client — all of this is hidden behind what looks like an ordinary Java method call.`,
      },
      {
        heading: 'Why RMI Is Considered Legacy Today',
        body: `RMI ties both client and server to Java specifically (a client written in another language cannot easily call an RMI service), requires careful handling of classloading and serialization security, and does not play well with firewalls, load balancers, and modern cloud infrastructure the way HTTP-based protocols do. For these reasons, REST APIs (over HTTP/JSON), gRPC (over HTTP/2 with protocol buffers), and message queues (like Kafka or RabbitMQ for asynchronous communication) are the standard choices for new distributed systems. Knowing RMI is still valuable for understanding the concepts behind remote calls and for legacy codebases, but it should not be reached for in new projects.`,
      },
    ],
    examples: [
      {
        caption: 'A minimal RMI remote interface, implementation, server, and client',
        code: `// --- Remote interface ---
import java.rmi.Remote;
import java.rmi.RemoteException;

public interface Calculator extends Remote {
    int add(int a, int b) throws RemoteException;
}

// --- Remote implementation ---
import java.rmi.server.UnicastRemoteObject;
import java.rmi.RemoteException;

public class CalculatorImpl extends UnicastRemoteObject implements Calculator {
    protected CalculatorImpl() throws RemoteException {
        super();
    }

    public int add(int a, int b) throws RemoteException {
        return a + b;
    }
}

// --- Server: creates registry and binds the object ---
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.rmi.Naming;

public class Server {
    public static void main(String[] args) throws Exception {
        Registry registry = LocateRegistry.createRegistry(1099);
        Calculator calculator = new CalculatorImpl();
        Naming.rebind("rmi://localhost/CalculatorService", calculator);
        System.out.println("Calculator service is bound and ready.");
    }
}

// --- Client: looks up the object and calls it as if local ---
import java.rmi.Naming;

public class Client {
    public static void main(String[] args) throws Exception {
        Calculator calculator = (Calculator) Naming.lookup("rmi://localhost/CalculatorService");
        System.out.println("5 + 7 = " + calculator.add(5, 7));
    }
}`,
        output: `(Server terminal) Calculator service is bound and ready.
(Client terminal) 5 + 7 = 12`,
      },
    ],
    commonMistakes: [
      'Forgetting that every method on a Remote interface must declare "throws RemoteException", since network failures are always possible.',
      'Assuming RMI works across different languages — both client and server must be Java, unlike REST or gRPC.',
      'Not accounting for serialization: every argument and return type passed through RMI must implement Serializable.',
      'Choosing RMI for a brand-new project today instead of a REST API, gRPC, or a message queue, which are far better supported and more interoperable.',
    ],
    keyPoints: [
      'RMI lets a Java object call a method on another object running in a different JVM as if it were local.',
      'The core pieces are a Remote interface, a UnicastRemoteObject implementation, and the RMI registry for lookup.',
      'Calling a stub method transparently serializes the call, sends it over the network, and returns the deserialized result.',
      'RMI is largely legacy today; modern systems favor REST APIs, gRPC, or message queues for distributed communication.',
    ],
  },

  'searching-algorithms-in-java-linear-search-and-binary-search': {
    title: 'Searching Algorithms in Java: Linear Search and Binary Search',
    intro: `Searching means finding whether a target value exists in a collection, and if so, where. Java's two foundational search algorithms — linear search and binary search — represent a classic trade-off in algorithm design: linear search works on any data but scans everything, while binary search is dramatically faster but only works if the data is already sorted.

Understanding both, and knowing exactly why binary search requires sorted input, is one of the most common topics in coding interviews and a foundational building block for understanding more advanced search structures.`,
    sections: [
      {
        heading: 'Linear Search',
        body: `Linear search checks each element of a collection one at a time, in order, comparing it to the target value, and stops as soon as a match is found (or reports "not found" after checking every element). It makes no assumptions about the data's order, so it works on any array or list, sorted or not.`,
        list: [
          '<strong>Time complexity:</strong> O(n) — in the worst case (target is last, or absent), every element is checked.',
          '<strong>Space complexity:</strong> O(1) — no extra memory beyond a loop counter.',
          '<strong>When to use it:</strong> unsorted data, small collections, or a one-off search where sorting first would not pay off.',
        ],
      },
      {
        heading: 'Binary Search',
        body: `Binary search only works on sorted data, and it exploits that order to eliminate half of the remaining candidates on every step. It maintains a low and high bound on the current search range, checks the middle element, and — because the array is sorted — knows immediately whether the target must be in the left half or the right half, discarding the other half entirely without even looking at it.`,
        list: [
          '<strong>Time complexity:</strong> O(log n) — each comparison halves the remaining search space.',
          '<strong>Space complexity:</strong> O(1) for the iterative version; O(log n) call-stack space for a recursive version.',
          '<strong>Requirement:</strong> the array or list must already be sorted; searching unsorted data with binary search produces unreliable results.',
        ],
      },
      {
        heading: 'Why Binary Search Requires Sorted Data',
        body: `Binary search's speed comes entirely from being able to discard half the data based on a single comparison. That logic — "if the target is greater than the middle element, it can only be in the right half" — is only valid because sortedness guarantees everything to the left of the middle is smaller and everything to the right is larger. On unsorted data that guarantee does not hold, so eliminating a whole half based on one comparison would be incorrect and could skip right past the target.`,
      },
      {
        heading: 'Complexity Comparison',
        body: `For a collection of size n: linear search is O(n) but needs no preprocessing; binary search is O(log n) but requires the data to be sorted first, which itself typically costs O(n log n) if it is not already sorted. Binary search wins decisively when the same sorted collection will be searched many times; linear search is simpler and just as good for small or one-off searches on unsorted data.`,
      },
    ],
    examples: [
      {
        caption: 'Linear search over an unsorted array',
        code: `public class LinearSearchDemo {
    static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                return i; // found at index i
            }
        }
        return -1; // not found
    }

    public static void main(String[] args) {
        int[] numbers = {42, 17, 8, 99, 23, 4};

        System.out.println("Index of 99: " + linearSearch(numbers, 99));
        System.out.println("Index of 100: " + linearSearch(numbers, 100));
    }
}`,
        output: `Index of 99: 3
Index of 100: -1`,
      },
      {
        caption: 'Binary search (iterative) on a sorted array',
        code: `public class BinarySearchDemo {
    static int binarySearch(int[] sortedArr, int target) {
        int low = 0;
        int high = sortedArr.length - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2; // avoids overflow vs (low + high) / 2
            if (sortedArr[mid] == target) {
                return mid;
            } else if (sortedArr[mid] < target) {
                low = mid + 1;  // target must be in the right half
            } else {
                high = mid - 1; // target must be in the left half
            }
        }
        return -1; // not found
    }

    public static void main(String[] args) {
        int[] sorted = {4, 8, 17, 23, 42, 56, 99};

        System.out.println("Index of 42: " + binarySearch(sorted, 42));
        System.out.println("Index of 100: " + binarySearch(sorted, 100));
    }
}`,
        output: `Index of 42: 4
Index of 100: -1`,
      },
    ],
    commonMistakes: [
      'Running binary search on data that was never actually sorted — it can silently return the wrong answer instead of clearly failing.',
      'Computing the midpoint as (low + high) / 2, which can integer-overflow on very large arrays; low + (high - low) / 2 avoids this.',
      'Forgetting the "low <= high" loop condition (using "<" instead), which can miss the last remaining candidate element.',
      'Choosing binary search for a single one-off lookup on unsorted data, where the cost of sorting first outweighs the search savings.',
    ],
    keyPoints: [
      'Linear search is O(n), works on any data (sorted or not), and needs no preprocessing.',
      'Binary search is O(log n) but requires the input to already be sorted.',
      'Binary search works by comparing the middle element and discarding half the remaining range each step — invalid without sortedness.',
      'Binary search pays off most when the same sorted collection is searched repeatedly.',
    ],
  },

  'sorting-algorithms-in-java-bubble-selection-insertion-and-merge-sort': {
    title: 'Sorting Algorithms in Java: Bubble, Selection, Insertion, and Merge Sort',
    intro: `Sorting arranges elements of a collection into a defined order (typically ascending) and is one of the most fundamental operations in computer science — many other algorithms, including binary search, depend on data already being sorted. Java's own Arrays.sort() and Collections.sort() are highly optimized and should be used in production code, but understanding how the classic sorting algorithms work by hand is essential for interviews and for building intuition about algorithmic complexity.

This lesson walks through four foundational algorithms — Bubble Sort, Selection Sort, Insertion Sort, and Merge Sort — with complete, traced Java implementations.`,
    sections: [
      {
        heading: 'Bubble Sort',
        body: `Bubble Sort repeatedly steps through the array, comparing each pair of adjacent elements and swapping them if they are in the wrong order. Larger elements "bubble" toward the end of the array with each full pass. After n-1 passes, the array is guaranteed sorted. It is simple to understand but inefficient on large inputs.`,
        list: [
          '<strong>Time complexity:</strong> O(n²) in the average and worst case; O(n) best case with an early-exit optimization if no swaps occur in a pass.',
          '<strong>Space complexity:</strong> O(1) — sorts in place.',
          '<strong>Stability:</strong> stable (equal elements keep their relative order).',
        ],
      },
      {
        heading: 'Selection Sort',
        body: `Selection Sort divides the array into a sorted portion (at the front, initially empty) and an unsorted portion. On each pass, it scans the entire unsorted portion to find the minimum element and swaps it into the next position of the sorted portion. Unlike Bubble Sort, it always performs the same number of comparisons regardless of the initial order.`,
        list: [
          '<strong>Time complexity:</strong> O(n²) in all cases — it always scans the remaining unsorted elements fully.',
          '<strong>Space complexity:</strong> O(1) — sorts in place.',
          '<strong>Stability:</strong> not stable by default (a straightforward swap-based implementation can reorder equal elements).',
        ],
      },
      {
        heading: 'Insertion Sort',
        body: `Insertion Sort builds a sorted portion at the front of the array one element at a time: it takes the next unsorted element and shifts it backward through the sorted portion until it lands in its correct position. It closely resembles how a person sorts playing cards in their hand. It is inefficient in the worst case but very efficient on data that is already nearly sorted.`,
        list: [
          '<strong>Time complexity:</strong> O(n²) worst case (reverse-sorted input); O(n) best case (already sorted input).',
          '<strong>Space complexity:</strong> O(1) — sorts in place.',
          '<strong>Stability:</strong> stable.',
        ],
      },
      {
        heading: 'Merge Sort',
        body: `Merge Sort is a divide-and-conquer algorithm: it recursively splits the array in half until each piece has one element (trivially sorted), then repeatedly merges sorted halves back together in order. Unlike the previous three algorithms, its performance does not degrade to O(n²) on any input, which makes it the preferred choice for large datasets where guaranteed performance matters — at the cost of needing extra memory for the merge step.`,
        list: [
          '<strong>Time complexity:</strong> O(n log n) in the best, average, and worst case.',
          '<strong>Space complexity:</strong> O(n) — needs auxiliary arrays during the merge step.',
          '<strong>Stability:</strong> stable (a correct merge preserves the relative order of equal elements).',
        ],
      },
    ],
    examples: [
      {
        caption: 'Bubble Sort and Selection Sort on the same array',
        code: `import java.util.Arrays;

public class BubbleAndSelectionSortDemo {
    static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int pass = 0; pass < n - 1; pass++) {
            boolean swapped = false;
            for (int i = 0; i < n - 1 - pass; i++) {
                if (arr[i] > arr[i + 1]) {
                    int temp = arr[i];
                    arr[i] = arr[i + 1];
                    arr[i + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break; // already sorted, stop early
        }
    }

    static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIndex = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                }
            }
            int temp = arr[minIndex];
            arr[minIndex] = arr[i];
            arr[i] = temp;
        }
    }

    public static void main(String[] args) {
        int[] a = {5, 2, 9, 1, 5, 6};
        bubbleSort(a);
        System.out.println("Bubble sorted: " + Arrays.toString(a));

        int[] b = {5, 2, 9, 1, 5, 6};
        selectionSort(b);
        System.out.println("Selection sorted: " + Arrays.toString(b));
    }
}`,
        output: `Bubble sorted: [1, 2, 5, 5, 6, 9]
Selection sorted: [1, 2, 5, 5, 6, 9]`,
      },
      {
        caption: 'Insertion Sort and Merge Sort on the same array',
        code: `import java.util.Arrays;

public class InsertionAndMergeSortDemo {
    static void insertionSort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j]; // shift larger element right
                j--;
            }
            arr[j + 1] = key; // insert into its correct position
        }
    }

    static void mergeSort(int[] arr, int left, int right) {
        if (left >= right) return; // base case: 0 or 1 element
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }

    static void merge(int[] arr, int left, int mid, int right) {
        int[] leftPart = Arrays.copyOfRange(arr, left, mid + 1);
        int[] rightPart = Arrays.copyOfRange(arr, mid + 1, right + 1);

        int i = 0, j = 0, k = left;
        while (i < leftPart.length && j < rightPart.length) {
            if (leftPart[i] <= rightPart[j]) {
                arr[k++] = leftPart[i++];
            } else {
                arr[k++] = rightPart[j++];
            }
        }
        while (i < leftPart.length) arr[k++] = leftPart[i++];
        while (j < rightPart.length) arr[k++] = rightPart[j++];
    }

    public static void main(String[] args) {
        int[] a = {5, 2, 9, 1, 5, 6};
        insertionSort(a);
        System.out.println("Insertion sorted: " + Arrays.toString(a));

        int[] b = {5, 2, 9, 1, 5, 6};
        mergeSort(b, 0, b.length - 1);
        System.out.println("Merge sorted: " + Arrays.toString(b));
    }
}`,
        output: `Insertion sorted: [1, 2, 5, 5, 6, 9]
Merge sorted: [1, 2, 5, 5, 6, 9]`,
      },
    ],
    commonMistakes: [
      'Using Bubble Sort or Selection Sort on large datasets in production code instead of Arrays.sort() — their O(n²) behavior does not scale.',
      'Forgetting the early-exit "swapped" flag in Bubble Sort, which wastes full passes on an already-sorted array.',
      'Getting the merge step\'s loop bounds wrong in Merge Sort, causing elements to be dropped or duplicated — always verify with copyOfRange lengths.',
      'Assuming all O(n²) sorts behave identically — Insertion Sort is actually fast on nearly-sorted data, while Selection Sort always does the same amount of work regardless of input order.',
    ],
    keyPoints: [
      'Bubble, Selection, and Insertion Sort are all O(n²) in the worst case and sort in place with O(1) extra space.',
      'Merge Sort guarantees O(n log n) in every case but needs O(n) auxiliary space for merging.',
      'Insertion Sort is the best of the simple sorts for nearly-sorted or small input.',
      'Big-O comparison: Bubble O(n²) · Selection O(n²) · Insertion O(n²) worst / O(n) best · Merge O(n log n) always.',
    ],
  },

  'internationalization-i18n-in-java': {
    title: 'Internationalization (i18n) in Java',
    intro: `Internationalization (often abbreviated i18n — "i", 18 letters, "n") is the practice of designing software so it can be adapted to different languages, regions, and cultural conventions without changing its code. Java has built-in support for this through the Locale class, ResourceBundle for externalizing translatable text, and locale-aware formatters for numbers, currencies, and dates.

A well-internationalized Java application never hardcodes user-facing strings or assumes everyone formats numbers and dates the way the developer's own locale does.`,
    sections: [
      {
        heading: 'Locale — Representing a Language and Region',
        body: `A Locale object represents a specific combination of language and (optionally) country/region, such as English in the United States (en-US) versus French in France (fr-FR). Locale does not hold any translated text itself — it is simply a key used by other classes (like ResourceBundle and the formatters below) to decide which language- or region-specific behavior to apply. You can get one with <code>new Locale("fr", "FR")</code>, or use built-in constants like <code>Locale.US</code> and <code>Locale.GERMANY</code>, or read the JVM's default with <code>Locale.getDefault()</code>.`,
      },
      {
        heading: 'ResourceBundle — Externalizing Translatable Text',
        body: `ResourceBundle loads locale-specific text from separate properties files instead of hardcoding strings in Java source, so adding a new language means adding a new properties file — no recompilation of application logic required. Given a base name like "messages", you provide files such as messages_en.properties (English) and messages_fr.properties (French); ResourceBundle.getBundle("messages", locale) automatically picks the file matching the given Locale, falling back to a default messages.properties if no exact match exists.`,
        list: [
          'messages_en.properties: <code>greeting=Hello, {0}!</code>',
          'messages_fr.properties: <code>greeting=Bonjour, {0}!</code>',
          '<code>ResourceBundle.getBundle("messages", Locale.FRANCE).getString("greeting")</code> returns the French text.',
        ],
      },
      {
        heading: 'Locale-Aware Formatting: NumberFormat and DateFormat',
        body: `Numbers, currency amounts, and dates are formatted differently across cultures — for example, the U.S. writes one thousand and a half as "1,000.5" while Germany writes it as "1.000,5" (commas and periods swapped). <code>NumberFormat.getInstance(locale)</code>, <code>NumberFormat.getCurrencyInstance(locale)</code>, and <code>DateFormat.getDateInstance(style, locale)</code> automatically apply the correct separators, symbols, and ordering for a given Locale, so the same underlying number or date value displays correctly for each audience without any manual string manipulation.`,
      },
    ],
    examples: [
      {
        caption: 'ResourceBundle loading greetings for two different locales',
        code: `import java.util.*;

// messages_en.properties contains: greeting=Hello, {0}!
// messages_fr.properties contains: greeting=Bonjour, {0}!

public class ResourceBundleDemo {
    public static void main(String[] args) {
        ResourceBundle englishBundle = ResourceBundle.getBundle("messages", Locale.US);
        ResourceBundle frenchBundle = ResourceBundle.getBundle("messages", Locale.FRANCE);

        String englishTemplate = englishBundle.getString("greeting");
        String frenchTemplate = frenchBundle.getString("greeting");

        System.out.println(java.text.MessageFormat.format(englishTemplate, "Asha"));
        System.out.println(java.text.MessageFormat.format(frenchTemplate, "Asha"));
    }
}`,
        output: `Hello, Asha!
Bonjour, Asha!`,
      },
      {
        caption: 'NumberFormat formatting the same value for US and German locales',
        code: `import java.text.NumberFormat;
import java.util.Locale;

public class NumberFormatDemo {
    public static void main(String[] args) {
        double amount = 1234567.891;

        NumberFormat usFormat = NumberFormat.getNumberInstance(Locale.US);
        NumberFormat germanFormat = NumberFormat.getNumberInstance(Locale.GERMANY);

        System.out.println("US format: " + usFormat.format(amount));
        System.out.println("German format: " + germanFormat.format(amount));

        NumberFormat usCurrency = NumberFormat.getCurrencyInstance(Locale.US);
        NumberFormat germanCurrency = NumberFormat.getCurrencyInstance(Locale.GERMANY);

        System.out.println("US currency: " + usCurrency.format(amount));
        System.out.println("German currency: " + germanCurrency.format(amount));
    }
}`,
        output: `US format: 1,234,567.891
German format: 1.234.567,891
US currency: $1,234,567.89
German currency: 1.234.567,89 €`,
      },
    ],
    commonMistakes: [
      'Hardcoding user-facing strings directly in Java source instead of externalizing them into ResourceBundle properties files.',
      'Assuming every user formats numbers, currency, and dates the way the developer\'s own locale does, causing confusing or incorrect output for international users.',
      'Forgetting to specify an encoding for properties files containing non-ASCII characters, leading to garbled accented characters.',
      'Constructing formatted date/number strings manually with string concatenation instead of using locale-aware NumberFormat/DateFormat.',
    ],
    keyPoints: [
      'Locale represents a language/region pair and drives the behavior of ResourceBundle and the formatting classes.',
      'ResourceBundle loads translated text from locale-specific properties files (e.g. messages_en.properties, messages_fr.properties), avoiding hardcoded strings.',
      'NumberFormat and DateFormat produce locale-appropriate output for numbers, currency, and dates from the same underlying value.',
      'Internationalizing early (externalizing text, using locale-aware formatters) avoids expensive rework later.',
    ],
  },
}
