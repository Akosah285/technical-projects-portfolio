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
      {
        slug: "motor-and-pwm",
        title: "Motor & PWM",
        description:
          "DC motors driven through a TB6612 H-bridge with PWM, plus a pin-change-interrupt speed sensor. A pot sets direction & speed; an SVG shaft spins; the speedometer reports RPM = 3 × pulses/second.",
      },
      {
        slug: "iot-and-real-time",
        title: "IoT & Real-time",
        description:
          "Arduino + Airlift WiFi + MQTT subscriptions drive a level-crossing dashboard: RGB stoplight FSM, servo-actuated gate, maintenance + train pre-emption.",
      },
    ],
  },
  {
    slug: "digital-electronics",
    title: "Digital Electronics",
    subtitle: "Dartmouth ENGS 31 · Spring 2020",
    description:
      "Hardware design in VHDL, targeting Xilinx FPGAs. Each project replays a lab — SPI controller FSMs, parallel-load datapaths, sampling clock dividers, and stopwatch-style sequential machines — by lifting the VHDL behaviour into a deterministic JavaScript simulator with a real waveform / state-diagram view. The original .vhd source is linked from each page.",
    themes: [
      {
        slug: "state-machines",
        title: "State Machines",
        description:
          "Moore-style controller FSMs in VHDL: state diagram, transition table, and per-state output assignments. SPI-bus controller from Lab 4 as the canonical example.",
      },
      {
        slug: "datapaths",
        title: "Datapaths",
        description:
          "Registers and buses driven by the controller. A 16-bit shift register clocks SPI serial data in MSB-first; a parallel-load output register captures the low 12 bits to drive the ADC bus.",
      },
      {
        slug: "counters-and-timing",
        title: "Counters & Timing",
        description:
          "Free-running counters used as clock dividers — turn a fast 100 MHz FPGA clock into a 1 kHz sample-rate strobe by counting to TCount and pulsing.",
      },
      {
        slug: "sequential-design",
        title: "Sequential Design",
        description:
          "Putting controllers + datapaths + dividers together. A two-state stopwatch FSM (STOPPED ⇄ RUNNING) drives a 4-digit hundredths-of-a-second display with a clear-only-when-stopped guard.",
      },
    ],
  },
  {
    slug: "microprocessors-engineered-systems",
    title: "Microprocessors in Engineered Systems",
    subtitle: "Dartmouth ENGS 62 · Winter 2021",
    description:
      "Bare-metal C on the Xilinx Zynq-7000 System-on-Chip (ZYBO-Z7 board) — a dual-core ARM Cortex-A9 fused to programmable FPGA fabric, talking to AXI-mapped peripherals over the PS-PL bridge. Each lab climbs one rung of the SoC stack: GPIO → interrupts via the GIC → PWM-mode AXI Timers → the on-chip XADC → a multi-timer state machine for a level-crossing controller → a wireless link to a remote substation. The browser ports model each lab's runtime behaviour deterministically — type at a virtual UART, fire ISRs by clicking switches, sweep a PWM duty cycle and watch a servo arm follow it, drag a virtual potentiometer into the ADC, and step the 9-state traffic FSM through every transition. The original .c / .h source files are linked from each page.",
    themes: [
      {
        slug: "gpio-and-uart",
        title: "GPIO & UART",
        description:
          "Hello-world for the SoC: drive the four board LEDs through AXI-GPIO, the on-board MIO LED through PS-GPIO, and the RGB LED through a second AXI-GPIO port — all from a UART REPL that parses single-character commands.",
      },
    ],
  },
  {
    subtitle: "Dartmouth ENGS 147 · Spring 2021",
    slug: "mechatronics",
    title: "Mechatronics",
    description:
      "Closed-loop control of a brushed DC motor + an autonomous micromouse robot, originally written in Arduino C++ on an ATmega2560 with quadrature encoders, an Arduino Motor Shield R3, sharp-IR distance sensors, and a Bosch BNO055 9-axis IMU. The projects port the firmware into deterministic JS simulators — drag the PWM, watch the first-order velocity rise; toggle P vs PI and see steady-state error vanish; track a square-wave position reference; turn the robot by-N-degrees off IMU heading; and let the wall-following micromouse explore an 8×8 maze. Original .ino source files are linked from each page.",
    themes: [
      {
        slug: "system-identification",
        title: "System Identification",
        description:
          "Open-loop step-response characterisation of the motor as a first-order system. Pick a PWM duty, watch velocity rise, read off K (steady-state) and τ (the time-to-63.2%).",
      },
      {
        slug: "closed-loop-control",
        title: "Closed-Loop Control",
        description:
          "Wrap the motor in a feedback loop. Toggle a pure proportional controller (visible steady-state error) against a discrete-time PI controller (zero steady-state error after a few τ) — same plant, same reference, very different responses.",
      },
      {
        slug: "position-control",
        title: "Position Control",
        description:
          "Discrete-time controller K(z−a)/(z−b) tracking an angular-position square-wave reference. The position output reverses sign every period; the controller chases each new reference through the same first-order plant.",
      },
      {
        slug: "inertial-sensing",
        title: "Inertial Sensing",
        description:
          "BNO055 9-DOF IMU drives a closed-loop in-place turn. The controller commands left and right motors in opposition and feeds Euler-heading drift back as the controlled variable, with 0–360° wraparound handled in software so a 90° command always lands at 90° regardless of starting bearing.",
      },
      {
        slug: "autonomous-navigation",
        title: "Autonomous Navigation",
        description:
          "Right-hand wall-following micromouse running on an 8×8 grid. The same choose_direction state machine that flashed onto the lab cart, exposed as a step-and-watch animation. Pick a maze, hit Run, and watch the rule trace its way to the goal — including the famous failure mode where the right-hand rule loops the outer ring forever and never enters an enclosed inner room.",
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
