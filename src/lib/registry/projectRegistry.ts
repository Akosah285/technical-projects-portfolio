export interface ProjectCheckpoint {
  label: string;
  path: string;
  description?: string;
}

export interface Project {
  course: string;
  theme: string;
  slug: string;
  title: string;
  summary: string;
  originalSourcePath: string;
  /** Display name of the original implementation language ("Python" by default) */
  sourceLanguage?: string;
  checkpoints?: ProjectCheckpoint[];
  relatedSources?: ProjectCheckpoint[];
}

const PROJECTS: Project[] = [
  {
    course: "intro-to-programming",
    theme: "recursion-and-algorithms",
    slug: "towers-of-hanoi",
    title: "Towers of Hanoi",
    summary:
      "A recursive solver that prints the optimal move sequence for the Towers of Hanoi puzzle, ported from a Fall 2018 introductory programming submission.",
    originalSourcePath:
      "/sources/intro-to-programming/towers-of-hanoi/solve_hanoi.py",
  },
  {
    course: "intro-to-programming",
    theme: "recursion-and-algorithms",
    slug: "quicksort",
    title: "Quicksort",
    summary:
      "An animated walk-through of Lomuto-style quicksort: pivot selection at the right end, the i/j partition pointers, the swaps that build the low-side region, and the final pivot placement that drives the recursive descent.",
    originalSourcePath:
      "/sources/intro-to-programming/quicksort/quicksort.py",
  },
  {
    course: "intro-to-programming",
    theme: "recursion-and-algorithms",
    slug: "scan",
    title: "Scan",
    summary:
      "A step-by-step visualization of inclusive and exclusive prefix-scan operations with both plus and times. Toggle the operation, switch modes, and watch each cell update from the previous one.",
    originalSourcePath: "/sources/intro-to-programming/scan/scan.py",
  },
  {
    course: "intro-to-programming",
    theme: "cities-and-maps",
    slug: "sort-cities",
    title: "Sort Cities",
    summary:
      "Sorts the world's most populous cities along a chosen axis — alphabetically, by population, or by latitude — using the same Lomuto-style quicksort from this course's Recursion & Algorithms work. Switch the axis to watch the city list reorder.",
    originalSourcePath:
      "/sources/intro-to-programming/sort-cities/sort_cities.py",
    relatedSources: [
      {
        label: "sort_cities.py",
        path: "/sources/intro-to-programming/sort-cities/sort_cities.py",
        description: "Driver: reads the city file, dispatches three sorts, writes outputs.",
      },
      {
        label: "city.py",
        path: "/sources/intro-to-programming/sort-cities/city.py",
        description: "City class: country code, name, region, population, latitude, longitude.",
      },
      {
        label: "read_cities.py",
        path: "/sources/intro-to-programming/sort-cities/read_cities.py",
        description: "Loads world_cities.txt into a list of City objects.",
      },
      {
        label: "quicksort.py",
        path: "/sources/intro-to-programming/sort-cities/quicksort.py",
        description: "Generic quicksort that takes a comparison function.",
      },
    ],
  },
  {
    course: "intro-to-programming",
    theme: "cities-and-maps",
    slug: "visualize-cities",
    title: "Visualize Cities",
    summary:
      "Plots the world's most populous cities as dots on a world-map projection. Cities appear one at a time, mirroring the original cs1lib animation that revealed cities frame-by-frame.",
    originalSourcePath:
      "/sources/intro-to-programming/visualize-cities/visualize_cities.py",
    relatedSources: [
      {
        label: "visualize_cities.py",
        path: "/sources/intro-to-programming/visualize-cities/visualize_cities.py",
        description: "Plots cities on a world map; one new city appears each animation frame.",
      },
      {
        label: "city.py",
        path: "/sources/intro-to-programming/visualize-cities/city.py",
        description: "Same City class shared with sort_cities.py.",
      },
    ],
  },
  {
    course: "intro-to-programming",
    theme: "cities-and-maps",
    slug: "bfs-dartmouth-campus",
    title: "BFS Across the Dartmouth Campus",
    summary:
      "A breadth-first-search shortest-path solver played out on the Dartmouth campus map. Click a start landmark and a goal landmark; the BFS frontier expands outward across the graph, and the shortest route highlights when the goal is reached.",
    originalSourcePath:
      "/sources/intro-to-programming/bfs-dartmouth-campus/bfs.py",
    relatedSources: [
      {
        label: "bfs.py",
        path: "/sources/intro-to-programming/bfs-dartmouth-campus/bfs.py",
        description: "The breadth-first-search itself: deque-based frontier, back-pointer dictionary, path reconstruction.",
      },
      {
        label: "vertex.py",
        path: "/sources/intro-to-programming/bfs-dartmouth-campus/vertex.py",
        description: "Vertex class: name, x/y location on the map, adjacency list of neighbouring vertices.",
      },
      {
        label: "load_graph.py",
        path: "/sources/intro-to-programming/bfs-dartmouth-campus/load_graph.py",
        description: "Reads dartmouth_graph.txt twice — once to build the vertex dictionary, once to wire up adjacencies.",
      },
      {
        label: "map_plot.py",
        path: "/sources/intro-to-programming/bfs-dartmouth-campus/map_plot.py",
        description: "The cs1lib runner: campus map background, mouse-driven start/goal selection, BFS path overlay.",
      },
      {
        label: "lab_3_checkpoint.py",
        path: "/sources/intro-to-programming/bfs-dartmouth-campus/lab_3_checkpoint.py",
        description: "Lab 3 checkpoint that produced vertices.txt — the very file this project still reads from to build its graph.",
      },
    ],
  },
  {
    course: "intro-to-programming",
    theme: "cryptography-and-text-processing",
    slug: "crypto",
    title: "One-Time-Pad XOR Cipher",
    summary:
      "A step-by-step visualization of the one-time-pad XOR cipher from this course's Lab 4. Edit the plaintext or the key, then watch each ciphertext byte light up as it's computed by XOR-ing the corresponding plaintext byte with the key — and watch decryption recover the plaintext just as easily, because XOR is its own inverse.",
    originalSourcePath: "/sources/intro-to-programming/crypto/crypto.py",
    relatedSources: [
      {
        label: "crypto.py",
        path: "/sources/intro-to-programming/crypto/crypto.py",
        description:
          "The full Lab 4 module: xor_block, generate_pad, modular_exponentiation (RSA), encrypt_file, decrypt_file. Only xor_block drives the visualization here.",
      },
      {
        label: "ciphertext.txt",
        path: "/sources/intro-to-programming/crypto/ciphertext.txt",
        description:
          "Sample ciphertext file generated by encrypt_file — the very file the original lab decrypted end-to-end.",
      },
    ],
  },
  {
    course: "intro-to-programming",
    theme: "object-oriented-design",
    slug: "counter-and-timer",
    title: "Counter & Timer",
    summary:
      "The OOP lab — a countdown Counter with wrap-around plus a Timer built from three Counters (hh:mm:ss). Both classes are ported faithfully to TypeScript and wired to live controls, with a method-call log so the public API stays visible.",
    originalSourcePath: "/sources/intro-to-programming/counter-and-timer/counterclass.py",
    relatedSources: [
      { label: "counterclass.py", path: "/sources/intro-to-programming/counter-and-timer/counterclass.py", description: "The Counter class — a countdown with wrap." },
      { label: "counter_test.py", path: "/sources/intro-to-programming/counter-and-timer/counter_test.py", description: "The original Counter test harness." },
      { label: "timer.py", path: "/sources/intro-to-programming/counter-and-timer/timer.py", description: "Timer composed from three Counters (24/60/60)." },
      { label: "timer_test.py", path: "/sources/intro-to-programming/counter-and-timer/timer_test.py", description: "The original Timer test harness." },
    ],
  },
  {
    course: "intro-to-programming",
    theme: "drawings-and-generative-art",
    slug: "string-art",
    title: "String Art",
    summary:
      "Faithful re-rendering of the cs1lib string-art drawing — two red sticks plus n + 1 colour-graded strings interpolated between them. Adjust the stick endpoints and string density to reshape the curve.",
    originalSourcePath: "/sources/intro-to-programming/string-art/string_art_akwasi.py",
  },
  {
    course: "intro-to-programming",
    theme: "drawings-and-generative-art",
    slug: "logo-turtle",
    title: "Logo Turtle",
    summary:
      "A small in-browser Logo interpreter inspired by the FA18 logo submission. Type Logo commands — FORWARD, RIGHT, LEFT, PENUP, PENDOWN, HOME, and nested REPEAT — and the turtle draws live on canvas.",
    originalSourcePath: "/sources/intro-to-programming/logo-turtle/logoakosah.py",
  },
  {
    course: "intro-to-programming",
    theme: "first-programs-and-loops",
    slug: "egg-and-ham",
    title: "Green Eggs and Ham",
    summary:
      "A faithful SVG re-rendering of an early cs1lib drawing assignment — same coordinates, same colours, same 400×400 canvas as the original Python.",
    originalSourcePath: "/sources/intro-to-programming/egg-and-ham/egg_and_ham.py",
  },
  {
    course: "intro-to-programming",
    theme: "first-programs-and-loops",
    slug: "portia",
    title: "Portia vs Brutus",
    summary:
      "A while-loop compound-interest narrative from the loops lab. Brutus puts $1 in the bank at 5% per year; Portia puts $100,000 in at 4%. The loop runs forward in time and prints the year Brutus' tiny stake first overtakes Portia's fortune.",
    originalSourcePath: "/sources/intro-to-programming/portia/portia.py",
  },
  {
    course: "intro-to-programming",
    theme: "first-programs-and-loops",
    slug: "rich",
    title: "From One Dollar to a Border Wall",
    summary:
      "Same compound-interest engine as Portia, but with a single investor: how big does Brutus' $1 deposit get by 2018, and how many $21.6-billion border walls could that fund? A loop, a constant, and a print.",
    originalSourcePath: "/sources/intro-to-programming/rich/rich.py",
  },
  {
    course: "intro-to-programming",
    theme: "first-programs-and-loops",
    slug: "choose",
    title: "Binomial Coefficient",
    summary:
      "Recursive computation of n-choose-k from the recursion lab. Two base cases (k = 0, k = n → 1) plus the Pascal-triangle recurrence. Adjust n and k to watch the value compute live.",
    originalSourcePath: "/sources/intro-to-programming/choose/choose.py",
  },
  {
    course: "intro-to-programming",
    theme: "interactive-worlds",
    slug: "soldiers",
    title: "Soldiers — Josephus Problem",
    summary:
      "An animated walk-through of the Josephus circular-elimination problem from this course's circular-linked-list lab. N soldiers stand in a circle; every k-th soldier is eliminated until one remains. Adjust N and k, then watch the pointer count around the ring.",
    originalSourcePath: "/sources/intro-to-programming/soldiers/soldiers.py",
    relatedSources: [
      {
        label: "soldiers.py",
        path: "/sources/intro-to-programming/soldiers/soldiers.py",
        description:
          "Soldier and Army classes — circular doubly-linked list, kill() splices a node out, kill_all(k) advances by k each round until one soldier remains.",
      },
    ],
  },
  {
    course: "intro-to-programming",
    theme: "interactive-worlds",
    slug: "game-of-life",
    title: "Conway's Game of Life",
    summary:
      "An interactive Conway's Game of Life on a 30×50 toroidal grid. Click or drag to paint cells, drop in a glider/blinker/pulsar/R-pentomino seed, then play the simulation at variable speed. Faithful to the original Lab cell.py + colony.py topology.",
    originalSourcePath: "/sources/intro-to-programming/game-of-life/colony.py",
    relatedSources: [
      {
        label: "cell.py",
        path: "/sources/intro-to-programming/game-of-life/cell.py",
        description:
          "Cell class: living flag, kill/revive/flip, draw on the cs1lib canvas in blue (alive) or yellow (dead).",
      },
      {
        label: "colony.py",
        path: "/sources/intro-to-programming/game-of-life/colony.py",
        description:
          "Colony class: 2D grid of cells, click → flip, compute_generation walks the 8 neighbors with toroidal wraparound and applies B3/S23.",
      },
    ],
  },
  {
    course: "problem-solving-oop",
    theme: "image-processing",
    slug: "region-finder",
    title: "Region Finder",
    summary:
      "An iterative 8-neighborhood flood-fill that finds and recolors connected color regions in an image. Faithfully ported from the Winter 2019 PS_1 Java submission, and wired to a small canvas where you can pick a target color, tune the color-tolerance and minimum-region thresholds, and watch each region get its own color.",
    originalSourcePath: "/sources/problem-solving-oop/region-finder/RegionFinder.java",
    sourceLanguage: "Java",
    relatedSources: [
      {
        label: "RegionFinder.java",
        path: "/sources/problem-solving-oop/region-finder/RegionFinder.java",
        description: "Region-growing class — colorMatch, findRegions, largestRegion, recolorImage.",
      },
      {
        label: "CamPaint.java",
        path: "/sources/problem-solving-oop/region-finder/CamPaint.java",
        description: "The webcam-driven driver: shows the largest matching region as a moving paintbrush.",
      },
      {
        label: "RegionsTest.java",
        path: "/sources/problem-solving-oop/region-finder/RegionsTest.java",
        description: "Test harness that loads a still image and prints region counts.",
      },
    ],
  },
  {
    course: "problem-solving-oop",
    theme: "spatial-data-structures",
    slug: "point-quadtree",
    title: "Point Quadtree",
    summary:
      "A point quadtree that partitions a 2D rectangle around each anchor and supports O(log n) range queries. Click on the canvas to insert points, slide the query circle around, and watch the tree skip whole subtrees whose bounding rectangles can't intersect the circle. Faithfully ported from the Winter 2019 PS_2 Java submission.",
    originalSourcePath: "/sources/problem-solving-oop/quadtree/PointQuadtree.java",
    sourceLanguage: "Java",
    relatedSources: [
      {
        label: "PointQuadtree.java",
        path: "/sources/problem-solving-oop/quadtree/PointQuadtree.java",
        description: "Generic point quadtree — insert, size, allPoints, findInCircle.",
      },
      {
        label: "Geometry.java",
        path: "/sources/problem-solving-oop/quadtree/Geometry.java",
        description: "pointInCircle and circleIntersectsRectangle helpers.",
      },
      {
        label: "Point2D.java",
        path: "/sources/problem-solving-oop/quadtree/Point2D.java",
        description: "Interface every quadtree element implements.",
      },
      {
        label: "Blob.java",
        path: "/sources/problem-solving-oop/quadtree/Blob.java",
        description: "Animated bouncing blob used by the original collision detector.",
      },
      {
        label: "Dot.java",
        path: "/sources/problem-solving-oop/quadtree/Dot.java",
        description: "A simple Point2D used by the original DotTreeGUI.",
      },
      {
        label: "DotTreeGUI.java",
        path: "/sources/problem-solving-oop/quadtree/DotTreeGUI.java",
        description: "Java GUI that visualizes the tree subdivisions and the circle query.",
      },
      {
        label: "CollisionGUI.java",
        path: "/sources/problem-solving-oop/quadtree/CollisionGUI.java",
        description: "Driver that uses the quadtree to detect collisions among many bouncing blobs.",
      },
    ],
  },
  {
    course: "problem-solving-oop",
    theme: "compression-and-encoding",
    slug: "huffman",
    title: "Huffman Compression",
    summary:
      "Type some text and watch the Huffman pipeline run live: a frequency table, the tree built by repeatedly merging the two least-frequent subtrees, and the final variable-length bit string. Faithfully ported from the Winter 2019 PS_3 Java submission, which compressed the U.S. Constitution from 45 KB to 25 KB on disk.",
    originalSourcePath: "/sources/problem-solving-oop/huffman/CompressFile.java",
    sourceLanguage: "Java",
    relatedSources: [
      {
        label: "CompressFile.java",
        path: "/sources/problem-solving-oop/huffman/CompressFile.java",
        description: "End-to-end driver: reads a file, builds the frequency map, builds the tree, encodes, decodes.",
      },
      {
        label: "HuffmanTree.java",
        path: "/sources/problem-solving-oop/huffman/HuffmanTree.java",
        description: "The recursive tree node — leaves carry a character, inner nodes carry a frequency total.",
      },
      {
        label: "BufferedBitReader.java",
        path: "/sources/problem-solving-oop/huffman/BufferedBitReader.java",
        description: "Reads compressed bit stream, byte-by-byte, with end-of-stream handling.",
      },
      {
        label: "BufferedBitWriter.java",
        path: "/sources/problem-solving-oop/huffman/BufferedBitWriter.java",
        description: "Writes compressed bit stream with a trailing byte that records the bit count.",
      },
      {
        label: "USConstitution_compressed.txt",
        path: "/sources/problem-solving-oop/huffman/USConstitution_compressed.txt",
        description: "The actual bit-packed compressed output produced by the Java submission (≈25 KB).",
      },
      {
        label: "USConstitution_decompressed.txt",
        path: "/sources/problem-solving-oop/huffman/USConstitution_decompressed.txt",
        description: "Decompressed output — byte-for-byte identical to the original (≈45 KB).",
      },
    ],
  },
  {
    course: "problem-solving-oop",
    theme: "graph-algorithms",
    slug: "kevin-bacon",
    title: "Six Degrees of Kevin Bacon",
    summary:
      "BFS over a small actor/movie graph — pick a center, then click any actor to see their Bacon number and the chain of shared movies that connects them. Faithfully ported from the Winter 2019 PS_4 Java submission, including the exact tiny test dataset used to grade it.",
    originalSourcePath: "/sources/problem-solving-oop/kevin-bacon/KevinBaconGame.java",
    sourceLanguage: "Java",
    relatedSources: [
      {
        label: "KevinBaconGame.java",
        path: "/sources/problem-solving-oop/kevin-bacon/KevinBaconGame.java",
        description: "Builds the actor graph from the actors / movies / movie-actors text files.",
      },
      {
        label: "KevinBaconUI.java",
        path: "/sources/problem-solving-oop/kevin-bacon/KevinBaconUI.java",
        description: "Console UI — set center (u), find path (p), missing actors (i), separation range (s).",
      },
      {
        label: "GraphLib.java",
        path: "/sources/problem-solving-oop/kevin-bacon/GraphLib.java",
        description: "Generic graph algorithms: random walk, BFS, getPath, missingVertices, averageSeparation.",
      },
      {
        label: "PS_4_test_1.txt",
        path: "/sources/problem-solving-oop/kevin-bacon/PS_4_test_1.txt",
        description: "The exact graded test transcript (the dataset visualized here).",
      },
      {
        label: "PS_4_test_4_FullTextFiles.txt",
        path: "/sources/problem-solving-oop/kevin-bacon/PS_4_test_4_FullTextFiles.txt",
        description: "Full-corpus run with the real Kevin Bacon dataset.",
      },
    ],
  },
  {
    course: "problem-solving-oop",
    theme: "probabilistic-models",
    slug: "pos-tagger",
    title: "HMM Viterbi POS Tagger",
    summary:
      "Train a hidden Markov model on a tiny tagged corpus, then decode the most-likely tag sequence for any sentence using Viterbi. Faithfully ports the PS_5 Java solution — including the unseen-word log-penalty fallback (PENALTY = 100).",
    originalSourcePath: "/sources/problem-solving-oop/pos-tagger/Training.java",
    sourceLanguage: "Java",
    relatedSources: [
      {
        label: "Training.java",
        path: "/sources/problem-solving-oop/pos-tagger/Training.java",
        description: "Counts → log-probabilities → Viterbi decoder, with the PENALTY=100 fallback for unseen words.",
      },
      {
        label: "hardCoded-train-sentences.txt",
        path: "/sources/problem-solving-oop/pos-tagger/hardCoded-train-sentences.txt",
        description: "Eight-sentence training corpus (Gregory the Persian cat) shipped with the original.",
      },
      {
        label: "hardCoded-train-tags.txt",
        path: "/sources/problem-solving-oop/pos-tagger/hardCoded-train-tags.txt",
        description: "Aligned POS tags for the training sentences.",
      },
      {
        label: "hardCoded-test-sentences.txt",
        path: "/sources/problem-solving-oop/pos-tagger/hardCoded-test-sentences.txt",
        description: "Held-out sentences used to score the original submission.",
      },
      {
        label: "hardCoded-test-tags.txt",
        path: "/sources/problem-solving-oop/pos-tagger/hardCoded-test-tags.txt",
        description: "Gold-standard tags for the held-out sentences.",
      },
      {
        label: "hardCode_testResults.txt",
        path: "/sources/problem-solving-oop/pos-tagger/hardCode_testResults.txt",
        description: "Captured run output: predicted vs expected tags + accuracy summary.",
      },
    ],
  },
  {
    course: "problem-solving-oop",
    theme: "interactive-editors",
    slug: "sketch-editor",
    title: "Sketch Editor (single-client)",
    summary:
      "Draw, move, recolour, and delete shapes on a shared canvas — the same Shape / Sketch model from the PS_6 collaborative editor, with the network layer stripped away. Hit-testing matches the original Java per shape type (ellipse equation; segment-distance ≤ 3 pixels).",
    originalSourcePath: "/sources/problem-solving-oop/sketch-editor/Editor.java",
    sourceLanguage: "Java",
    relatedSources: [
      {
        label: "Editor.java",
        path: "/sources/problem-solving-oop/sketch-editor/Editor.java",
        description: "Main Swing window — tool palette, mode radios, mouse handlers.",
      },
      {
        label: "Sketch.java",
        path: "/sources/problem-solving-oop/sketch-editor/Sketch.java",
        description: "Synchronised list of shapes with add / remove / topMost / draw.",
      },
      {
        label: "Shape.java",
        path: "/sources/problem-solving-oop/sketch-editor/Shape.java",
        description: "Shared interface: contains, moveBy, setColor, setCorners, draw.",
      },
      {
        label: "Ellipse.java",
        path: "/sources/problem-solving-oop/sketch-editor/Ellipse.java",
        description: "Ellipse implementation with the (x/a)^2 + (y/b)^2 ≤ 1 hit-test.",
      },
      {
        label: "Rectangle.java",
        path: "/sources/problem-solving-oop/sketch-editor/Rectangle.java",
        description: "Bounding-box hit-test rectangle.",
      },
      {
        label: "Segment.java",
        path: "/sources/problem-solving-oop/sketch-editor/Segment.java",
        description: "Line segment with point-to-segment-distance ≤ 3 hit-test.",
      },
      {
        label: "EditorCommunicator.java",
        path: "/sources/problem-solving-oop/sketch-editor/EditorCommunicator.java",
        description: "Client side of the original networking — speaks the editor protocol over TCP.",
      },
      {
        label: "SketchServer.java",
        path: "/sources/problem-solving-oop/sketch-editor/SketchServer.java",
        description: "Multi-client server that broadcasts updates back to every editor.",
      },
      {
        label: "SketchServerCommunicator.java",
        path: "/sources/problem-solving-oop/sketch-editor/SketchServerCommunicator.java",
        description: "Per-client server thread; relays add/move/recolor/delete messages.",
      },
      {
        label: "EchoServer.java",
        path: "/sources/problem-solving-oop/sketch-editor/EchoServer.java",
        description: "Reference echo server used to test the messaging layer in isolation.",
      },
      {
        label: "EditorOne.java (SA_8)",
        path: "/sources/problem-solving-oop/sketch-editor/EditorOne.java",
        description: "Earlier single-client warm-up assignment that established the Shape API.",
      },
    ],
  },
  {
    course: "problem-solving-oop",
    theme: "generative-art",
    slug: "pollock",
    title: "Pollock Canvas",
    summary:
      "Thousands of randomly-coloured wandering pixels leaving a colour trail across the canvas. Faithfully ports the WI19 SA_2 Pollock + WanderingPixel + Wanderer trio, swapping the Java BufferedImage for an HTML canvas.",
    originalSourcePath: "/sources/problem-solving-oop/pollock/Pollock.java",
    sourceLanguage: "Java",
    relatedSources: [
      {
        label: "Pollock.java",
        path: "/sources/problem-solving-oop/pollock/Pollock.java",
        description: "Spawns the swarm of WanderingPixels and runs the timer-driven animation.",
      },
      {
        label: "WanderingPixel.java",
        path: "/sources/problem-solving-oop/pollock/WanderingPixel.java",
        description: "A coloured Wanderer that draws itself as a small filled oval.",
      },
      {
        label: "PurposeWanderer.java",
        path: "/sources/problem-solving-oop/pollock/PurposeWanderer.java",
        description: "A variant blob that moves deterministically for N steps before randomising — the warm-up that established the Wanderer pattern.",
      },
      {
        label: "HoloDancers.java",
        path: "/sources/problem-solving-oop/pollock/HoloDancers.java",
        description: "First-week class definition exercise — a stand-in for the simplest Java class shape.",
      },
    ],
  },
  {
    course: "problem-solving-oop",
    theme: "data-structures",
    slug: "linked-list",
    title: "Singly Linked List (head + tail)",
    summary:
      "A from-scratch singly linked list with both head AND tail pointers, so append is O(1) instead of O(n). Step through scripted sequences to watch the pointers move on every add / remove / append operation.",
    originalSourcePath: "/sources/problem-solving-oop/linked-list/SinglyLinkedHT.java",
    sourceLanguage: "Java",
    relatedSources: [
      {
        label: "SinglyLinkedHT.java",
        path: "/sources/problem-solving-oop/linked-list/SinglyLinkedHT.java",
        description: "The Java version with the inner Element class, advance / add / remove / append, and a main() that exercises every operation.",
      },
    ],
  },
  {
    course: "intro-to-programming",
    theme: "interactive-worlds",
    slug: "pong",
    title: "Pong",
    summary:
      "A reimplementation of an Atari-style two-player Pong game, originally built in Fall 2018 with the cs1lib graphics library. Two checkpoints show the project growing from paddles-only motion into a full game with ball physics, collisions, and scoring.",
    originalSourcePath:
      "/sources/intro-to-programming/pong/pong_game_Akosa.py",
    checkpoints: [
      {
        label: "Paddles only",
        path: "/sources/intro-to-programming/pong/atari_pong_akosah.py",
        description:
          "First checkpoint: two paddles that respond to keyboard input, no ball yet.",
      },
      {
        label: "Full game",
        path: "/sources/intro-to-programming/pong/pong_game_Akosa.py",
        description:
          "Final submission: ball physics, paddle collisions, wall bouncing, scoring, and serve direction.",
      },
    ],
  },
  {
    course: "machine-learning",
    theme: "optimisation",
    slug: "gradient-descent",
    title: "Gradient Descent Visualiser",
    summary:
      "HW1 of CS 74/174 (SP20). Implement gradient descent and watch it walk down a quartic cost surface — g(w) = (w⁴ + w² + 10w − 50) / 50. Drag sliders for the starting point, learning rate, and iteration count; step through the trajectory; see exactly when too-large a step causes the iterates to overshoot, oscillate, or diverge.",
    originalSourcePath:
      "/sources/machine-learning/gradient-descent/HW1_GradientDescent.ipynb",
    sourceLanguage: "Python (Jupyter)",
    relatedSources: [
      {
        label: "HW1_GradientDescent.ipynb",
        path: "/sources/machine-learning/gradient-descent/HW1_GradientDescent.ipynb",
        description: "Original Jupyter notebook — autograd-based GD implementation and plots.",
      },
    ],
  },
  {
    course: "machine-learning",
    theme: "regression",
    slug: "linear-regression",
    title: "Linear Regression on Kleiber's Law",
    summary:
      "HW2 of CS 74/174 (SP20). Fit a straight line to the log–log relationship between an animal's body mass and its resting metabolism. Drag sliders to fit by hand, then train with gradient descent under least-squares or least-absolute-deviation loss. The closed-form OLS fit is overlaid as a dashed reference; Kleiber's law predicts a slope of about 0.75.",
    originalSourcePath:
      "/sources/machine-learning/linear-regression/HW2_LinearRegression.ipynb",
    sourceLanguage: "Python (Jupyter)",
    relatedSources: [
      {
        label: "HW2_LinearRegression.ipynb",
        path: "/sources/machine-learning/linear-regression/HW2_LinearRegression.ipynb",
        description: "Original notebook — model + least squares + LAD + Ridge/Lasso polynomial regression with sklearn.",
      },
    ],
  },
  {
    course: "machine-learning",
    theme: "classification",
    slug: "logistic-regression",
    title: "Logistic Regression",
    summary:
      "HW3 of CS 74/174 (SP20). The classic single-feature binary classifier — predict the probability of class 1 with σ(w₀ + w₁·x), train under binary cross-entropy with analytic gradient descent. Drag the slope/intercept by hand, train, then move the decision threshold to trade off false positives against false negatives without retraining.",
    originalSourcePath:
      "/sources/machine-learning/logistic-regression/HW3_LogisticRegression.ipynb",
    sourceLanguage: "Python (Jupyter)",
    relatedSources: [
      {
        label: "HW3_LogisticRegression.ipynb",
        path: "/sources/machine-learning/logistic-regression/HW3_LogisticRegression.ipynb",
        description: "Original notebook — sigmoid, cross-entropy, gradient descent, evaluate, perceptron cost.",
      },
    ],
  },
  {
    course: "machine-learning",
    theme: "probabilistic-classifiers",
    slug: "naive-bayes",
    title: "Naïve Bayes Text Classifier",
    summary:
      "HW4 of CS 74/174 (SP20). Multinomial Naïve Bayes from scratch with Laplace smoothing, applied to a tiny spam / ham corpus. Type your own message and watch the model break down each word's log-probability contribution toward each class — and slide the smoothing α to see how the posterior sharpens or softens.",
    originalSourcePath:
      "/sources/machine-learning/naive-bayes/HW4_NaiveBayes.ipynb",
    sourceLanguage: "Python (Jupyter)",
    relatedSources: [
      {
        label: "HW4_NaiveBayes.ipynb",
        path: "/sources/machine-learning/naive-bayes/HW4_NaiveBayes.ipynb",
        description: "Original notebook — Multinomial NB, Gaussian NB, F1 score, sklearn comparison.",
      },
    ],
  },
  {
    course: "embedded-systems",
    theme: "bit-banging-gpio",
    slug: "blinky",
    title: "Blinky — Virtual AVR Registers",
    summary:
      "Lab 1 of E85 (WI21). The first AVR program — drive three LEDs on PORT D bits 2/4/7 by writing directly to the DDRD (data direction) and PORTD (output) registers. The simulator interprets the same |=, &= ~, ^= bit-twiddling idioms the student wrote in C, against virtual 8-bit registers, and lights virtual LEDs only when both DDRD bit AND PORTD bit are 1 — exactly as on real hardware. Step through blinkSEQ.c (sequential) or blinkyCNT.c (3-bit counter) instruction-by-instruction.",
    originalSourcePath: "/sources/embedded-systems/blinky/blinkySEQ.c",
    sourceLanguage: "C (AVR)",
    relatedSources: [
      {
        label: "blinkySEQ.c",
        path: "/sources/embedded-systems/blinky/blinkySEQ.c",
        description: "Sequential blink — light D2, D4, D7 in order using bit-set / bit-clear.",
      },
      {
        label: "blinkyCNT.c",
        path: "/sources/embedded-systems/blinky/blinkyCNT.c",
        description: "3-bit binary counter on the same three LEDs.",
      },
    ],
  },
  {
    course: "embedded-systems",
    theme: "inputs-and-reaction",
    slug: "reaction-game",
    title: "Reaction-Time Game",
    summary:
      "Two-player reaction-time game from `buttonLED_RTG.c`. The original C polled two buttons through PIND7/PIND4 pull-ups and drove three LEDs on PORTB. Re-rendered as a 4-phase finite state machine — IDLE → COUNTDOWN (start light blinks 3 times) → READY → CELEBRATE — measuring reaction time in milliseconds from when READY begins.",
    originalSourcePath: "/sources/embedded-systems/reaction-game/buttonLED_RTG.c",
    sourceLanguage: "C (AVR)",
    relatedSources: [
      {
        label: "buttonLED_RTG.c",
        path: "/sources/embedded-systems/reaction-game/buttonLED_RTG.c",
        description: "Two-player reaction game; pull-up button polling + winner flicker.",
      },
    ],
  },
  {
    course: "embedded-systems",
    theme: "adc-and-sensors",
    slug: "voltmeter-fan",
    title: "Voltmeter + Temperature → Fan",
    summary:
      "Lab 3 + Lab 4 of E85 (WI21). A TMP36 analog temperature sensor drives the AVR's 10-bit ADC, and a TIMER1 interrupt samples it once per second. The simulator pipes the user-controlled ambient temperature through the same calibration math (`(V_mV − 500)/10`) and the same hysteresis decision rule (LOW=26°C, HIGH=28°C) the C source uses — driving a virtual red LED, green LED, and a spinning fan.",
    originalSourcePath: "/sources/embedded-systems/voltmeter-fan/lab4.c",
    sourceLanguage: "C (AVR)",
    relatedSources: [
      {
        label: "lab4.c",
        path: "/sources/embedded-systems/voltmeter-fan/lab4.c",
        description: "Lab 4 — TIMER1-driven 1 Hz sampling + fan/LED controller.",
      },
      {
        label: "voltmeter.c",
        path: "/sources/embedded-systems/voltmeter-fan/voltmeter.c",
        description: "Lab 3 — voltmeter that prints ADC + voltage + °C + °F over UART.",
      },
      {
        label: "ADC.c",
        path: "/sources/embedded-systems/voltmeter-fan/ADC.c",
        description: "Standalone ADC initialiser (AVCC ref, prescaler /128).",
      },
    ],
  },
  {
    course: "embedded-systems",
    theme: "display-and-motion",
    slug: "tilt-7seg",
    title: "Tilt → 7-Segment Display",
    summary:
      "Lab 5 of E85 (WI21). An LSM303AGR accelerometer feeds an Adafruit HT16K33 4-digit 7-segment display over I2C. The firmware computes `tilt = asin(Ax / g)`, converts to deci-degrees, then packs four segment-bytes (with minus sign + decimal point) via `SevenSeg_angle()`. Tilt the virtual device and watch the exact same byte stream — rendered SVG-segment-by-segment — that the real display would receive.",
    originalSourcePath: "/sources/embedded-systems/tilt-7seg/lab5.c",
    sourceLanguage: "C (AVR)",
    relatedSources: [
      {
        label: "lab5.c",
        path: "/sources/embedded-systems/tilt-7seg/lab5.c",
        description: "Main loop — TIMER1 sampling, asin tilt math, SevenSeg_angle call.",
      },
      {
        label: "SevenSeg.c",
        path: "/sources/embedded-systems/tilt-7seg/SevenSeg.c",
        description: "HT16K33 driver — number / angle packing, dim, blink.",
      },
      {
        label: "SevenSeg.h",
        path: "/sources/embedded-systems/tilt-7seg/SevenSeg.h",
        description: "Public API + numbertable header.",
      },
      {
        label: "lsm303agr.c",
        path: "/sources/embedded-systems/tilt-7seg/lsm303agr.c",
        description: "Accelerometer init + raw read (I2C).",
      },
    ],
  },
  {
    course: "embedded-systems",
    theme: "motor-and-pwm",
    slug: "motor-rpm",
    title: "DC Motor + PWM + RPM Speedometer",
    summary:
      "Lab 7 of E85 (WI21). A potentiometer drives the AVR's 10-bit ADC, which selects motor mode (FWD / BRAKE / REV) and a PWM duty value over a TB6612 H-bridge. A pin-change interrupt on PIND7 counts pulses from a 3-blade speed sensor, and every second the firmware reports RPM = 3 × pulses (signed by direction). Drag the pot, watch the shaft accelerate, and read the speedometer live.",
    originalSourcePath: "/sources/embedded-systems/motor-rpm/lab7.c",
    sourceLanguage: "C (AVR)",
    relatedSources: [
      {
        label: "lab7.c",
        path: "/sources/embedded-systems/motor-rpm/lab7.c",
        description: "Main loop — Timer1 PWM, Timer0 sampler, pin-change RPM counter.",
      },
      {
        label: "tb6612.c",
        path: "/sources/embedded-systems/motor-rpm/tb6612.c",
        description: "TB6612 H-bridge driver — FWD/REV/BRAKE/STOP + PWM speed.",
      },
      {
        label: "tb6612.h",
        path: "/sources/embedded-systems/motor-rpm/tb6612.h",
        description: "Public API + MOTOR_MIN/MAX/DEAD_BAND constants.",
      },
    ],
  },
  {
    course: "embedded-systems",
    theme: "iot-and-real-time",
    slug: "traffic-control",
    title: "IoT Level-Crossing Dashboard",
    summary:
      "Capstone IoT Lab. An Arduino with an Adafruit Airlift WiFi shield subscribes to two Adafruit IO MQTT feeds — `maintenance` (ON/OFF) and a `train_sig` push button — and drives an RGB stoplight + an SG92R servo crossing gate. The FSM cycles RED → YELLOW → GREEN → YELLOW, pre-empting to MAINTENANCE or TRAIN_ARRIVAL on remote events and returning to RED + gate-open on clear. The same FSM is reproduced as a pure reducer here.",
    originalSourcePath:
      "/sources/embedded-systems/traffic-control/AIO_MQTT_traffic_control.ino",
    sourceLanguage: "C++ (Arduino)",
    relatedSources: [
      {
        label: "AIO_MQTT_traffic_control.ino",
        path: "/sources/embedded-systems/traffic-control/AIO_MQTT_traffic_control.ino",
        description:
          "Full sketch — WiFi/MQTT setup, FSM, servo & RGB control, TMP36 publish.",
      },
    ],
  },
  {
    course: "digital-electronics",
    theme: "state-machines",
    slug: "spi-fsm",
    title: "SPI Controller FSM",
    summary:
      "Lab 4 of ENGS 31 (SP20). A Moore-style finite state machine in VHDL drives a 16-bit SPI transaction over three states: SWait → Shift → Load → SWait. The Shift state holds for 15 sclk cycles (count 0…14), with TC pulsing the move to Load on the 16th. Pulse take_sample, watch the state graph light up, and read the per-state spi_cs / shift_en / load_en / CE outputs — exactly as the original .vhd entity defined them.",
    originalSourcePath: "/sources/digital-electronics/spi-fsm/Controller_lab4.vhd",
    sourceLanguage: "VHDL",
    relatedSources: [
      {
        label: "Controller_lab4.vhd",
        path: "/sources/digital-electronics/spi-fsm/Controller_lab4.vhd",
        description: "FSM entity + Moore-style next-state and output logic.",
      },
      {
        label: "Controller_lab4_tb.vhd",
        path: "/sources/digital-electronics/spi-fsm/Controller_lab4_tb.vhd",
        description: "Testbench from the original submission.",
      },
    ],
  },
  {
    course: "digital-electronics",
    theme: "datapaths",
    slug: "spi-datapath",
    title: "SPI Receiver Datapath",
    summary:
      "From lab4_datapath.vhd. The companion datapath to the SPI controller FSM: a 16-bit shift register clocks `spi_sdata` in MSB-first while `shift_en` is high; on a `load_en` pulse, the low 12 bits are latched into the parallel output register that drives `ad_data` (the 12-bit ADC bus). Drive any 16-bit pattern through the bus, watch each bit slot in, then capture.",
    originalSourcePath: "/sources/digital-electronics/spi-datapath/lab4_datapath.vhd",
    sourceLanguage: "VHDL",
    relatedSources: [
      {
        label: "lab4_datapath.vhd",
        path: "/sources/digital-electronics/spi-datapath/lab4_datapath.vhd",
        description: "Datapath entity — shift_register + output_register processes.",
      },
      {
        label: "lab4_datapath_tb.vhd",
        path: "/sources/digital-electronics/spi-datapath/lab4_datapath_tb.vhd",
        description: "Testbench from the original submission.",
      },
    ],
  },
];

export function getProject(
  course: string,
  theme: string,
  slug: string,
): Project | null {
  return (
    PROJECTS.find(
      (p) => p.course === course && p.theme === theme && p.slug === slug,
    ) ?? null
  );
}

export function listProjectsForTheme(
  course: string,
  theme: string,
): Project[] {
  return PROJECTS.filter((p) => p.course === course && p.theme === theme);
}

export function listAllProjectPaths(): Array<
  Pick<Project, "course" | "theme" | "slug">
> {
  return PROJECTS.map(({ course, theme, slug }) => ({ course, theme, slug }));
}
