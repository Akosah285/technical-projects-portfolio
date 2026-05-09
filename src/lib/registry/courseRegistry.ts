export interface Theme {
  slug: string;
  title: string;
  description: string;
}

export interface Course {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  themes: Theme[];
}

const COURSES: Course[] = [
  {
    slug: "intro-to-programming",
    title: "Introduction to Programming and Computation",
    subtitle: "Dartmouth COSC 1 · Fall 2018",
    description:
      "The first computer-science course I took. Each project here is a faithful re-rendering of a Fall 2018 submission, organized into seven outcome themes — recursion, data structures, simulation, OOP, drawing, cryptography, and pathfinding.",
    themes: [
      {
        slug: "first-programs-and-loops",
        title: "First Programs & Loops",
        description:
          "The earliest assignments — first cs1lib drawings, first while-loops, first recursion. Compound-interest narratives, binomial coefficients, and a green-eggs-and-ham still life.",
      },
      {
        slug: "drawings-and-generative-art",
        title: "Drawings & Generative Art",
        description:
          "Programs that draw. A parameter-driven port of the cs1lib string-art lab plus a small in-browser Logo turtle.",
      },
      {
        slug: "recursion-and-algorithms",
        title: "Recursion & Algorithms",
        description:
          "The recursion lab and the algorithm-walk-through assignments — Towers of Hanoi, Lomuto-style quicksort, prefix scans.",
      },
      {
        slug: "object-oriented-design",
        title: "Object-Oriented Design",
        description:
          "The OOP lab — encapsulating state and behaviour in classes, with a method-call log so the public API stays visible as you click.",
      },
      {
        slug: "cities-and-maps",
        title: "Cities & Maps",
        description:
          "The cities and graphs labs — sorting the world's most populous cities by various keys, plotting them on a map, and running BFS across the Dartmouth campus to find shortest routes.",
      },
      {
        slug: "cryptography-and-text-processing",
        title: "Cryptography & Text Processing",
        description:
          "The cryptography lab — a one-time-pad XOR cipher with a step-by-step encrypt / decrypt visualization.",
      },
      {
        slug: "interactive-worlds",
        title: "Interactive Worlds",
        description:
          "Game-loop and simulation projects — Atari-style Pong, Conway's Game of Life on a toroidal grid, and the Soldiers / Josephus elimination.",
      },
    ],
  },
  {
    slug: "problem-solving-oop",
    title: "Problem Solving via Object-Oriented Programming",
    subtitle: "Dartmouth COSC 10 · Winter 2019",
    description:
      "The follow-up to the introductory course. Originally taught in Java, the projects here are faithful TypeScript ports of my Winter 2019 problem-set submissions — image processing, spatial data structures, compression, graph search, probabilistic models, and collaborative editors. Each project links its original Java source.",
    themes: [
      {
        slug: "image-processing",
        title: "Image Processing & Camera",
        description:
          "Region-growing flood-fill on real images — find color-matching connected components and recolor them to make the regions visible.",
      },
      {
        slug: "spatial-data-structures",
        title: "Spatial Data Structures",
        description:
          "Point quadtrees that partition 2D space around each anchor point, enabling fast circle range queries and the collision-detection back-end for bouncing blobs.",
      },
      {
        slug: "compression-and-encoding",
        title: "Compression & Encoding",
        description:
          "Huffman coding — count letters, build a min-heap of leaf trees, repeatedly merge the two least-frequent into an inner node, then walk the resulting tree to read off each character's variable-length bit code.",
      },
      {
        slug: "graph-algorithms",
        title: "Graph Algorithms",
        description:
          "Six degrees of Kevin Bacon — actors as vertices, shared movies as edges, BFS for shortest paths and the resulting Bacon numbers.",
      },
      {
        slug: "probabilistic-models",
        title: "Probabilistic Models",
        description:
          "Hidden Markov models with Viterbi decoding — train on a small labelled corpus, then tag any sentence with the most-likely sequence of parts of speech.",
      },
      {
        slug: "interactive-editors",
        title: "Interactive Editors",
        description:
          "A live sketch editor — pick a tool, draw shapes, then move, recolour, or delete them. The same Shape / Sketch model that the original PS_6 wired through a multi-client TCP server.",
      },
      {
        slug: "generative-art",
        title: "Generative Art",
        description:
          "Pollock-style canvases — thousands of randomly-coloured pixels wandering across the canvas, leaving colour trails wherever they go.",
      },
      {
        slug: "data-structures",
        title: "Data Structures",
        description:
          "Hand-rolled containers — singly linked lists with head AND tail pointers (O(1) append), built from scratch and stepped through visually.",
      },
    ],
  },
  {
    slug: "machine-learning",
    title: "Machine Learning and Statistical Data Analysis",
    subtitle: "Dartmouth CS 74/174 · Spring 2020",
    description:
      "Originally taught in Python with autograd / numpy / sklearn. This was largely a learning journey through the maths of supervised learning. The projects here re-implement each homework's core algorithm from scratch in TypeScript and put it behind an interactive playground — sliders for hyper-parameters, animated trajectories, prob tables you can poke. Each project links the original Jupyter notebook submission.",
    themes: [
      {
        slug: "optimisation",
        title: "Optimisation",
        description:
          "Gradient descent — the workhorse beneath every supervised model in the course. Animate descent on the HW1 quartic cost surface, watch overshoot, and see what happens when the learning rate is too big.",
      },
      {
        slug: "regression",
        title: "Regression",
        description:
          "Linear regression on log-log Kleiber's-law data — body mass vs resting metabolism for ~20 mammals. Drag the line by hand or train it with gradient descent under either least-squares or least-absolute-deviation loss.",
      },
      {
        slug: "classification",
        title: "Classification",
        description:
          "Binary classifiers — sigmoid + cross-entropy logistic regression. Drag the slope and intercept, train with gradient descent, and watch the decision boundary slide as the threshold moves.",
      },
      {
        slug: "probabilistic-classifiers",
        title: "Probabilistic Classifiers",
        description:
          "Bag-of-words text classification with Multinomial Naïve Bayes — Laplace smoothing, log-prior + log-likelihood scoring, and a per-word breakdown of how each token nudges the prediction toward spam or ham.",
      },
    ],
  },
  {
    slug: "embedded-systems",
    title: "Embedded Systems",
    subtitle: "Dartmouth ENGS 28 / E85 · Winter 2021",
    description:
      "Bare-metal C on the AVR ATmega328p (Arduino UNO board). Each project replays a lab — bit-banging GPIO, polling buttons, ADC sensors, 7-segment displays, PWM motors, and an MQTT IoT dashboard — as an in-browser simulator that drives virtual hardware off the same register reads / writes the original C source did.",
    themes: [
      {
        slug: "bit-banging-gpio",
        title: "Bit-Banging GPIO",
        description:
          "Lab 1 — drive LEDs by writing to PORT D directly. A faithful AVR-register simulator runs the student's blinkSEQ() and 3-bit counter against virtual DDRD/PORTD registers and lights virtual LEDs.",
      },
      {
        slug: "inputs-and-reaction",
        title: "Inputs & Reaction",
        description:
          "Polling buttons through pull-up resistors, debouncing-by-FSM. A two-player reaction-time game runs on a 4-phase state machine: IDLE → COUNTDOWN → READY → CELEBRATE.",
      },
      {
        slug: "adc-and-sensors",
        title: "ADC & Sensors",
        description:
          "Reading analog signals into the AVR through its 10-bit ADC. A TMP36 temperature sensor drives a hysteresis-controlled fan + indicator LEDs.",
      },
      {
        slug: "display-and-motion",
        title: "Display & Motion",
        description:
          "Driving an Adafruit HT16K33 4-digit 7-segment display over I2C from an LSM303AGR accelerometer. Tilt the virtual device and watch the same segment-byte format the real firmware sends.",
      },
    ],
  },
];

export function getCourse(slug: string): Course | null {
  return COURSES.find((c) => c.slug === slug) ?? null;
}

export function getTheme(courseSlug: string, themeSlug: string): { course: Course; theme: Theme } | null {
  const course = getCourse(courseSlug);
  if (!course) return null;
  const theme = course.themes.find((t) => t.slug === themeSlug);
  if (!theme) return null;
  return { course, theme };
}

export function listAllCourses(): Course[] {
  return COURSES;
}
