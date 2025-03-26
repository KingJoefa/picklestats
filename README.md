# PickleStats 🏓

A modern web application for tracking pickleball matches and player statistics, featuring a Miami Vice-inspired design theme.

## Features

- **Match Scoring**
  - Real-time score tracking
  - Player selection with automatic availability updates
  - Visual court representation
  - Celebratory animations for shutout victories (🥒)

- **Player Management**
  - Player profiles with stats
  - Profile picture support
  - Win/loss tracking
  - Points scored/conceded statistics

- **Match History**
  - Comprehensive match records
  - Filter matches by player
  - Detailed score breakdowns
  - Team composition tracking

- **Statistics**
  - Player win rates
  - Head-to-head records
  - Common partners analysis
  - Session statistics

## Tech Stack

- **Frontend**: Next.js 13.5.10
- **Styling**: Tailwind CSS with custom gradients
- **UI Components**: Radix UI
- **Database**: Prisma with SQLite
- **State Management**: Zustand
- **Animations**: Framer Motion

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/KingJoefa/picklestats.git
   cd picklestats
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses a Prisma database with the following main models:
- Players (name, profile picture, stats)
- Matches (teams, scores, date)
- Statistics (win rates, points, partnerships)

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project as you wish.

## Acknowledgments

- Inspired by the growing popularity of pickleball
- Design influenced by Miami Vice color schemes
- Built with modern web development best practices 