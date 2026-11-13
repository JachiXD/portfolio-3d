// Everything about you lives here. The pages read from this file.

// Vite's base is "/" locally and "/portfolio-3d/" on GitHub Pages, so images
// referenced from data have to carry that prefix too.
export const asset = (file: string) => `${import.meta.env.BASE_URL}images/${file}`

export const site = {
  name: 'Jay Takle',
  brand: 'JACHI_PORTFOLIO',
  codename: 'HSIN',
  epithet: 'MOON FOX',
  unit: 'EVA-00',
  role: 'AI & machine learning developer',
  location: 'India',
  timezone: 'Asia/Kolkata',
  email: 'jay.s.takle@gmail.com',
  available: true,
  intro: 'I build AI-powered applications: natural language processing, computer vision and the web interfaces that make them usable. First place at the CBSE competition for an AI chatbot and a predictive ML project.',
  socials: [
    { label: 'GitHub', href: 'https://github.com/JachiXD' },
    { label: 'Email', href: 'mailto:jay.s.takle@gmail.com' },
    { label: 'Previous site', href: 'https://jachixd.github.io/portfolio' },
  ],
  marquee: ['Python', 'Computer vision', 'Machine learning', 'NLP', 'Gemini', 'React'],
}

export interface Project {
  slug: string
  title: string
  client: string
  category: string
  year?: string
  cover: string
  tint: string
  summary: string
  role: string[]
  deliverables: string[]
  stack?: string[]
  link?: string
  body: string[]
  size: 'large' | 'small'
}

export const projects: Project[] = [
  {
    slug: 'ai-chatbot',
    title: 'Saarthi',
    client: 'CBSE competition',
    category: 'Voice assistant & LLM',
    cover: asset('saarthi.svg'),
    tint: '#120d1c',
    summary: 'A voice-first school assistant that gives directions to nine campus locations, takes reports of bullying or weapons, and calls Gemini when a scripted answer is not enough.',
    role: ['Speech recognition', 'Intent flow', 'LLM integration'],
    deliverables: ['Offline voice loop', 'Synonym-based intent matching', 'Gemini safety responses'],
    stack: ['Python', 'Vosk', 'Google Speech Recognition', 'pyttsx3', 'Gemini 1.5 Flash'],
    body: [
      'Saarthi is a voice assistant built for a school campus. You speak a destination and it answers out loud while printing the route: nine locations, from the principal’s office and reception to the library, nurse, canteen, staff room, admin office, coordinator and counsellor.',
      'The first version ran fully offline — Vosk speech recognition, pyttsx3 text-to-speech and keyword matching against a local dictionary of synonyms, so “fee counter” still found reception and “first aid” found the nurse. The second version moved to Google Speech Recognition and Gemini 1.5 Flash for the cases a dictionary cannot cover: when a student reports bullying, harassment or a weapon, a scripted route is replaced by a short, supportive generated reply.',
      'It won first place in the CBSE competition for AI chatbot and machine-learning projects. More importantly it taught me the difference between a demo that answers and an assistant that listens.',
    ],
    size: 'large',
  },
  {
    slug: 'weapon-detection',
    title: 'Weapon Detection',
    client: 'Independent',
    category: 'Real-time computer vision',
    cover: asset('weapon-detection.svg'),
    tint: '#0a1114',
    summary: 'A webcam detector for guns and knives, rebuilt from YOLOv4 through YOLOv8 to a small custom cascade, with the frame budget always in view.',
    role: ['Model integration', 'ONNX export', 'Real-time inference'],
    deliverables: ['Trained detector', 'ONNX export', 'Live OpenCV demo'],
    stack: ['Python', 'OpenCV', 'YOLOv4', 'Ultralytics YOLOv8', 'ONNX', 'Symlet wavelets'],
    body: [
      'A real-time detector that watches a webcam feed and draws a box around a gun or a knife. Capture, preprocessing, inference, filtering and drawing all have to fit inside a frame budget, which is where most of the engineering actually lives.',
      'The first version loaded YOLOv4 through OpenCV’s DNN module, with non-max suppression and a confidence threshold tuned for a noisy webcam. The next moved to Ultralytics YOLOv8 and exported the weights to ONNX, so inference no longer depended on the training environment — the OpenCV capture loop stayed the same.',
      'The last pass trades size for speed: a custom Haar cascade for a fixed camera angle, plus Symlet wavelet features for the edges a colour-based detector misses. It is a demo, not a security system, but it is where I learned to read a detector’s failures instead of its accuracy.',
    ],
    size: 'large',
  },
]

export const bySlug = (slug: string) => projects.find((p) => p.slug === slug)

export const skillGroups = [
  {
    title: 'Languages',
    items: [
      { name: 'Python', level: 90 },
      { name: 'JavaScript', level: 85 },
      { name: 'Java', level: 80 },
    ],
  },
  {
    title: 'Web development',
    items: [
      { name: 'React', level: 85 },
      { name: 'Next.js', level: 80 },
      { name: 'HTML & CSS', level: 90 },
    ],
  },
  {
    title: 'AI & machine learning',
    items: [
      { name: 'Machine learning', level: 85 },
      { name: 'Deep learning', level: 80 },
      { name: 'Computer vision', level: 85 },
      { name: 'Data analysis', level: 85 },
    ],
  },
  {
    title: 'Tools & platforms',
    items: [
      { name: 'Git', level: 85 },
      { name: 'OpenCV', level: 85 },
      { name: 'Docker', level: 75 },
      { name: 'AWS', level: 70 },
    ],
  },
]

export const achievements = [
  {
    title: 'CBSE winner',
    tag: 'CBSE competition',
    detail: 'First place in the CBSE competition for Saarthi, the AI voice assistant, and the machine-learning work around it.',
  },
  {
    title: 'AI projects',
    tag: 'NLP · Computer vision',
    detail: 'Applications across NLP and computer vision, from a voice-first assistant to a real-time weapon detector.',
  },
  {
    title: 'Web development',
    tag: 'React · Next.js',
    detail: 'Modern, responsive interfaces with React, Next.js and TypeScript, including this 3D portfolio.',
  },
]

export const goals = [
  {
    horizon: 'Short term',
    items: ['Master advanced AI and machine-learning concepts', 'Develop full-stack expertise', 'Build a strong portfolio of innovative projects', 'Contribute to open-source AI'],
  },
  {
    horizon: 'Long term',
    items: ['Lead innovative AI projects in a tech company', 'Create AI solutions for real-world problems', 'Mentor aspiring developers and AI enthusiasts', 'Contribute to the advancement of AI technology'],
  },
]
