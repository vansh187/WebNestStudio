// JSP (JavaServer Pages) module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content11Jsp = {
  'jsp-introduction-and-lifecycle': {
    title: 'JSP Introduction and Lifecycle',
    intro: `JavaServer Pages (JSP) let you write HTML pages with embedded Java logic, instead of writing HTML by hand inside a servlet's <code>println()</code> calls. A JSP file looks mostly like an ordinary HTML page, with special tags for the dynamic parts — but that appearance is deceiving, because a JSP page is never executed directly. Behind the scenes, the container translates every JSP into a full Java servlet, compiles it, and then runs it exactly like any other servlet.

This relationship — JSP is really "a servlet written the easy way" — explains almost every behavior JSP has, from its implicit objects to its lifecycle stages, and is the single most important fact to internalize before learning JSP syntax.`,
    sections: [
      {
        heading: 'From .jsp File to Running Servlet',
        body: `The container performs this translation the first time a JSP page is requested (or ahead of time, if precompiled): it reads the .jsp file, generates an equivalent Java source file (a servlet class extending <code>HttpJspPage</code>, which itself extends the same servlet lineage you already know), compiles that source into bytecode, and loads it. HTML markup in the JSP becomes <code>out.println()</code> calls in the generated servlet; Java code you wrote in scriptlets is copied nearly verbatim into the generated <code>_jspService()</code> method.`,
      },
      {
        heading: 'The Five Lifecycle Stages',
        body: `Because a JSP becomes a servlet, its lifecycle closely mirrors the servlet lifecycle, with one extra stage at the front for the translation step.`,
        list: [
          '<strong>Translation</strong> — the .jsp file is converted into Java source code (a servlet class), performed once per page unless the source changes.',
          '<strong>Compilation</strong> — the generated Java source is compiled into a .class file, again performed once (until the JSP is modified).',
          '<strong>Initialization</strong> — <code>jspInit()</code> runs once, analogous to a servlet\'s init().',
          '<strong>Execution</strong> — <code>_jspService()</code> runs once per request, analogous to a servlet\'s service(); you never write this method yourself, the container generates it from your page.',
          '<strong>Destruction</strong> — <code>jspDestroy()</code> runs once when the container removes the page, analogous to destroy().',
        ],
      },
      {
        heading: 'Why This Matters in Practice',
        body: `Because JSP compiles to a servlet, the first request to a freshly deployed JSP page is noticeably slower than subsequent ones — that first hit pays the translation-and-compilation cost. It also explains why a JSP syntax error shows up as a compilation error referencing a generated file with a name like <code>product_jsp.java</code>, which can look confusing until you know that file is auto-generated from your page.`,
      },
    ],
    examples: [
      {
        caption: 'A minimal JSP page and the servlet-like structure it compiles into conceptually',
        code: `<%-- welcome.jsp --%>
<html>
<body>
  <h2>Welcome to Webnest Studio</h2>
  <p>Today's date on the server: <%= new java.util.Date() %></p>
</body>
</html>

<%-- Conceptually, the container generates and runs code equivalent to: --%>
<%--
public void _jspService(HttpServletRequest request, HttpServletResponse response) {
    out.println("<html><body>");
    out.println("<h2>Welcome to Webnest Studio</h2>");
    out.println("<p>Today's date on the server: " + new java.util.Date() + "</p>");
    out.println("</body></html>");
}
--%>`,
        output: `Browser output:
Welcome to Webnest Studio
Today's date on the server: Mon Sep 21 00:00:00 UTC 2026`,
      },
    ],
    commonMistakes: [
      'Assuming a JSP file is interpreted line-by-line like a script — it is fully translated into a servlet and compiled, not interpreted.',
      'Not expecting the first request after deployment to be slower, and mistaking that one-time translation/compilation delay for a performance bug.',
      'Editing a JSP in production and being confused by a stack trace referencing an auto-generated file like index_jsp.java instead of the original .jsp.',
      'Forgetting that jspInit()/jspDestroy() run once, not per request, just like a servlet\'s init()/destroy().',
    ],
    keyPoints: [
      'A JSP page is translated into a servlet, compiled, and executed — it is not interpreted directly.',
      'Lifecycle: translation, compilation, initialization (jspInit), execution (_jspService per request), destruction (jspDestroy).',
      'HTML in a JSP becomes out.println() calls in the generated servlet; embedded Java is copied into the generated service method.',
      'The first request to a newly deployed or modified JSP pays a one-time translation/compilation cost.',
    ],
  },

  'jsp-scripting-elements': {
    title: 'JSP Scripting Elements',
    intro: `JSP scripting elements are the tags that let you embed Java code directly inside a page. There are three kinds — scriptlets, expressions, and declarations — and each is translated into a different part of the generated servlet, which is why they behave differently even though all three "contain Java code."

Scripting elements were the original way to add logic to a JSP page, and you will still encounter them in older codebases and in learning materials. Modern JSP development, however, deliberately avoids heavy use of them in favor of the Expression Language (EL) and the JSP Standard Tag Library (JSTL), for reasons explained below.`,
    sections: [
      {
        heading: 'Scriptlets: <% ... %>',
        body: `A scriptlet contains arbitrary Java statements and is copied directly into the generated servlet's <code>_jspService()</code> method, in the exact position it appears on the page. This means you can open a loop or an if-block in one scriptlet, write plain HTML in between (which becomes an out.println() inside that block), and close the loop or block in a later scriptlet — the HTML in between only renders when the surrounding Java logic says it should.`,
      },
      {
        heading: 'Expressions: <%= ... %>',
        body: `An expression evaluates a single Java expression and inserts its String representation directly into the output, equivalent to wrapping it in <code>out.print(...)</code>. Because it is inserted as an expression, it must not end with a semicolon, and it must genuinely evaluate to a value (not a statement).`,
      },
      {
        heading: 'Declarations: <%! ... %>',
        body: `A declaration defines members — fields or methods — at the class level of the generated servlet, outside of <code>_jspService()</code>. This means variables declared here behave like servlet instance variables: they persist across requests and are shared by all users, exactly like a normal servlet's instance fields, which makes them just as dangerous for storing per-request state.`,
      },
      {
        heading: 'Why Modern JSP Avoids Heavy Scriptlets',
        body: `Scriptlets mix Java and HTML in a way that is hard to read, hard to unit test, and impossible for non-Java developers (like front-end designers) to safely edit. The Expression Language (<code>\${...}</code>) and JSTL tags (like <code>&lt;c:forEach&gt;</code> and <code>&lt;c:if&gt;</code>) were introduced specifically to replace common scriptlet patterns with cleaner, tag-based syntax that keeps logic in servlets/JavaBeans and keeps JSP focused on presentation — a separation of concerns that scriptlet-heavy pages break.`,
      },
    ],
    examples: [
      {
        caption: 'All three scripting elements together, and the modern EL/JSTL replacement',
        code: `<%!
    // Declaration: class-level field, shared across ALL requests (be careful!)
    private int pageHitCounter = 0;
%>

<%
    // Scriptlet: ordinary Java, runs per request
    pageHitCounter++;
    String[] fruits = {"Apple", "Banana", "Cherry"};
%>

<html><body>
  <p>Page hits since server start: <%= pageHitCounter %></p>  <%-- Expression --%>

  <ul>
  <% for (String fruit : fruits) { %>
      <li><%= fruit %></li>
  <% } %>
  </ul>
</body></html>

<%-- Modern equivalent using EL + JSTL, no scriptlets: --%>
<%-- <ul>
       <c:forEach var="fruit" items="\${fruits}">
         <li>\${fruit}</li>
       </c:forEach>
     </ul> --%>`,
        output: `Browser output:
Page hits since server start: 1  (increments on every reload, shared by all visitors)
- Apple
- Banana
- Cherry`,
      },
    ],
    commonMistakes: [
      'Putting a semicolon at the end of an expression <%= x; %> — expressions must be a single value-producing expression, not a statement.',
      'Declaring per-request state (like a counter meant to be per-user) inside a declaration block <%! %>, not realizing it becomes shared servlet-level state.',
      'Splitting a Java control block (for/if) across multiple scriptlets and forgetting to close every brace, which produces a confusing generated-servlet compile error.',
      'Writing large amounts of business logic directly in scriptlets instead of a servlet or JavaBean, making the page hard to test and maintain.',
    ],
    keyPoints: [
      'Scriptlets <% %> insert Java statements into _jspService(); expressions <%= %> insert a value via out.print(); declarations <%! %> add class-level members.',
      'Declaration-block variables behave like servlet instance variables — shared across all requests and users.',
      'Modern practice replaces scriptlet-heavy logic with Expression Language (${...}) and JSTL tags for readability and separation of concerns.',
      'Expressions must not end with a semicolon; scriptlets can span multiple tags as long as braces balance.',
    ],
  },

  'jsp-implicit-objects': {
    title: 'JSP Implicit Objects',
    intro: `Because every JSP page is compiled into a servlet, the container automatically declares a set of ready-to-use objects inside the generated <code>_jspService()</code> method, without you ever declaring or importing them. These are the JSP implicit objects, and JSP defines exactly nine of them, each corresponding to something a plain servlet would otherwise have to obtain manually.`,
    sections: [
      {
        heading: 'The Nine Implicit Objects',
        body: `Each implicit object gives access to a specific part of the request-handling environment, and most map directly onto objects you already know from servlet programming.`,
        list: [
          '<strong>request</strong> — the current HttpServletRequest, for reading parameters, headers, and attributes.',
          '<strong>response</strong> — the current HttpServletResponse, for setting headers or redirecting.',
          '<strong>session</strong> — the current HttpSession (unless the page explicitly disables sessions via the page directive).',
          '<strong>application</strong> — the ServletContext, shared across the entire web application, useful for app-wide data.',
          '<strong>out</strong> — a JspWriter used to write output to the response body; buffered, unlike a raw PrintWriter.',
          '<strong>config</strong> — the ServletConfig for this JSP\'s generated servlet, giving access to init parameters.',
          '<strong>pageContext</strong> — a JSP-specific object that provides access to all scopes (page, request, session, application) through one unified API.',
          '<strong>page</strong> — a reference to the current servlet instance itself (equivalent to "this"), rarely used directly.',
          '<strong>exception</strong> — available only on pages marked as an error page (via the <code>isErrorPage="true"</code> page directive), giving access to the exception that triggered the error page.',
        ],
      },
      {
        heading: 'Scope and pageContext',
        body: `JSP defines four attribute scopes: page (this request/response cycle within this page only), request (survives a forward to another resource), session (survives across a user's requests), and application (shared by every user of the app). <code>pageContext.setAttribute(name, value, scope)</code> lets you set an attribute in any of these four scopes from one API, which is useful when writing reusable code that shouldn't assume which scope it's working with.`,
      },
      {
        heading: 'out vs response.getWriter()',
        body: `<code>out</code> is not simply <code>response.getWriter()</code> — it is a <code>JspWriter</code>, which adds buffering on top. This buffering is why you can still call <code>response.sendRedirect()</code> or set headers partway through a JSP page in some cases: as long as the JSP's output buffer hasn't been flushed yet, the response has not been "committed," so headers can still be changed. Mixing raw use of the underlying writer with <code>out</code> is not recommended, since it can produce output in the wrong order.`,
      },
    ],
    examples: [
      {
        caption: 'Several implicit objects used together on one page',
        code: `<html><body>
  <p>Requested URI: <%= request.getRequestURI() %></p>
  <p>Session ID: <%= session.getId() %></p>

  <%
      application.setAttribute("visitCount",
          ((Integer) (application.getAttribute("visitCount") == null
              ? 0 : application.getAttribute("visitCount"))) + 1);
  %>
  <p>Total application-wide visits: <%= application.getAttribute("visitCount") %></p>

  <% out.println("<p>Written directly through the implicit 'out' object.</p>"); %>
</body></html>`,
        output: `Browser output (visit count shared by every user of the app):
Requested URI: /webnest/welcome.jsp
Session ID: 9F1A2B3C...
Total application-wide visits: 5
Written directly through the implicit 'out' object.`,
      },
      {
        caption: 'A dedicated error page using the exception implicit object',
        code: `<%@ page isErrorPage="true" %>
<html><body>
  <h3>Something went wrong</h3>
  <p>Error message: <%= exception.getMessage() %></p>
</body></html>`,
        output: `Browser output when another page throws an exception and forwards here (via <%@ page errorPage="error.jsp" %>):
Something went wrong
Error message: / by zero`,
      },
    ],
    commonMistakes: [
      'Trying to use the "exception" implicit object on a normal page that is not marked isErrorPage="true" — it causes a compile error there.',
      'Confusing "session" scope (per user, across requests) with "application" scope (shared by every user) and storing per-user data in the wrong one.',
      'Assuming "out" behaves exactly like response.getWriter() with no buffering difference.',
      'Forgetting that "session" is unavailable if the page directive explicitly sets session="false".',
    ],
    keyPoints: [
      'JSP defines nine implicit objects: request, response, session, application, out, config, pageContext, page, and exception.',
      'application maps to ServletContext (app-wide); session maps to HttpSession (per user); out is a buffered JspWriter.',
      'pageContext offers a unified API across all four attribute scopes: page, request, session, application.',
      'exception is only available on pages explicitly marked as an error page with isErrorPage="true".',
    ],
  },

  'jsp-directives-and-actions': {
    title: 'JSP Directives and Actions',
    intro: `Beyond scripting elements, JSP has two other tag families that control how a page is processed: directives, which configure page-level settings understood at translation time, and actions, which perform tasks at request time using XML-style tags. Both look similar to scripting tags but serve very different purposes, and confusing the two is a common source of mistakes for beginners.`,
    sections: [
      {
        heading: 'Directives: page, include, taglib',
        body: `A directive gives the container instructions about the page as a whole, processed during translation rather than at request time. Directives use the syntax <code>&lt;%@ directiveName attribute="value" %&gt;</code>.`,
        list: [
          '<strong><code>page</code></strong> — configures page-wide settings such as <code>contentType</code>, <code>import</code> (for Java classes used in scriptlets/expressions), <code>session</code> (enable/disable), <code>errorPage</code>, and <code>isErrorPage</code>.',
          '<strong><code>include</code></strong> — performs a static, translation-time include of another file\'s raw content, merging it into this page\'s source before compilation (different from the include action below, which happens at request time).',
          '<strong><code>taglib</code></strong> — declares a tag library prefix, such as <code>&lt;%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %&gt;</code>, which is required before using JSTL tags like <code>&lt;c:forEach&gt;</code>.',
        ],
      },
      {
        heading: 'Standard Actions',
        body: `Actions use XML tag syntax (<code>&lt;jsp:actionName /&gt;</code>) and execute at request time, unlike directives. The most commonly used standard actions mirror the servlet mechanisms you already know: <code>&lt;jsp:forward page="target.jsp" /&gt;</code> transfers control to another resource (like RequestDispatcher.forward), <code>&lt;jsp:include page="fragment.jsp" /&gt;</code> includes another resource's output at request time (like RequestDispatcher.include, and distinct from the include directive), and <code>&lt;jsp:useBean&gt;</code>/<code>&lt;jsp:setProperty&gt;</code>/<code>&lt;jsp:getProperty&gt;</code> work with JavaBean objects in a given scope.`,
      },
      {
        heading: 'Include Directive vs Include Action',
        body: `This distinction trips up many learners: the include directive (<code>&lt;%@ include file="header.jsp" %&gt;</code>) merges the included file's source at translation time, before compilation — so it behaves as if you had pasted the content in by hand, and any change to the included file requires the including page to be recompiled to take effect. The include action (<code>&lt;jsp:include page="header.jsp" /&gt;</code>) instead calls the target resource at request time and inserts its live output, meaning the included page can be changed independently and always reflects its latest compiled version.`,
      },
    ],
    examples: [
      {
        caption: 'Page and taglib directives combined with JSTL, plus jsp:include',
        code: `<%@ page contentType="text/html;charset=UTF-8" import="java.util.List" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

<html><body>
  <jsp:include page="/WEB-INF/views/header.jsp" />

  <h2>Product List</h2>
  <ul>
    <c:forEach var="item" items="\${productList}">
      <li>\${item}</li>
    </c:forEach>
  </ul>

  <jsp:include page="/WEB-INF/views/footer.jsp" />
</body></html>`,
        output: `Browser output (assuming productList = ["Mouse", "Keyboard"]):
[header content]
Product List
- Mouse
- Keyboard
[footer content]`,
      },
      {
        caption: 'jsp:forward vs jsp:include — control transfer vs embedding',
        code: `<%-- forward: control leaves this page entirely, URL logic handled server-side --%>
<jsp:forward page="/WEB-INF/views/thankyou.jsp" />

<%-- include: output of cart-summary.jsp is embedded here, and this page continues after it --%>
<jsp:include page="/WEB-INF/views/cart-summary.jsp" />
<p>Continue shopping below.</p>`,
        output: 'With jsp:forward, only thankyou.jsp\'s output reaches the browser. With jsp:include, cart-summary.jsp\'s output appears, followed by "Continue shopping below."',
      },
    ],
    commonMistakes: [
      'Confusing the include directive (<%@ include %>, translation-time, static) with the include action (<jsp:include />, request-time, dynamic).',
      'Forgetting the taglib directive before using JSTL tags, which causes the tags to be treated as literal, unrecognized text.',
      'Using <jsp:forward> after content has already been flushed to the response, which fails because the response is already committed.',
      'Placing directive attributes with incorrect syntax (missing quotes, wrong attribute names) and getting confusing translation-time errors.',
    ],
    keyPoints: [
      'Directives (page, include, taglib) configure the page at translation time; actions (jsp:forward, jsp:include, jsp:useBean) execute at request time.',
      'The include directive pastes source at compile time; the include action calls the target and embeds live output at request time.',
      'taglib must be declared before using any JSTL or custom tag library on a page.',
      'jsp:forward transfers control completely; jsp:include embeds another resource\'s output and returns control to the caller.',
    ],
  },

  'mvc-architecture-with-servlets-and-jsp': {
    title: 'MVC Architecture with Servlets and JSP',
    intro: `Early JSP applications often mixed HTML, business logic, and database access all in one file — a style sometimes called "Model 1" — which worked for small pages but became unmanageable as applications grew. The Model-View-Controller (MVC) pattern, applied to servlets and JSP as "Model 2," separates these concerns into three distinct roles, and it remains the conceptual foundation underneath virtually every modern Java web framework, including Spring MVC.`,
    sections: [
      {
        heading: 'Mapping MVC onto Servlets and JSP',
        body: `Each part of MVC has a natural home in a servlet-and-JSP application, and keeping them separate is the entire point of the pattern.`,
        list: [
          '<strong>Model</strong> — plain Java objects (often JavaBeans) and business/data-access logic representing the application\'s data, independent of any web-specific code. A Model class knows nothing about HttpServletRequest or JSP.',
          '<strong>View</strong> — JSP pages responsible only for presentation: rendering data that has already been prepared, using EL and JSTL rather than business logic.',
          '<strong>Controller</strong> — a servlet that receives the HTTP request, invokes the appropriate Model logic, stores the results as request attributes, and forwards to the correct JSP view.',
        ],
      },
      {
        heading: 'A Typical Request Flow',
        body: `A request first hits the Controller servlet, which reads input via <code>request.getParameter()</code>, delegates to Model classes to perform the actual work (validating input, querying a database, applying business rules), places the resulting data into request scope with <code>setAttribute()</code>, and finally forwards to a JSP view with <code>RequestDispatcher.forward()</code>. The JSP then reads that data purely through EL expressions like <code>\${product.name}</code> and JSTL tags, without embedding Java business logic of its own.`,
      },
      {
        heading: 'Why the Separation Matters',
        body: `Keeping these roles separate produces several concrete benefits: JSP pages stay simple enough for designers to edit without touching Java code; business logic in the Model can be unit-tested without a servlet container, since it has no dependency on HttpServletRequest; and the same Model and Controller logic can serve multiple different views (an HTML JSP, a JSON API response, a mobile-friendly page) without duplicating business rules. Violating the separation — for example, putting a database query directly inside a JSP scriptlet — reintroduces exactly the maintenance problems MVC was designed to prevent.`,
      },
    ],
    examples: [
      {
        caption: 'A minimal MVC flow: Model, Controller servlet, and JSP view',
        code: `// --- Model: a plain JavaBean, no servlet dependencies ---
public class Product {
    private String name;
    private double price;

    public Product(String name, double price) {
        this.name = name;
        this.price = price;
    }
    public String getName() { return name; }
    public double getPrice() { return price; }
}

// --- Controller: a servlet coordinating Model and View ---
import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.List;
import java.util.Arrays;

@WebServlet("/products")
public class ProductController extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // In a real app this would call a service/DAO layer instead of hardcoding data
        List<Product> products = Arrays.asList(
            new Product("Wireless Mouse", 799.00),
            new Product("Mechanical Keyboard", 2499.00)
        );
        request.setAttribute("products", products);

        RequestDispatcher dispatcher = request.getRequestDispatcher("/WEB-INF/views/productList.jsp");
        dispatcher.forward(request, response);
    }
}`,
        output: `productList.jsp (View, using JSTL/EL only):
<c:forEach var="p" items="\${products}">
  <li>\${p.name} - Rs. \${p.price}</li>
</c:forEach>

Rendered in browser:
- Wireless Mouse - Rs. 799.0
- Mechanical Keyboard - Rs. 2499.0`,
      },
    ],
    commonMistakes: [
      'Writing database queries or business rules directly inside a JSP scriptlet instead of delegating to a Model/service class through the Controller.',
      'Letting a JSP view read request parameters directly and make decisions, blurring the line between Controller and View responsibilities.',
      'Skipping the Controller and mapping URLs directly to JSP files, which pushes all logic back into the View and recreates the old Model 1 problems.',
      'Forgetting to use request scope (not session or application) for data that is only relevant to a single forwarded request, causing stale data to leak into later, unrelated requests.',
    ],
    keyPoints: [
      'MVC splits responsibilities: Model (data/business logic), View (JSP presentation), Controller (servlet coordinating the two).',
      'A typical flow: Controller servlet reads the request, calls the Model, sets request attributes, and forwards to a JSP view.',
      'Views should use EL/JSTL for presentation only, never embed business logic or direct data access.',
      'This separation enables independent testing of business logic, easier maintenance, and reuse of the same Model/Controller for multiple views.',
    ],
  },
}
