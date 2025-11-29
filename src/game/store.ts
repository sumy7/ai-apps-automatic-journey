import { create } from 'zustand';
import type { Car, Direction, GameState, GameStatus, Position } from './types';

// Game configuration constants
const ANIMATION_DELAY_MS = 150;
const MAX_CAR_GENERATION_ATTEMPTS = 1000;
const DEFAULT_BOARD_SIZE = 8;
const DEFAULT_CAR_COUNT = 15;
const DEFAULT_FLIP_POWER_UP_COUNT = 2;
const FLIP_CAR_COUNT = 3;

// Helper function to generate a random color
const generateColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Helper function to get direction delta
const getDirectionDelta = (direction: Direction): Position => {
  switch (direction) {
    case 'up': return { row: -1, col: 0 };
    case 'down': return { row: 1, col: 0 };
    case 'left': return { row: 0, col: -1 };
    case 'right': return { row: 0, col: 1 };
  }
};

// Helper function to get tail position from head position and direction
const getTailFromHead = (head: Position, direction: Direction): Position => {
  const delta = getDirectionDelta(direction);
  // Tail is opposite to the direction the car is facing
  return {
    row: head.row - delta.row,
    col: head.col - delta.col
  };
};

// Check if a position is within the board
const isInBoard = (pos: Position, boardSize: number): boolean => {
  return pos.row >= 0 && pos.row < boardSize && pos.col >= 0 && pos.col < boardSize;
};

// Check if a position is occupied by any car
const isOccupied = (pos: Position, cars: Car[], excludeCarId?: string): boolean => {
  return cars.some(car => {
    if (car.id === excludeCarId) return false;
    return (
      (car.head.row === pos.row && car.head.col === pos.col) ||
      (car.tail.row === pos.row && car.tail.col === pos.col)
    );
  });
};

// Generate random cars for the board
const generateCars = (boardSize: number, carCount: number): Car[] => {
  const cars: Car[] = [];
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  
  let attempts = 0;
  
  while (cars.length < carCount && attempts < MAX_CAR_GENERATION_ATTEMPTS) {
    attempts++;
    
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const head: Position = {
      row: Math.floor(Math.random() * boardSize),
      col: Math.floor(Math.random() * boardSize)
    };
    const tail = getTailFromHead(head, direction);
    
    // Check if both head and tail are in the board
    if (!isInBoard(head, boardSize) || !isInBoard(tail, boardSize)) {
      continue;
    }
    
    // Check if positions are not occupied
    if (isOccupied(head, cars) || isOccupied(tail, cars)) {
      continue;
    }
    
    cars.push({
      id: `car-${cars.length}`,
      head,
      tail,
      direction,
      color: generateColor()
    });
  }
  
  return cars;
};

// Check if a car can move
const canCarMove = (car: Car, cars: Car[], boardSize: number): boolean => {
  const delta = getDirectionDelta(car.direction);
  const nextHeadPos: Position = {
    row: car.head.row + delta.row,
    col: car.head.col + delta.col
  };
  
  // If moving outside the board, the car can move (it will leave)
  if (!isInBoard(nextHeadPos, boardSize)) {
    return true;
  }
  
  // Check if the next position is occupied by another car
  return !isOccupied(nextHeadPos, cars, car.id);
};

// Check if any car can move
const canAnyCarMove = (cars: Car[], boardSize: number): boolean => {
  return cars.some(car => canCarMove(car, cars, boardSize));
};

// Move a car one step
const moveCarOneStep = (car: Car): Car => {
  const delta = getDirectionDelta(car.direction);
  return {
    ...car,
    head: {
      row: car.head.row + delta.row,
      col: car.head.col + delta.col
    },
    tail: {
      row: car.tail.row + delta.row,
      col: car.tail.col + delta.col
    }
  };
};

// Check if car is completely outside the board
const isCarOutside = (car: Car, boardSize: number): boolean => {
  return !isInBoard(car.head, boardSize) && !isInBoard(car.tail, boardSize);
};

// Helper function to get the opposite direction
const getOppositeDirection = (direction: Direction): Direction => {
  switch (direction) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
  }
};

// Helper function to flip car direction (swap head and tail)
const flipCarDirection = (car: Car): Car => {
  return {
    ...car,
    head: car.tail,
    tail: car.head,
    direction: getOppositeDirection(car.direction)
  };
};

interface GameStore extends GameState {
  initGame: (boardSize?: number, carCount?: number) => void;
  moveCar: (carId: string) => void;
  activateFlipPowerUp: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  boardSize: DEFAULT_BOARD_SIZE,
  cars: [],
  status: 'playing',
  movingCarId: null,
  flipPowerUpCount: DEFAULT_FLIP_POWER_UP_COUNT,
  moveCount: 0,
  initialCarCount: DEFAULT_CAR_COUNT,
  
