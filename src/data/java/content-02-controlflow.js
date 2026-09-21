// Java Control Flow module — hand-written lesson content.
// Keys are slugs from javaSlugify() applied to the topic titles in topics.js.
export const content02ControlFlow = {
  'java-if-else-statement': {
    title: 'Java If-else Statement',
    intro: `The if-else statement is Java's basic decision-making construct: it lets a program execute one block of code or another based on whether a boolean condition is true or false. Almost every non-trivial program branches somewhere, and if-else is the tool that makes that branching explicit and readable.

Java evaluates the condition inside the parentheses, and that condition must be a boolean expression — unlike C, Java does not allow an int to be used directly as a condition. This strictness catches a whole class of bugs (like accidentally writing <code>if (x = 5)</code> instead of <code>if (x == 5)</code>) at compile time rather than letting them silently misbehave at runtime.`,
    sections: [
      {
        heading: 'The if, if-else, and if-else-if Forms',
        body: `Java supports three shapes of this statement, each suited to a different kind of decision.`,
        list: [
          '<strong>if</strong> — runs a block only when the condition is true; otherwise nothing happens.',
          '<strong>if-else</strong> — runs one block when the condition is true and a different block when it is false; exactly one branch always executes.',
          '<strong>if-else-if ladder</strong> — chains multiple conditions checked top to bottom; the first true condition wins, and only its block runs even if a later condition would also be true.',
        ],
      },
      {
        heading: 'Nested if and Braces',
        body: `An if statement can contain another if statement inside its block, which is useful when a second decision only makes sense after the first condition is satisfied. Java allows you to omit curly braces when a branch is a single statement, but doing so is risky: only the very next statement belongs to the if, and any developer who later adds a second statement without adding braces will silently break the logic. Professional style always uses braces, even for one-line branches.`,
      },
      {
        heading: 'The Dangling else Problem',
        body: `When if statements are nested without braces, an else always binds to the nearest unmatched if, not necessarily the one the indentation visually suggests. This is called the "dangling else" ambiguity, and it is a real source of bugs when code is reformatted or edited. Using braces around every branch removes the ambiguity entirely, because the else then has only one possible if to attach to.`,
      },
    ],
    examples: [
      {
        caption: 'An if-else-if ladder assigning a letter grade from a numeric score',
        code: `public class GradeChecker {
    public static void main(String[] args) {
        int score = 82;
        char grade;

        if (score >= 90) {
            grade = 'A';
        } else if (score >= 80) {
            grade = 'B';
        } else if (score >= 70) {
            grade = 'C';
        } else {
            grade = 'F';
        }

        System.out.println("Grade: " + grade);
    }
}`,
        output: 'Grade: B',
      },
    ],
    commonMistakes: [
      'Writing "if (x = 5)" instead of "if (x == 5)" — Java prevents this specific mistake at compile time because assignment does not produce a boolean, but it still confuses beginners coming from other languages.',
      'Omitting braces on a single-statement branch and later adding a second statement that unintentionally falls outside the if.',
      'Ordering an if-else-if ladder incorrectly, such as checking "score >= 70" before "score >= 90" — the first matching branch wins, so broader conditions must come last.',
      'Comparing objects like String with == instead of .equals() inside an if condition, which compares references rather than content.',
    ],
    keyPoints: [
      'The condition in an if statement must be a boolean expression — Java does not accept int-as-boolean like C does.',
      'In an if-else-if ladder, only the first true branch executes, even if later conditions are also true.',
      'Always use braces around branches to avoid the dangling-else ambiguity and prevent future edits from breaking the logic.',
    ],
  },

  'java-switch-statement': {
    title: 'Java Switch Statement',
    intro: `The switch statement is a multi-way branch that compares one value against several possible constant cases, offering a cleaner alternative to a long if-else-if ladder when all the branches test the same variable for equality. Java's switch works on byte, short, char, int (and their wrapper classes), enum types, and String.

Traditional switch statements execute case labels sequentially once a match is found, and — unless a break statement stops execution — control "falls through" into the next case's code. This fall-through behavior is a deliberate design choice inherited from C, useful in specific situations but a frequent source of bugs when forgotten.`,
    sections: [
      {
        heading: 'Basic Syntax and Fall-Through',
        body: `A switch evaluates its expression once, then jumps to the case label whose constant value matches. Execution then continues downward through every subsequent case's statements until it hits a break or reaches the end of the switch block.`,
        list: [
          'Case labels must be compile-time constants — <code>final</code> variables, literals, or enum constants, never a regular variable or a method call result.',
          'A <code>default</code> case is optional and runs when no other case matches; it can appear anywhere in the block, though convention places it last.',
          'Multiple case labels can be stacked with no code between them to share one block, which intentionally uses fall-through as a grouping technique.',
          'Forgetting <code>break</code> at the end of a case causes execution to continue into the next case unintentionally — the most common switch bug.',
        ],
      },
      {
        heading: 'Switching on String and Enum',
        body: `Since Java 7, switch can compare a String expression against String literal cases, which internally relies on .equals() and hashCode() rather than reference comparison. Switching on an enum is especially clean because you write only the bare constant name in each case label (not <code>Enum.CONSTANT</code>), and the compiler already knows the type from the switch expression.`,
      },
      {
        heading: 'Modern Enhanced Switch (Java 14+)',
        body: `Newer Java versions introduced an arrow-based switch expression: <code>case value -> result;</code>. Each arrow case runs only its own branch with no fall-through at all, the switch itself can produce a value directly (assignable to a variable), and a block body can return a value with <code>yield</code>. This form is safer for beginners because it removes the fall-through pitfall entirely, though the classic colon-and-break form remains widely used in existing codebases and is still essential to understand.`,
      },
    ],
    examples: [
      {
        caption: 'Classic switch using grouped case labels and break to avoid fall-through',
        code: `public class DayTypeDemo {
    public static void main(String[] args) {
        int day = 6;
        String type;

        switch (day) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                type = "Weekday";
                break;
            case 6:
            case 7:
                type = "Weekend";
                break;
            default:
                type = "Invalid";
        }

        System.out.println(type);
    }
}`,
        output: 'Weekend',
      },
      {
        caption: 'The same logic written as a modern arrow-based switch expression',
        code: `public class SwitchExpressionDemo {
    public static void main(String[] args) {
        int day = 3;

        String type = switch (day) {
            case 1, 2, 3, 4, 5 -> "Weekday";
            case 6, 7 -> "Weekend";
            default -> "Invalid";
        };

        System.out.println(type);
    }
}`,
        output: 'Weekday',
      },
    ],
    commonMistakes: [
      'Forgetting "break" at the end of a case in a classic switch, causing execution to silently fall through into the next case.',
      'Trying to use a non-constant variable or a method call result as a case label, which fails to compile.',
      'Assuming a switch on String is case-insensitive — case labels must match the switch value exactly, including capitalization.',
      'Writing an enum case label as "Day.MONDAY" instead of just "MONDAY", which does not compile inside a switch on that enum type.',
    ],
    keyPoints: [
      'Classic switch falls through to the next case unless a break statement stops it — this is by design, not a bug.',
      'Case labels must be compile-time constants; switch supports byte/short/char/int, their wrappers, String, and enums.',
      'The Java 14+ arrow syntax (case value -> result;) has no fall-through and can directly produce a value.',
      'default is optional but should normally be included to handle unexpected values explicitly.',
    ],
  },

  'java-for-loop': {
    title: 'Java For Loop',
    intro: `The for loop is Java's standard construct for repeating a block of code a known or countable number of times. It packages initialization, a continuation condition, and an update step into one compact header, which keeps loop-control logic in a single, easy-to-scan place instead of scattered across the loop body.

Because all three parts of the header are visible together, the for loop communicates intent clearly: a reader immediately sees where the counter starts, when the loop stops, and how the counter changes on every pass, without having to hunt through the loop body for that information.`,
    sections: [
      {
        heading: 'Anatomy of the for Loop',
        body: `The header has the form <code>for (initialization; condition; update)</code>. Initialization runs once before the loop starts, typically declaring a counter variable. The condition is checked before every iteration, including the first — if it is false immediately, the loop body never runs at all. The update expression runs after each iteration completes, before the condition is checked again.`,
      },
      {
        heading: 'Multiple Expressions and Infinite Loops',
        body: `Java allows comma-separated multiple initializations and multiple update expressions in a single for header, which is useful for loops that track two related counters moving in opposite directions. Any of the three header parts can also be omitted; omitting all three, as in <code>for (;;)</code>, produces an intentional infinite loop that must be stopped from inside the body, usually with a break statement or a return.`,
      },
      {
        heading: 'Scope of the Loop Variable',
        body: `A variable declared in the initialization section (e.g. <code>int i</code>) is scoped only to the for loop itself — it does not exist before the loop and cannot be referenced after it ends. This prevents loop counters from accidentally leaking into and cluttering the surrounding method's namespace.`,
      },
    ],
    examples: [
      {
        caption: 'A simple counting loop and a loop with two update expressions moving toward each other',
        code: `public class ForLoopDemo {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 5; i++) {
            sum += i;
        }
        System.out.println("Sum: " + sum);

        for (int i = 1, j = 5; i <= j; i++, j--) {
            System.out.println(i + " " + j);
        }
    }
}`,
        output: `Sum: 15
1 5
2 4
3 3`,
      },
    ],
    commonMistakes: [
      'Off-by-one errors from using "<=" versus "<" incorrectly, causing the loop to run one time too many or too few.',
      'Modifying the loop counter inside the body in addition to the header\'s update expression, causing confusing, hard-to-predict iteration counts.',
      'Trying to use the loop variable after the loop ends, not realizing it goes out of scope once the for block closes.',
      'Writing "for (;;)" without an internal break condition, creating an unintended infinite loop that hangs the program.',
    ],
    keyPoints: [
      'The header runs initialization once, checks the condition before every iteration, and runs the update after every iteration.',
      'If the condition is false on the very first check, the loop body never executes.',
      'A for loop\'s counter variable is scoped to the loop and does not exist outside it.',
      'for (;;) with all header parts omitted creates an infinite loop that needs an internal break or return.',
    ],
  },

  'java-while-and-do-while-loop': {
    title: 'Java While and Do-While Loop',
    intro: `while and do-while are Java's two loop constructs built around a single boolean condition rather than the three-part header of a for loop. They are the natural choice when the number of iterations is not known in advance — for example, reading input until a sentinel value appears, or retrying an operation until it succeeds.

The key difference between them is when the condition is checked: while is a pre-test loop that may skip its body entirely, while do-while is a post-test loop that always executes its body at least once, no matter what the condition evaluates to.`,
    sections: [
      {
        heading: 'The while Loop',
        body: `A while loop checks its condition before every iteration, including the first. If the condition is false from the start, the body never runs at all. This makes while suitable whenever it is genuinely possible that zero iterations are the correct outcome — for instance, processing items in a queue that might already be empty.`,
      },
      {
        heading: 'The do-while Loop',
        body: `A do-while loop places its condition check after the body, using the syntax <code>do { ... } while (condition);</code> — note the required semicolon after the closing parenthesis, which is easy to forget since ordinary blocks don't need one. Because the check happens after the body runs, the body is guaranteed to execute at least once even if the condition is false immediately. This matches situations like displaying a menu at least once before deciding whether to repeat it.`,
      },
      {
        heading: 'Choosing Between while, do-while, and for',
        body: `Use a for loop when the number of iterations is known or naturally counted. Use a while loop when repetition depends on a condition that might already be false the first time. Use a do-while loop specifically when the body must run at least once regardless of the condition — this is the one behavioral guarantee no other loop form provides.`,
      },
    ],
    examples: [
      {
        caption: 'A while loop that may not run versus a do-while loop guaranteed to run once',
        code: `public class LoopComparisonDemo {
    public static void main(String[] args) {
        int count = 5;
        while (count > 0) {
            System.out.println("While count: " + count);
            count--;
        }

        int attempts = 0;
        do {
            System.out.println("Do-while attempt: " + attempts);
            attempts++;
        } while (attempts < 0);
    }
}`,
        output: `While count: 5
While count: 4
While count: 3
While count: 2
While count: 1
Do-while attempt: 0`,
      },
    ],
    commonMistakes: [
      'Forgetting the semicolon after "while (condition)" in a do-while loop, which is required and causes a compile error if missing.',
      'Forgetting to update the variable used in the while condition inside the loop body, creating an accidental infinite loop.',
      'Using do-while when the body should not run at all if the condition starts false — do-while always runs its body once, regardless.',
      'Confusing the pre-test (while) and post-test (do-while) semantics when the loop body has an observable side effect, like printing or writing to a file.',
    ],
    keyPoints: [
      'while checks its condition before each iteration and may execute zero times.',
      'do-while checks its condition after each iteration and always executes at least once.',
      'The do-while syntax requires a trailing semicolon after the while(condition) part.',
      'Choose while/do-while over for when the iteration count is not known ahead of time.',
    ],
  },

  'java-for-each-loop': {
    title: 'Java For-each Loop',
    intro: `The for-each loop (also called the "enhanced for loop"), introduced in Java 5, provides a simpler syntax for iterating over every element of an array or any object implementing Iterable, such as the collections in java.util. It removes the need to manage an index variable manually, which eliminates an entire category of off-by-one and ArrayIndexOutOfBoundsException bugs.

The syntax reads almost like plain English: <code>for (Type element : collection)</code> means "for each element of this type in this collection." Internally, for an array the compiler generates an equivalent indexed loop, and for an Iterable it generates calls to hasNext() and next() on an iterator — but you never have to write that machinery yourself.`,
    sections: [
      {
        heading: 'Syntax and How It Works',
        body: `On each iteration, the loop variable is assigned a copy of the next element in the array or collection, in order, and the body executes with that value available. The loop automatically stops after the last element, so there is no condition or index update to get wrong.`,
      },
      {
        heading: 'Limitations of the For-each Loop',
        body: `The convenience comes with real trade-offs that make for-each unsuitable for some tasks.`,
        list: [
          'The loop variable holds a <em>copy</em> of each element for primitives, so reassigning it inside the loop body does not modify the original array.',
          'There is no automatic access to the current index, which is a problem if you need to know an element\'s position or modify the array in place by index.',
          'You cannot easily iterate backward, skip elements, or iterate two collections in lockstep using a single for-each loop.',
          'You cannot safely add or remove elements from most collections while iterating over them with for-each — doing so throws a ConcurrentModificationException.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Iterating an int array and a String array with for-each',
        code: `public class ForEachDemo {
    public static void main(String[] args) {
        int[] numbers = {2, 4, 6, 8, 10};
        int sum = 0;
        for (int num : numbers) {
            sum += num;
        }
        System.out.println("Sum: " + sum);

        String[] fruits = {"Apple", "Banana", "Cherry"};
        for (String fruit : fruits) {
            System.out.println(fruit);
        }
    }
}`,
        output: `Sum: 30
Apple
Banana
Cherry`,
      },
    ],
    commonMistakes: [
      'Trying to modify an array element by assigning to the for-each loop variable, not realizing it only changes the local copy, not the array.',
      'Needing the current index inside the loop and having no clean way to get it without falling back to an indexed for loop.',
      'Adding or removing elements from a List while iterating it with for-each, which throws a ConcurrentModificationException at runtime.',
      'Assuming for-each can iterate in reverse order — it always moves forward from the first element to the last.',
    ],
    keyPoints: [
      'for-each works on arrays and any type implementing Iterable, without managing an index manually.',
      'The loop variable receives a copy of each element; reassigning it never changes the underlying array or collection.',
      'for-each has no built-in index access and always iterates forward only.',
      'Modifying a collection\'s structure while iterating it with for-each can throw ConcurrentModificationException.',
    ],
  },

  'java-break-and-continue': {
    title: 'Java Break and Continue',
    intro: `break and continue are jump statements that alter the normal top-to-bottom flow of a loop from inside its body. break exits the loop entirely, while continue skips only the rest of the current iteration and moves straight to the next one. Both make it possible to express "stop early" or "skip this one" logic without wrapping the whole loop body in a large conditional.

Beyond simple loops, Java also supports labeled break and labeled continue, which extend this control to nested loops — letting inner-loop code affect an outer loop directly, something an unlabeled break or continue cannot do.`,
    sections: [
      {
        heading: 'The break Statement',
        body: `An unlabeled break immediately terminates the nearest enclosing loop (for, while, or do-while) or switch statement, and execution resumes at the first statement after that loop or switch. It is commonly used to stop searching once a target has been found, avoiding unnecessary further iterations.`,
      },
      {
        heading: 'The continue Statement',
        body: `continue skips the remaining statements in the current iteration of the nearest enclosing loop and jumps directly to the loop's update/condition check — in a for loop that means the update expression still runs before the condition is re-tested. It is useful for filtering out cases that should be skipped without nesting the rest of the loop body inside an if block.`,
      },
      {
        heading: 'Labeled break and continue',
        body: `A label is an identifier followed by a colon placed immediately before a loop, such as <code>search:</code> before a for loop. <code>break search;</code> exits that specific labeled loop (even from inside a nested inner loop), and <code>continue search;</code> skips to the next iteration of that specific labeled loop rather than the innermost one. Labels are the only way to break or continue an outer loop directly from inside a nested loop without extra boolean flags.`,
      },
    ],
    examples: [
      {
        caption: 'continue to skip even numbers and break to stop once a limit is exceeded',
        code: `public class BreakContinueDemo {
    public static void main(String[] args) {
        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) {
                continue;
            }
            if (i > 7) {
                break;
            }
            System.out.println(i);
        }
    }
}`,
        output: `1
3
5
7`,
      },
      {
        caption: 'A labeled break exiting a nested loop as soon as a value is found in a 2D array',
        code: `public class LabeledBreakDemo {
    public static void main(String[] args) {
        int[][] matrix = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };
        int target = 5;
        boolean found = false;

        search:
        for (int row = 0; row < matrix.length; row++) {
            for (int col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col] == target) {
                    found = true;
                    System.out.println("Found at [" + row + "][" + col + "]");
                    break search;
                }
            }
        }
        System.out.println("Found: " + found);
    }
}`,
        output: `Found at [1][1]
Found: true`,
      },
    ],
    commonMistakes: [
      'Using an unlabeled break inside a nested loop expecting it to exit both loops — it only exits the innermost enclosing loop.',
      'Confusing break and continue in a for loop, forgetting that continue still runs the update expression before re-checking the condition.',
      'Placing the label colon incorrectly or on the wrong loop, so the labeled break/continue does not target the intended loop.',
      'Overusing break to simulate early returns instead of restructuring the loop or extracting a method, which can make control flow harder to follow.',
    ],
    keyPoints: [
      'break exits the nearest enclosing loop or switch entirely; continue skips only the rest of the current iteration.',
      'In a for loop, continue still triggers the update expression before the condition is re-checked.',
      'Labeled break and continue can target a specific outer loop from inside nested loops.',
      'A label is written as an identifier followed by a colon directly above the loop it names.',
    ],
  },

  'java-arrays': {
    title: 'Java Arrays',
    intro: `An array is a fixed-size, ordered container that holds multiple values of the same type under a single variable name, with each value accessed by a zero-based integer index. Arrays are themselves objects in Java (even arrays of primitives), which is why every array has a <code>length</code> field and is allocated on the heap with <code>new</code>.

Because an array's size is fixed once created, arrays are best suited to situations where you know how many elements you need in advance. When the number of elements can grow or shrink dynamically, Java's collection classes (like ArrayList) are usually a better fit, but arrays remain the foundation those collections are often built on.`,
    sections: [
      {
        heading: 'Declaring, Creating, and Initializing Arrays',
        body: `Declaring an array (<code>int[] scores;</code>) only creates a reference variable — no memory for elements exists yet. Creating an array with <code>new int[4]</code> allocates space for four ints on the heap. Java also supports an array literal shorthand at the point of declaration, such as <code>int[] scores = {90, 85, 78, 92};</code>, which both creates and initializes the array in one step.`,
      },
      {
        heading: 'Default Values and Length',
        body: `When an array is created with <code>new</code> but no explicit values, every element gets the type's default value automatically: 0 for numeric types, false for boolean, and null for reference types — the same defaults instance variables get. The <code>length</code> field (not a method — no parentheses) always reports the array's fixed size and never changes after creation.`,
      },
      {
        heading: 'Bounds and Fixed Size',
        body: `Valid indices run from 0 to length - 1. Accessing any index outside that range, in either direction, throws an ArrayIndexOutOfBoundsException at runtime rather than being caught at compile time, so index arithmetic needs care. Because arrays cannot grow, "adding" an element in practice means creating a new, larger array and copying the existing elements into it.`,
      },
    ],
    examples: [
      {
        caption: 'Creating an array with default values, then filling and summing it',
        code: `public class ArrayBasicsDemo {
    public static void main(String[] args) {
        int[] scores = new int[4];  // default values: 0, 0, 0, 0
        System.out.println("Default: " + java.util.Arrays.toString(scores));

        scores[0] = 90;
        scores[1] = 85;
        scores[2] = 78;
        scores[3] = 92;

        int total = 0;
        for (int i = 0; i < scores.length; i++) {
            total += scores[i];
        }
        System.out.println("Total: " + total);
        System.out.println("Length: " + scores.length);
    }
}`,
        output: `Default: [0, 0, 0, 0]
Total: 345
Length: 4`,
      },
    ],
    commonMistakes: [
      'Writing "scores.length()" with parentheses — length is a field on arrays, not a method (Strings and Lists use .length() or .size(), which is a frequent source of confusion).',
      'Accessing index "scores.length" instead of "scores.length - 1", causing an ArrayIndexOutOfBoundsException on the last valid access.',
      'Assuming an array can be resized after creation — it cannot; a new array must be created and the old data copied over.',
      'Forgetting that a freshly created array of objects is filled with null, not empty objects, leading to a NullPointerException on first use.',
    ],
    keyPoints: [
      'Arrays have a fixed size set at creation time and cannot be resized afterward.',
      'Valid indices run from 0 to length - 1; length is a field, not a method call.',
      'Elements created with "new" but not explicitly set receive the type\'s default value (0, false, or null).',
      'Arrays are objects allocated on the heap, even when they hold primitive values.',
    ],
  },

  'java-multidimensional-arrays': {
    title: 'Java Multidimensional Arrays',
    intro: `A multidimensional array in Java is really an array of arrays — there is no true rectangular block of memory the way there is in some other languages. A 2D array like <code>int[][] grid</code> is an array where each element is itself a reference to another int array, and understanding this "array of arrays" model explains both the flexibility and the quirks multidimensional arrays have in Java.

Because each inner array is an independent object, multidimensional arrays in Java do not have to be perfectly rectangular. Each row can have a different length, producing what is called a jagged array — a pattern that is unusual in some languages but completely normal and often useful in Java.`,
    sections: [
      {
        heading: 'Declaring and Creating Rectangular 2D Arrays',
        body: `A rectangular grid is declared as <code>int[][] grid = new int[3][4];</code>, creating 3 rows of 4 columns each, all pre-filled with default values. Array literals also work for 2D data: <code>int[][] grid = {{1, 2, 3}, {4, 5, 6}};</code> creates two rows directly. Access uses two index pairs, <code>grid[row][col]</code>, where the first index selects the inner array and the second selects an element within it.`,
      },
      {
        heading: 'Jagged Arrays',
        body: `Because each row is a separate array object, rows can have different lengths. You can create the outer array first with <code>new int[3][]</code> (note the empty second bracket), then assign each row its own array of any length. This is genuinely useful for data like a triangular table or a list of variable-length records, and it is a natural consequence of Java's "array of arrays" model rather than a special feature.`,
      },
      {
        heading: 'Iterating Multidimensional Arrays',
        body: `A nested for or for-each loop is the standard way to visit every element: the outer loop walks the rows, and the inner loop walks the elements within the current row. Using for-each with <code>int[] row : grid</code> for the outer loop and <code>int value : row</code> for the inner loop reads cleanly and works correctly for jagged arrays too, since each row's own length is used automatically.`,
      },
    ],
    examples: [
      {
        caption: 'Summing a rectangular 2D array, then building and printing a jagged array',
        code: `public class MultiDimArrayDemo {
    public static void main(String[] args) {
        int[][] grid = {
            {1, 2, 3},
            {4, 5, 6}
        };

        int sum = 0;
        for (int[] row : grid) {
            for (int value : row) {
                sum += value;
            }
        }
        System.out.println("Sum: " + sum);

        int[][] jagged = new int[3][];
        jagged[0] = new int[]{1};
        jagged[1] = new int[]{1, 2};
        jagged[2] = new int[]{1, 2, 3};

        for (int[] row : jagged) {
            System.out.println(java.util.Arrays.toString(row));
        }
    }
}`,
        output: `Sum: 21
[1]
[1, 2]
[1, 2, 3]`,
      },
    ],
    commonMistakes: [
      'Assuming every row of a 2D array must have the same length — Java allows jagged arrays because each row is an independent array object.',
      'Trying to print a 2D array directly with Arrays.toString(), which only prints the outer array\'s references (like "[I@1b6d3586") instead of the actual numbers — Arrays.deepToString() is needed for nested arrays.',
      'Forgetting the empty brackets when creating a jagged array\'s outer shell, e.g. writing "new int[3]" instead of "new int[3][]" and then being unable to assign array rows.',
      'Mixing up row and column index order, e.g. writing grid[col][row] instead of grid[row][col], which silently accesses the wrong element instead of failing to compile.',
    ],
    keyPoints: [
      'Java implements multidimensional arrays as arrays of arrays, not as one contiguous rectangular block.',
      'Rows of a 2D array can have different lengths, producing a jagged array.',
      'Use Arrays.deepToString() to print nested arrays meaningfully; Arrays.toString() only shows one level.',
      'Nested loops (or nested for-each) are the standard way to visit every element of a multidimensional array.',
    ],
  },

  'java-arrays-class-and-copying-arrays': {
    title: 'Java Arrays Class and Copying Arrays',
    intro: `java.util.Arrays is a utility class packed with static helper methods for working with arrays — sorting them, searching them, comparing them, filling them, and copying them — so you rarely need to write these operations by hand. Because arrays themselves expose almost no built-in methods beyond the length field, Arrays fills that gap for everyday array manipulation.

Copying arrays correctly matters because array variables hold references, not the data itself: writing <code>int[] b = a;</code> does not copy anything, it just gives two names to the same underlying array, so changes through either variable are visible through the other. Arrays.copyOf, Arrays.copyOfRange, and System.arraycopy are the standard, correct ways to actually duplicate array data.`,
    sections: [
      {
        heading: 'Printing and Comparing Arrays',
        body: `Printing an array directly with System.out.println (or string concatenation) prints an unhelpful internal reference like "[I@1b6d3586", because arrays don't override toString(). <code>Arrays.toString(array)</code> produces a readable "[1, 2, 3]" for one-dimensional arrays, while <code>Arrays.deepToString(array)</code> is required for nested (multidimensional) arrays. Similarly, <code>==</code> on two arrays compares references, not contents, so <code>Arrays.equals(a, b)</code> (or deepEquals for nested arrays) is the correct way to check whether two arrays hold the same elements.`,
      },
      {
        heading: 'Sorting and Searching',
        body: `<code>Arrays.sort(array)</code> sorts the array in place in ascending order using a dual-pivot quicksort for primitives (or a stable mergesort variant for objects). Once an array is sorted, <code>Arrays.binarySearch(array, key)</code> finds a value's index efficiently in logarithmic time — but binarySearch gives undefined results on an unsorted array, so sorting first is mandatory.`,
      },
      {
        heading: 'Copying Arrays',
        body: `Three standard tools create genuine, independent copies of array data.`,
        list: [
          '<code>Arrays.copyOf(array, newLength)</code> — returns a new array of the given length, copying from the start; if newLength is larger, extra slots get default values, and if smaller, the array is truncated.',
          '<code>Arrays.copyOfRange(array, from, to)</code> — returns a new array containing elements from index "from" (inclusive) to "to" (exclusive).',
          '<code>System.arraycopy(src, srcPos, dest, destPos, length)</code> — the lowest-level, fastest option; it copies into an already-existing destination array rather than creating a new one, and both Arrays.copyOf and copyOfRange actually use it internally.',
        ],
      },
    ],
    examples: [
      {
        caption: 'Copying, sorting, searching, and slicing an array without mutating the original',
        code: `import java.util.Arrays;

public class ArraysClassDemo {
    public static void main(String[] args) {
        int[] original = {5, 2, 9, 1, 7};

        int[] copy = Arrays.copyOf(original, original.length);
        Arrays.sort(copy);
        System.out.println("Sorted copy: " + Arrays.toString(copy));
        System.out.println("Original unchanged: " + Arrays.toString(original));

        int index = Arrays.binarySearch(copy, 7);
        System.out.println("Index of 7: " + index);

        int[] partial = Arrays.copyOfRange(original, 1, 4);
        System.out.println("Partial copy: " + Arrays.toString(partial));

        int[] destination = new int[3];
        System.arraycopy(original, 0, destination, 0, 3);
        System.out.println("System.arraycopy result: " + Arrays.toString(destination));
    }
}`,
        output: `Sorted copy: [1, 2, 5, 7, 9]
Original unchanged: [5, 2, 9, 1, 7]
Index of 7: 3
Partial copy: [2, 9, 1]
System.arraycopy result: [5, 2, 9]`,
      },
    ],
    commonMistakes: [
      'Writing "int[] b = a;" expecting an independent copy — this only copies the reference, so both variables point to the same array.',
      'Calling Arrays.binarySearch on an array that was never sorted, which can return an incorrect index with no warning.',
      'Using == or .equals() to compare two arrays element-by-element, when only Arrays.equals()/deepEquals() actually compare contents.',
      'Printing a multidimensional array with Arrays.toString() instead of Arrays.deepToString(), producing reference strings for the inner arrays instead of their values.',
    ],
    keyPoints: [
      'Assigning one array variable to another copies the reference, not the data — the two variables share the same array.',
      'Arrays.copyOf and Arrays.copyOfRange create new arrays; System.arraycopy copies into an existing destination array.',
      'Arrays.sort must be called before Arrays.binarySearch, since binary search assumes sorted order.',
      'Use Arrays.toString for 1D arrays and Arrays.deepToString for nested/multidimensional arrays when printing.',
    ],
  },
}
