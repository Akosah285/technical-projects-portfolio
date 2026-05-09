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
