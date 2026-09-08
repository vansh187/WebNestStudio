// Fallback language list — mirrors `GET /api/compiler/languages`.
// The live endpoint (when the backend ships it) overrides this at runtime;
// until then, and whenever that call fails, the compiler still works with these.

export const LANGUAGES = [
  {
    id: 'javascript',
    label: 'JavaScript (Node)',
    monacoId: 'javascript',
    fileExtension: 'js',
    mainFile: 'main.js',
    defaultSnippet: 'console.log("Hello, World!");\n',
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    monacoId: 'typescript',
    fileExtension: 'ts',
    mainFile: 'main.ts',
    defaultSnippet: 'const greeting: string = "Hello, World!";\nconsole.log(greeting);\n',
  },
  {
    id: 'python',
    label: 'Python 3',
    monacoId: 'python',
    fileExtension: 'py',
    mainFile: 'main.py',
    defaultSnippet: 'print("Hello, World!")\n',
  },
  {
    id: 'java',
    label: 'Java',
    monacoId: 'java',
    fileExtension: 'java',
    mainFile: 'Main.java',
    defaultSnippet:
      'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n',
  },
  {
    id: 'c',
    label: 'C',
    monacoId: 'c',
    fileExtension: 'c',
    mainFile: 'main.c',
    defaultSnippet: '#include <stdio.h>\n\nint main(void) {\n    printf("Hello, World!\\n");\n    return 0;\n}\n',
  },
  {
    id: 'cpp',
    label: 'C++',
    monacoId: 'cpp',
    fileExtension: 'cpp',
    mainFile: 'main.cpp',
    defaultSnippet:
      '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}\n',
  },
  {
    id: 'go',
    label: 'Go',
    monacoId: 'go',
    fileExtension: 'go',
    mainFile: 'main.go',
    defaultSnippet: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}\n',
  },
  {
    id: 'ruby',
    label: 'Ruby',
    monacoId: 'ruby',
    fileExtension: 'rb',
    mainFile: 'main.rb',
    defaultSnippet: 'puts "Hello, World!"\n',
  },
]

const BY_ID = Object.fromEntries(LANGUAGES.map((l) => [l.id, l]))

export function getLanguage(id) {
  return BY_ID[id] ?? LANGUAGES[0]
}

// Entry-file name to send in the execute / project `files` array.
export function mainFileName(lang) {
  if (!lang) return 'main.txt'
  if (lang.mainFile) return lang.mainFile
  return lang.fileExtension ? `main.${lang.fileExtension}` : 'main.txt'
}
