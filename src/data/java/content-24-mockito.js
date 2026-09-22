// Additional Engineering Practices lesson — Mockito. Merged into the same
// module as content-13-engineering.js in index.js.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content24Mockito = {
  'mockito-and-testing-spring-applications': {
    title: 'Mockito and Testing Spring Applications',
    intro: `A unit test for a service class shouldn't also need a real database, a real HTTP call to another service, or a fully started Spring application — any of those turns a fast, focused unit test into a slow, brittle integration test. <strong>Mockito</strong> is the standard Java mocking framework: it creates fake ("mock") implementations of a class's dependencies, so you can test one class's logic completely in isolation.`,
    sections: [
      {
        heading: 'Mock vs. Stub vs. Spy',
        list: [
          '<strong>Stub</strong> — an object that returns pre-programmed, canned answers; a test doesn\'t verify how it was called, only that it supplied the data needed.',
          '<strong>Mock</strong> — a fake object whose <em>interactions</em> you explicitly verify: how many times a method was called, and with what arguments.',
          '<strong>Spy</strong> — wraps a real object, letting its real methods run by default, with the option to override specific method calls — useful when you want mostly-real behavior with one method faked.',
        ],
      },
      {
        heading: 'The Core Mockito API',
        body: `<code>@Mock</code> creates a fake instance of a dependency's type. <code>@InjectMocks</code> creates a real instance of the class under test and automatically injects the <code>@Mock</code>-annotated fields into it (via constructor or setter injection, whichever the class supports). <code>when(...).thenReturn(...)</code> programs a mock's canned response. <code>verify(mock, times(n)).method(...)</code> asserts a method was actually called the expected number of times with the expected arguments.`,
      },
      {
        heading: 'Testing a Spring Boot Application at Different Levels',
        body: `Spring Boot Test offers focused testing slices instead of forcing every test to load the entire application context. <code>@ExtendWith(MockitoExtension.class)</code> (no Spring context at all) is the fastest option for pure business-logic unit tests. <code>@WebMvcTest(SomeController.class)</code> loads only the web layer, letting you test a controller's request/response handling with <code>MockMvc</code> while mocking out its service dependencies with <code>@MockBean</code>. <code>@SpringBootTest</code> loads the full application context and is reserved for true integration tests, since it's significantly slower to start than the more targeted slices.`,
      },
    ],
    examples: [
      {
        caption: 'A pure Mockito unit test for a service, and a @WebMvcTest slice test for a controller',
        code: `// Pure unit test — no Spring context, fastest to run
@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock private StudentRepository repo;
    @InjectMocks private StudentService service;

    @Test
    void toppersReturnsOnlyStudentsAboveNinety() {
        when(repo.findByMarksGreaterThan(90))
            .thenReturn(List.of(new Student(1, "Vansh", 95)));

        List<Student> result = service.toppers();

        assertEquals(1, result.size());
        assertEquals("Vansh", result.get(0).getName());
        verify(repo, times(1)).findByMarksGreaterThan(90);
    }
}

// Web-layer slice test — loads only Spring MVC infrastructure, mocks the service
@WebMvcTest(StudentController.class)
class StudentControllerTest {

    @Autowired private MockMvc mvc;
    @MockBean private StudentService service;

    @Test
    void getByIdReturns200WithJsonBody() throws Exception {
        when(service.findById(1)).thenReturn(Optional.of(new Student(1, "Vansh", 95)));

        mvc.perform(get("/api/students/1"))
           .andExpect(status().isOk())
           .andExpect(jsonPath("$.name").value("Vansh"));
    }

    @Test
    void getByIdReturns404WhenMissing() throws Exception {
        when(service.findById(99)).thenReturn(Optional.empty());

        mvc.perform(get("/api/students/99"))
           .andExpect(status().isNotFound());
    }
}`,
        output: `StudentServiceTest > toppersReturnsOnlyStudentsAboveNinety() PASSED
StudentControllerTest > getByIdReturns200WithJsonBody() PASSED
StudentControllerTest > getByIdReturns404WhenMissing() PASSED`,
      },
    ],
    commonMistakes: [
      'Reaching for @SpringBootTest (full application context) for every test, making the suite slow, when a plain Mockito test or a focused @WebMvcTest slice would run in a fraction of the time.',
      'Mocking a class instead of an interface unnecessarily, or mocking value objects/DTOs that have no real behavior worth faking.',
      'Verifying interactions Mockito already implies by the test passing (over-specifying with verify() on every single call), making tests brittle to harmless refactors.',
      'Forgetting that @Mock fields return null (or 0/false) by default until explicitly stubbed with when(...).thenReturn(...), causing confusing NullPointerExceptions in the test itself.',
    ],
    keyPoints: [
      'Stub returns canned data; Mock verifies interactions; Spy wraps a real object with selective overrides.',
      '@Mock creates fakes, @InjectMocks wires them into the real class under test automatically.',
      'when(...).thenReturn(...) programs mock behavior; verify(...) asserts how a mock was actually called.',
      'Match the test type to what you\'re verifying: plain Mockito for logic, @WebMvcTest for the web layer, @SpringBootTest only for true integration tests.',
    ],
  },
}
