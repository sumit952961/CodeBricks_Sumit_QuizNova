export const initialQuestions = [
  {
    questionText: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Multi Language",
      "Hyper Transfer Markup Language",
      "Home Tool Markup Language"
    ],
    correctAnswerIndex: 0,
    category: "Web Dev",
    difficulty: "Easy",
    timeLimitSeconds: 15,
    explanation: "HTML stands for Hyper Text Markup Language, the standard document structure for web pages."
  },
  {
    questionText: "Which hook is used in React to manage state?",
    options: [
      "useContext",
      "useEffect",
      "useState",
      "useReducer"
    ],
    correctAnswerIndex: 2,
    category: "React",
    difficulty: "Easy",
    timeLimitSeconds: 15,
    explanation: "useState is the built-in React hook used for declared state management in functional components."
  },
  {
    questionText: "Which method converts a JavaScript object into a JSON string?",
    options: [
      "JSON.parse()",
      "JSON.stringify()",
      "JSON.toObject()",
      "Object.toJSON()"
    ],
    correctAnswerIndex: 1,
    category: "JavaScript",
    difficulty: "Easy",
    timeLimitSeconds: 15,
    explanation: "JSON.stringify() converts a JavaScript value or object into a formatted JSON string."
  },
  {
    questionText: "In the MERN stack, what does the 'E' stand for?",
    options: [
      "EJS",
      "Electron",
      "Express.js",
      "Ember.js"
    ],
    correctAnswerIndex: 2,
    category: "Web Dev",
    difficulty: "Easy",
    timeLimitSeconds: 15,
    explanation: "Express.js is a minimal and flexible Node.js web application framework."
  },
  {
    questionText: "What is the runtime environment that executes JavaScript outside the browser?",
    options: [
      "TypeScript",
      "Node.js",
      "Babel",
      "Webpack"
    ],
    correctAnswerIndex: 1,
    category: "Node.js",
    difficulty: "Medium",
    timeLimitSeconds: 20,
    explanation: "Node.js is an open-source, cross-platform JavaScript runtime environment built on V8."
  },
  {
    questionText: "Which MongoDB command is used to insert a single document?",
    options: [
      "db.collection.addOne()",
      "db.collection.insertOne()",
      "db.collection.save()",
      "db.collection.create()"
    ],
    correctAnswerIndex: 1,
    category: "MongoDB",
    difficulty: "Medium",
    timeLimitSeconds: 20,
    explanation: "insertOne() inserts a single document into a collection in MongoDB."
  },
  {
    questionText: "What is the primary function of Node.js Event Loop?",
    options: [
      "To compile JavaScript code into machine code",
      "To handle asynchronous non-blocking I/O operations",
      "To query MongoDB collections concurrently",
      "To manage CSS styles dynamically"
    ],
    correctAnswerIndex: 1,
    category: "Node.js",
    difficulty: "Hard",
    timeLimitSeconds: 25,
    explanation: "The Event Loop enables Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded."
  },
  {
    questionText: "Which keyword is used to declare block-scoped variables in modern ES6 JavaScript?",
    options: [
      "var",
      "let",
      "def",
      "dim"
    ],
    correctAnswerIndex: 1,
    category: "JavaScript",
    difficulty: "Easy",
    timeLimitSeconds: 15,
    explanation: "let and const allow block scoping in JavaScript."
  }
];

// No prefilled scores to ensure fresh start
export const initialScores = [];
