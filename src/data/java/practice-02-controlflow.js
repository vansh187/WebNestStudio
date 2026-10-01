// Practice blocks for the Control Flow and Arrays module. Merged onto the lesson
// entries in index.js by slug, so the lesson prose files stay unchanged.
export const practice02ControlFlow = {
  'java-if-else-statement': {
    whyItMatters: `Almost every business rule ends up as a condition: who gets a discount, which requests are allowed, what happens when a value is missing. The mistakes here are rarely syntax errors — they are conditions tested in the wrong order or an <code>else</code> attached to a different <code>if</code> than the indentation suggests — so the code runs and quietly gives the wrong answer.`,
    exercise: {
      prompt: `Write the ticket-price rule for a museum: children under 5 enter free, ages 5 to 17 pay 100, ages 18 to 59 pay 200, and anyone 60 or older pays 120.

Expected output: <code>0</code>, <code>100</code>, <code>200</code>, <code>120</code>, each on its own line.`,
      starterCode: `public class TicketPrice {

    static int priceFor(int age) {
        // TODO: return the price for this age
        return -1;
    }

    public static void main(String[] args) {
        System.out.println(priceFor(3));
        System.out.println(priceFor(12));
        System.out.println(priceFor(30));
        System.out.println(priceFor(65));
    }
}`,
      hints: [
        'Test the ranges in order, from the youngest upward, so each condition only needs one comparison.',
        'The last range needs no condition at all: it is the final <code>else</code>.',
      ],
      solution: `public class TicketPrice {

    static int priceFor(int age) {
        if (age < 5) {
            return 0;
        } else if (age < 18) {
            return 100;
        } else if (age < 60) {
            return 200;
        } else {
            return 120;
        }
    }

    public static void main(String[] args) {
        System.out.println(priceFor(3));
        System.out.println(priceFor(12));
        System.out.println(priceFor(30));
        System.out.println(priceFor(65));
    }
}`,
    },
    quiz: [
      {
        question: 'With <code>int x = 5;</code>, what does <code>if (x > 3) if (x > 10) System.out.print("A"); else System.out.print("B");</code> print?',
        options: ['A', 'B', 'Nothing', 'It does not compile'],
        answer: 1,
        explanation: 'An else always belongs to the nearest unmatched if, which is the inner one. x > 3 is true, x > 10 is false, so the else runs and prints B.',
      },
      {
        question: 'With <code>int x = 3;</code>, what happens with <code>if (x = 5) { ... }</code>?',
        options: ['The block runs', 'The block is skipped', 'It does not compile', 'It throws an exception'],
        answer: 2,
        explanation: 'x = 5 is an assignment whose value is an int. An if condition must be a boolean, so the compiler rejects it.',
      },
      {
        question: 'A ladder tests <code>score >= 60</code> first (grade D) and then <code>score >= 90</code> (grade A). What grade does a score of 95 get?',
        options: ['A', 'D', 'Both', 'Neither'],
        answer: 1,
        explanation: 'Only the first true branch of an if-else-if ladder runs. 95 >= 60 is true, so the A branch is never reached. Test the most specific condition first.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the dangling else problem?',
        answer: `When if statements are nested without braces, it can look as though an else belongs to the outer if when the compiler actually pairs it with the nearest unmatched inner if. Indentation has no effect on this. The fix is to always use braces, which makes the pairing explicit.`,
      },
      {
        question: 'When would you use the ternary operator instead of if-else?',
        answer: `When you are choosing between two values, not two actions. <code>String label = count == 1 ? "item" : "items";</code> is clearer than a four-line if-else. For anything with side effects, several statements, or more than one level of nesting, a normal if-else is easier to read and debug.`,
      },
    ],
  },

  'java-switch-statement': {
    whyItMatters: `A switch states "pick one of these fixed cases" more clearly than a long if-else-if ladder, and the modern form lets the compiler check that you covered every case. The classic form has one famous trap — a forgotten <code>break</code> — that has caused real production bugs, which is why interviewers ask about fall-through so often.`,
    exercise: {
      prompt: `Write a method that returns the number of days in a month (ignoring leap years) using a switch expression with arrow syntax. February has 28 days; April, June, September and November have 30; all others have 31.

Expected output: <code>28</code>, <code>30</code>, <code>31</code>, each on its own line. This needs Java 14 or newer.`,
      starterCode: `public class DaysInMonth {

    static int daysIn(int month) {
        // TODO: return the number of days using a switch expression
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(daysIn(2));
        System.out.println(daysIn(4));
        System.out.println(daysIn(1));
    }
}`,
      hints: [
        'One case label can list several values separated by commas: <code>case 4, 6, 9, 11 -></code>.',
        'A switch expression produces a value, so you can write <code>return switch (month) { ... };</code>.',
      ],
      solution: `public class DaysInMonth {

    static int daysIn(int month) {
        return switch (month) {
            case 2 -> 28;
            case 4, 6, 9, 11 -> 30;
            default -> 31;
        };
    }

    public static void main(String[] args) {
        System.out.println(daysIn(2));
        System.out.println(daysIn(4));
        System.out.println(daysIn(1));
    }
}`,
    },
    quiz: [
      {
        question: 'In a classic switch, what happens when a matching case has no <code>break</code>?',
        options: ['The switch ends', 'Execution continues into the next case', 'The code does not compile', 'The default case runs instead'],
        answer: 1,
        explanation: 'Without break, execution falls through into the following case labels until it meets a break or the end of the switch.',
      },
      {
        question: 'Which type can NOT be used as the selector of a classic switch?',
        options: ['int', 'String', 'long', 'An enum'],
        answer: 2,
        explanation: 'A classic switch accepts byte, short, char, int, their wrappers, String and enums. long, float, double and boolean are not allowed.',
      },
      {
        question: 'A switch expression over an enum has no default and misses one constant. What happens?',
        options: ['It returns null for the missing constant', 'It throws an exception at runtime', 'It does not compile', 'It returns 0'],
        answer: 2,
        explanation: 'A switch expression must be exhaustive. With an enum, the compiler reports an error if a constant is not covered and there is no default.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a switch statement and a switch expression?',
        answer: `A switch statement only performs actions and, in its classic colon form, falls through unless you write break. A switch expression (standard since Java 14) produces a value, so it can be assigned or returned.

With arrow labels there is no fall-through, a case can list several values, and the expression must be exhaustive, so the compiler tells you when a case is missing.`,
      },
      {
        question: 'How does a switch on a String compare values, and what happens if the String is null?',
        answer: `It compares using the string's content, as <code>equals()</code> would, and it is case-sensitive: "yes" does not match "YES". If the selector is null, the switch throws a <code>NullPointerException</code>, so check for null before switching on a value that might be missing.`,
      },
    ],
  },

  'java-for-loop': {
    whyItMatters: `The for loop is the standard way to repeat work a known number of times, and its three parts run in an order that is easy to get slightly wrong. Off-by-one errors — looping once too many or once too few — are among the most common bugs in any language, and they come from misreading exactly when the condition is checked and when the update happens.`,
    diagram: {
      caption: 'The order a for loop runs in: initialise once, then check, run the body, update, and check again.',
      svg: `<svg viewBox="0 0 640 170" role="img" aria-label="For loop flow: initialisation, then condition; if true run the body, then the update, then back to the condition; if false exit" class="mx-auto h-auto w-full max-w-2xl" fill="none" stroke="currentColor" stroke-width="1.5" font-family="ui-monospace, monospace" font-size="13">
  <rect x="10" y="30" width="110" height="44" rx="6"/>
  <text x="65" y="50" text-anchor="middle" fill="currentColor" stroke="none">init</text>
  <text x="65" y="66" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">int i = 0</text>
  <path d="M120 52 H160"/><path d="M154 46 L160 52 L154 58"/>
  <rect x="160" y="30" width="120" height="44" rx="6" stroke-width="3"/>
  <text x="220" y="50" text-anchor="middle" fill="currentColor" stroke="none">condition</text>
  <text x="220" y="66" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">i &lt; 5 ?</text>
  <path d="M280 52 H330"/><path d="M324 46 L330 52 L324 58"/>
  <text x="305" y="44" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">true</text>
  <rect x="330" y="30" width="110" height="44" rx="6"/>
  <text x="385" y="57" text-anchor="middle" fill="currentColor" stroke="none">body</text>
  <path d="M440 52 H490"/><path d="M484 46 L490 52 L484 58"/>
  <rect x="490" y="30" width="110" height="44" rx="6"/>
  <text x="545" y="50" text-anchor="middle" fill="currentColor" stroke="none">update</text>
  <text x="545" y="66" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">i++</text>
  <path d="M545 74 V120 H220 V74"/><path d="M214 80 L220 74 L226 80"/>
  <path d="M190 74 V150 H120"/><path d="M126 144 L120 150 L126 156"/>
  <text x="150" y="142" text-anchor="middle" fill="currentColor" stroke="none" font-size="11">false</text>
  <text x="80" y="154" text-anchor="middle" fill="currentColor" stroke="none">exit</text>
</svg>`,
    },
    exercise: {
      prompt: `Use a for loop to add up all the even numbers from 2 to 100 inclusive and print the total.

Expected output: <code>2550</code>`,
      starterCode: `public class SumOfEvens {
    public static void main(String[] args) {
        int sum = 0;

        // TODO: loop over the even numbers from 2 to 100 and add each to sum

        System.out.println(sum);
    }
}`,
      hints: [
        'The update expression does not have to be <code>i++</code>; <code>i += 2</code> steps through even numbers directly.',
        'Use <code>&lt;=</code> so that 100 itself is included.',
      ],
      solution: `public class SumOfEvens {
    public static void main(String[] args) {
        int sum = 0;

        for (int i = 2; i <= 100; i += 2) {
            sum += i;
        }

        System.out.println(sum); // 2550
    }
}`,
    },
    quiz: [
      {
        question: 'How many times does the body of <code>for (int i = 0; i < 5; i++)</code> run?',
        options: ['4', '5', '6', 'It never stops'],
        answer: 1,
        explanation: 'i takes the values 0, 1, 2, 3 and 4. When i becomes 5 the condition is false and the loop ends.',
      },
      {
        question: 'What happens with <code>for (int i = 0; i < 3; i++) { } System.out.println(i);</code>?',
        options: ['It prints 3', 'It prints 2', 'It does not compile', 'It prints 0'],
        answer: 2,
        explanation: 'A variable declared in the for header exists only inside the loop. Using i after the loop is a compile error.',
      },
      {
        question: 'What does <code>for (;;) { }</code> do?',
        options: ['It does not compile', 'It runs once', 'It runs forever', 'It never runs'],
        answer: 2,
        explanation: 'All three parts are optional. A missing condition is treated as true, so this is an infinite loop.',
      },
    ],
    interviewQuestions: [
      {
        question: 'In what order do the parts of a for loop execute?',
        answer: `The initialisation runs once. Then the condition is checked; if it is true the body runs, then the update expression runs, and the condition is checked again. As soon as the condition is false the loop ends.

Two consequences: the body may run zero times, and the update runs after the body, not before it.`,
      },
      {
        question: 'Is there any difference between i++ and ++i in the update part of a for loop?',
        answer: `Not in the result. The update expression's value is discarded, so both simply add one to i. The difference between prefix and postfix only matters when the value of the expression is used, as in <code>int x = i++;</code>.`,
      },
    ],
  },

  'java-while-and-do-while-loop': {
    whyItMatters: `Not every loop has a count known in advance. Reading until input ends, retrying until a call succeeds and processing a number digit by digit all depend on a condition, and that is what <code>while</code> and <code>do-while</code> are for. Choosing between them comes down to one question: must the body run at least once?`,
    exercise: {
      prompt: `Count how many digits a whole number has by repeatedly dividing it by 10. Make sure the answer for <code>0</code> is 1, not 0.

Expected output: <code>5</code> for 90210, then <code>1</code> for 0.`,
      starterCode: `public class DigitCount {

    static int countDigits(int n) {
        int count = 0;
        // TODO: divide n by 10 until nothing is left, counting each step
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countDigits(90210));
        System.out.println(countDigits(0));
    }
}`,
      hints: [
        'Each integer division by 10 removes the last digit: 90210 / 10 is 9021.',
        'A plain while loop would not run at all for 0. A do-while runs the body once before checking.',
      ],
      solution: `public class DigitCount {

    static int countDigits(int n) {
        int count = 0;
        do {
            count++;
            n /= 10;
        } while (n != 0);
        return count;
    }

    public static void main(String[] args) {
        System.out.println(countDigits(90210)); // 5
        System.out.println(countDigits(0));     // 1
    }
}`,
    },
    quiz: [
      {
        question: 'What is the minimum number of times a do-while body runs?',
        options: ['0', '1', '2', 'It depends on the condition'],
        answer: 1,
        explanation: 'The condition is checked after the body, so the body always runs at least once.',
      },
      {
        question: 'With <code>int i = 5;</code>, how many times does the body of <code>while (i < 5) { ... }</code> run?',
        options: ['0', '1', '5', 'Forever'],
        answer: 0,
        explanation: 'A while loop checks the condition first. 5 < 5 is false, so the body never runs.',
      },
      {
        question: 'With <code>int i = 0;</code>, what does <code>while (i < 3); { i++; }</code> do?',
        options: ['Runs the block three times', 'Runs the block once', 'Loops forever', 'Does not compile'],
        answer: 2,
        explanation: 'The semicolon after the condition is an empty loop body. i never changes inside that loop, so it never ends, and the block is never reached.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between while and do-while?',
        answer: `<code>while</code> checks its condition before each iteration, so the body can run zero times. <code>do-while</code> checks after each iteration, so the body runs at least once. Use do-while when the first pass must happen regardless, such as showing a menu before asking whether to continue.`,
      },
      {
        question: 'When would you choose a while loop over a for loop?',
        answer: `When the number of iterations is not known in advance and the loop is driven by a condition rather than a counter: reading until there is no more input, or retrying until an operation succeeds. When there is a clear counter with a start, an end and a step, a for loop keeps those three parts together and is harder to get wrong.`,
      },
    ],
  },

  'java-for-each-loop': {
    whyItMatters: `The for-each loop removes the index, and with it a whole category of off-by-one mistakes, so it is the default way to read every element of an array or collection. Knowing its limits matters just as much: it cannot change which element an array holds, and removing from a collection inside one throws an exception that surprises most developers the first time.`,
    exercise: {
      prompt: `Find the largest value in an array using a for-each loop, without using any library method.

Expected output: <code>89</code>`,
      starterCode: `public class LargestValue {
    public static void main(String[] args) {
        int[] scores = {12, 45, 7, 89, 23};

        // TODO: find the largest value with a for-each loop

        System.out.println(largest);
    }
}`,
      hints: [
        'Start by assuming the first element is the largest, then compare every element against it.',
        'The loop reads as "for each score in scores": <code>for (int score : scores)</code>.',
      ],
      solution: `public class LargestValue {
    public static void main(String[] args) {
        int[] scores = {12, 45, 7, 89, 23};

        int largest = scores[0];
        for (int score : scores) {
            if (score > largest) {
                largest = score;
            }
        }

        System.out.println(largest); // 89
    }
}`,
    },
    quiz: [
      {
        question: 'Given <code>int[] nums = {1, 2, 3};</code>, what does the array contain after <code>for (int n : nums) { n = n * 2; }</code>?',
        options: ['{2, 4, 6}', '{1, 2, 3}', '{0, 0, 0}', 'It does not compile'],
        answer: 1,
        explanation: 'n is a copy of each element. Assigning to it changes only the local variable, not the array.',
      },
      {
        question: 'What happens when you call <code>list.remove(item)</code> on an ArrayList inside a for-each loop over that same list?',
        options: ['The item is removed safely', 'It usually throws ConcurrentModificationException', 'It does not compile', 'The loop restarts'],
        answer: 1,
        explanation: 'The loop uses an iterator that detects the list was changed behind its back and throws ConcurrentModificationException. Use Iterator.remove() or removeIf() instead.',
      },
      {
        question: 'What must your own class implement to be usable in a for-each loop?',
        options: ['Comparable', 'Iterable', 'Serializable', 'Cloneable'],
        answer: 1,
        explanation: 'for-each works on arrays and on any object that implements Iterable, which supplies an Iterator.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the limitations of the for-each loop?',
        answer: `You have no index, so you cannot easily tell the position of an element, iterate backwards, skip elements, or walk two arrays in step. You cannot replace an element of an array through the loop variable, and you cannot safely remove from the collection you are iterating. When any of those is needed, use an indexed for loop or an explicit Iterator.`,
      },
      {
        question: 'How does the for-each loop work internally?',
        answer: `It is compiler shorthand. For an array, the compiler generates an ordinary indexed loop from 0 to length. For anything else, it calls <code>iterator()</code> on the Iterable and loops with <code>hasNext()</code> and <code>next()</code>. That hidden iterator is why modifying a collection inside the loop is detected.`,
      },
    ],
  },

  'java-break-and-continue': {
    whyItMatters: `<code>break</code> and <code>continue</code> let a loop stop or skip as soon as the answer is known, instead of running to the end and tracking extra flags. Used well they make search and filter loops shorter; used carelessly, especially in nested loops, they hide the path the code takes — so it pays to know exactly which loop each one affects.`,
    exercise: {
      prompt: `Find the first number between 1 and 200 that is divisible by both 7 and 9, and stop searching as soon as you find it.

Expected output: <code>63</code>`,
      starterCode: `public class FirstCommonMultiple {
    public static void main(String[] args) {
        int found = -1;

        for (int i = 1; i <= 200; i++) {
            // TODO: when i is divisible by 7 and by 9, store it and stop the loop
        }

        System.out.println(found);
    }
}`,
      hints: [
        'A number is divisible by 7 when <code>i % 7 == 0</code>.',
        'Without <code>break</code> the loop would keep going and overwrite <code>found</code> with 126 and then 189.',
      ],
      solution: `public class FirstCommonMultiple {
    public static void main(String[] args) {
        int found = -1;

        for (int i = 1; i <= 200; i++) {
            if (i % 7 == 0 && i % 9 == 0) {
                found = i;
                break;
            }
        }

        System.out.println(found); // 63
    }
}`,
    },
    quiz: [
      {
        question: 'A <code>break</code> appears inside the inner of two nested loops, with no label. Which loop does it end?',
        options: ['Both loops', 'Only the inner loop', 'Only the outer loop', 'The whole method'],
        answer: 1,
        explanation: 'An unlabelled break ends only the innermost loop (or switch) that contains it. The outer loop carries on.',
      },
      {
        question: 'In a for loop, where does execution go after <code>continue</code>?',
        options: ['To the statement after the loop', 'Back to the initialisation', 'To the update expression, then the condition', 'To the start of the method'],
        answer: 2,
        explanation: 'continue skips the rest of the body. In a for loop the update expression still runs before the condition is checked again.',
      },
      {
        question: 'What does this print? <code>for (int i = 1; i <= 5; i++) { if (i == 3) continue; System.out.print(i + " "); }</code>',
        options: ['1 2', '1 2 3 4 5', '1 2 4 5', '3'],
        answer: 2,
        explanation: 'When i is 3, continue skips the print for that iteration only. The loop then carries on with 4 and 5.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a labelled break and when would you use one?',
        answer: `A label is a name placed before a loop, such as <code>outer:</code>. <code>break outer;</code> ends that named loop even from inside a nested one. It is useful for leaving several levels at once — for example, stopping a search through a 2D array the moment the value is found — without an extra boolean flag.`,
      },
      {
        question: 'What is the difference between break and return inside a loop?',
        answer: `<code>break</code> ends the loop, and execution continues with the statement after it in the same method. <code>return</code> ends the whole method immediately, so nothing after the loop runs either (apart from a finally block).`,
      },
    ],
  },

  'java-arrays': {
    whyItMatters: `Arrays are the simplest way to hold many values of the same type, and they sit underneath most of the collections you will use later, including ArrayList. Their two fixed rules — the size never changes, and indexes run from 0 to length minus 1 — explain both why they are fast and why <code>ArrayIndexOutOfBoundsException</code> is one of the first exceptions every Java developer meets.`,
    complexity: [
      { operation: 'Read or write by index', average: 'O(1)', worst: 'O(1)' },
      { operation: 'Search an unsorted array', average: 'O(n)', worst: 'O(n)' },
    ],
    exercise: {
      prompt: `Reverse an array in place, without creating a second array, by swapping elements from the two ends towards the middle.

Expected output: <code>[5, 4, 3, 2, 1]</code>`,
      starterCode: `import java.util.Arrays;

public class ReverseArray {
    public static void main(String[] args) {
        int[] values = {1, 2, 3, 4, 5};

        // TODO: swap values[left] and values[right], moving both towards the middle

        System.out.println(Arrays.toString(values));
    }
}`,
      hints: [
        'Use two indexes: <code>left</code> starting at 0 and <code>right</code> starting at <code>values.length - 1</code>.',
        'A swap needs a temporary variable to hold one of the two values.',
      ],
      solution: `import java.util.Arrays;

public class ReverseArray {
    public static void main(String[] args) {
        int[] values = {1, 2, 3, 4, 5};

        for (int left = 0, right = values.length - 1; left < right; left++, right--) {
            int temp = values[left];
            values[left] = values[right];
            values[right] = temp;
        }

        System.out.println(Arrays.toString(values)); // [5, 4, 3, 2, 1]
    }
}`,
    },
    quiz: [
      {
        question: 'What does each element of <code>new int[3]</code> contain?',
        options: ['null', '0', 'A random value', 'Nothing until assigned'],
        answer: 1,
        explanation: 'Array elements are always initialised to defaults: 0 for numeric types, false for boolean and null for references.',
      },
      {
        question: 'What happens when you read <code>arr[arr.length]</code>?',
        options: ['It returns the last element', 'It returns 0', 'It throws ArrayIndexOutOfBoundsException', 'It does not compile'],
        answer: 2,
        explanation: 'Valid indexes run from 0 to length - 1. Index length is one past the end, so the access throws at runtime.',
      },
      {
        question: 'How do you get the number of elements in an array called <code>arr</code>?',
        options: ['arr.length()', 'arr.size()', 'arr.length', 'arr.count'],
        answer: 2,
        explanation: 'length is a field on arrays, with no parentheses. String uses the method length(), and collections use size().',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between an array and an ArrayList?',
        answer: `An array has a fixed size set when it is created, can hold primitives or objects, and uses <code>arr[i]</code> and <code>arr.length</code>. An ArrayList grows and shrinks as needed, holds only objects (primitives are boxed), and offers methods such as <code>add</code>, <code>remove</code> and <code>size()</code>.

Internally an ArrayList is backed by an array that it replaces with a larger one when it fills up.`,
      },
      {
        question: 'Are arrays objects in Java?',
        answer: `Yes. Every array is an object created on the heap, even an array of primitives. An array variable holds a reference, so assigning one array variable to another copies the reference, not the elements, and both names then refer to the same array.`,
      },
    ],
  },

  'java-multidimensional-arrays': {
    whyItMatters: `Grids, tables, game boards and matrices are naturally two-dimensional. Java does not have true 2D arrays; it has arrays whose elements are themselves arrays. Understanding that explains why rows can have different lengths, why <code>a.length</code> and <code>a[0].length</code> are different numbers, and why a row can be null.`,
    diagram: {
      caption: 'A 2D array is an array of references, each pointing to its own row. Rows may have different lengths (a jagged array).',
      svg: `<svg viewBox="0 0 640 190" role="img" aria-label="An outer array of three references, each pointing to a separate row array of length 3, 1 and 2" class="mx-auto h-auto w-full max-w-2xl" fill="none" stroke="currentColor" stroke-width="1.5" font-family="ui-monospace, monospace" font-size="13">
  <text x="60" y="20" text-anchor="middle" fill="currentColor" stroke="none">grid</text>
  <rect x="20" y="30" width="80" height="40"/><text x="60" y="55" text-anchor="middle" fill="currentColor" stroke="none">grid[0]</text>
  <rect x="20" y="70" width="80" height="40"/><text x="60" y="95" text-anchor="middle" fill="currentColor" stroke="none">grid[1]</text>
  <rect x="20" y="110" width="80" height="40"/><text x="60" y="135" text-anchor="middle" fill="currentColor" stroke="none">grid[2]</text>
  <path d="M100 50 H200"/><path d="M194 44 L200 50 L194 56"/>
  <path d="M100 90 H200"/><path d="M194 84 L200 90 L194 96"/>
  <path d="M100 130 H200"/><path d="M194 124 L200 130 L194 136"/>
  <rect x="200" y="32" width="50" height="36"/><text x="225" y="55" text-anchor="middle" fill="currentColor" stroke="none">1</text>
  <rect x="250" y="32" width="50" height="36"/><text x="275" y="55" text-anchor="middle" fill="currentColor" stroke="none">2</text>
  <rect x="300" y="32" width="50" height="36"/><text x="325" y="55" text-anchor="middle" fill="currentColor" stroke="none">3</text>
  <rect x="200" y="72" width="50" height="36"/><text x="225" y="95" text-anchor="middle" fill="currentColor" stroke="none">4</text>
  <rect x="200" y="112" width="50" height="36"/><text x="225" y="135" text-anchor="middle" fill="currentColor" stroke="none">5</text>
  <rect x="250" y="112" width="50" height="36"/><text x="275" y="135" text-anchor="middle" fill="currentColor" stroke="none">6</text>
  <text x="380" y="55" fill="currentColor" stroke="none" font-size="12">grid[0].length = 3</text>
  <text x="380" y="95" fill="currentColor" stroke="none" font-size="12">grid[1].length = 1</text>
  <text x="380" y="135" fill="currentColor" stroke="none" font-size="12">grid[2].length = 2</text>
  <text x="20" y="178" fill="currentColor" stroke="none" font-size="12">grid.length = 3 (number of rows)</text>
</svg>`,
    },
    exercise: {
      prompt: `Add up the main diagonal of a square matrix — the elements where the row index equals the column index.

Expected output: <code>15</code> (1 + 5 + 9)`,
      starterCode: `public class DiagonalSum {
    public static void main(String[] args) {
        int[][] matrix = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };

        int sum = 0;
        // TODO: add matrix[0][0], matrix[1][1], matrix[2][2] using a loop

        System.out.println(sum);
    }
}`,
      hints: [
        'On the main diagonal the row and column index are the same, so one loop variable is enough.',
        '<code>matrix.length</code> gives the number of rows.',
      ],
      solution: `public class DiagonalSum {
    public static void main(String[] args) {
        int[][] matrix = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };

        int sum = 0;
        for (int i = 0; i < matrix.length; i++) {
            sum += matrix[i][i];
        }

        System.out.println(sum); // 15
    }
}`,
    },
    quiz: [
      {
        question: 'After <code>int[][] a = new int[3][4];</code>, what is <code>a.length</code>?',
        options: ['3', '4', '12', '7'],
        answer: 0,
        explanation: 'a.length is the size of the outer array, which is the number of rows: 3.',
      },
      {
        question: 'For the same array, what is <code>a[0].length</code>?',
        options: ['3', '4', '12', '0'],
        answer: 1,
        explanation: 'a[0] is the first row, itself an array of 4 ints.',
      },
      {
        question: 'Is <code>int[][] a = new int[3][];</code> valid?',
        options: ['No, both sizes are required', 'Yes, and each row is an empty array', 'Yes, and each row is null until you create it', 'Only for jagged arrays of Strings'],
        answer: 2,
        explanation: 'Only the first dimension is required. The three row references start as null, and you create each row separately, possibly with different lengths.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is a jagged array?',
        answer: `A two-dimensional array whose rows have different lengths. It is possible in Java because a 2D array is really an array of separate row arrays. You create the outer array first and then assign each row with whatever length you need, which saves space when the data is not rectangular.`,
      },
      {
        question: 'How is a 2D array stored in memory in Java?',
        answer: `As an array of references, where each reference points to another array object holding one row. The rows are separate objects on the heap and need not be next to each other. This differs from C, where a 2D array is one continuous block of memory.`,
      },
    ],
  },

  'java-arrays-class-and-copying-arrays': {
    whyItMatters: `Printing, comparing, sorting and copying arrays all behave differently from what newcomers expect: <code>println</code> prints something like <code>[I@1b6d3586</code>, <code>==</code> compares references, and <code>=</code> does not copy. The <code>java.util.Arrays</code> class provides the correct tool for each, and knowing them saves writing loops that the standard library already does well.`,
    complexity: [
      { operation: 'Arrays.sort', average: 'O(n log n)', worst: 'O(n log n) for objects; O(n²) is possible in theory for primitives' },
      { operation: 'Arrays.binarySearch (sorted array)', average: 'O(log n)', worst: 'O(log n)' },
      { operation: 'Arrays.copyOf, Arrays.equals, Arrays.toString', average: 'O(n)', worst: 'O(n)' },
    ],
    exercise: {
      prompt: `Produce a sorted copy of an array while leaving the original untouched, then print both.

Expected output: <code>Original: [5, 3, 9, 1]</code> then <code>Sorted: [1, 3, 5, 9]</code>`,
      starterCode: `import java.util.Arrays;

public class SortedCopy {
    public static void main(String[] args) {
        int[] original = {5, 3, 9, 1};

        // TODO: create a real copy of original, then sort only the copy

        System.out.println("Original: " + Arrays.toString(original));
        System.out.println("Sorted: " + Arrays.toString(sorted));
    }
}`,
      hints: [
        '<code>int[] sorted = original;</code> does not copy anything — both names would refer to the same array.',
        '<code>Arrays.copyOf(original, original.length)</code> creates a new array with the same contents.',
      ],
      solution: `import java.util.Arrays;

public class SortedCopy {
    public static void main(String[] args) {
        int[] original = {5, 3, 9, 1};

        int[] sorted = Arrays.copyOf(original, original.length);
        Arrays.sort(sorted);

        System.out.println("Original: " + Arrays.toString(original));
        System.out.println("Sorted: " + Arrays.toString(sorted));
    }
}`,
    },
    quiz: [
      {
        question: 'What does <code>System.out.println(arr)</code> print for an <code>int[]</code>?',
        options: ['The elements in square brackets', 'The elements separated by spaces', 'A type code and hash such as [I@1b6d3586', 'The length of the array'],
        answer: 2,
        explanation: 'Arrays do not override toString(), so you get the type and identity hash. Use Arrays.toString(arr) to print the elements.',
      },
      {
        question: 'What must be true of an array before calling <code>Arrays.binarySearch</code> on it?',
        options: ['It must contain no duplicates', 'It must be sorted', 'It must hold objects, not primitives', 'It must have an even length'],
        answer: 1,
        explanation: 'Binary search halves a sorted range at each step. On an unsorted array the result is undefined.',
      },
      {
        question: 'After <code>int[] b = a; b[0] = 99;</code>, what is <code>a[0]</code>?',
        options: ['Its original value', '99', '0', 'It does not compile'],
        answer: 1,
        explanation: 'b = a copies the reference, not the array. Both variables refer to the same array, so the change is visible through a.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between a shallow copy and a deep copy of an array?',
        answer: `A shallow copy creates a new array but copies the element values as they are. For an array of primitives that is a full copy. For an array of objects, or a 2D array, the new array holds the same references, so both arrays share the underlying objects or rows.

<code>clone()</code>, <code>Arrays.copyOf</code> and <code>System.arraycopy</code> are all shallow. A deep copy has to copy each row or object as well.`,
      },
      {
        question: 'How do you compare two arrays for equal content?',
        answer: `Use <code>Arrays.equals(a, b)</code>, which checks length and compares element by element. <code>a == b</code> and <code>a.equals(b)</code> both compare references, so they are only true when both variables refer to the same array. For nested arrays use <code>Arrays.deepEquals</code>.`,
      },
    ],
  },

  'java-recursion': {
    whyItMatters: `Some problems are defined in terms of smaller versions of themselves: walking a folder tree, traversing a nested structure, dividing a list in half. Recursion expresses those directly. It is also a favourite interview topic because it tests whether you can reason about the call stack — and because a missing base case fails in a very recognisable way.`,
    exercise: {
      prompt: `Write a recursive method that returns the sum of the digits of a non-negative number. Do not use a loop.

Expected output: <code>19</code> for 4096 (4 + 0 + 9 + 6), then <code>7</code> for 7.`,
      starterCode: `public class DigitSum {

    static int sumDigits(int n) {
        // TODO: base case - a single digit is its own sum
        // TODO: recursive case - last digit plus the sum of the remaining digits
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(sumDigits(4096));
        System.out.println(sumDigits(7));
    }
}`,
      hints: [
        '<code>n % 10</code> is the last digit and <code>n / 10</code> is the number without it.',
        'The base case is when <code>n</code> is less than 10.',
      ],
      solution: `public class DigitSum {

    static int sumDigits(int n) {
        if (n < 10) {
            return n;
        }
        return n % 10 + sumDigits(n / 10);
    }

    public static void main(String[] args) {
        System.out.println(sumDigits(4096)); // 19
        System.out.println(sumDigits(7));    // 7
    }
}`,
    },
    quiz: [
      {
        question: 'What stops a recursive method from calling itself forever?',
        options: ['The return type', 'A base case that returns without recursing', 'The static keyword', 'The garbage collector'],
        answer: 1,
        explanation: 'The base case handles the smallest input directly. Every recursive call must move towards it.',
      },
      {
        question: 'A method computes n! recursively as n * factorial(n - 1), with factorial(1) returning 1. What does <code>factorial(4)</code> return?',
        options: ['10', '16', '24', '4'],
        answer: 2,
        explanation: '4 * 3 * 2 * 1 = 24. The multiplications happen as the calls return, from the base case back up.',
      },
      {
        question: 'What happens when a recursive method has no base case?',
        options: ['It returns 0', 'It loops forever without error', 'It throws StackOverflowError', 'It does not compile'],
        answer: 2,
        explanation: 'Each call adds a frame to the call stack. With nothing to stop it, the stack fills up and the JVM throws StackOverflowError.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What are the trade-offs between recursion and iteration?',
        answer: `Recursion often matches the shape of the problem and gives shorter, clearer code for trees and divide-and-conquer algorithms. Its cost is one stack frame per call, so deep recursion uses more memory and can overflow the stack.

Iteration uses constant stack space and is usually a little faster, but may need an explicit stack or extra variables to track state that recursion keeps for you.`,
      },
      {
        question: 'Does Java optimise tail recursion?',
        answer: `No. The Java compiler and the standard JVM do not perform tail-call elimination, so a tail-recursive method still uses one stack frame per call and can still throw StackOverflowError on deep input. If depth is a concern in Java, rewrite the method as a loop.`,
      },
    ],
  },
}
