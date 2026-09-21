// Servlets module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content10Servlets = {
  'servlet-introduction-and-lifecycle': {
    title: 'Servlet Introduction and Lifecycle',
    intro: `A servlet is a Java class that runs inside a servlet container (such as Apache Tomcat, Jetty, or a full Jakarta EE server) and handles HTTP requests and responses. Servlets are the foundation of server-side Java web development — frameworks like Spring MVC, Struts, and even JSP itself compile down to servlets under the hood.

Unlike a plain Java class you instantiate yourself, a servlet's entire life — from creation to destruction — is managed by the container. You never call <code>new</code> on a servlet class in application code; you implement callback methods, and the container decides when to invoke them, based on incoming HTTP traffic and server startup/shutdown events.`,
    sections: [
      {
        heading: 'The Servlet Interface and HttpServlet',
        body: `Every servlet ultimately implements the <code>javax.servlet.Servlet</code> (or <code>jakarta.servlet.Servlet</code>, depending on the platform version) interface, but in practice almost nobody implements it directly. Instead, you extend <code>HttpServlet</code>, an abstract class that already implements generic request dispatching and exposes HTTP-specific methods like <code>doGet</code>, <code>doPost</code>, <code>doPut</code>, and <code>doDelete</code> that you override based on which HTTP methods your servlet should handle.`,
      },
      {
        heading: 'The Three Lifecycle Stages',
        body: `The container manages a servlet through three well-defined stages, and each maps to a specific method you can override.`,
        list: [
          '<strong>Loading and Instantiation</strong> — the container loads the servlet class and creates exactly one instance, typically on the first request (or at startup, if <code>load-on-startup</code> is configured).',
          '<strong>init()</strong> — called exactly once, immediately after instantiation, before the servlet handles any request. Used for one-time setup like opening a database connection pool or reading configuration.',
          '<strong>service()</strong> — called once per incoming request. <code>HttpServlet</code>\'s built-in <code>service()</code> inspects the HTTP method and dispatches to <code>doGet()</code>, <code>doPost()</code>, and so on automatically.',
          '<strong>destroy()</strong> — called exactly once, when the container is shutting down the servlet (e.g., on application undeploy or server shutdown), giving you a chance to release resources.',
        ],
      },
      {
        heading: 'Single Instance, Multiple Threads',
        body: `A critical detail that trips up many developers: the container normally creates only one instance of each servlet class and reuses it for every request, dispatching concurrent requests to that single instance on separate threads. This means instance variables in a servlet are shared state across all users, and mutating them without synchronization is a common source of subtle, hard-to-reproduce bugs. Request-specific data should live in local variables inside <code>doGet</code>/<code>doPost</code>, never in servlet instance fields.`,
      },
    ],
    examples: [
      {
        caption: 'A servlet showing init(), doGet(), and destroy() in the lifecycle',
        code: `import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class GreetingServlet extends HttpServlet {

    private int requestCount = 0; // shared across all requests - handle with care

    @Override
    public void init() {
        System.out.println("GreetingServlet: init() called once at startup");
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        requestCount++;
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("<html><body>");
        out.println("<h2>Hello from GreetingServlet</h2>");
        out.println("<p>This servlet has handled " + requestCount + " request(s).</p>");
        out.println("</body></html>");
    }

    @Override
    public void destroy() {
        System.out.println("GreetingServlet: destroy() called at shutdown");
    }
}`,
        output: `Browser (each reload increments the counter):
Hello from GreetingServlet
This servlet has handled 1 request(s).
(reload again) This servlet has handled 2 request(s).

Server console on deploy:  GreetingServlet: init() called once at startup
Server console on undeploy: GreetingServlet: destroy() called at shutdown`,
      },
    ],
    commonMistakes: [
      'Storing per-request or per-user data in servlet instance variables, assuming each request gets a fresh object — the container reuses one instance across threads.',
      'Overriding service() directly instead of doGet()/doPost() when extending HttpServlet, which bypasses the built-in HTTP-method dispatching.',
      'Expecting init() to run on every request — it runs exactly once, right after the servlet is instantiated.',
      'Forgetting that heavy work in init() (like opening many connections) delays the very first request if the servlet is lazily loaded rather than load-on-startup.',
    ],
    keyPoints: [
      'A servlet is a container-managed Java class that handles HTTP requests; HttpServlet is the class almost everyone extends.',
      'Lifecycle order: instantiation, init() once, service() per request (dispatching to doGet/doPost), destroy() once at shutdown.',
      'Normally one servlet instance serves all requests concurrently on different threads — avoid mutable shared instance state.',
    ],
  },

  'servlet-configuration-web-xml-vs-annotations': {
    title: 'Servlet Configuration: web.xml vs Annotations',
    intro: `Before a servlet can handle requests, the container needs to know two things: which URL patterns should route to it, and any initialization parameters it needs. Java web applications support two ways to declare this: the traditional XML deployment descriptor (<code>web.xml</code>), and the modern <code>@WebServlet</code> annotation introduced in Servlet 3.0.

Both approaches configure the same underlying concept — a mapping from a URL pattern to a servlet class — but they differ in where that configuration lives and how flexible it is at deploy time.`,
    sections: [
      {
        heading: 'The Legacy Approach: web.xml',
        body: `Before Servlet 3.0, every servlet had to be declared in <code>WEB-INF/web.xml</code> using a <code>&lt;servlet&gt;</code> element (naming the class) paired with a <code>&lt;servlet-mapping&gt;</code> element (binding that name to a URL pattern). This centralizes all routing information in one file, which some teams still prefer for auditability, and it lets operations staff change a URL mapping without recompiling code.`,
        list: [
          '<code>&lt;servlet&gt;</code> — declares a logical <code>&lt;servlet-name&gt;</code> and the fully qualified <code>&lt;servlet-class&gt;</code>.',
          '<code>&lt;servlet-mapping&gt;</code> — links a <code>&lt;servlet-name&gt;</code> to one or more <code>&lt;url-pattern&gt;</code> values.',
          '<code>&lt;init-param&gt;</code> — optional name/value pairs available in the servlet via <code>getInitParameter()</code>.',
        ],
      },
      {
        heading: 'The Modern Approach: @WebServlet',
        body: `Servlet 3.0 (2009) introduced the <code>@WebServlet</code> annotation, which lets you declare the URL pattern directly on the class, eliminating the need for a matching <code>web.xml</code> entry entirely. This keeps routing information next to the code it affects and is now the default style in almost all new development. Annotations also support init parameters through the nested <code>@WebInitParam</code> annotation.`,
      },
      {
        heading: 'Choosing Between Them (and Mixing Both)',
        body: `Annotations are simpler for most projects and reduce boilerplate, but web.xml still has a role: it can override an annotation's URL pattern without touching source code, and some legacy containers or frameworks still expect it. A web.xml entry for a given servlet, if present, takes precedence over that servlet's annotation. Many real projects mix both — annotations for most servlets, and a thin web.xml for cross-cutting settings like session timeout, welcome files, or error pages.`,
      },
    ],
    examples: [
      {
        caption: 'Same servlet configured with web.xml',
        code: `<!-- WEB-INF/web.xml -->
<web-app>
    <servlet>
        <servlet-name>greeting</servlet-name>
        <servlet-class>com.webnest.GreetingServlet</servlet-class>
        <init-param>
            <param-name>defaultName</param-name>
            <param-value>Guest</param-value>
        </init-param>
    </servlet>
    <servlet-mapping>
        <servlet-name>greeting</servlet-name>
        <url-pattern>/greet</url-pattern>
    </servlet-mapping>
</web-app>`,
        output: 'Requests to /greet are routed to GreetingServlet; getInitParameter("defaultName") returns "Guest".',
      },
      {
        caption: 'The same configuration using @WebServlet (no web.xml entry needed)',
        code: `import javax.servlet.annotation.WebInitParam;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;

@WebServlet(
    urlPatterns = "/greet",
    initParams = { @WebInitParam(name = "defaultName", value = "Guest") }
)
public class GreetingServlet extends HttpServlet {
    // doGet/doPost implementation unchanged
}`,
        output: 'Requests to /greet are routed to GreetingServlet exactly as with the web.xml version — no XML file required.',
      },
    ],
    commonMistakes: [
      'Declaring the same URL pattern for two different servlets, which throws a deployment error because mappings must be unique.',
      'Forgetting that a web.xml <servlet-mapping> for a class also using @WebServlet can silently override the annotation, causing confusing "which config wins" debugging.',
      'Mixing up <servlet-name> across the <servlet> and <servlet-mapping> elements in web.xml, which breaks the routing silently.',
      'Assuming annotations work in servlet containers older than Servlet 3.0 (Tomcat 6 and earlier do not support @WebServlet).',
    ],
    keyPoints: [
      'web.xml is the traditional, centralized way to declare servlets, using <servlet> plus <servlet-mapping>.',
      '@WebServlet(urlPatterns = "...") is the modern Servlet 3.0+ approach, keeping routing next to the class.',
      'A matching web.xml entry overrides an @WebServlet annotation for the same servlet.',
      'Both approaches support init parameters, retrieved in code via getInitParameter().',
    ],
  },

  'request-and-response-objects': {
    title: 'Request and Response Objects',
    intro: `Every time a servlet's <code>doGet</code> or <code>doPost</code> method runs, the container hands it two objects: an <code>HttpServletRequest</code> representing everything the client sent, and an <code>HttpServletResponse</code> representing everything the servlet will send back. Almost all servlet logic revolves around reading from the request and writing to the response.`,
    sections: [
      {
        heading: 'HttpServletRequest — Reading Client Data',
        body: `The request object exposes form data, URL query parameters, headers, cookies, and metadata about the connection.`,
        list: [
          '<code>getParameter(String name)</code> — returns a single form field or query string value as a String (or null if absent).',
          '<code>getParameterValues(String name)</code> — returns an array, used for multi-value fields like checkboxes.',
          '<code>getHeader(String name)</code> — reads an HTTP request header, such as <code>User-Agent</code> or <code>Authorization</code>.',
          '<code>getMethod()</code>, <code>getRequestURI()</code>, <code>getRemoteAddr()</code> — metadata about the request itself.',
          '<code>getAttribute()</code> / <code>setAttribute()</code> — a per-request storage area, commonly used to pass data to a JSP via forward.',
        ],
      },
      {
        heading: 'HttpServletResponse — Writing Back to the Client',
        body: `The response object controls the status code, headers, and body sent back. Setting the content type before writing the body matters because it tells the browser how to interpret what follows.`,
        list: [
          '<code>setContentType(String type)</code> — e.g. <code>"text/html"</code> or <code>"application/json"</code>; must be called before getWriter() for correct behavior.',
          '<code>getWriter()</code> — returns a PrintWriter for writing character (text) output, such as HTML.',
          '<code>getOutputStream()</code> — returns a stream for binary output, such as an image or file download.',
          '<code>setStatus(int sc)</code> / <code>sendError(int sc)</code> — sets the HTTP status code, e.g. 404 or 500.',
          '<code>sendRedirect(String url)</code> — sends an HTTP redirect, instructing the browser to make a new request.',
        ],
      },
      {
        heading: 'A Note on Character Encoding',
        body: `Because request parameters and response bodies are ultimately byte streams, character encoding matters for anything beyond plain ASCII. Calling <code>request.setCharacterEncoding("UTF-8")</code> before reading any parameters, and <code>response.setCharacterEncoding("UTF-8")</code> (or including it in setContentType, e.g. <code>"text/html;charset=UTF-8"</code>) before writing, avoids garbled text for non-English input.`,
      },
    ],
    examples: [
      {
        caption: 'Reading form parameters and headers, then writing an HTML response',
        code: `import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class RegisterServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        String username = request.getParameter("username");
        String userAgent = request.getHeader("User-Agent");

        response.setContentType("text/html;charset=UTF-8");
        PrintWriter out = response.getWriter();

        if (username == null || username.trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.println("<h3>Error: username is required</h3>");
            return;
        }

        out.println("<html><body>");
        out.println("<h3>Welcome, " + username + "!</h3>");
        out.println("<p>Detected browser info: " + userAgent + "</p>");
        out.println("</body></html>");
    }
}`,
        output: `Form submitted with username=Ananya:
Welcome, Ananya!
Detected browser info: Mozilla/5.0 (...) Chrome/...

Form submitted with empty username:
HTTP 400 response body: Error: username is required`,
      },
    ],
    commonMistakes: [
      'Calling getParameter() for a form field name that does not match the HTML form\'s "name" attribute exactly (case-sensitive) and getting null.',
      'Calling response.getWriter() before response.setContentType(), which can cause the content type to be ignored by some containers.',
      'Mixing getWriter() and getOutputStream() calls on the same response, which throws an IllegalStateException.',
      'Forgetting to call setCharacterEncoding("UTF-8") before reading parameters that contain non-ASCII text, resulting in garbled characters.',
    ],
    keyPoints: [
      'HttpServletRequest carries everything the client sent: parameters, headers, attributes, and connection metadata.',
      'HttpServletResponse controls what goes back: status code, headers, and body via getWriter() or getOutputStream().',
      'Set content type and character encoding before writing to the response body.',
      'getParameter() always returns a String or null — never assume a value was supplied.',
    ],
  },

  'session-tracking-cookies-httpsession-url-rewriting': {
    title: 'Session Tracking: Cookies, HttpSession, URL Rewriting',
    intro: `HTTP is a stateless protocol: each request is handled independently, with no built-in memory of previous requests from the same client. But real applications need to remember things across requests — who is logged in, what is in a shopping cart, what step of a checkout flow a user is on. Session tracking is the general term for the techniques Java web applications use to simulate that memory on top of stateless HTTP.

Java provides three related mechanisms, and understanding how they connect is more important than memorizing any one API: Cookies are the client-side building block, HttpSession is the server-side abstraction built on top of cookies (usually), and URL rewriting is the fallback used when cookies are unavailable.`,
    sections: [
      {
        heading: 'Cookies — Client-Side State',
        body: `A cookie is a small piece of data the server sends to the browser via a <code>Set-Cookie</code> response header; the browser stores it and automatically resends it with every subsequent request to the same domain. In servlets, you create one with <code>new Cookie(name, value)</code>, configure it (expiry, path), and add it with <code>response.addCookie(cookie)</code>. On later requests, <code>request.getCookies()</code> returns the array of cookies the browser sent back. Cookies are entirely client-managed — the server trusts what comes back, so sensitive data should never be stored directly in a cookie's value.`,
      },
      {
        heading: 'HttpSession — Server-Side State',
        body: `<code>HttpSession</code> stores data on the server, keyed by a unique session ID. You obtain it with <code>request.getSession()</code> (creates one if it doesn't exist) or <code>request.getSession(false)</code> (returns null instead of creating one). You then use <code>setAttribute()</code> / <code>getAttribute()</code> to store and retrieve objects tied to that specific user's session across multiple requests. Under the hood, the container almost always uses a cookie named <code>JSESSIONID</code> to let the browser prove, on each request, which session it belongs to — the actual data lives in server memory (or a distributed store), not in the cookie itself.`,
      },
      {
        heading: 'URL Rewriting — the Fallback',
        body: `If a browser has cookies disabled, the JSESSIONID cookie never gets stored, and the server would lose track of the session on the very next request. URL rewriting solves this by encoding the session ID directly into the URL instead — for example, <code>/cart;jsessionid=ABC123</code>. In servlet code, you never hardcode this manually; you call <code>response.encodeURL(url)</code> (or <code>encodeRedirectURL()</code> for redirects) on every outgoing link, and the container automatically appends the session ID only when it detects the client isn't using cookies. This is why every link and form action in a properly written JSP page should be wrapped in <code>encodeURL()</code>.`,
      },
    ],
    examples: [
      {
        caption: 'Tracking a logged-in user with HttpSession, with a cookie-safe link',
        code: `import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class DashboardServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(); // creates one if none exists

        Integer visitCount = (Integer) session.getAttribute("visitCount");
        visitCount = (visitCount == null) ? 1 : visitCount + 1;
        session.setAttribute("visitCount", visitCount);

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("<html><body>");
        out.println("<p>Session ID: " + session.getId() + "</p>");
        out.println("<p>You have visited this page " + visitCount + " time(s).</p>");

        // encodeURL appends ;jsessionid=... automatically if cookies are disabled
        String logoutLink = response.encodeURL("/logout");
        out.println("<a href=\\"" + logoutLink + "\\">Logout</a>");
        out.println("</body></html>");
    }
}`,
        output: `First visit:
Session ID: 7F3A9C1E...
You have visited this page 1 time(s).
Logout

Second visit (same browser session, cookies enabled): visit count increments to 2.
With cookies disabled: the Logout link becomes /logout;jsessionid=7F3A9C1E... to preserve the session.`,
      },
    ],
    commonMistakes: [
      'Storing sensitive information (passwords, raw credit card numbers) directly inside a cookie value, which is visible and editable on the client.',
      'Calling request.getSession() when you only want to check for an existing session — this creates a new empty session as a side effect if none existed; use getSession(false) to check safely.',
      'Forgetting to invalidate the session (session.invalidate()) on logout, leaving a valid session usable by anyone with the old session ID.',
      'Hardcoding links without response.encodeURL(), which silently breaks session tracking for the small fraction of users with cookies disabled.',
    ],
    keyPoints: [
      'HTTP is stateless; cookies, HttpSession, and URL rewriting are the mechanisms Java web apps use to fake state across requests.',
      'Cookies are client-side and container-agnostic; the container typically uses a JSESSIONID cookie to link a browser to server-side session data.',
      'HttpSession stores data on the server, accessed via getSession(), setAttribute(), and getAttribute().',
      'URL rewriting (via response.encodeURL()) is the fallback session-tracking mechanism when the client has cookies disabled.',
    ],
  },

  'servlet-filters-and-listeners': {
    title: 'Servlet Filters and Listeners',
    intro: `As applications grow, certain concerns — logging every request, checking authentication, compressing responses, or reacting to application startup — need to apply across many servlets rather than being duplicated inside each one. Servlet Filters and Listeners exist to handle exactly this kind of cross-cutting behavior without polluting individual servlet classes.`,
    sections: [
      {
        heading: 'Filters — Intercepting the Request/Response Chain',
        body: `A <code>Filter</code> sits in front of one or more servlets and can inspect, modify, or even block a request before it reaches its target, and likewise inspect or modify the response on the way back. You implement the <code>Filter</code> interface's <code>doFilter(request, response, chain)</code> method, and critically, you must call <code>chain.doFilter(request, response)</code> to pass control onward — if you don't, the request stops right there and never reaches the servlet.`,
        list: [
          '<strong>Logging filter</strong> — records method, URI, and timing for every request.',
          '<strong>Authentication filter</strong> — checks for a valid session before allowing access to protected URL patterns.',
          '<strong>Compression filter</strong> — wraps the response to gzip-compress the output.',
          'Filters are configured with <code>@WebFilter(urlPatterns = "...")</code> or a <code>&lt;filter&gt;</code>/<code>&lt;filter-mapping&gt;</code> pair in web.xml, similar to servlet mapping.',
        ],
      },
      {
        heading: 'Listeners — Reacting to Lifecycle Events',
        body: `Listeners let you run code in response to application-level or session-level events, without wiring that logic into every servlet. The most commonly used ones are <code>ServletContextListener</code>, whose <code>contextInitialized()</code> and <code>contextDestroyed()</code> methods fire when the whole web application starts up and shuts down — a natural place to initialize a connection pool or scheduled task — and <code>HttpSessionListener</code>, whose <code>sessionCreated()</code> and <code>sessionDestroyed()</code> methods fire whenever any user's session is created or invalidated, useful for tracking active user counts.`,
      },
      {
        heading: 'Filter Chains Run in Order',
        body: `When multiple filters match the same URL, they execute in a defined order (the order declared in web.xml, or an unspecified-but-consistent order for annotation-based filters unless you also declare ordering), forming a chain. Each filter's code before <code>chain.doFilter()</code> runs on the way in; code after it runs on the way out, in reverse order — which is why filters are a natural fit for "wrap" style logic like timing (start a clock before, log elapsed time after).`,
      },
    ],
    examples: [
      {
        caption: 'A logging filter that times every request',
        code: `import java.io.IOException;
import javax.servlet.*;
import javax.servlet.annotation.WebFilter;

@WebFilter(urlPatterns = "/*")
public class LoggingFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        long start = System.currentTimeMillis();

        chain.doFilter(request, response); // pass control to the next filter or the servlet

        long elapsed = System.currentTimeMillis() - start;
        System.out.println("Request handled in " + elapsed + " ms");
    }
}`,
        output: `Server console for each request:
Request handled in 42 ms
Request handled in 17 ms`,
      },
      {
        caption: 'A listener that counts active sessions application-wide',
        code: `import javax.servlet.annotation.WebListener;
import javax.servlet.http.HttpSessionEvent;
import javax.servlet.http.HttpSessionListener;
import java.util.concurrent.atomic.AtomicInteger;

@WebListener
public class ActiveUserListener implements HttpSessionListener {
    private static final AtomicInteger activeSessions = new AtomicInteger(0);

    @Override
    public void sessionCreated(HttpSessionEvent se) {
        System.out.println("Active users: " + activeSessions.incrementAndGet());
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        System.out.println("Active users: " + activeSessions.decrementAndGet());
    }
}`,
        output: `Server console as users log in and sessions time out:
Active users: 1
Active users: 2
Active users: 1`,
      },
    ],
    commonMistakes: [
      'Forgetting to call chain.doFilter(), which silently stops every request from ever reaching its servlet.',
      'Calling chain.doFilter() more than once, which causes an IllegalStateException because the response has already been committed.',
      'Assuming a ServletContextListener runs per-request — it runs only once at application startup and once at shutdown.',
      'Relying on a specific execution order between multiple annotation-declared filters without explicitly configuring that order.',
    ],
    keyPoints: [
      'Filters intercept requests/responses for cross-cutting concerns (logging, auth, compression) and must call chain.doFilter() to continue the chain.',
      'ServletContextListener reacts to whole-application startup/shutdown; HttpSessionListener reacts to individual session creation/destruction.',
      'Code before chain.doFilter() runs on the way in; code after it runs on the way out.',
      'Both filters and listeners can be configured via annotations (@WebFilter, @WebListener) or web.xml.',
    ],
  },

  'requestdispatcher-forward-vs-include': {
    title: 'RequestDispatcher: Forward vs Include',
    intro: `Servlets frequently need to hand off processing to another resource — often a JSP that renders the final HTML, or another servlet that handles a sub-task. Java provides three distinct mechanisms for this, and mixing them up is one of the most common sources of confusing bugs in servlet-based applications: <code>RequestDispatcher.forward()</code>, <code>RequestDispatcher.include()</code>, and <code>HttpServletResponse.sendRedirect()</code>.

The key distinction is server-side vs client-side. Forward and include both happen entirely on the server, within the same request; sendRedirect tells the browser to make an entirely new, separate request.`,
    sections: [
      {
        heading: 'forward() — Hand Off Control, Same Request',
        body: `<code>RequestDispatcher.forward(request, response)</code> transfers control to another resource on the server, within the same request and response objects. Any attributes set with <code>request.setAttribute()</code> before the forward are still visible to the target resource — this is the standard way a controller servlet passes data to a JSP view. The browser's address bar does not change, because the browser is never told a redirection happened; it only ever sees the response from the final resource. Anything written to the response before the forward should generally be avoided, since forward is meant to hand off rendering, not append to it.`,
      },
      {
        heading: 'include() — Embed Another Resource\'s Output',
        body: `<code>RequestDispatcher.include(request, response)</code> executes another resource and inserts its output into the current response, then returns control back to the original servlet, which can continue writing more content afterward. This is useful for composing a page out of reusable fragments — a header, a footer, or a sidebar — much like a template include. Unlike forward, the including resource retains control and can write both before and after the include call.`,
      },
      {
        heading: 'sendRedirect() — A New Request From the Browser',
        body: `<code>response.sendRedirect(url)</code> sends an HTTP 302 (or 303) status back to the browser with a <code>Location</code> header; the browser then issues a brand-new GET request to that URL. This is client-side: the address bar changes to the new URL, request attributes from the original request are lost (because it truly is a new request), and it works for redirecting to external sites, unlike forward/include which only work within the same application's resources.`,
        list: [
          '<strong>forward()</strong> — server-side, same request, URL unchanged, attributes preserved.',
          '<strong>include()</strong> — server-side, embeds output, control returns to caller.',
          '<strong>sendRedirect()</strong> — client-side, new request, URL changes, attributes lost, can target external URLs.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Controller servlet forwarding to a JSP view with request attributes',
        code: `import java.io.IOException;
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ProductServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setAttribute("productName", "Wireless Mouse");
        request.setAttribute("price", 799.00);

        // Server-side hand-off: URL stays "/products", attributes are visible in the JSP
        RequestDispatcher dispatcher = request.getRequestDispatcher("/WEB-INF/views/product.jsp");
        dispatcher.forward(request, response);
    }
}`,
        output: `Browser address bar remains: /products
Rendered page (from product.jsp using \${productName} and \${price}):
Product: Wireless Mouse
Price: 799.0`,
      },
      {
        caption: 'sendRedirect vs forward — the address bar difference',
        code: `// Option A: forward — address bar stays "/checkout"
request.getRequestDispatcher("/WEB-INF/views/confirmation.jsp").forward(request, response);

// Option B: sendRedirect — address bar changes to "/confirmation", new GET request issued
response.sendRedirect("confirmation");`,
        output: 'Forward: bar shows /checkout while confirmation.jsp renders. Redirect: browser navigates to /confirmation with a fresh request; refreshing the page does not resubmit the original form data.',
      },
    ],
    commonMistakes: [
      'Using sendRedirect() after a form POST and expecting request.getAttribute() values to still be available in the next page — a redirect starts a brand-new request.',
      'Calling forward() after the response has already been committed (partially written and flushed), which throws an IllegalStateException.',
      'Using forward() when an external URL is intended — forward only works for resources within the same web application.',
      'Confusing include() with forward() and being surprised that the including servlet can still write to the response afterward.',
    ],
    keyPoints: [
      'forward() and include() are server-side and share the same request/response; sendRedirect() is client-side and creates a new request.',
      'forward() hands off rendering entirely; include() embeds another resource\'s output and returns control to the caller.',
      'Only sendRedirect() changes the browser\'s address bar and can target URLs outside the current application.',
      'Request attributes set before a forward/include survive; they do not survive a redirect.',
    ],
  },
}
