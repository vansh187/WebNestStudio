# WebNest Studio - High-Level Architecture Diagram

```mermaid
%% ============================================================
%% MAIN APPLICATION SHELL
%% ============================================================

graph TD
    %% Core Client-Side Components
    App["<b>App.jsx</b>\n- ErrorBoundary\n- ThemeProvider\n- ToastProvider\n- AuthProvider\n- Layout\n- Routes"]:::core

    %% Routing/Lazy-Loaded Pages (Public)
    subgraph Public_Pages [Public Marketing Pages]
        Home["<b>Home</b>"]
        About["<b>About</b>"]
        Services["<b>Services</b>"]
        Portfolio["<b>Portfolio</b>"]
        Blog["<b>Blog</b>"]
        Faqs["<b>FAQs</b>"]
        Contact["<b>Contact</b>"]
    end

    %% Auth-Gated Pages
    subgraph Auth_Gated [Authentication & Protected]
        Login["<b>Login</b>\n- OTP Verification\n- Password Flow"]
        DeleteAccount["<b>Delete Account</b>"]
        DigitalCard["<b>Digital Card</b>\n- QR Code Generation"]
        PortfolioDetail["<b>Portfolio Detail</b>"]
        BlogDetail["<b>Blog Detail</b>"]
    end

    %% Coding Platform Area
    subgraph Coding_Platform [Coding & Playground]
        CodeLab_Home["<b>CodeLab Home</b>"]
        Playground["<b>Playground</b>\n- Monaco Editor"]
        Projects_List["<b>Projects List</b>"]
        Project_Workspace["<b>Project Workspace</b>"]
        Shared_Snippet["<b>Shared Snippet</b>"]
    end

    %% Learning Area
    subgraph Learning [Learning Platform]
        Courses_List["<b>Courses List</b>"]
        Course_Detail["<b>Course Detail</b>"]
        Lesson_Detail["<b>Lesson Detail</b>"]
        Learner_Dashboard["<b>Learner Dashboard</b>\n- Protected"]
    end

    %% AI Builder Area
    subgraph AI_Builder [AI Page Builder]
        Chat_Widget["<b>Chat Widget</b>"]
        Chat_Panel["<b>Chat Panel</b>"]
        Generation_Chat["<b>Generation Chat</b>"]
        Plan_Result["<b>Plan Result</b>"]
    end

    %% Admin Area
    subgraph Admin [Admin Panel (Auth-Roles)]
        Admin_Layout["<b>Admin Layout</b>"]
        Admin_Leads["<b>Admin Leads</b>"]
        Admin_Resource_Crud["<b>Admin Resource CRUD</b>"]
        Admin_Project_Status["<b>Admin Project Status</b>"]
    end

    %% Context Providers
    Auth_Context["<b>AuthContext</b>\n- JWT/Refresh Token\n- getAccessToken/setSession"]
    Theme_Context["<b>ThemeContext</b>\n- Light/Dark toggle"]
    Toast_Context["<b>ToastContext</b>\n- Notification system"]

    %% ============================================================
    %% EXTERNAL INTEGRATIONS & SERVICES
    %% ============================================================

    subgraph External_Services [Backend & Third-Party]
        BASE_URL["<b>API Base URL</b>\nhttps://webneststudiobackend-n00h.onrender.com"]:::api

        %% API Client Layer
        apiClient["<b>apiClient.js</b>\n- axios instance\n- Timeout per endpoint\n- Auth interceptors\n- 503 retry\n- Token refresh"]:::api

        %% Compiler & Execution
        Compiler["<b>Compiler Service</b>\n- /api/compiler/execute\n- JDoodle-style execution\n- Normalize results\n- Python/Java/Web support"]:::compiler

        %% Java Playground
        Java_Service["<b>Java Playground</b>\n- /api/java/run\n- Cloud Run proxy\n- 90s timeout"]:::java

        %% AI/LLM Integration
        AI_Service["<b>AI Builder Service</b>\n- Gemini + Groq fallback\n- /api/generate, /api/chat/*\n- 90s timeout for cold starts"]:::ai

        %% Authentication Backend
        Auth_Backend["<b>Auth Backend</b>\n- /api/auth/*\n- Signup, Login, OTP, Refresh"]:::auth

        %% Content Management
        Content_API["<b>Content APIs</b>\n- /api/services, /api/portfolio\n- /api/blog, /api/faqs"]:::content

        %% Storage/Blobs
        Blob_Storage["<b>Blob Storage</b>\n- PDF downloads\n- Plan files"]:::storage

        %% Vercel Analytics
        Vercel_Analytics["<b>Vercel Analytics</b>\n- @vercel/analytics/react"]:::analytics
    end

    %% ============================================================
    %% INTERNAL API CALLS (from apiClient)
    %% ============================================================

    %% Auth Flow
    App -->|uses| Auth_Context
    Auth_Context -->|calls| apiClient
    apiClient -->|POST /api/auth/*| Auth_Backend
    Auth_Backend -->|JWT/Refresh| apiClient

    %% Content Queries
    App -->|uses| apiClient
    apiClient -->|GET /api/services| Content_API
    apiClient -->|GET /api/blog| Content_API
    apiClient -->|GET /api/portfolio| Content_API
    apiClient -->|GET /api/faqs| Content_API

    %% Coding Platform API Calls
    CodeLab_Home -->|listLanguages| apiClient
    CodeLab_Home -->|executeCode| apiClient
    apiClient -->|POST /api/compiler/execute| Compiler
    Compiler -->|returns normalized result| apiClient

    %% Python Execution (Pyodide Worker)
    CodeLab_Home -->|runPython| useCodeRunner
    useCodeRunner -->|new Worker| pyodideWorker["<b>pyodideRunner.worker.js</b>\n- Browser WebWorker\n- Executes Python code"]:::worker

    %% Java Execution
    CodeLab_Home -->|run Java| apiClient
    apiClient -->|POST /api/java/run| Java_Service
    Java_Service -->|Cloud Run| javaRunner["<b>java-playground worker</b>"]:::worker

    %% AI Builder Calls
    AI_Builder -->|startThread, sendMessage| apiClient
    apiClient -->|POST /api/chat/*| AI_Service
    AI_Service -->|LLM generation| Gemini/Groq

    %% Admin CRUD Operations
    Admin_Layout -->|uses apiClient| apiClient
    apiClient -->|GET/POST/PUT/DELETE /api/admin/*| Admin_Backend
    Admin_Backend -->|CRUD operations| Database

    %% Digital Card / QR Code
    DigitalCard -->|generates QR| Blob_Storage
    DigitalCard -->|download PDF| apiClient
    apiClient -->|GET /api/chat/plans/*/pdf| Blob_Storage

    %% Vercel Analytics
    App -->|view| Vercel_Analytics

    %% ============================================================
    %% DATA FLOW
    %% ============================================================

    style App fill:#f9f9f9,stroke:#333,stroke-width:2px
    style apiClient fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Compiler fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style Java_Service fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    style AI_Service fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style Admin_Backend fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style pyodideWorker fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px
    style Auth_Context fill:#e0f7fa,stroke:#00bcd4,stroke-width:2px
    style Theme_Context fill:#e0f7fa,stroke:#00bcd4,stroke-width:2px
    style Toast_Context fill:#e0f7fa,stroke:#00bcd4,stroke-width:2px

    %% Legend
    classDef core fill:#f0f4f8,stroke:#414141,stroke-width:2px,rx:4,ry:4
    classDef api fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,rx:4,ry:4
    classDef compiler fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,rx:4,ry:4
    classDef java fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,rx:4,ry:4
    classDef ai fill:#fff3e0,stroke:#f57c00,stroke-width:2px,rx:4,ry:4
    classDef auth fill:#ffe0e0,stroke:#e53935,stroke-width:2px,rx:4,ry:4
    classDef worker fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px,rx:4,ry:4
    classDef content fill:#e8f5e9,stroke:#388e3c,stroke-width:2px,rx:4,ry:4
    classDef analytics fill:#e0f2f1,stroke:#00838f,stroke-width:2px,rx:4,ry:4