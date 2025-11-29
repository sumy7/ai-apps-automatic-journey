# 🚗 Car Elimination Game

A puzzle game where you eliminate cars from an isometric 3D board by clicking on them to make them move in their facing direction.

## 🎮 How to Play

1. **Click on any car** to make it move in the direction it's facing (indicated by the white dot)
2. Cars will continue moving until they hit another car or exit the board
3. When a car exits the board, it's eliminated
4. **Win** by eliminating all cars from the board
5. **Lose** if no cars can move and you're out of power-ups

## ✨ Features

- **Isometric 3D Board**: Beautiful 45-degree angled view with 3D car effects
- **Responsive Design**: Optimized for desktop (widescreen sidebar), tablet, and mobile layouts
- **Dark/Light Mode**: Automatic theme detection based on system preferences
- **Power-ups**: Use "Flip 3 Cars" to randomly change the direction of 3 cars
- **Statistics Panel**: Track cars remaining, eliminated, moves made, and power-ups left

## 🛠️ Tech Stack

- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **styled-components** - CSS-in-JS Styling
- **Zustand** - State Management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── game/
│   ├── Game.tsx      # Main game component with UI
│   ├── store.ts      # Zustand state management
│   ├── types.ts      # TypeScript type definitions
│   └── index.ts      # Module exports
├── App.tsx           # Root application component
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## 📜 License

MIT
