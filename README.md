# PickleStats

A modern, intuitive React application for tracking pickleball matches and player statistics in real-time.

## Features

- Interactive pickleball court visualization
- Real-time score tracking
- Player management system
- Match history tracking
- Session statistics
- Responsive design for mobile use

## Tech Stack

- Next.js 13+ with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Zustand for state management
- Framer Motion for animations

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Click on player slots to add players to the game
2. Use the score inputs to track points for each team
3. Click "End Match" when a game is complete
4. View match history and statistics in the stats panel

## Development

The project structure follows Next.js 13+ conventions:

```
src/
  app/              # Next.js app router pages
  components/       # React components
    Court/         # Court visualization components
    Stats/         # Statistics components
  store/           # Zustand state management
  types/           # TypeScript type definitions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request 