  initGame: (boardSize = DEFAULT_BOARD_SIZE, carCount = DEFAULT_CAR_COUNT) => {
    const cars = generateCars(boardSize, carCount);
    // Only lose if no cars can move AND no power-ups available
    const status: GameStatus = cars.length === 0 ? 'won' : 
      (canAnyCarMove(cars, boardSize) || DEFAULT_FLIP_POWER_UP_COUNT > 0) ? 'playing' : 'lost';
    
    set({
      boardSize,
      cars,
      status,
      movingCarId: null,
      flipPowerUpCount: DEFAULT_FLIP_POWER_UP_COUNT,
      moveCount: 0,
      initialCarCount: cars.length // Track actual initial car count
    });
  },
  
  moveCar: (carId: string) => {
    const { cars, boardSize, status, movingCarId, moveCount } = get();
    
    // Don't move if game is over or another car is moving
    if (status !== 'playing' || movingCarId !== null) return;
    
    const carIndex = cars.findIndex(c => c.id === carId);
    if (carIndex === -1) return;
    
    const car = cars[carIndex];
    
    // Check if car can move
    if (!canCarMove(car, cars, boardSize)) return;
    
    // Set moving car and increment move count
    set({ movingCarId: carId, moveCount: moveCount + 1 });
    
    // Animate the car movement
    const animateMove = () => {
      const currentState = get();
      const currentCarIndex = currentState.cars.findIndex(c => c.id === carId);
      
      if (currentCarIndex === -1) {
        set({ movingCarId: null });
        return;
      }
      
      const currentCar = currentState.cars[currentCarIndex];
      const movedCar = moveCarOneStep(currentCar);
      
      // Check if car is outside
      if (isCarOutside(movedCar, currentState.boardSize)) {
        // Remove the car
        const newCars = currentState.cars.filter(c => c.id !== carId);
        
        // Check game status - only lose if no moves AND no power-ups
        let newStatus: GameStatus = 'playing';
        if (newCars.length === 0) {
          newStatus = 'won';
        } else if (!canAnyCarMove(newCars, currentState.boardSize) && currentState.flipPowerUpCount <= 0) {
          newStatus = 'lost';
        }
        
        set({
          cars: newCars,
          status: newStatus,
          movingCarId: null
        });
        return;
      }
      
      // Check if can continue moving
      const newCars = [...currentState.cars];
      newCars[currentCarIndex] = movedCar;
      
      if (canCarMove(movedCar, newCars, currentState.boardSize)) {
        // Continue moving
        set({ cars: newCars });
        setTimeout(animateMove, ANIMATION_DELAY_MS);
      } else {
        // Stop moving - only lose if no moves AND no power-ups
        let newStatus: GameStatus = 'playing';
        if (!canAnyCarMove(newCars, currentState.boardSize) && currentState.flipPowerUpCount <= 0) {
          newStatus = 'lost';
        }
        
        set({
          cars: newCars,
          status: newStatus,
          movingCarId: null
        });
      }
    };
    
    setTimeout(animateMove, ANIMATION_DELAY_MS);
  },
  
  activateFlipPowerUp: () => {
    const { cars, boardSize, status, movingCarId, flipPowerUpCount } = get();
    
    // Don't use power-up if game is over, a car is moving, or no power-ups left
    if (status !== 'playing' || movingCarId !== null || flipPowerUpCount <= 0 || cars.length === 0) return;
    
    // Randomly select up to FLIP_CAR_COUNT cars to flip using Fisher-Yates shuffle
    const carsToFlip = Math.min(FLIP_CAR_COUNT, cars.length);
    const indices = [...Array(cars.length).keys()];
    
    // Fisher-Yates shuffle for unbiased randomization
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    const indicesToFlip = indices.slice(0, carsToFlip);
    
    const newCars = cars.map((car, index) => 
      indicesToFlip.includes(index) ? flipCarDirection(car) : car
    );
    
    const newFlipPowerUpCount = flipPowerUpCount - 1;
    
    // Check game status after flipping - only lose if no moves AND no power-ups left
    let newStatus: GameStatus = 'playing';
    if (!canAnyCarMove(newCars, boardSize) && newFlipPowerUpCount <= 0) {
      newStatus = 'lost';
    }
    
    set({
      cars: newCars,
      flipPowerUpCount: newFlipPowerUpCount,
      status: newStatus
    });
  }
}));
