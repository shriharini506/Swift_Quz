// Swift Programming Quiz - Round 2 Dataset
// Day 2: Logic, Functions & Algorithms
// Extracted from Swift_Quiz_Round2 (1) (1).pptx

const QUIZ_DATA = {
  meta: {
    title: "Swift Programming Quiz",
    subtitle: "Day 2: Logic, Functions & Algorithms",
    round: "Round 2",
    totalQuestions: 20
  },
  questions: [
    {
      id: 1,
      difficulty: "Easy",
      category: "Operators",
      prompt: "What is the output?",
      code: "let a = 10\nlet b = 3\nprint(a % b)",
      type: "mcq",
      options: [
        { id: "A", text: "3" },
        { id: "B", text: "1" },
        { id: "C", text: "0" },
        { id: "D", text: "10" }
      ],
      correct: "B",
      explanation: "B) 1. The % operator gives the remainder of integer division: 10 ÷ 3 = 3 with a remainder of 1."
    },
    {
      id: 2,
      difficulty: "Easy",
      category: "Functions",
      prompt: "Which keyword sends a value back from a function?",
      code: null,
      type: "mcq",
      options: [
        { id: "A", text: "print" },
        { id: "B", text: "func" },
        { id: "C", text: "return" },
        { id: "D", text: "break" }
      ],
      correct: "C",
      explanation: "C) return. The `return` keyword sends a value back to the caller and terminates function execution."
    },
    {
      id: 3,
      difficulty: "Easy",
      category: "Conditional Logic",
      prompt: "What is the output?",
      code: "let marks = 82\n\nif marks >= 90 {\n    print(\"A\")\n} else if marks >= 75 {\n    print(\"B\")\n} else {\n    print(\"C\")\n}",
      type: "mcq",
      options: [
        { id: "A", text: "A" },
        { id: "B", text: "B" },
        { id: "C", text: "C" },
        { id: "D", text: "No output" }
      ],
      correct: "B",
      explanation: "B) B. 82 fails the condition (>= 90), but passes (>= 75), so the second branch runs and prints \"B\"."
    },
    {
      id: 4,
      difficulty: "Easy",
      category: "Logical Operators",
      prompt: "Which logical operator reverses a Boolean value?",
      code: null,
      type: "mcq",
      options: [
        { id: "A", text: "&&" },
        { id: "B", text: "||" },
        { id: "C", text: "==" },
        { id: "D", text: "!" }
      ],
      correct: "D",
      explanation: "D) !. The logical NOT operator (!) inverts true to false and vice versa."
    },
    {
      id: 5,
      difficulty: "Easy",
      category: "Functions",
      prompt: "What is the output?",
      code: "func add(a: Int, b: Int) -> Int {\n    return a + b\n}\n\nprint(add(a: 4, b: 6))",
      type: "mcq",
      options: [
        { id: "A", text: "46" },
        { id: "B", text: "10" },
        { id: "C", text: "24" },
        { id: "D", text: "4" }
      ],
      correct: "B",
      explanation: "B) 10. 4 + 6 = 10. In Swift, this performs integer addition rather than string concatenation."
    },
    {
      id: 6,
      difficulty: "Easy",
      category: "Ranges",
      prompt: "What does 1...5 represent in Swift?",
      code: null,
      type: "mcq",
      options: [
        { id: "A", text: "Numbers from 1 to 4" },
        { id: "B", text: "Numbers from 1 to 5, including 5" },
        { id: "C", text: "Numbers from 0 to 5" },
        { id: "D", text: "Only the number 5" }
      ],
      correct: "B",
      explanation: "B) Numbers from 1 to 5, including 5. The closed range operator (...) includes both the lower and upper bounds."
    },
    {
      id: 7,
      difficulty: "Easy",
      category: "Comparison Operators",
      prompt: "What is the output?",
      code: "let age = 16\nprint(age >= 18)",
      type: "mcq",
      options: [
        { id: "A", text: "True" },
        { id: "B", text: "False" },
        { id: "C", "text": "16" },
        { id: "D", "text": "Error" }
      ],
      correct: "B",
      explanation: "B) False. 16 is not ≥ 18, so the comparison evaluates to the Boolean false."
    },
    {
      id: 8,
      difficulty: "Easy",
      category: "Data Types",
      prompt: "Which return type represents a true-or-false value?",
      code: null,
      type: "mcq",
      options: [
        { id: "A", text: "Int" },
        { id: "B", text: "String" },
        { id: "C", text: "Bool" },
        { id: "D", text: "Double" }
      ],
      correct: "C",
      explanation: "C) Bool. In Swift, the Bool type can only represent true or false."
    },
    {
      id: 9,
      difficulty: "Medium",
      category: "Loops & Ranges",
      prompt: "What is the output?",
      code: "for i in 1..<4 {\n    print(i)\n}",
      type: "mcq",
      options: [
        { id: "A", text: "1, 2, 3" },
        { id: "B", "text": "1, 2, 3, 4" },
        { id: "C", "text": "0, 1, 2, 3" },
        { id: "D", "text": "4 only" }
      ],
      correct: "A",
      explanation: "A) 1, 2, 3. The half-open range operator (..<) runs up to, but does not include, the upper bound (4)."
    },
    {
      id: 10,
      difficulty: "Easy",
      category: "Modular Programming",
      prompt: "What is the main benefit of modular programming?",
      code: null,
      type: "mcq",
      options: [
        { id: "A", text: "It makes every program longer" },
        { id: "B", text: "It divides a program into smaller, reusable parts" },
        { id: "C", text: "It removes all conditions" },
        { id: "D", text: "It eliminates the need for functions" }
      ],
      correct: "B",
      explanation: "B) It divides a program into smaller, reusable parts. Modular code is easier to read, maintain, test, and reuse."
    },
    {
      id: 11,
      difficulty: "Code Output",
      category: "Conditional Logic",
      prompt: "What is printed?",
      code: "let number = -3\n\nif number > 0 {\n    print(\"Positive\")\n} else if number < 0 {\n    print(\"Negative\")\n} else {\n    print(\"Zero\")\n}",
      type: "output",
      options: [
        { id: "A", text: "Positive" },
        { id: "B", text: "Negative" },
        { id: "C", text: "Zero" },
        { id: "D", text: "Error" }
      ],
      correct: "B",
      expectedOutput: "Negative",
      explanation: "-3 is less than 0, so the second branch runs and outputs \"Negative\"."
    },
    {
      id: 12,
      difficulty: "Easy",
      category: "Functions",
      prompt: "What is the output?",
      code: "func greet() {\n    print(\"Hello\")\n}\n\ngreet()\ngreet()",
      type: "mcq",
      options: [
        { id: "A", text: "Hello" },
        { id: "B", text: "Hello Hello" },
        { id: "C", text: "Hello printed twice, on separate lines" },
        { id: "D", "text": "No output" }
      ],
      correct: "C",
      explanation: "C) Hello printed twice, on separate lines. Each call executes the body once and Swift's print() automatically adds a newline."
    },
    {
      id: 13,
      difficulty: "Code Output",
      category: "Logical Operators",
      prompt: "What is printed?",
      code: "let age = 20\nlet hasID = false\n\nif age >= 18 && hasID {\n    print(\"Allowed\")\n} else {\n    print(\"Denied\")\n}",
      type: "output",
      options: [
        { id: "A", text: "Allowed" },
        { id: "B", text: "Denied" },
        { id: "C", text: "true" },
        { id: "D", text: "Error" }
      ],
      correct: "B",
      expectedOutput: "Denied",
      explanation: "&& requires both sides to be true. Although age >= 18 is true, hasID is false, so the else branch prints \"Denied\"."
    },
    {
      id: 14,
      difficulty: "Easy",
      category: "Functions",
      prompt: "What is the output?",
      code: "func square(number: Int) -> Int {\n    return number * number\n}\n\nprint(square(number: 6))",
      type: "mcq",
      options: [
        { id: "A", text: "12" },
        { id: "B", text: "36" },
        { id: "C", "text": "6" },
        { id: "D", "text": "18" }
      ],
      correct: "B",
      explanation: "B) 36. 6 × 6 = 36."
    },
    {
      id: 15,
      difficulty: "Easy",
      category: "Loops & Ranges",
      prompt: "How many times does this loop execute?",
      code: "for i in 1...4 {\n    print(i)\n}",
      type: "mcq",
      options: [
        { id: "A", text: "3 times" },
        { id: "B", text: "4 times" },
        { id: "C", text: "5 times" },
        { id: "D", "text": "1 time" }
      ],
      correct: "B",
      explanation: "B) 4 times. 1...4 contains 1, 2, 3, and 4 — exactly 4 iterations."
    },
    {
      id: 16,
      difficulty: "Code Output",
      category: "Conditional Logic",
      prompt: "What is the output?",
      code: "let number = 7\n\nif number != 5 {\n    print(\"Different\")\n} else {\n    print(\"Same\")\n}",
      type: "output",
      options: [
        { id: "A", text: "Different" },
        { id: "B", text: "Same" },
        { id: "C", text: "True" },
        { id: "D", text: "False" }
      ],
      correct: "A",
      expectedOutput: "Different",
      explanation: "7 != 5 evaluates to true, so the if branch executes and prints \"Different\"."
    },
    {
      id: 17,
      difficulty: "Medium",
      category: "Loops & Logic",
      prompt: "What is printed?",
      code: "for number in 1...6 {\n    if number % 2 == 0 {\n        print(number)\n    }\n}",
      type: "output",
      options: [
        { id: "A", text: "1, 3, 5" },
        { id: "B", text: "2, 4, 6" },
        { id: "C", text: "1, 2, 3, 4, 5, 6" },
        { id: "D", "text": "2, 4" }
      ],
      correct: "B",
      expectedOutput: "2, 4, 6",
      explanation: "Only numbers in 1...6 with a remainder of 0 when divided by 2 (even numbers: 2, 4, 6) are printed."
    },
    {
      id: 18,
      difficulty: "Challenge",
      category: "Argument Labels",
      prompt: "Which call matches this function definition?",
      code: "func introduce(name person: String) {\n    print(\"Hello, \\(person)\")\n}",
      type: "mcq",
      options: [
        { id: "A", text: "introduce(person: \"Anu\")" },
        { id: "B", text: "introduce(name: \"Anu\")" },
        { id: "C", text: "introduce(\"Anu\")" },
        { id: "D", text: "introduce(name person: \"Anu\")" }
      ],
      correct: "B",
      explanation: "B) introduce(name: \"Anu\"). The external argument label `name` is required at the call site, while `person` is the parameter name used inside the function body."
    },
    {
      id: 19,
      difficulty: "Easy",
      category: "Logical Operators",
      prompt: "What is the output?",
      code: "let a = true\nlet b = false\n\nprint(a || b)",
      type: "mcq",
      options: [
        { id: "A", text: "True" },
        { id: "B", text: "False" },
        { id: "C", "text": "1" },
        { id: "D", "text": "Error" }
      ],
      correct: "A",
      explanation: "A) True. The logical OR operator (||) evaluates to true if at least one of its operands is true."
    },
    {
      id: 20,
      difficulty: "Medium",
      category: "Functions",
      prompt: "What happens if a function is defined but never called?",
      code: null,
      type: "mcq",
      options: [
        { id: "A", text: "It always executes once" },
        { id: "B", text: "It executes repeatedly" },
        { id: "C", "text": "Its body does not execute" },
        { id: "D", "text": "The program must crash" }
      ],
      correct: "C",
      explanation: "C) Its body does not execute. A function definition creates reusable code, but it only runs when explicitly called."
    }
  ]
};
