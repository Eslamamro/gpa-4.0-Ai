# StudyMate AI Toolkit

An AI-powered study companion that helps students transform their notes into summaries, flashcards, and interactive quizzes. Built with React, TypeScript, and modern web technologies.

## Features

- **AI-Powered Summaries**: Transform lengthy notes into concise, digestible summaries
- **Interactive Flashcards**: Automatically generate flashcards from your study materials  
- **Smart Quizzes**: Create personalized quizzes to test your knowledge
- **File Upload**: Support for various file formats (PDF, text files, etc.)
- **Modern UI**: Beautiful, responsive interface built with shadcn/ui components
- **Dark Mode**: Toggle between light and dark themes
- **Mobile Responsive**: Works seamlessly on all devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **shadcn/ui** components with Radix UI primitives
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** with Zod validation
- **Lucide React** icons

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Rushdy00/gpa-4.0-Ai.git
cd gpa-4.0-Ai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── Sidebar.tsx     # Navigation sidebar
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Home.tsx        # Landing page
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Flashcards.tsx  # Flashcards page
│   ├── Quiz.tsx        # Quiz page
│   └── Settings.tsx    # Settings page
└── main.tsx           # App entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please open an issue on GitHub.
