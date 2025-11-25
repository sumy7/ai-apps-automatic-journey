// Direction the car is facing (where the head is pointing)
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  row: number;
  col: number;
}

export interface Car {
  id: string;
  // Head position of the car
  head: Position;
  // Tail position of the car (adjacent to head)
  tail: Position;
  // Direction the car is facing (where it will move when clicked)
  direction: Direction;
  // Color of the car
  color: string;
}

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GameState {
  boardSize: number;
  cars: Car[];
  status: GameStatus;
  movingCarId: string | null;
}
