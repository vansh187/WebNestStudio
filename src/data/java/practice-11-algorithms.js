// Practice blocks for the Algorithms and Internationalization module. Merged onto the
// lesson entries in index.js by slug, so the lesson prose files stay unchanged.
export const practice11Algorithms = {
  'searching-algorithms-in-java-linear-search-and-binary-search': {
    whyItMatters: `Binary search is the standard example of an algorithm that is fast because it throws away half of the remaining data at every step, and the same idea is behind database indexes and sorted collections. It is also one of the most frequently asked coding questions, and it is easy to get wrong by one position, so it is worth writing by hand until it is automatic.`,
    complexity: [
      { operation: 'Linear search', average: 'O(n)', worst: 'O(n)' },
      { operation: 'Binary search (sorted data)', average: 'O(log n)', worst: 'O(log n)' },
    ],
    exercise: {
      prompt: `Implement binary search on a sorted array. Return the index of the target, or <code>-1</code> if it is not present.

Expected output: <code>4</code> then <code>-1</code>`,
      starterCode: `public class BinarySearchPractice {

    static int binarySearch(int[] sorted, int target) {
        int low = 0;
        int high = sorted.length - 1;

        // TODO: while the range is not empty, compare the middle element with the target
        //       and continue in the left or the right half

        return -1;
    }

    public static void main(String[] args) {
        int[] numbers = {2, 5, 8, 12, 16, 23, 38};

        System.out.println(binarySearch(numbers, 16));
        System.out.println(binarySearch(numbers, 7));
    }
}`,
      hints: [
        'The loop runs while <code>low &lt;= high</code>. Compute the middle as <code>low + (high - low) / 2</code>.',
        'If the middle element is smaller than the target, set <code>low = mid + 1</code>; if larger, set <code>high = mid - 1</code>.',
      ],
      solution: `public class BinarySearchPractice {

    static int binarySearch(int[] sorted, int target) {
        int low = 0;
        int high = sorted.length - 1;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (sorted[mid] == target) {
                return mid;
            } else if (sorted[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }

        return -1;
    }

    public static void main(String[] args) {
        int[] numbers = {2, 5, 8, 12, 16, 23, 38};

        System.out.println(binarySearch(numbers, 16)); // 4
        System.out.println(binarySearch(numbers, 7));  // -1
    }
}`,
    },
    quiz: [
      {
        question: 'What must be true of an array before binary search can be used on it?',
        options: ['It must be sorted', 'It must have an even length', 'It must contain no duplicates', 'It must contain only positive numbers'],
        answer: 0,
        explanation: 'Discarding half the range is only valid when the elements are in order.',
      },
      {
        question: 'About how many comparisons does binary search need, at most, for 1,000,000 sorted elements?',
        options: ['1,000', '20', '500,000', '1,000,000'],
        answer: 1,
        explanation: 'Each step halves the range, and 2 to the power 20 is just over one million.',
      },
      {
        question: 'When is linear search the right choice?',
        options: ['Never', 'When the data is sorted and large', 'When the data is unsorted or very small', 'Only for strings'],
        answer: 2,
        explanation: 'Sorting first costs more than one linear scan, so binary search pays off only when the data is already sorted or searched many times.',
      },
    ],
    interviewQuestions: [
      {
        question: 'Why is the middle computed as low + (high - low) / 2 and not (low + high) / 2?',
        answer: `For very large arrays, <code>low + high</code> can exceed the largest <code>int</code> value and overflow to a negative number, which then gives a negative index. <code>low + (high - low) / 2</code> gives the same result without the sum ever exceeding <code>high</code>.`,
      },
      {
        question: 'What does Arrays.binarySearch() return when the value is not found?',
        answer: `It returns a negative number equal to <code>-(insertion point) - 1</code>, where the insertion point is the index at which the value would be inserted to keep the array sorted. Any negative result means "not found", and the insertion point can be recovered from it. The array must be sorted beforehand, or the result is undefined.`,
      },
    ],
  },

  'sorting-algorithms-in-java-bubble-selection-insertion-and-merge-sort': {
    whyItMatters: `In real code you call <code>Arrays.sort</code> or <code>Collections.sort</code> and never write a sort yourself. These algorithms are taught because they are the clearest way to learn how to analyse the cost of code, and because interviewers use them to see whether you can reason about loops, swaps and recursion.`,
    complexity: [
      { operation: 'Bubble sort', average: 'O(n²)', worst: 'O(n²)' },
      { operation: 'Selection sort', average: 'O(n²)', worst: 'O(n²)' },
      { operation: 'Insertion sort', average: 'O(n²)', worst: 'O(n²)' },
      { operation: 'Merge sort', average: 'O(n log n)', worst: 'O(n log n)' },
    ],
    exercise: {
      prompt: `Implement insertion sort. For each element, starting from the second, shift the larger elements before it one place to the right and put the element into the gap.

Expected output: <code>[1, 2, 5, 8, 9]</code>`,
      starterCode: `import java.util.Arrays;

public class InsertionSortPractice {

    static void insertionSort(int[] values) {
        for (int i = 1; i < values.length; i++) {
            int current = values[i];
            // TODO: shift elements larger than current one place to the right
            // TODO: place current in the gap that is left
        }
    }

    public static void main(String[] args) {
        int[] numbers = {5, 2, 9, 1, 8};
        insertionSort(numbers);
        System.out.println(Arrays.toString(numbers));
    }
}`,
      hints: [
        'Start with <code>int j = i - 1</code> and move left while <code>j &gt;= 0</code> and <code>values[j] &gt; current</code>.',
        'Inside the loop, copy <code>values[j]</code> into <code>values[j + 1]</code>. After the loop, the gap is at <code>j + 1</code>.',
      ],
      solution: `import java.util.Arrays;

public class InsertionSortPractice {

    static void insertionSort(int[] values) {
        for (int i = 1; i < values.length; i++) {
            int current = values[i];
            int j = i - 1;
            while (j >= 0 && values[j] > current) {
                values[j + 1] = values[j]; // shift right
                j--;
            }
            values[j + 1] = current;
        }
    }

    public static void main(String[] args) {
        int[] numbers = {5, 2, 9, 1, 8};
        insertionSort(numbers);
        System.out.println(Arrays.toString(numbers)); // [1, 2, 5, 8, 9]
    }
}`,
    },
    quiz: [
      {
        question: 'Which of these sorts runs in O(n log n) in the worst case?',
        options: ['Bubble sort', 'Selection sort', 'Insertion sort', 'Merge sort'],
        answer: 3,
        explanation: 'Merge sort always splits in half and merges in linear time, whatever the input.',
      },
      {
        question: 'How does insertion sort perform on an array that is already sorted?',
        options: ['O(n)', 'O(n²)', 'O(n log n)', 'O(1)'],
        answer: 0,
        explanation: 'No element needs to be shifted, so it makes one pass with one comparison per element.',
      },
      {
        question: 'What is the main cost of merge sort compared with the simple sorts?',
        options: ['It is slower on large inputs', 'It needs O(n) extra memory for merging', 'It only works on numbers', 'It is not stable'],
        answer: 1,
        explanation: 'The simple sorts work inside the array. Merge sort copies elements into temporary arrays.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What does it mean for a sorting algorithm to be stable?',
        answer: `A stable sort keeps elements that compare as equal in their original order. This matters when sorting objects by one field after another: sorting by name and then stably by department leaves each department sorted by name. Bubble, insertion and merge sort are stable; selection sort, in its usual form, is not.`,
      },
      {
        question: 'Which algorithm does Arrays.sort() use?',
        answer: `For arrays of primitives it uses a dual-pivot quicksort, which is fast and does not need to be stable because equal primitives cannot be told apart. For arrays of objects, and for <code>Collections.sort</code> and <code>List.sort</code>, it uses TimSort, a stable combination of merge sort and insertion sort that is especially quick on data that is already partly sorted.`,
      },
    ],
  },

  'internationalization-i18n-in-java': {
    whyItMatters: `An application used in more than one country has to show text in the user's language and format numbers, currency and dates the way that country writes them. The same number is written 1,234.5 in the United States and 1.234,5 in Germany. Building with <code>Locale</code> and resource bundles from the start is far cheaper than finding every hard-coded string later.`,
    exercise: {
      prompt: `Format the same number for a reader in the United States and for a reader in Germany, using <code>NumberFormat</code>.

Expected output: <code>1,234,567.891</code> then <code>1.234.567,891</code>`,
      starterCode: `import java.text.NumberFormat;
import java.util.Locale;

public class FormatForLocale {
    public static void main(String[] args) {
        double value = 1234567.891;

        // TODO: print the value formatted for Locale.US
        // TODO: print the value formatted for Locale.GERMANY
    }
}`,
      hints: [
        '<code>NumberFormat.getNumberInstance(locale)</code> returns a formatter for that locale.',
        'Call <code>format(value)</code> on the formatter to get the text.',
      ],
      solution: `import java.text.NumberFormat;
import java.util.Locale;

public class FormatForLocale {
    public static void main(String[] args) {
        double value = 1234567.891;

        System.out.println(NumberFormat.getNumberInstance(Locale.US).format(value));      // 1,234,567.891
        System.out.println(NumberFormat.getNumberInstance(Locale.GERMANY).format(value)); // 1.234.567,891
    }
}`,
    },
    quiz: [
      {
        question: 'What does a <code>Locale</code> represent?',
        options: ['A time zone', 'A character encoding', 'A language, optionally with a country or region', 'A currency'],
        answer: 2,
        explanation: 'For example, fr is French, and fr-CA is French as used in Canada.',
      },
      {
        question: 'The locale is fr_CA and there is no <code>messages_fr_CA.properties</code>. Which file does <code>ResourceBundle</code> try next?',
        options: ['messages_en.properties', 'It throws an exception immediately', 'messages.properties', 'messages_fr.properties'],
        answer: 3,
        explanation: 'It falls back from the most specific file to the language-only file and then to the base file.',
      },
      {
        question: 'What happens when <code>bundle.getString("title")</code> is called and no file in the chain has that key?',
        options: ['It throws MissingResourceException', 'It returns the key', 'It returns null', 'It returns an empty string'],
        answer: 0,
        explanation: 'The base file should therefore contain every key, as the final fallback.',
      },
    ],
    interviewQuestions: [
      {
        question: 'What is the difference between internationalization and localization?',
        answer: `Internationalization, shortened to i18n, is designing the application so that it can support different languages and regions without code changes: moving text into resource bundles and using locale-aware formatting. Localization, l10n, is the work of adapting it to one particular locale: translating the text and supplying that locale's formats.`,
      },
      {
        question: 'How does ResourceBundle choose which properties file to load?',
        answer: `Given a base name and a locale, it looks for the most specific file first, for example <code>messages_fr_CA.properties</code>, then the language-only file <code>messages_fr.properties</code>, and finally the base file <code>messages.properties</code>. A key that is missing from a more specific file is taken from the next one in the chain, so a regional file only needs the entries that differ.`,
      },
    ],
  },
}
