// Practice blocks for the Networking, Reflection, and Platform Tools module. Merged onto
// the lesson entries in index.js by slug, so the lesson prose files stay unchanged.
// The exercises need no network connection and no second JVM.
export const practice10Platform = {
  'java-networking-sockets-url-urlconnection-httpurlconnection-and-inetaddress': {
    whyItMatters: `Every web request, database connection and message between services is a network call underneath. You will normally use a framework or an HTTP client library for these, but the terms used here — host, port, socket, connection, timeout — are the ones in every error message and configuration file you will read while building backend systems.`,
    exercise: {
      prompt: `Break an address into its parts with <code>java.net.URI</code>, which has the same getters as the <code>URL</code> class and does not need a network connection. Print the host, the port, the path and the query.

Expected output: <code>example.com</code>, <code>8443</code>, <code>/api/users</code>, <code>id=7</code> (one per line)`,
      starterCode: `import java.net.URI;

public class AddressParts {
    public static void main(String[] args) {
        URI address = URI.create("https://example.com:8443/api/users?id=7");

        // TODO: print the host, the port, the path and the query, one per line
    }
}`,
      hints: [
        'The getters are <code>getHost()</code>, <code>getPort()</code>, <code>getPath()</code> and <code>getQuery()</code>.',
        '<code>getPort()</code> returns <code>-1</code> when the address has no explicit port; this one has.',
      ],
      solution: `import java.net.URI;

public class AddressParts {
    public static void main(String[] args) {
        URI address = URI.create("https://example.com:8443/api/users?id=7");

        System.out.println(address.getHost());  // example.com
        System.out.println(address.getPort());  // 8443
        System.out.println(address.getPath());  // /api/users
        System.out.println(address.getQuery()); // id=7
    }
}`,
    },
    quiz: [
      {
        question: 'Which class does a TCP server use to wait for clients?',
        options: ['Socket', 'URLConnection', 'InetAddress', 'ServerSocket'],
        answer: 3,
        explanation: 'A ServerSocket listens on a port. Each accepted connection is returned as a Socket.',
      },
      {
        question: 'What does <code>serverSocket.accept()</code> do when no client is connecting?',
        options: ['Blocks until a client connects', 'Throws an exception', 'Returns null', 'Returns an empty Socket'],
        answer: 0,
        explanation: 'The thread waits inside accept(), which is why servers handle each client on a separate thread.',
      },
      {
        question: 'What does <code>InetAddress.getByName("example.com")</code> do?',
        options: ['Opens a connection to the host', 'Looks up the IP address for the host name', 'Downloads the page', 'Checks that the host is online'],
        answer: 1,
        explanation: 'It performs a DNS lookup and returns an object holding the address.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a socket?',
        answer: `A socket is one end of a two-way connection between two programs on a network. It is identified by an IP address and a port number. In Java, a client creates a <code>Socket</code> for the server's address and port, and a server creates a <code>ServerSocket</code> and calls <code>accept()</code>, which returns a <code>Socket</code> for each client. Both sides then read and write through the socket's input and output streams.`,
      },
      {
        question: 'What is the difference between TCP and UDP?',
        answer: `TCP sets up a connection and guarantees that data arrives complete and in order, resending anything that is lost; it is used for HTTP, databases and file transfer, and in Java through <code>Socket</code> and <code>ServerSocket</code>. UDP sends independent packets with no connection and no guarantee of delivery or order, which makes it faster; it is used for streaming, games and DNS, and in Java through <code>DatagramSocket</code>.`,
      },
      {
        question: 'How would you make an HTTP request in modern Java?',
        answer: `With <code>java.net.http.HttpClient</code>, added in Java 11. You build an <code>HttpRequest</code> and call <code>client.send(request, BodyHandlers.ofString())</code>, or <code>sendAsync</code> for a non-blocking call. It supports HTTP/2 and timeouts and is easier to use than the older <code>HttpURLConnection</code>.`,
      },
    ],
  },

  'java-reflection-api-and-the-javap-tool': {
    whyItMatters: `You will rarely write reflection yourself, but nearly every framework you use is built on it. Spring finds your classes and injects their dependencies, JUnit finds test methods, and Jackson and Hibernate read and set fields, all by inspecting classes at runtime. Knowing what reflection can do explains how annotations such as <code>@Autowired</code> work.`,
    exercise: {
      prompt: `Using reflection, print the simple name of the <code>Secret</code> class and then read the value of its private field <code>code</code> from an object.

Expected output: <code>Secret</code> then <code>X42</code>`,
      starterCode: `import java.lang.reflect.Field;

class Secret {
    private String code = "X42";
}

public class ReadPrivateField {
    public static void main(String[] args) throws Exception {
        Secret secret = new Secret();
        Class<?> type = secret.getClass();

        // TODO: print the simple name of the class
        // TODO: get the declared field "code", make it accessible, and print its value for this object
    }
}`,
      hints: [
        '<code>getDeclaredField("code")</code> finds a field of any visibility declared in the class.',
        'Call <code>field.setAccessible(true)</code> before <code>field.get(secret)</code>, or the private field cannot be read.',
      ],
      solution: `import java.lang.reflect.Field;

class Secret {
    private String code = "X42";
}

public class ReadPrivateField {
    public static void main(String[] args) throws Exception {
        Secret secret = new Secret();
        Class<?> type = secret.getClass();

        System.out.println(type.getSimpleName()); // Secret

        Field field = type.getDeclaredField("code");
        field.setAccessible(true);
        System.out.println(field.get(secret)); // X42
    }
}`,
    },
    quiz: [
      {
        question: 'What is the difference between <code>getMethods()</code> and <code>getDeclaredMethods()</code>?',
        options: ['There is none', 'getDeclaredMethods() returns only public methods', 'getMethods() returns public methods including inherited ones; getDeclaredMethods() returns all methods declared in the class itself', 'getMethods() returns only static methods'],
        answer: 2,
        explanation: 'The "declared" versions include private members but not inherited ones.',
      },
      {
        question: 'What does <code>setAccessible(true)</code> do?',
        options: ['Makes the member public in the source', 'Loads the class', 'Makes the method static', 'Turns off the access check for that reflective object, so a private member can be used'],
        answer: 3,
        explanation: 'It affects only that Field or Method object; the class itself is not changed.',
      },
      {
        question: 'What does the command <code>javap -c MyClass</code> show?',
        options: ['The bytecode instructions of each method', 'The original source code', 'The output of the program', 'The memory used by the class'],
        answer: 0,
        explanation: 'Without -c, javap lists the fields and method signatures of the compiled class.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is reflection and where is it used?',
        answer: `Reflection is the ability of a program to inspect classes at runtime — their fields, methods, constructors and annotations — and to create objects, call methods and read or set fields by name. Dependency injection containers, test frameworks, object-relational mappers and JSON libraries all rely on it to work with classes they knew nothing about when they were compiled.`,
      },
      {
        question: 'What are the drawbacks of reflection?',
        answer: `It is slower than direct calls, because the checks that the compiler normally does are done at runtime. It bypasses compile-time type checking, so a wrong method name fails only when the code runs. It can break encapsulation by reaching private members, and that access may be refused for classes in modules that do not open their packages. For these reasons application code uses it sparingly.`,
      },
    ],
  },

  'java-rmi-remote-method-invocation': {
    whyItMatters: `RMI is mostly found in older enterprise systems, but the idea it introduced is the basis of everything that replaced it. Calling a method that actually runs on another machine, through a local stub that sends the arguments over the network, is exactly what gRPC and REST clients do today. Understanding RMI makes those easier to learn, and you may still have to maintain it.`,
    exercise: {
      prompt: `Declare a remote interface <code>Calculator</code> with a method <code>add</code>, following both rules that RMI requires of a remote interface. The implementation is called directly here, without a registry, so the program runs in one JVM.

Expected output: <code>12</code>`,
      starterCode: `import java.rmi.Remote;
import java.rmi.RemoteException;

// TODO: declare the interface Calculator with a method: int add(int a, int b)
//       Rule 1: it must extend Remote
//       Rule 2: every method must declare RemoteException

class CalculatorImpl implements Calculator {
    @Override
    public int add(int a, int b) throws RemoteException {
        return a + b;
    }
}

public class RemoteInterfacePractice {
    public static void main(String[] args) throws RemoteException {
        Calculator calculator = new CalculatorImpl();
        System.out.println(calculator.add(5, 7));
    }
}`,
      hints: [
        'The declaration starts with <code>interface Calculator extends Remote</code>.',
        'The method is declared as <code>int add(int a, int b) throws RemoteException;</code>',
      ],
      solution: `import java.rmi.Remote;
import java.rmi.RemoteException;

interface Calculator extends Remote {
    int add(int a, int b) throws RemoteException;
}

class CalculatorImpl implements Calculator {
    @Override
    public int add(int a, int b) throws RemoteException {
        return a + b;
    }
}

public class RemoteInterfacePractice {
    public static void main(String[] args) throws RemoteException {
        Calculator calculator = new CalculatorImpl();
        System.out.println(calculator.add(5, 7)); // 12
    }
}`,
    },
    quiz: [
      {
        question: 'Which interface must a remote interface extend?',
        options: ['Serializable', 'java.rmi.Remote', 'Runnable', 'Cloneable'],
        answer: 1,
        explanation: 'Remote is a marker interface that identifies methods that can be called from another JVM.',
      },
      {
        question: 'Why must every remote method declare <code>RemoteException</code>?',
        options: ['It is only a convention', 'It makes the call faster', 'A network call can fail in ways a local call cannot, and the caller must handle that', 'The method always throws it'],
        answer: 2,
        explanation: 'The server may be down or the connection may drop while the call is in progress.',
      },
      {
        question: 'What does the RMI registry do?',
        options: ['Compiles remote classes', 'Stores the results of calls', 'Encrypts the connection', 'Lets a client look up a remote object by name'],
        answer: 3,
        explanation: 'The server binds its object under a name, and the client looks that name up to obtain a stub.',
      },
    ],
    interviewQuestions: [
      {
        question: 'How does an RMI call work?',
        answer: `The client holds a stub, a local object that implements the remote interface. Calling a method on the stub serializes the arguments and sends them over the network to the server, where the real object runs the method. The return value, or the exception, is serialized and sent back, and the stub returns it to the caller. Arguments and results must therefore be serializable.`,
      },
      {
        question: 'Why is RMI rarely chosen for new systems?',
        answer: `Both sides must be Java, the classes on each side must match, and it depends on Java serialization, which is a known security risk. Its connections are also awkward to pass through firewalls. REST over HTTP, gRPC and message queues work between any languages and are the usual choices today.`,
      },
    ],
  },
}
