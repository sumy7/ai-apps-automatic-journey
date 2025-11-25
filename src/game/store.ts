import { create } from 'zustand';
import type { Car, Direction, GameState, GameStatus, Position } from './types';

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
  const maxAttempts = 1000;
  
  while (cars.length < carCount && attempts < maxAttempts) {
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

interface GameStore extends GameState {
  initGame: (boardSize?: number, carCount?: number) => void;
  moveCar: (carId: string) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  boardSize: 6,
  cars: [],
  status: 'playing',
  movingCarId: null,
  
  initGame: (boardSize = 6, carCount = 5) => {
    const cars = generateCars(boardSize, carCount);
    const status: GameStatus = cars.length === 0 ? 'won' : 
      canAnyCarMove(cars, boardSize) ? 'playing' : 'lost';
    
    set({
      boardSize,
      cars,
      status,
      movingCarId: null
    });
  },
  
  moveCar: (carId: string) => {
    const { cars, boardSize, status, movingCarId } = get();
    
    // Don't move if game is over or another car is moving
    if (status !== 'playing' || movingCarId !== null) return;
    
    const carIndex = cars.findIndex(c => c.id === carId);
    if (carIndex === -1) return;
    
    const car = cars[carIndex];
    
    // Check if car can move
    if (!canCarMove(car, cars, boardSize)) return;
    
    // Set moving car
    set({ movingCarId: carId });
    
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
        
        // Check game status
        let newStatus: GameStatus = 'playing';
        if (newCars.length === 0) {
          newStatus = 'won';
        } else if (!canAnyCarMove(newCars, currentState.boardSize)) {
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
        setTimeout(animateMove, 150);
      } else {
        // Stop moving
        let newStatus: GameStatus = 'playing';
        if (!canAnyCarMove(newCars, currentState.boardSize)) {
          newStatus = 'lost';
        }
        
        set({
          cars: newCars,
          status: newStatus,
          movingCarId: null
        });
      }
    };
    
    setTimeout(animateMove, 150);
  }
}));
