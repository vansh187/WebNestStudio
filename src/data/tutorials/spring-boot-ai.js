// Spring Boot course — Spring AI series (Spring AI 2.0 on Spring Boot 4).
// Keys are slugs matching the topics listed under the Spring AI module in
// codelabDefaults.js. Model replies shown in "output" blocks are samples —
// real LLM answers vary from run to run.
export const springBootAi = {
  'introduction-to-spring-ai': {
    title: 'Introduction to Spring AI',
    intro: `Large language models (LLMs) such as GPT, Claude, Gemini, Llama and Mistral have become a normal part of business applications: support chatbots, document search, summarisation, data extraction, code assistants and autonomous agents. Java teams no longer need a separate Python service to use them. <strong>Spring AI</strong> brings AI capabilities into Spring Boot with the same patterns you already know — starters, auto-configuration, properties, beans and portable APIs.

This lesson explains what Spring AI is, the core building blocks (chat models, ChatClient, embeddings, vector stores, advisors, tools and MCP), which providers it supports, and walks you through building and running your first AI-powered endpoint with Spring AI 2.0 and Spring Boot 4.`,
    sections: [
      {
        heading: 'Why Spring AI?',
        body: `Every AI provider has its own HTTP API, request format, streaming protocol and error handling. If you call them directly, your code becomes tied to one vendor and full of boilerplate. Spring AI provides <strong>portable abstractions</strong>: you write code against <code>ChatClient</code>, <code>EmbeddingModel</code> and <code>VectorStore</code>, and switch between OpenAI, Anthropic, Google, Mistral, Amazon Bedrock or a local Ollama model by changing a dependency and a few properties.

It also solves the application-level problems that appear as soon as you go beyond a demo: mapping answers to Java objects, remembering conversations, letting models call your code, retrieving your own documents (RAG), observability, and evaluation.`,
      },
      {
        heading: 'Core Building Blocks',
        body: `You will meet these concepts throughout the Spring AI module:`,
        list: [
          '<strong>ChatModel</strong> — the low-level interface to a chat LLM provider. Auto-configured by the provider starter.',
          '<strong>ChatClient</strong> — the fluent, high-level API you use in application code, similar in style to RestClient.',
          '<strong>Prompt</strong> and <strong>messages</strong> — system, user, assistant and tool messages sent to the model; PromptTemplate fills placeholders.',
          '<strong>Structured output</strong> — converting model text into Java records and lists with <code>.entity(...)</code>.',
          '<strong>Advisors</strong> — interceptors around each call, used for chat memory, RAG, logging, tool calling and safety.',
          '<strong>Tools</strong> — Java methods annotated with <code>@Tool</code> that the model can ask to call.',
          '<strong>EmbeddingModel</strong> and <strong>VectorStore</strong> — turn text into vectors and search by meaning; the basis of RAG.',
          '<strong>MCP</strong> — the Model Context Protocol, a standard for sharing tools and data between AI applications.',
        ],
      },
      {
        heading: 'Supported Providers',
        body: `Spring AI 2.0 includes chat support for OpenAI, Anthropic Claude, Google GenAI (Gemini), Amazon Bedrock, Mistral AI, DeepSeek and Ollama, with further providers in the community. Embedding models and more than twenty vector databases are supported, including PGVector, Redis, MongoDB Atlas, Elasticsearch, Qdrant, Chroma, Milvus, Pinecone and Weaviate. Each has its own starter, named <code>spring-ai-starter-model-&lt;provider&gt;</code> or <code>spring-ai-starter-vector-store-&lt;store&gt;</code>.`,
      },
      {
        heading: 'Versions and Setup',
        body: `Spring AI 2.0 (GA June 2026) requires Spring Boot 4.0 or 4.1 and Spring Framework 7, uses Jackson 3, and needs Java 17 or newer. Import the <code>spring-ai-bom</code> so all Spring AI modules use matching versions, then add one model starter. You can also select "OpenAI", "Anthropic" or "Ollama" under the AI section on start.spring.io and the BOM is added for you.

Never hard-code API keys. Put them in an environment variable (for example <code>OPENAI_API_KEY</code>) and reference it from <code>application.yml</code>.`,
      },
      {
        heading: 'Costs, Limits and Responsible Use',
        body: `Hosted models charge per <strong>token</strong> (roughly ¾ of an English word) for both input and output, so long prompts and large documents cost money on every call. Providers also apply rate limits. Models can produce incorrect but confident answers ("hallucinations"), so AI features need validation, grounding in your own data, and human review where decisions matter. Treat anything a user types as untrusted input that may try to override your instructions (prompt injection).`,
      },
    ],
    examples: [
      {
        caption: 'pom.xml: Spring AI BOM and the OpenAI starter',
        code: `<properties>
    <java.version>21</java.version>
    <spring-ai.version>2.0.1</spring-ai.version>
</properties>

<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.ai</groupId>
        <artifactId>spring-ai-starter-model-openai</artifactId>
    </dependency>
</dependencies>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.ai</groupId>
            <artifactId>spring-ai-bom</artifactId>
            <version>\${spring-ai.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>`,
        output: '(Gradle: implementation platform("org.springframework.ai:spring-ai-bom:2.0.1") and implementation "org.springframework.ai:spring-ai-starter-model-openai")',
      },
      {
        caption: 'application.yml: API key from the environment and model selection',
        code: `spring:
  application:
    name: webnest-ai
  ai:
    openai:
      api-key: \${OPENAI_API_KEY}
      chat:
        model: gpt-5-mini
        temperature: 0.3`,
        output: `# Set the key before running (never commit it):
# PowerShell:  $env:OPENAI_API_KEY="sk-..."
# bash/zsh:    export OPENAI_API_KEY=sk-...`,
      },
      {
        caption: 'Your first AI endpoint',
        code: `package com.webnest.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AskController {

    private final ChatClient chatClient;

    // Spring AI auto-configures a ChatClient.Builder for the model on the classpath
    public AskController(ChatClient.Builder builder) {
        this.chatClient = builder
            .defaultSystem("You are a concise tutor for Java and Spring Boot learners.")
            .build();
    }

    @GetMapping("/ask")
    public String ask(@RequestParam String question) {
        return chatClient.prompt()
            .user(question)
            .call()
            .content();
    }
}`,
        output: `curl "http://localhost:8080/ask?question=What+does+@SpringBootApplication+do"

@SpringBootApplication combines three annotations: @Configuration (the class can define beans),
@EnableAutoConfiguration (Spring Boot configures beans based on your classpath) and
@ComponentScan (scans the package and sub-packages for components).`,
      },
    ],
    commonMistakes: [
      'Committing API keys to Git or pasting them into application.yml — always use environment variables or a secret manager.',
      'Mixing Spring AI module versions manually instead of importing spring-ai-bom.',
      'Using Spring AI 1.x tutorials on Spring Boot 4: 1.x targets Boot 3, while Spring AI 2.0 is required for Boot 4.',
      'Trusting model output blindly in business logic without validation or grounding in real data.',
      'Sending entire documents or databases in every prompt, which is slow and expensive — use RAG instead.',
    ],
    keyPoints: [
      'Spring AI gives Spring Boot portable APIs for chat, embeddings, vector stores, tools and MCP.',
      'Spring AI 2.0 targets Spring Boot 4 and Spring Framework 7; import spring-ai-bom and add one model starter.',
      'ChatClient is the main API; build it from the auto-configured ChatClient.Builder.',
      'Keys belong in environment variables; model choice and settings go in spring.ai.* properties.',
      'Tokens cost money and answers can be wrong — design for cost, validation and prompt-injection safety.',
    ],
  },

  'chatclient-and-prompt-templates': {
    title: 'ChatClient and Prompt Templates',
    intro: `<code>ChatClient</code> is the API you will use for nearly every interaction with a language model in Spring AI. Its fluent style — <code>prompt()</code>, then <code>system()</code> and <code>user()</code>, then <code>call()</code> or <code>stream()</code> — makes the structure of each request obvious and keeps application code independent of the provider.

In this lesson you will learn how messages and roles work, how to configure defaults once, how to use prompt templates with parameters and external template files, how to stream responses token by token, how to read token usage, how to override model options per request, and how to send images to multimodal models.`,
    sections: [
      {
        heading: 'Messages and Roles',
        body: `A chat request is a list of messages, each with a role. The <strong>system</strong> message sets behaviour, tone and rules ("You are a support assistant for Webnest. Answer only questions about our courses."). <strong>User</strong> messages carry the end user's input. <strong>Assistant</strong> messages are previous model replies, used to continue a conversation. <strong>Tool</strong> messages carry results of tool calls. Models give system instructions high priority, so put your rules there, not in the user text.`,
      },
      {
        heading: 'Defaults on the Builder',
        body: `<code>ChatClient.Builder</code> lets you set defaults that apply to every request: <code>defaultSystem(...)</code>, <code>defaultOptions(...)</code>, <code>defaultAdvisors(...)</code> and <code>defaultTools(...)</code>. Build a <code>ChatClient</code> bean per "persona" or use case (support bot, SQL assistant, summariser) and inject the one you need. Per-request calls can still override or add to the defaults.`,
      },
      {
        heading: 'Prompt Templates',
        body: `Spring AI uses <code>{placeholder}</code> syntax (rendered with the StringTemplate engine) for both system and user text. Pass values with <code>.param(name, value)</code>. For long prompts, keep templates in files such as <code>src/main/resources/prompts/summarise.st</code>, inject them as a <code>Resource</code>, and pass the resource to <code>system(...)</code> or <code>user(...)</code>. Keeping prompts outside Java code makes them easy to review and version.`,
      },
      {
        heading: 'call() vs stream()',
        body: `<code>call()</code> waits for the complete answer. <code>stream()</code> returns a Reactor <code>Flux</code> that emits pieces of text as the model generates them, so users see the answer appear immediately — the same experience as ChatGPT. Spring MVC can return a <code>Flux&lt;String&gt;</code> directly as Server-Sent Events. After <code>call()</code> you can ask for <code>content()</code> (just text), <code>chatResponse()</code> (text plus metadata such as token usage and finish reason), or <code>entity(...)</code> (structured output, next lesson).`,
      },
      {
        heading: 'Model Options',
        body: `Options control generation: <code>model</code>, <code>temperature</code> (0 = focused and repeatable, higher = more varied), <code>maxTokens</code> and provider-specific settings. Set defaults in properties, and override per request with the provider's options builder, for example <code>OpenAiChatOptions.builder().model("gpt-5").temperature(0.0).build()</code>. In Spring AI 2.0 options objects are immutable and created with builders.`,
      },
      {
        heading: 'Multimodal Input',
        body: `Vision-capable models accept images alongside text. Add media to the user message with <code>.user(u -&gt; u.text(...).media(mimeType, resource))</code>. This is useful for describing product photos, reading receipts, or extracting data from screenshots.`,
      },
    ],
    examples: [
      {
        caption: 'Several ChatClient beans with different defaults',
        code: `@Configuration
public class ChatClientConfig {

    @Bean
    ChatClient supportClient(ChatClient.Builder builder) {
        return builder
            .defaultSystem("""
                You are the support assistant for Webnest Studio.
                Answer only questions about Webnest courses and accounts.
                If you do not know the answer, say so and suggest contacting support@webneststudio.co.in.
                """)
            .build();
    }

    @Bean
    ChatClient summaryClient(ChatClient.Builder builder) {
        return builder
            .defaultSystem("Summarise the given text in at most {sentences} sentences for a {audience} audience.")
            .build();
    }
}`,
        output: '(Inject by parameter name or with @Qualifier("supportClient") / @Qualifier("summaryClient").)',
      },
      {
        caption: 'Templates with parameters and an external template file',
        code: `// src/main/resources/prompts/explain.st
// Explain the Java topic "{topic}" to a {level} developer.
// Use one short code example and finish with two practice questions.

@Service
public class TutorService {

    private final ChatClient summaryClient;
    private final ChatClient tutor;

    @Value("classpath:/prompts/explain.st")
    private Resource explainTemplate;

    public TutorService(ChatClient summaryClient, ChatClient.Builder builder) {
        this.summaryClient = summaryClient;
        this.tutor = builder.build();
    }

    public String summarise(String text) {
        return summaryClient.prompt()
            .system(s -> s.param("sentences", 3).param("audience", "beginner"))
            .user(text)
            .call()
            .content();
    }

    public String explain(String topic, String level) {
        return tutor.prompt()
            .user(u -> u.text(explainTemplate).param("topic", topic).param("level", level))
            .call()
            .content();
    }
}`,
        output: `explain("records", "beginner")

A record is a compact class for holding immutable data...
    record Point(int x, int y) {}
Practice: 1) What methods does a record generate automatically? 2) Can a record extend another class?`,
      },
      {
        caption: 'Streaming a response to the browser with Server-Sent Events',
        code: `@RestController
public class StreamController {

    private final ChatClient chatClient;

    public StreamController(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @GetMapping(value = "/ask/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> stream(@RequestParam String question) {
        return chatClient.prompt()
            .user(question)
            .stream()
            .content();
    }
}

// Browser:
// const es = new EventSource('/ask/stream?question=' + encodeURIComponent(q));
// es.onmessage = (e) => output.textContent += e.data;`,
        output: `curl -N "http://localhost:8080/ask/stream?question=Explain+dependency+injection"
data:Dependency
data: injection
data: means
data: an
data: object
...`,
      },
      {
        caption: 'Reading metadata and overriding options per request',
        code: `ChatResponse response = chatClient.prompt()
    .user("Give me three names for a Java learning platform.")
    .options(OpenAiChatOptions.builder()
        .model("gpt-5")
        .temperature(0.9)
        .build())
    .call()
    .chatResponse();

Usage usage = response.getMetadata().getUsage();
System.out.println(response.getResult().getOutput().getText());
System.out.println("model=" + response.getMetadata().getModel()
    + " prompt=" + usage.getPromptTokens()
    + " completion=" + usage.getCompletionTokens()
    + " total=" + usage.getTotalTokens());`,
        output: `1. CodeForge Academy
2. JavaNest
3. Bytecode Bootcamp
model=gpt-5 prompt=21 completion=18 total=39`,
      },
      {
        caption: 'Sending an image to a vision model',
        code: `@PostMapping(value = "/describe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public String describe(@RequestParam MultipartFile image) {
    return chatClient.prompt()
        .user(u -> u.text("Describe this product photo in one sentence for an online shop.")
                    .media(MimeTypeUtils.parseMimeType(image.getContentType()), image.getResource()))
        .call()
        .content();
}`,
        output: `curl -F image=@backpack.png http://localhost:8080/describe
A navy-blue waterproof laptop backpack with padded straps and a front zip pocket.`,
      },
    ],
    commonMistakes: [
      'Concatenating user input into the system prompt, which lets users rewrite your instructions. Keep rules in the system message and user text in user().',
      'Creating a new ChatClient on every request with ChatClient.builder(...) instead of reusing a configured bean.',
      'Using call() for long answers in a chat UI; users wait seconds with a blank screen when stream() would show progress.',
      'Forgetting that literal curly braces in templates (for example JSON examples) are treated as placeholders and must be escaped.',
      'Setting a high temperature for tasks that need consistent, factual answers such as classification or extraction.',
    ],
    keyPoints: [
      'ChatClient: prompt() → system()/user() → call() or stream() → content(), chatResponse() or entity().',
      'Configure defaultSystem, defaultOptions, defaultAdvisors and defaultTools once on the builder.',
      'Templates use {placeholders} filled with .param(); keep long prompts in resource files.',
      'stream() returns a Flux you can expose as Server-Sent Events for a responsive UI.',
      'chatResponse() exposes token usage; per-request options override model and temperature.',
    ],
  },

  'structured-output': {
    title: 'Structured Output with Spring AI',
    intro: `Plain text answers are fine for a chatbot, but most business features need <strong>data</strong>: a list of tags, a sentiment score, an extracted invoice, a classification label. Parsing free text with string operations is fragile. Spring AI's structured output support asks the model to reply in JSON that matches a schema generated from your Java type, and converts the reply into a Java object for you.

This lesson covers mapping to records, lists and maps, using enums for classification, extracting data from unstructured text, validating the result, and the settings that make structured output reliable.`,
    sections: [
      {
        heading: 'How .entity() Works',
        body: `When you call <code>.entity(MyRecord.class)</code>, Spring AI's <code>BeanOutputConverter</code> generates a JSON Schema from the record, appends formatting instructions to your prompt, and parses the model's JSON reply into an instance of the record using Jackson. For models and providers that support it, Spring AI can also use the provider's <strong>native structured output</strong> mode, where the model is constrained to produce valid JSON for the schema.`,
      },
      {
        heading: 'Designing Types for the Model',
        body: `The model only sees the schema, so make it self-explanatory. Use descriptive field names, <code>@JsonPropertyDescription</code> to explain fields, enums for fixed sets of values, and simple types (strings, numbers, booleans, lists, nested records). Keep objects small; asking for forty fields at once increases errors.`,
      },
      {
        heading: 'Generic Types: Lists and Maps',
        body: `Java erases generics at runtime, so <code>List&lt;Product&gt;.class</code> is not possible. Use <code>new ParameterizedTypeReference&lt;List&lt;Product&gt;&gt;() {}</code> instead. For ad-hoc data you can map to <code>Map&lt;String, Object&gt;</code>, but typed records are safer.`,
      },
      {
        heading: 'Validation and Retries',
        body: `Even with a schema, a model can return values that are syntactically valid but wrong — a negative quantity, a missing required field, an invalid email. Apply Bean Validation to the result, and for important flows retry or fall back when validation fails. Spring AI 2.0 includes a <code>StructuredOutputValidationAdvisor</code> that checks the reply against the schema and asks the model to correct non-conforming output automatically.`,
      },
      {
        heading: 'Temperature and Determinism',
        body: `For extraction and classification, set temperature to 0 or close to it. You want the same input to produce the same output every time, and creative variation only introduces errors.`,
      },
    ],
    examples: [
      {
        caption: 'Mapping an answer to a record',
        code: `public record CourseOutline(
        String title,
        @JsonPropertyDescription("Target learner level: BEGINNER, INTERMEDIATE or ADVANCED") Level level,
        @JsonPropertyDescription("5 to 8 lesson titles in teaching order") List<String> lessons,
        @JsonPropertyDescription("Estimated total hours") int hours) {

    public enum Level { BEGINNER, INTERMEDIATE, ADVANCED }
}

CourseOutline outline = chatClient.prompt()
    .user("Design a short course on Spring Data JPA for developers who know SQL.")
    .call()
    .entity(CourseOutline.class);

System.out.println(outline.title() + " (" + outline.level() + ", " + outline.hours() + "h)");
outline.lessons().forEach(l -> System.out.println(" - " + l));`,
        output: `Spring Data JPA for SQL Developers (INTERMEDIATE, 6h)
 - Entities and the persistence context
 - Repositories and derived queries
 - JPQL and native queries
 - Relationships and fetching
 - Transactions
 - Performance and the N+1 problem`,
      },
      {
        caption: 'Classifying support tickets with an enum',
        code: `public enum TicketCategory { BILLING, LOGIN_PROBLEM, COURSE_CONTENT, BUG_REPORT, OTHER }

public record TicketTriage(TicketCategory category,
                           @JsonPropertyDescription("1 = low, 5 = urgent") int priority,
                           String summary) {}

@Service
public class TriageService {

    private final ChatClient chatClient;

    public TriageService(ChatClient.Builder builder) {
        this.chatClient = builder
            .defaultSystem("Classify customer support tickets for an online learning platform.")
            .defaultOptions(OpenAiChatOptions.builder().temperature(0.0).build())
            .build();
    }

    public TicketTriage triage(String ticketText) {
        return chatClient.prompt().user(ticketText).call().entity(TicketTriage.class);
    }
}`,
        output: `triage("I was charged twice for the Spring Boot course and I can't find a refund option!!")
TicketTriage[category=BILLING, priority=4, summary=Customer was double-charged for the Spring Boot course and wants a refund.]`,
      },
      {
        caption: 'Extracting a list of objects from unstructured text',
        code: `public record LineItem(String product, int quantity, BigDecimal unitPrice) {}

String email = """
    Hi, please send 3 Java Core workbooks at 499 each,
    one Spring Boot hoodie (1299) and 2 stickers packs for 99 each. Thanks, Ravi
    """;

List<LineItem> items = chatClient.prompt()
    .system("Extract ordered items. Prices are in INR.")
    .user(email)
    .call()
    .entity(new ParameterizedTypeReference<List<LineItem>>() {});

items.forEach(System.out::println);`,
        output: `LineItem[product=Java Core workbook, quantity=3, unitPrice=499]
LineItem[product=Spring Boot hoodie, quantity=1, unitPrice=1299]
LineItem[product=Sticker pack, quantity=2, unitPrice=99]`,
      },
      {
        caption: 'Validating structured output before using it',
        code: `public record Signup(@NotBlank String name, @Email String email, @Min(13) int age) {}

@Service
public class SignupExtractor {

    private final ChatClient chatClient;
    private final Validator validator;

    public SignupExtractor(ChatClient.Builder builder, Validator validator) {
        this.chatClient = builder.build();
        this.validator = validator;
    }

    public Signup extract(String text) {
        Signup signup = chatClient.prompt()
            .user(u -> u.text("Extract the signup details from: {text}").param("text", text))
            .call()
            .entity(Signup.class);

        Set<ConstraintViolation<Signup>> errors = validator.validate(signup);
        if (!errors.isEmpty()) {
            throw new IllegalArgumentException("AI extraction failed validation: " + errors);
        }
        return signup;
    }
}`,
        output: `extract("I'm Meera, 24, reach me at meera@example.com") -> Signup[name=Meera, email=meera@example.com, age=24]
extract("Name: Tom, email: not-an-email, age 9")         -> IllegalArgumentException: AI extraction failed validation: [email must be a well-formed email address, age must be greater than or equal to 13]`,
      },
    ],
    commonMistakes: [
      'Parsing JSON out of content() manually with regular expressions instead of using entity().',
      'Using List<MyType>.class style code (impossible) instead of ParameterizedTypeReference for generic types.',
      'Giving fields vague names like "value" or "data" so the model cannot infer what to put in them.',
      'Trusting extracted values without validation, especially numbers, dates and emails.',
      'Using a high temperature for extraction, producing different results for the same input.',
    ],
    keyPoints: [
      '.entity(Class) generates a JSON schema, instructs the model and converts the reply to your type.',
      'Use ParameterizedTypeReference for lists and other generic types.',
      'Descriptive names, @JsonPropertyDescription and enums make results far more accurate.',
      'Validate results with Bean Validation and use low temperature for extraction and classification.',
      'StructuredOutputValidationAdvisor can automatically ask the model to fix non-conforming JSON.',
    ],
  },

  'chat-memory': {
    title: 'Chat Memory and Conversations',
    intro: `LLMs are <strong>stateless</strong>. Each request is independent; the model has no idea what the user said a moment ago unless you send that history again. A chatbot that forgets the user's name between two messages feels broken.

Spring AI solves this with the <code>ChatMemory</code> abstraction and memory <strong>advisors</strong> that automatically load previous messages before each call and save new ones afterwards. In this lesson you will add memory to a ChatClient, keep conversations separate per user, persist them in a database, and control how much history is sent so costs stay under control.`,
    sections: [
      {
        heading: 'ChatMemory and ChatMemoryRepository',
        body: `<code>ChatMemory</code> decides <em>which</em> messages to keep; a <code>ChatMemoryRepository</code> decides <em>where</em> to store them. Spring AI auto-configures a <code>ChatMemory</code> bean of type <code>MessageWindowChatMemory</code> — which keeps the most recent messages (20 by default) — backed by an in-memory repository. Swap the repository for JDBC, Cassandra, MongoDB or Neo4j to persist conversations.`,
      },
      {
        heading: 'Memory Advisors',
        body: `Advisors wrap each ChatClient call. <code>MessageChatMemoryAdvisor</code> adds the stored history as proper user/assistant messages, which is the most accurate option. <code>PromptChatMemoryAdvisor</code> instead appends the history as text into the system prompt, useful for models with limited multi-message support. <code>VectorStoreChatMemoryAdvisor</code> stores messages in a vector store and retrieves only the most relevant past messages, which suits very long-running conversations.`,
      },
      {
        heading: 'Conversation IDs',
        body: `Every memory advisor needs a conversation id, passed with <code>.advisors(a -&gt; a.param(ChatMemory.CONVERSATION_ID, id))</code>; omitting it throws an exception. The id decides which history is loaded, so derive it on the server from the authenticated user and a conversation or session id. Never accept a raw conversation id from the client without checking that it belongs to the current user — otherwise one user can read another user's chat.`,
      },
      {
        heading: 'Controlling History Size and Cost',
        body: `Every remembered message is sent to the model on every call and billed as input tokens. A window of 10–20 messages is usually enough for chat. <code>MessageWindowChatMemory</code> evicts whole turns so a tool call is never separated from its result. For long conversations, consider summarising older messages, or use the vector-store memory advisor.`,
      },
    ],
    examples: [
      {
        caption: 'Without memory, the model forgets',
        code: `chatClient.prompt().user("Hi, my name is Asha and I'm learning Spring Security.").call().content();
chatClient.prompt().user("What's my name and what am I learning?").call().content();`,
        output: `Hello Asha! Spring Security is a great topic...
I'm sorry, I don't know your name or what you are learning — could you tell me?`,
      },
      {
        caption: 'Adding MessageChatMemoryAdvisor with per-user conversations',
        code: `@Configuration
public class MemoryConfig {

    @Bean
    ChatClient tutorClient(ChatClient.Builder builder, ChatMemory chatMemory) {
        return builder
            .defaultSystem("You are a friendly Spring Boot tutor.")
            .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
            .build();
    }
}

@RestController
@RequestMapping("/api/tutor")
public class TutorController {

    private final ChatClient tutorClient;

    public TutorController(ChatClient tutorClient) {
        this.tutorClient = tutorClient;
    }

    @PostMapping("/{chatId}")
    public String chat(@PathVariable String chatId,
                       @RequestBody String message,
                       Principal principal) {
        // Scope the conversation to the logged-in user so ids cannot be guessed
        String conversationId = principal.getName() + ":" + chatId;
        return tutorClient.prompt()
            .user(message)
            .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
            .call()
            .content();
    }
}`,
        output: `POST /api/tutor/1  "Hi, my name is Asha and I'm learning Spring Security."
-> Hi Asha! Spring Security is a great next step...
POST /api/tutor/1  "What's my name and what am I learning?"
-> Your name is Asha and you're learning Spring Security.
POST /api/tutor/2  "What's my name?"          (new conversation)
-> I don't know your name yet — what should I call you?`,
      },
      {
        caption: 'Persisting conversations with the JDBC repository',
        code: `<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-model-chat-memory-repository-jdbc</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>

# application.yml
spring:
  ai:
    chat:
      memory:
        repository:
          jdbc:
            initialize-schema: always   # creates SPRING_AI_CHAT_MEMORY on startup

@Bean
ChatMemory chatMemory(JdbcChatMemoryRepository repository) {
    return MessageWindowChatMemory.builder()
        .chatMemoryRepository(repository)
        .maxMessages(12)
        .build();
}`,
        output: `select conversation_id, type, left(content, 40) from spring_ai_chat_memory;
 asha:1 | USER      | Hi, my name is Asha and I'm learning Sp
 asha:1 | ASSISTANT | Hi Asha! Spring Security is a great nex
(Conversations now survive application restarts.)`,
      },
      {
        caption: 'Listing and clearing a user\'s conversation',
        code: `@GetMapping("/{chatId}/history")
public List<String> history(@PathVariable String chatId, Principal principal) {
    return chatMemory.get(principal.getName() + ":" + chatId).stream()
        .map(m -> m.getMessageType() + ": " + m.getText())
        .toList();
}

@DeleteMapping("/{chatId}")
public void clear(@PathVariable String chatId, Principal principal) {
    chatMemory.clear(principal.getName() + ":" + chatId);
}`,
        output: `GET /api/tutor/1/history
["USER: Hi, my name is Asha and I'm learning Spring Security.","ASSISTANT: Hi Asha! ...","USER: What's my name...","ASSISTANT: Your name is Asha..."]`,
      },
    ],
    commonMistakes: [
      'Using one fixed conversation id for every user, so all users share (and can see) the same history.',
      'Trusting a conversation id sent by the browser without tying it to the authenticated user.',
      'Keeping unlimited history, which grows token costs on every call and can exceed the model\'s context window.',
      'Relying on the default in-memory repository in production and losing every conversation on restart or across instances.',
      'Forgetting ChatMemory.CONVERSATION_ID in .advisors(...), which throws IllegalArgumentException at runtime.',
    ],
    keyPoints: [
      'LLMs are stateless; memory advisors resend relevant history on each call.',
      'ChatMemory (what to keep) is separate from ChatMemoryRepository (where to store it).',
      'MessageChatMemoryAdvisor is the default choice; always pass a server-derived conversation id.',
      'Use the JDBC (or another persistent) repository in production.',
      'Limit history with MessageWindowChatMemory.maxMessages to control cost and context size.',
    ],
  },

  'tool-calling': {
    title: 'Tool Calling (Function Calling)',
    intro: `A language model on its own only knows what was in its training data. It cannot look up today's exchange rate, check an order's status in your database, or book a meeting. <strong>Tool calling</strong> changes that: you describe Java methods to the model, the model decides when one would help and asks your application to run it with specific arguments, and your application sends the result back so the model can finish its answer.

Tool calling is the foundation of AI <strong>agents</strong>. In this lesson you will create tools with <code>@Tool</code>, register them with ChatClient, pass private context to tools safely, return results directly, and understand how Spring AI 2.0 runs the tool loop through the <code>ToolCallingAdvisor</code>.`,
    sections: [
      {
        heading: 'How the Tool Loop Works',
        body: `1) Spring AI sends your prompt plus a JSON schema for each available tool. 2) The model replies either with a normal answer or with a <strong>tool call request</strong> naming a tool and its arguments. 3) Spring AI invokes the matching Java method, 4) adds the result to the conversation as a tool message, and 5) calls the model again. This repeats until the model produces a final answer. The model never runs your code itself — your application stays in control of what is executed.

In Spring AI 2.0 this loop is handled by <code>ToolCallingAdvisor</code>, which is automatically registered with ChatClient and works the same way for every model provider.`,
      },
      {
        heading: 'Defining Tools with @Tool',
        body: `Annotate public methods with <code>@Tool(description = ...)</code> and their parameters with <code>@ToolParam(description = ...)</code>. The description is the <strong>most important part</strong>: it is all the model sees when deciding whether and how to use the tool. Explain what the tool does, when to use it and what the parameters mean. Parameters are required unless you set <code>required = false</code>. Return values are converted to JSON for the model.`,
      },
      {
        heading: 'Registering Tools',
        body: `Pass tool objects per request with <code>.tools(new DateTimeTools())</code>, or for all requests with <code>defaultTools(...)</code> on the builder. For tools defined as functions or shared across the app, declare <code>ToolCallback</code> beans (for example with <code>FunctionToolCallback.builder(...)</code> or <code>MethodToolCallbackProvider</code>) and pass them explicitly. Spring AI 2.0 removed the old <code>toolNames(...)</code> lookup of bare function beans by name.`,
      },
      {
        heading: 'ToolContext and Return Direct',
        body: `<code>ToolContext</code> carries values your tool needs but the model must not see or control — the current user id, tenant id, or request locale. Add them with <code>.toolContext(Map.of(...))</code> and declare a <code>ToolContext</code> parameter on the tool method. Setting <code>returnDirect = true</code> sends the tool's result straight back to the caller without another model round-trip, useful when the tool output is already the final answer.`,
      },
      {
        heading: 'Security and Safety',
        body: `Treat the model like an untrusted user: it can be manipulated by prompt injection into calling tools with harmful arguments. Enforce authorization <strong>inside</strong> each tool using the real user identity from <code>ToolContext</code> or the SecurityContext, validate every argument, prefer read-only tools, and require human confirmation for destructive actions such as refunds or deletions. Log every tool invocation for auditing.`,
      },
    ],
    examples: [
      {
        caption: 'A simple date/time tool',
        code: `public class DateTimeTools {

    @Tool(description = "Get the current date and time in the user's time zone")
    public String currentDateTime() {
        return ZonedDateTime.now(LocaleContextHolder.getTimeZone().toZoneId()).toString();
    }
}

String answer = chatClient.prompt()
    .user("What day of the week is it tomorrow?")
    .tools(new DateTimeTools())
    .call()
    .content();`,
        output: `(model requests tool currentDateTime → "2026-09-27T14:05:31+05:30[Asia/Kolkata]")
Tomorrow is Monday, 28 September 2026.`,
      },
      {
        caption: 'Tools backed by your database, scoped to the current user',
        code: `@Component
public class OrderTools {

    private final OrderRepository orders;

    public OrderTools(OrderRepository orders) {
        this.orders = orders;
    }

    @Tool(description = "Look up the status and delivery date of one of the current customer's orders by order number")
    public OrderStatusView orderStatus(
            @ToolParam(description = "Order number, for example WN-10231") String orderNumber,
            ToolContext context) {
        String customer = (String) context.getContext().get("customerEmail");
        return orders.findByNumberAndCustomerEmail(orderNumber, customer)
            .map(o -> new OrderStatusView(o.getNumber(), o.getStatus().name(), o.getExpectedDelivery()))
            .orElseThrow(() -> new IllegalArgumentException("No such order for this customer"));
    }

    @Tool(description = "List the current customer's five most recent orders")
    public List<OrderStatusView> recentOrders(ToolContext context) {
        String customer = (String) context.getContext().get("customerEmail");
        return orders.findTop5ByCustomerEmailOrderByCreatedAtDesc(customer).stream()
            .map(o -> new OrderStatusView(o.getNumber(), o.getStatus().name(), o.getExpectedDelivery()))
            .toList();
    }
}

public record OrderStatusView(String number, String status, LocalDate expectedDelivery) {}

@PostMapping("/api/support/chat")
public String chat(@RequestBody String message, Principal principal) {
    return supportClient.prompt()
        .user(message)
        .tools(orderTools)
        .toolContext(Map.of("customerEmail", principal.getName()))  // the model never sees or sets this
        .call()
        .content();
}`,
        output: `User: "Where is my order WN-10231?"
(model calls orderStatus(orderNumber="WN-10231"))
Assistant: Your order WN-10231 has shipped and is expected to arrive on 30 September 2026.

User: "Show me order WN-99999" (belongs to another customer)
Assistant: I couldn't find an order with that number on your account.`,
      },
      {
        caption: 'A function-style tool registered as a ToolCallback bean',
        code: `public record WeatherRequest(@ToolParam(description = "City name, e.g. Pune") String city) {}
public record WeatherResponse(String city, double temperatureC, String conditions) {}

@Configuration(proxyBeanMethods = false)
public class WeatherToolConfig {

    @Bean
    ToolCallback currentWeather(WeatherService weatherService) {
        return FunctionToolCallback.builder("currentWeather", weatherService::lookup)
            .description("Get the current weather for a city")
            .inputType(WeatherRequest.class)
            .build();
    }
}

@RestController
public class TravelController {

    private final ChatClient chatClient;
    private final ToolCallback currentWeather;

    public TravelController(ChatClient.Builder builder, ToolCallback currentWeather) {
        this.chatClient = builder.build();
        this.currentWeather = currentWeather;
    }

    @GetMapping("/travel-tip")
    public String tip(@RequestParam String city) {
        return chatClient.prompt()
            .user("Should I carry an umbrella in " + city + " today?")
            .tools(currentWeather)
            .call()
            .content();
    }
}`,
        output: `GET /travel-tip?city=Mumbai
(model calls currentWeather({"city":"Mumbai"}) → {"city":"Mumbai","temperatureC":29.0,"conditions":"heavy rain"})
Yes — Mumbai has heavy rain today, so take an umbrella.`,
      },
      {
        caption: 'returnDirect and a confirmation step for risky actions',
        code: `public class RefundTools {

    private final RefundService refunds;

    public RefundTools(RefundService refunds) {
        this.refunds = refunds;
    }

    // The model may only PROPOSE a refund; a human must approve it in the admin UI
    @Tool(description = "Create a refund request for review by staff. Does not refund money directly.",
          returnDirect = true)
    public String requestRefund(@ToolParam(description = "Order number") String orderNumber,
                                @ToolParam(description = "Reason given by the customer") String reason,
                                ToolContext context) {
        String customer = (String) context.getContext().get("customerEmail");
        RefundRequest req = refunds.createPendingRequest(customer, orderNumber, reason);
        return "Refund request " + req.id() + " created. Our team will review it within 2 working days.";
    }
}`,
        output: `User: "I want a refund for WN-10231, the course videos don't play."
Assistant: Refund request RR-5521 created. Our team will review it within 2 working days.
(Returned directly from the tool — no second model call.)`,
      },
    ],
    commonMistakes: [
      'Writing vague tool descriptions like "gets data" — the model then calls the wrong tool or none at all.',
      'Letting the model supply the user id or tenant id as a tool argument; pass identity through ToolContext instead.',
      'Exposing destructive tools (delete account, issue refund) that act immediately without authorization checks or human approval.',
      'Registering dozens of tools on every request, which inflates prompt size and confuses the model; give each ChatClient only the tools it needs.',
      'Using the removed toolNames(...) API from Spring AI 1.x tutorials; in 2.0 pass tool objects or ToolCallback beans to .tools(...).',
    ],
    keyPoints: [
      'The model requests tool calls; Spring AI executes your Java methods and feeds results back until a final answer is produced.',
      'Annotate methods with @Tool and parameters with @ToolParam; descriptions drive the model\'s decisions.',
      'Register tools per request with .tools(...) or globally with defaultTools(...); ToolCallback beans for shared function tools.',
      'Use ToolContext for identity and tenant data the model must not control; returnDirect skips the extra model call.',
      'Enforce authorization and validation inside tools and keep risky actions behind human approval.',
    ],
  },

  'embeddings-and-vector-stores': {
    title: 'Embeddings and Vector Stores',
    intro: `Keyword search fails when users do not use your exact words: a search for "can't log in" misses the help article titled "Resetting your password". <strong>Embeddings</strong> fix this by representing text as a list of numbers (a vector) that captures its meaning, so texts with similar meaning end up close together even when they share no words.

A <strong>vector store</strong> is a database optimised for storing those vectors and finding the nearest ones to a query. Together they power semantic search, recommendations, duplicate detection and — most importantly — Retrieval Augmented Generation. This lesson shows how to create embeddings, store documents with metadata, search by similarity and filter results in Spring AI, using PostgreSQL with PGVector.`,
    sections: [
      {
        heading: 'What an Embedding Is',
        body: `An embedding model converts text into a fixed-length vector, for example 1536 floating-point numbers. The model is trained so that sentences with similar meaning produce vectors pointing in similar directions. The similarity of two vectors is usually measured with <strong>cosine similarity</strong>: 1.0 means identical direction, around 0 means unrelated.

Embeddings are cheap compared with chat calls, and you embed each document only once when you store it. Always use the <strong>same embedding model</strong> for storing and for querying; vectors from different models are not comparable.`,
      },
      {
        heading: 'EmbeddingModel in Spring AI',
        body: `Model starters auto-configure an <code>EmbeddingModel</code> bean (for example OpenAI's <code>text-embedding-3-small</code> or Ollama's <code>nomic-embed-text</code>). Call <code>embed(text)</code> to get a <code>float[]</code>, or <code>embedForResponse(list)</code> for batches. Most of the time you do not call it directly; the vector store calls it for you.`,
      },
      {
        heading: 'Documents and Metadata',
        body: `Spring AI stores content as <code>Document</code> objects: text plus a metadata map (source file, category, language, tenant id, last updated). Metadata is essential: it lets you filter searches ("only billing articles", "only this customer's files") and cite sources in answers.`,
      },
      {
        heading: 'Choosing a Vector Store',
        body: `If you already run PostgreSQL, the <strong>PGVector</strong> extension is usually the simplest choice: vectors live next to your relational data, backed up and secured the same way. Redis, MongoDB Atlas, Elasticsearch/OpenSearch and dedicated engines like Qdrant, Milvus, Weaviate and Pinecone suit larger or specialised workloads. <code>SimpleVectorStore</code> keeps everything in memory and is only for demos and tests. All share the same <code>VectorStore</code> interface, so switching later mostly means changing the starter.`,
      },
      {
        heading: 'Similarity Search and Filters',
        body: `<code>vectorStore.similaritySearch(SearchRequest)</code> embeds the query and returns the closest documents. Tune <code>topK</code> (how many results) and <code>similarityThreshold</code> (minimum score, 0–1), and add a <code>filterExpression</code> such as <code>"category == 'billing' &amp;&amp; year &gt;= 2025"</code> that is translated to the store's native filter language.`,
      },
    ],
    examples: [
      {
        caption: 'Comparing sentences with embeddings',
        code: `@Component
public class EmbeddingDemo implements CommandLineRunner {

    private final EmbeddingModel embeddingModel;

    public EmbeddingDemo(EmbeddingModel embeddingModel) {
        this.embeddingModel = embeddingModel;
    }

    @Override
    public void run(String... args) {
        float[] a = embeddingModel.embed("I can't log in to my account");
        float[] b = embeddingModel.embed("How do I reset my password?");
        float[] c = embeddingModel.embed("Best biryani recipe");

        System.out.println("dimensions = " + a.length);
        System.out.printf("login vs password = %.2f%n", cosine(a, b));
        System.out.printf("login vs biryani  = %.2f%n", cosine(a, c));
    }

    static double cosine(float[] x, float[] y) {
        double dot = 0, nx = 0, ny = 0;
        for (int i = 0; i < x.length; i++) {
            dot += x[i] * y[i];
            nx += x[i] * x[i];
            ny += y[i] * y[i];
        }
        return dot / (Math.sqrt(nx) * Math.sqrt(ny));
    }
}`,
        output: `dimensions = 1536
login vs password = 0.71
login vs biryani  = 0.08`,
      },
      {
        caption: 'PGVector setup: dependencies, Docker and properties',
        code: `<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-vector-store-pgvector</artifactId>
</dependency>

# compose.yaml — Spring Boot's Docker Compose support starts it automatically
services:
  postgres:
    image: pgvector/pgvector:pg17
    environment:
      POSTGRES_DB: webnest
      POSTGRES_USER: webnest
      POSTGRES_PASSWORD: webnest
    ports:
      - "5432:5432"

# application.yml
spring:
  ai:
    vectorstore:
      pgvector:
        initialize-schema: true
        index-type: HNSW
        distance-type: COSINE_DISTANCE
        dimensions: 1536`,
        output: `CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS public.vector_store (id uuid PRIMARY KEY, content text, metadata json, embedding vector(1536));
CREATE INDEX ... USING HNSW (embedding vector_cosine_ops);`,
      },
      {
        caption: 'Storing documents with metadata and searching them',
        code: `@Service
public class HelpCenterSearch {

    private final VectorStore vectorStore;

    public HelpCenterSearch(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public void load() {
        vectorStore.add(List.of(
            new Document("To reset your password, click 'Forgot password' on the login page.",
                         Map.of("category", "account", "articleId", "KB-1")),
            new Document("Refunds are available within 7 days of purchase from the Billing page.",
                         Map.of("category", "billing", "articleId", "KB-2")),
            new Document("Certificates are issued after you complete every lesson and quiz.",
                         Map.of("category", "courses", "articleId", "KB-3"))));
    }

    public List<Document> search(String query) {
        return vectorStore.similaritySearch(SearchRequest.builder()
            .query(query)
            .topK(2)
            .similarityThreshold(0.5)
            .build());
    }

    public List<Document> searchBilling(String query) {
        return vectorStore.similaritySearch(SearchRequest.builder()
            .query(query)
            .topK(3)
            .filterExpression("category == 'billing'")
            .build());
    }
}`,
        output: `search("I forgot my login details")
 -> [KB-1] To reset your password, click 'Forgot password' on the login page.  (score 0.78)

searchBilling("can I get my money back")
 -> [KB-2] Refunds are available within 7 days of purchase from the Billing page. (score 0.74)`,
      },
      {
        caption: 'Filter expressions built in code (safe with user input)',
        code: `FilterExpressionBuilder b = new FilterExpressionBuilder();

SearchRequest request = SearchRequest.builder()
    .query(question)
    .topK(5)
    .filterExpression(b.and(
            b.eq("tenantId", currentTenantId),        // never let a tenant see another tenant's docs
            b.in("category", "billing", "account"))
        .build())
    .build();

List<Document> results = vectorStore.similaritySearch(request);`,
        output: `(Translated by PGVector into: metadata::jsonb @@ '$.tenantId == "acme" && ($.category == "billing" || $.category == "account")')`,
      },
    ],
    commonMistakes: [
      'Changing the embedding model after documents are stored — old and new vectors are incompatible, so everything must be re-embedded.',
      'Setting vector dimensions in the store that do not match the embedding model\'s output size.',
      'Storing documents without metadata, making it impossible to filter by tenant or cite sources.',
      'Building filter expressions by concatenating user input into a string instead of using FilterExpressionBuilder.',
      'Using SimpleVectorStore in production; it lives in memory and does not scale.',
    ],
    keyPoints: [
      'Embeddings turn text into vectors where similar meanings are close together.',
      'Use the same embedding model for indexing and querying, and match the store\'s dimensions to it.',
      'Documents carry metadata that powers filtering, multi-tenancy and source citations.',
      'PGVector is a practical default when you already use PostgreSQL; all stores share the VectorStore API.',
      'similaritySearch with topK, similarityThreshold and filterExpression controls relevance.',
    ],
  },

  'retrieval-augmented-generation-rag': {
    title: 'Retrieval Augmented Generation (RAG)',
    intro: `A general-purpose LLM does not know your company's refund policy, your internal wiki, or the PDF manual for your product — and if asked, it may invent a plausible but wrong answer. Fine-tuning a model on your data is expensive and goes out of date quickly. <strong>Retrieval Augmented Generation</strong> takes a simpler approach: before asking the model, search your own documents for the most relevant passages and include them in the prompt, with instructions to answer only from that context.

RAG is the most widely deployed pattern for enterprise AI. In this lesson you will build a full pipeline with Spring AI: ingest PDFs and web pages (ETL), split them into chunks, store them in a vector store, answer questions with <code>QuestionAnswerAdvisor</code> and <code>RetrievalAugmentationAdvisor</code>, cite sources, and handle questions the documents cannot answer.`,
    sections: [
      {
        heading: 'The Two Phases of RAG',
        body: `<strong>Ingestion (offline):</strong> read source documents, split them into chunks of a few hundred tokens, embed each chunk, and store it in a vector store with metadata. <strong>Retrieval and generation (per question):</strong> embed the user's question, retrieve the most similar chunks, insert them into the prompt as context, and let the model write the answer. The model's job changes from "remember facts" to "read and summarise the provided context", which it does far more reliably.`,
      },
      {
        heading: 'ETL: Readers, Transformers, Writers',
        body: `Spring AI's ETL pipeline has three stages. <code>DocumentReader</code>s load content: <code>PagePdfDocumentReader</code> (spring-ai-pdf-document-reader), <code>TikaDocumentReader</code> for Word, HTML, PowerPoint and more (spring-ai-tika-document-reader), <code>TextReader</code> and <code>JsonReader</code>. <code>DocumentTransformer</code>s such as <code>TokenTextSplitter</code> split long text into chunks. The <code>VectorStore</code> acts as the writer.

Chunk size matters: too large and the context is diluted with irrelevant text; too small and chunks lose meaning. 300–800 tokens with some overlap is a common starting point.`,
      },
      {
        heading: 'QuestionAnswerAdvisor',
        body: `The quickest way to add RAG to a ChatClient is <code>QuestionAnswerAdvisor</code> (module <code>spring-ai-advisors-vector-store</code>). It runs a similarity search for the user's message and appends the results to the prompt with instructions to use them. Configure <code>topK</code>, <code>similarityThreshold</code> and filter expressions through a <code>SearchRequest</code>. You can change the filter per request, for example to restrict to the current user's tenant.`,
      },
      {
        heading: 'Modular RAG with RetrievalAugmentationAdvisor',
        body: `For more control, <code>RetrievalAugmentationAdvisor</code> (module <code>spring-ai-rag</code>) lets you compose the pipeline: <strong>query transformers</strong> such as <code>RewriteQueryTransformer</code> (rewrite vague questions) and <code>CompressionQueryTransformer</code> (fold chat history into a standalone question), <strong>query expanders</strong> like <code>MultiQueryExpander</code>, a <strong>document retriever</strong> (<code>VectorStoreDocumentRetriever</code>), and a <strong>query augmenter</strong> (<code>ContextualQueryAugmenter</code>) that controls what happens when no relevant documents are found.`,
      },
      {
        heading: 'Grounding, Citations and "I don\'t know"',
        body: `A good RAG system admits when it has no answer. Instruct the model to answer only from the context, and configure the augmenter to refuse when retrieval returns nothing, rather than letting the model fall back to guessing. Retrieved documents are available in the response metadata, so you can show "Sources: KB-2, Refund Policy p.3" under each answer — users trust answers they can verify.`,
      },
      {
        heading: 'Keeping the Index Fresh',
        body: `Documents change. Store a stable id and a version or hash in metadata, re-ingest changed documents on a schedule or when they are edited, and delete chunks of removed documents with <code>vectorStore.delete(filterExpression)</code>. Stale chunks produce confidently outdated answers.`,
      },
    ],
    examples: [
      {
        caption: 'Dependencies for a RAG application',
        code: `<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-model-openai</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-vector-store-pgvector</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-advisors-vector-store</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-rag</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-pdf-document-reader</artifactId>
</dependency>`,
        output: '(All versions come from spring-ai-bom.)',
      },
      {
        caption: 'Ingesting a folder of PDFs into the vector store',
        code: `@Service
public class PolicyIngestionService {

    private static final Logger log = LoggerFactory.getLogger(PolicyIngestionService.class);
    private final VectorStore vectorStore;

    public PolicyIngestionService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    public void ingest(Resource pdf, String docId) {
        // 1. Read: one Document per PDF page, with page number metadata
        List<Document> pages = new PagePdfDocumentReader(pdf).get();

        // 2. Transform: split pages into token-sized chunks
        List<Document> chunks = new TokenTextSplitter().apply(pages);
        chunks.forEach(c -> c.getMetadata().put("docId", docId));

        // 3. Write: remove the old version, then embed and store the new chunks
        vectorStore.delete(new FilterExpressionBuilder().eq("docId", docId).build());
        vectorStore.add(chunks);
        log.info("Ingested {} pages as {} chunks from {}", pages.size(), chunks.size(), docId);
    }
}

@Component
class IngestOnStartup implements ApplicationRunner {

    private final PolicyIngestionService ingestion;

    IngestOnStartup(PolicyIngestionService ingestion) {
        this.ingestion = ingestion;
    }

    @Override
    public void run(ApplicationArguments args) {
        ingestion.ingest(new ClassPathResource("docs/refund-policy.pdf"), "refund-policy");
        ingestion.ingest(new ClassPathResource("docs/student-handbook.pdf"), "student-handbook");
    }
}`,
        output: `Ingested 4 pages as 11 chunks from refund-policy
Ingested 23 pages as 67 chunks from student-handbook`,
      },
      {
        caption: 'Answering questions with QuestionAnswerAdvisor',
        code: `@RestController
public class PolicyQaController {

    private final ChatClient chatClient;

    public PolicyQaController(ChatClient.Builder builder, VectorStore vectorStore) {
        this.chatClient = builder
            .defaultSystem("You answer questions for Webnest students using only the provided context. "
                + "If the context does not contain the answer, say you don't know.")
            .defaultAdvisors(QuestionAnswerAdvisor.builder(vectorStore)
                .searchRequest(SearchRequest.builder().topK(4).similarityThreshold(0.6).build())
                .build())
            .build();
    }

    @GetMapping("/policy/ask")
    public String ask(@RequestParam String q) {
        return chatClient.prompt().user(q).call().content();
    }
}`,
        output: `GET /policy/ask?q=Can I get a refund after 10 days?
No. Refunds are available only within 7 days of purchase, and only if you have completed
less than 20% of the course.

GET /policy/ask?q=Who won the cricket world cup?
I don't know — that isn't covered in the Webnest policy documents.`,
      },
      {
        caption: 'Modular RAG with query rewriting, a no-answer policy and source citations',
        code: `@Service
public class HandbookAssistant {

    private final ChatClient chatClient;

    public HandbookAssistant(ChatClient.Builder builder, VectorStore vectorStore) {
        Advisor rag = RetrievalAugmentationAdvisor.builder()
            .queryTransformers(RewriteQueryTransformer.builder()
                .chatClientBuilder(builder.build().mutate())
                .build())
            .documentRetriever(VectorStoreDocumentRetriever.builder()
                .vectorStore(vectorStore)
                .similarityThreshold(0.55)
                .topK(5)
                .build())
            .queryAugmenter(ContextualQueryAugmenter.builder()
                .allowEmptyContext(false)   // refuse instead of guessing when nothing relevant is found
                .build())
            .build();

        this.chatClient = builder.defaultAdvisors(rag).build();
    }

    public record Answer(String text, List<String> sources) {}

    public Answer ask(String question) {
        ChatResponse response = chatClient.prompt()
            .user(question)
            .call()
            .chatResponse();

        // The advisor stores the retrieved documents in the response metadata
        List<Document> docs = response.getMetadata().get(RetrievalAugmentationAdvisor.DOCUMENT_CONTEXT);
        List<String> sources = docs == null ? List.of() : docs.stream()
            .map(d -> d.getMetadata().get("docId") + " p." + d.getMetadata().get("page_number"))
            .distinct()
            .toList();

        return new Answer(response.getResult().getOutput().getText(), sources);
    }
}`,
        output: `ask("hey how long do i have to finish stuff before cert?")
(rewritten query: "What is the time limit to complete a course to receive a certificate?")
Answer[text=You must complete all lessons and quizzes within 12 months of enrolling to receive a certificate.,
       sources=[student-handbook p.7, student-handbook p.8]]`,
      },
    ],
    commonMistakes: [
      'Embedding whole documents as one vector; retrieval then returns huge, unfocused context. Split into chunks.',
      'Not instructing the model to answer only from context, so it mixes in invented facts.',
      'Re-ingesting documents without deleting old chunks, leaving outdated and duplicated content in the index.',
      'Ignoring multi-tenancy: without a tenant filter, one customer\'s documents can appear in another customer\'s answers.',
      'Judging RAG quality by a few manual questions; build an evaluation set (see the testing lesson) and measure.',
    ],
    keyPoints: [
      'RAG retrieves relevant chunks of your data and gives them to the model as context for each question.',
      'Ingestion = read (PDF/Tika readers) → split (TokenTextSplitter) → embed and store (VectorStore).',
      'QuestionAnswerAdvisor is the quick start; RetrievalAugmentationAdvisor composes rewriting, retrieval and augmentation.',
      'Refuse to answer when nothing relevant is retrieved, and show sources from document metadata.',
      'Keep the index fresh with stable document ids, deletion of old chunks and tenant filters.',
    ],
  },

  'model-context-protocol-mcp-servers-and-clients': {
    title: 'Model Context Protocol (MCP) Servers and Clients',
    intro: `Tool calling lets a model use Java methods inside your own application. But what if you want the same tools available to Claude Desktop, an IDE assistant, or another team's AI application? Writing a custom integration for every AI client does not scale. The <strong>Model Context Protocol (MCP)</strong> is an open standard that solves this: an MCP <strong>server</strong> exposes tools, resources and prompts in a standard way, and any MCP <strong>client</strong> can discover and use them.

Spring AI 2.0 ships with the MCP Java SDK 2.0 and Boot starters for both sides. In this lesson you will expose Spring beans as MCP tools with <code>@McpTool</code>, run the server over Streamable HTTP, connect a Spring AI application to MCP servers as a client, and secure the setup.`,
    sections: [
      {
        heading: 'MCP Concepts',
        body: `An MCP server can offer three kinds of capability:`,
        list: [
          '<strong>Tools</strong> — functions the model can call, like "search orders" or "create Jira ticket".',
          '<strong>Resources</strong> — read-only data identified by a URI, such as a file, a database record or a configuration document.',
          '<strong>Prompts</strong> — reusable prompt templates the client can offer to users.',
          'Transports: <strong>STDIO</strong> (the client launches the server as a local process) and <strong>Streamable HTTP</strong> (the server runs as a web service; the default in Spring AI 2.0). SSE is the older HTTP transport.',
        ],
      },
      {
        heading: 'Building an MCP Server with Spring Boot',
        body: `Add <code>spring-ai-starter-mcp-server-webmvc</code> (or <code>-webflux</code>, or <code>spring-ai-starter-mcp-server</code> for STDIO). Annotate bean methods with <code>@McpTool</code> and parameters with <code>@McpToolParam</code>; the annotation scanner registers them and generates JSON schemas automatically. <code>@McpResource</code> and <code>@McpPrompt</code> expose resources and prompts the same way. Set <code>spring.ai.mcp.server.protocol=STREAMABLE</code> and the server listens on <code>/mcp</code>.`,
      },
      {
        heading: 'Consuming MCP Servers from Spring AI',
        body: `Add <code>spring-ai-starter-mcp-client</code> and list the servers under <code>spring.ai.mcp.client.streamable-http.connections</code> or <code>spring.ai.mcp.client.stdio.connections</code>. At startup Spring AI connects, lists the tools on each server, and exposes them as a <code>ToolCallbackProvider</code> bean (<code>SyncMcpToolCallbackProvider</code>). Pass its callbacks to your ChatClient and the model can use remote tools exactly like local ones.`,
      },
      {
        heading: 'Security Considerations',
        body: `An MCP server is an API that lets AI clients take actions, so secure it like any other API: require OAuth2 bearer tokens or API keys (Spring AI's MCP security support integrates with Spring Security), apply per-tool authorization, validate arguments, and log calls. On the client side, only connect to servers you trust — a malicious server can return tool descriptions or results containing prompt-injection instructions. For STDIO servers, remember that you are running someone else's program on your machine.`,
      },
    ],
    examples: [
      {
        caption: 'An MCP server exposing course catalogue tools',
        code: `<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-server-webmvc</artifactId>
</dependency>

# application.yml
spring:
  ai:
    mcp:
      server:
        name: webnest-courses
        version: 1.0.0
        type: SYNC
        protocol: STREAMABLE
server:
  port: 8090

@Component
public class CourseCatalogTools {

    private final CourseRepository courses;

    public CourseCatalogTools(CourseRepository courses) {
        this.courses = courses;
    }

    @McpTool(name = "search_courses",
             description = "Search Webnest courses by keyword and return title, level and lesson count")
    public List<CourseSummary> searchCourses(
            @McpToolParam(description = "Keyword such as 'spring' or 'sql'", required = true) String keyword) {
        return courses.searchByKeyword(keyword).stream()
            .map(c -> new CourseSummary(c.getSlug(), c.getTitle(), c.getLevel(), c.getLessonCount()))
            .toList();
    }

    @McpTool(name = "course_outline", description = "Get the module and lesson outline of a course by slug")
    public CourseOutline outline(
            @McpToolParam(description = "Course slug, e.g. spring-boot", required = true) String slug) {
        return courses.outline(slug);
    }
}

public record CourseSummary(String slug, String title, String level, int lessons) {}`,
        output: `Started McpServerApplication ... Tomcat started on port 8090
Registered MCP tools: [search_courses, course_outline]
MCP endpoint: http://localhost:8090/mcp (Streamable HTTP)`,
      },
      {
        caption: 'Exposing a resource and a prompt',
        code: `@Component
public class CourseResources {

    @McpResource(uri = "webnest://syllabus/{slug}", name = "Course syllabus",
                 description = "Markdown syllabus of a Webnest course")
    public String syllabus(String slug) {
        return syllabusService.markdownFor(slug);
    }

    @McpPrompt(name = "study_plan", description = "Create a weekly study plan for a course")
    public GetPromptResult studyPlan(
            @McpArg(name = "slug", description = "Course slug", required = true) String slug,
            @McpArg(name = "hoursPerWeek", description = "Available hours per week", required = true) String hours) {
        String text = "Create a week-by-week study plan for the course '" + slug
            + "' for a learner with " + hours + " hours per week.";
        return GetPromptResult.builder(List.of(new PromptMessage(Role.USER, TextContent.builder(text).build())))
            .description("Study plan")
            .build();
    }
}`,
        output: `Client lists resources -> webnest://syllabus/{slug}
Client lists prompts   -> study_plan(slug, hoursPerWeek)`,
      },
      {
        caption: 'A Spring AI application using remote MCP tools',
        code: `<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-mcp-client</artifactId>
</dependency>

# application.yml of the assistant app
spring:
  ai:
    mcp:
      client:
        type: SYNC
        request-timeout: 30s
        streamable-http:
          connections:
            courses:
              url: http://localhost:8090
              endpoint: /mcp
        stdio:
          connections:
            filesystem:
              command: npx
              args:
                - "-y"
                - "@modelcontextprotocol/server-filesystem"
                - "C:/webnest/notes"

@RestController
public class AdvisorController {

    private final ChatClient chatClient;

    public AdvisorController(ChatClient.Builder builder, SyncMcpToolCallbackProvider mcpTools) {
        this.chatClient = builder
            .defaultSystem("You are a course advisor for Webnest Studio.")
            .defaultTools(mcpTools.getToolCallbacks())
            .build();
    }

    @GetMapping("/advisor")
    public String advise(@RequestParam String goal) {
        return chatClient.prompt().user(goal).call().content();
    }
}`,
        output: `GET /advisor?goal=I know Java and want to build secure REST APIs
(model calls search_courses("spring") then course_outline("spring-boot") on the MCP server)
Start with the Spring Boot course: work through "API Development", then the full
"Spring Security" module (13 lessons), finishing with "Testing secured endpoints".`,
      },
      {
        caption: 'Testing the server with the MCP Inspector',
        code: `# Official MCP debugging UI (requires Node.js)
npx @modelcontextprotocol/inspector

# In the Inspector UI:
#   Transport: Streamable HTTP
#   URL:       http://localhost:8090/mcp
#   -> Connect -> Tools -> search_courses -> keyword = "spring" -> Run`,
        output: `[{"slug":"spring-framework","title":"Spring Framework","level":"intermediate to advanced","lessons":27},
 {"slug":"spring-boot","title":"Spring Boot","level":"intermediate to advanced","lessons":100}]`,
      },
    ],
    commonMistakes: [
      'Exposing an MCP server over HTTP with no authentication, allowing anyone to call its tools.',
      'Connecting a client to untrusted third-party MCP servers whose tool descriptions can inject instructions into your model.',
      'Writing vague @McpTool descriptions — MCP clients rely entirely on them to pick tools.',
      'Using the older SSE transport for new servers when Streamable HTTP is now the default and recommended option.',
      'Returning huge payloads from tools and resources, which blows up the client model\'s context window.',
    ],
    keyPoints: [
      'MCP standardises how AI applications discover and use tools, resources and prompts from servers.',
      'spring-ai-starter-mcp-server-webmvc plus @McpTool/@McpResource/@McpPrompt turns Spring beans into an MCP server.',
      'Streamable HTTP is the default transport in Spring AI 2.0; STDIO suits local, process-launched servers.',
      'spring-ai-starter-mcp-client connects to servers and exposes their tools as a ToolCallbackProvider for ChatClient.',
      'Secure MCP servers with OAuth2 or API keys and only trust servers you control.',
    ],
  },

  'running-local-models-with-ollama': {
    title: 'Running Local Models with Ollama',
    intro: `Hosted models are powerful, but they are not always an option: some data may not leave your network, API costs add up during development, and you may want to work offline. <strong>Ollama</strong> runs open-weight models — Llama, Mistral, Gemma, Qwen, DeepSeek, Phi and many more — locally on your laptop or on your own servers, with a simple HTTP API.

Spring AI supports Ollama for both chat and embeddings, and because your code uses the portable ChatClient and EmbeddingModel APIs, you can develop against a local model and switch to a hosted one in production (or the reverse) with configuration alone. This lesson covers installing Ollama, connecting Spring Boot to it, running it with Docker Compose, and using several providers in one application.`,
    sections: [
      {
        heading: 'Installing Ollama and Pulling Models',
        body: `Download Ollama from ollama.com for Windows, macOS or Linux, or run the official <code>ollama/ollama</code> Docker image. Pull a model with <code>ollama pull llama3.2</code> and an embedding model with <code>ollama pull nomic-embed-text</code>. Ollama serves its API on <code>http://localhost:11434</code>.

Choose model size to fit your hardware: 1–4B parameter models run on most laptops; 7–8B models want 8–16 GB of RAM or a GPU; larger models need serious GPUs. Smaller models are faster but weaker at reasoning, tool calling and structured output.`,
      },
      {
        heading: 'Configuring Spring AI for Ollama',
        body: `Add <code>spring-ai-starter-model-ollama</code>, then set <code>spring.ai.ollama.base-url</code>, <code>spring.ai.ollama.chat.model</code> and <code>spring.ai.ollama.embedding.model</code>. Spring AI can pull missing models automatically at startup with <code>spring.ai.ollama.init.pull-model-strategy=when_missing</code>, which is convenient for development and CI.`,
      },
      {
        heading: 'Docker Compose and Testcontainers',
        body: `Spring Boot's Docker Compose support detects an <code>ollama/ollama</code> service in <code>compose.yaml</code>, starts it with the application, and configures the base URL automatically through a service connection. Testcontainers offers an <code>OllamaContainer</code> for integration tests, also connected with <code>@ServiceConnection</code>.`,
      },
      {
        heading: 'Using Several Model Providers',
        body: `With more than one model starter on the classpath, the auto-configured <code>ChatClient.Builder</code> becomes ambiguous. Disable it with <code>spring.ai.chat.client.enabled=false</code> and build a ChatClient for each <code>ChatModel</code> bean yourself — for example a local Ollama model for cheap classification and a hosted model for complex reasoning.`,
      },
    ],
    examples: [
      {
        caption: 'Installing Ollama and pulling models',
        code: `# After installing from ollama.com
ollama pull llama3.2
ollama pull nomic-embed-text
ollama list

# Quick test from the terminal
ollama run llama3.2 "Explain Spring Boot starters in one sentence."`,
        output: `NAME                       SIZE
llama3.2:latest            2.0 GB
nomic-embed-text:latest    274 MB

Spring Boot starters are dependency bundles that pull in everything needed for a feature, like web or JPA, with compatible versions.`,
      },
      {
        caption: 'Spring Boot configuration for Ollama',
        code: `<dependency>
    <groupId>org.springframework.ai</groupId>
    <artifactId>spring-ai-starter-model-ollama</artifactId>
</dependency>

# application.yml
spring:
  ai:
    ollama:
      base-url: http://localhost:11434
      init:
        pull-model-strategy: when_missing
      chat:
        model: llama3.2
        temperature: 0.2
      embedding:
        model: nomic-embed-text`,
        output: `INFO  Pulling model llama3.2 (strategy when_missing)... already available
INFO  Started WebnestAiApplication in 2.1 seconds`,
      },
      {
        caption: 'Running Ollama with Docker Compose',
        code: `# compose.yaml in the project root
services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama-data:/root/.ollama
volumes:
  ollama-data:

<!-- pom.xml: Spring Boot starts compose.yaml automatically in development -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-docker-compose</artifactId>
    <optional>true</optional>
</dependency>`,
        output: `INFO  Using Docker Compose file compose.yaml
INFO  Container project-ollama-1 Started
(spring.ai.ollama.base-url is set automatically from the running container)`,
      },
      {
        caption: 'Local model for classification, hosted model for complex answers',
        code: `# application.yml
spring:
  ai:
    chat:
      client:
        enabled: false   # we create ChatClients ourselves

@Configuration
public class MultiModelConfig {

    @Bean
    ChatClient localClient(OllamaChatModel ollama) {
        return ChatClient.builder(ollama)
            .defaultSystem("Classify text. Reply with a single word.")
            .build();
    }

    @Bean
    ChatClient cloudClient(OpenAiChatModel openAi) {
        return ChatClient.builder(openAi)
            .defaultSystem("You are an expert Spring Boot architect.")
            .build();
    }
}

@Service
public class QuestionRouter {

    private final ChatClient localClient;
    private final ChatClient cloudClient;

    public QuestionRouter(ChatClient localClient, ChatClient cloudClient) {
        this.localClient = localClient;
        this.cloudClient = cloudClient;
    }

    public String answer(String question) {
        String kind = localClient.prompt()
            .user("Is this question SIMPLE or COMPLEX? " + question)
            .call().content().trim();
        return kind.startsWith("COMPLEX")
            ? cloudClient.prompt().user(question).call().content()
            : localClient.prompt().system("Answer briefly.").user(question).call().content();
    }
}`,
        output: `answer("What port does Spring Boot use by default?")                     -> (local) 8080.
answer("Design a multi-tenant schema strategy for a SaaS on Spring Boot") -> (cloud) There are three common strategies...`,
      },
    ],
    commonMistakes: [
      'Expecting a small local model to match a frontier hosted model at tool calling or complex reasoning — test each feature with the model you will deploy.',
      'Forgetting to pull the model, then seeing "model not found" errors; use pull-model-strategy or pull it in your setup script.',
      'Running Ollama in Docker on a machine with a GPU without enabling GPU access, making it far slower than necessary.',
      'Adding both OpenAI and Ollama starters and getting "expected single matching bean" errors for ChatClient.Builder.',
      'Mixing embedding models: documents embedded with nomic-embed-text cannot be searched with OpenAI embeddings.',
    ],
    keyPoints: [
      'Ollama runs open-weight models locally with an HTTP API on port 11434.',
      'spring-ai-starter-model-ollama plus spring.ai.ollama.* properties connect Spring AI to it.',
      'Docker Compose support and Testcontainers wire up Ollama automatically through service connections.',
      'Portable ChatClient code lets you switch between local and hosted models via configuration.',
      'With several providers, disable the auto-configured builder and create one ChatClient per ChatModel.',
    ],
  },

  'testing-and-observing-ai-applications': {
    title: 'Testing and Observing AI Applications',
    intro: `AI features are harder to test than normal code: the same prompt can produce different wording each time, answers can be subtly wrong, and every call costs money. Yet shipping untested prompts is how chatbots end up promising refunds that do not exist. You need a layered strategy — fast deterministic tests for your own code, and evaluation tests that measure the model's answers — plus production observability to see latency, token usage and failures.

This lesson shows how to unit-test code that uses ChatClient without calling a model, run integration tests against a local Ollama model with Testcontainers, evaluate answer quality with Spring AI's evaluators, and monitor AI calls with Micrometer metrics and traces.`,
    sections: [
      {
        heading: 'Layer 1: Isolate the Model Behind Your Own Service',
        body: `Put AI calls behind small, well-named service methods (<code>TriageService.triage(text)</code>) and have the rest of your application depend on those. Controllers and business logic can then be tested with <code>@MockitoBean TriageService</code>, returning fixed results — fast, free and deterministic. This also keeps prompt details out of your controllers.`,
      },
      {
        heading: 'Layer 2: Integration Tests with a Real (Local) Model',
        body: `To test prompts, structured output and tool wiring end to end, run a small model in a Testcontainers <code>OllamaContainer</code> connected with <code>@ServiceConnection</code>. Assert on structure and key facts, not exact wording — for example that the category enum is BILLING, not that the summary equals a specific sentence. Tag these tests so they run in CI but not on every local build.`,
      },
      {
        heading: 'Layer 3: Evaluation (LLM-as-a-Judge)',
        body: `Spring AI provides <code>Evaluator</code> implementations that use a model to grade answers. <code>RelevancyEvaluator</code> checks whether an answer is relevant to the question given the retrieved context — ideal for RAG. <code>FactCheckingEvaluator</code> checks whether a claim is supported by provided documents, detecting hallucinations. Build a set of 20–100 representative questions with expected facts, run them after every prompt or model change, and track the pass rate over time.`,
      },
      {
        heading: 'Observability in Production',
        body: `Spring AI is instrumented with Micrometer. With Actuator on the classpath you get metrics such as <code>gen_ai.client.operation</code> (latency per model call) and <code>gen_ai.client.token.usage</code> (input and output tokens by model), plus tracing spans for ChatClient calls, advisors, tool calls and vector store queries. Export them to Prometheus/Grafana or any OpenTelemetry backend to answer: which feature uses the most tokens, which calls are slow, and how often do tools fail?

Prompt and completion content are not logged by default because they may contain personal data. Enable content logging only in development, or with proper redaction.`,
      },
      {
        heading: 'Guardrails',
        body: `Combine testing with runtime safeguards: <code>SafeGuardAdvisor</code> blocks requests containing configured sensitive words, input length limits prevent huge prompts, output validation checks structured results, and rate limits per user protect your budget.`,
      },
    ],
    examples: [
      {
        caption: 'Controller test with the AI service mocked',
        code: `@WebMvcTest(TicketController.class)
class TicketControllerTest {

    @Autowired MockMvcTester mvc;
    @MockitoBean TriageService triageService;

    @Test
    void returnsTriageResult() {
        when(triageService.triage(anyString()))
            .thenReturn(new TicketTriage(TicketCategory.BILLING, 4, "Double charge"));

        assertThat(mvc.post().uri("/api/tickets/triage")
                .contentType(MediaType.TEXT_PLAIN)
                .content("I was charged twice"))
            .hasStatusOk()
            .bodyJson()
            .extractingPath("$.category").isEqualTo("BILLING");
    }
}`,
        output: `TicketControllerTest > returnsTriageResult() PASSED (0.4s, no model call, no cost)`,
      },
      {
        caption: 'Integration test against a local model with Testcontainers',
        code: `@SpringBootTest
@Testcontainers
@Tag("ai")
class TriageServiceIT {

    @Container
    @ServiceConnection
    static OllamaContainer ollama = new OllamaContainer("ollama/ollama:latest");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry registry) {
        registry.add("spring.ai.ollama.chat.model", () -> "llama3.2");
        registry.add("spring.ai.ollama.init.pull-model-strategy", () -> "when_missing");
    }

    @Autowired TriageService triageService;

    @Test
    void classifiesBillingTickets() {
        TicketTriage result = triageService.triage("I was charged twice for my course, please refund one payment");
        assertThat(result.category()).isEqualTo(TicketCategory.BILLING);
        assertThat(result.priority()).isBetween(1, 5);
    }
}

// Run only AI tests:  mvn verify -Dgroups=ai`,
        output: `Pulling model llama3.2 ...
TriageServiceIT > classifiesBillingTickets() PASSED (38.2s)`,
      },
      {
        caption: 'Evaluating RAG answers for relevancy',
        code: `@SpringBootTest
@Tag("ai-eval")
class PolicyAnswerEvaluationTest {

    @Autowired ChatClient.Builder builder;
    @Autowired VectorStore vectorStore;

    @ParameterizedTest
    @CsvSource(delimiter = '|', value = {
        "Can I get a refund after 10 days?        | refund",
        "How long is a certificate valid?          | certificate",
        "Can I download videos for offline viewing?| offline"
    })
    void answersAreRelevantToRetrievedContext(String question, String topic) {
        RetrievalAugmentationAdvisor rag = RetrievalAugmentationAdvisor.builder()
            .documentRetriever(VectorStoreDocumentRetriever.builder().vectorStore(vectorStore).build())
            .build();

        ChatResponse response = builder.build().prompt()
            .advisors(rag)
            .user(question)
            .call()
            .chatResponse();

        List<Document> context = response.getMetadata().get(RetrievalAugmentationAdvisor.DOCUMENT_CONTEXT);
        String answer = response.getResult().getOutput().getText();

        RelevancyEvaluator evaluator = new RelevancyEvaluator(builder);
        EvaluationResponse eval = evaluator.evaluate(new EvaluationRequest(question, context, answer));

        assertThat(eval.isPass()).as("Irrelevant answer for '%s': %s", question, answer).isTrue();
    }
}`,
        output: `PolicyAnswerEvaluationTest
  ✔ [1] Can I get a refund after 10 days?, refund
  ✔ [2] How long is a certificate valid?, certificate
  ✘ [3] Can I download videos for offline viewing?, offline
      Irrelevant answer for 'Can I download videos...': Yes, you can download all videos... (no supporting context)`,
      },
      {
        caption: 'Metrics and tracing configuration',
        code: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>

# application.yml
management:
  endpoints:
    web:
      exposure:
        include: health, metrics, prometheus
spring:
  ai:
    chat:
      observations:
        log-prompt: false        # keep personal data out of logs in production
        log-completion: false
    tools:
      observations:
        include-content: false`,
        output: `GET /actuator/metrics/gen_ai.client.token.usage
{"name":"gen_ai.client.token.usage","measurements":[{"statistic":"COUNT","value":48213.0}],
 "availableTags":[{"tag":"gen_ai.token.type","values":["input","output","total"]},
                  {"tag":"gen_ai.request.model","values":["gpt-5-mini"]}]}`,
      },
    ],
    commonMistakes: [
      'Asserting exact model wording in tests, which makes them fail randomly; assert structure, enums and key facts.',
      'Calling a paid hosted model in every unit test run, slowing builds and costing money.',
      'Changing a prompt or switching model versions without re-running an evaluation set.',
      'Logging full prompts and completions in production, leaking personal or confidential data.',
      'Not tracking token usage per feature, then being surprised by the monthly bill.',
    ],
    keyPoints: [
      'Hide AI calls behind services and mock them for fast, deterministic unit and web tests.',
      'Use Testcontainers OllamaContainer with @ServiceConnection for realistic, free integration tests.',
      'RelevancyEvaluator and FactCheckingEvaluator measure answer quality and detect hallucinations.',
      'Spring AI emits Micrometer metrics and traces for latency, token usage, tools and vector searches.',
      'Keep prompt/completion content out of production logs and monitor cost per feature.',
    ],
  },
}
