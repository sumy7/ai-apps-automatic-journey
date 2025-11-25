import styled from 'styled-components';
import { useGameStore } from './store';
import type { Car as CarType, Position } from './types';
import { useEffect } from 'react';

// Layout constants
const CELL_SIZE = 50;
const GAP_SIZE = 2;
const DEFAULT_BOARD_SIZE = 6;
const DEFAULT_CAR_COUNT = 5;

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
`;

const StatusMessage = styled.div<{ $status: 'playing' | 'won' | 'lost' }>`
  font-size: 24px;
  font-weight: bold;
  color: ${props => {
    switch (props.$status) {
      case 'won': return '#4CAF50';
      case 'lost': return '#F44336';
      default: return '#2196F3';
    }
  }};
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  
  &:hover {
    background-color: #1976D2;
  }
`;

const BoardWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 50px;
`;

const Board = styled.div<{ $size: number }>`
  position: relative;
  transform: rotate(45deg);
  display: grid;
  grid-template-columns: repeat(${props => props.$size}, ${CELL_SIZE}px);
  grid-template-rows: repeat(${props => props.$size}, ${CELL_SIZE}px);
  gap: ${GAP_SIZE}px;
  background-color: #333;
  padding: ${GAP_SIZE}px;
  border-radius: 5px;
`;

const Cell = styled.div`
  width: ${CELL_SIZE}px;
  height: ${CELL_SIZE}px;
  background-color: #e0e0e0;
  border-radius: 3px;
`;

const CarElement = styled.div<{ 
  $head: Position; 
  $tail: Position; 
  $color: string;
  $isMoving: boolean;
}>`
  position: absolute;
  background-color: ${props => props.$color};
  border-radius: 8px;
  cursor: ${props => props.$isMoving ? 'not-allowed' : 'pointer'};
  transition: all 0.15s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  
  /* Calculate position and size based on head and tail */
  ${props => {
    const minRow = Math.min(props.$head.row, props.$tail.row);
    const minCol = Math.min(props.$head.col, props.$tail.col);
    const maxRow = Math.max(props.$head.row, props.$tail.row);
    const maxCol = Math.max(props.$head.col, props.$tail.col);
    
    const cellWithGap = CELL_SIZE + GAP_SIZE;
    const top = minRow * cellWithGap + GAP_SIZE;
    const left = minCol * cellWithGap + GAP_SIZE;
    const width = (maxCol - minCol + 1) * CELL_SIZE + (maxCol - minCol) * GAP_SIZE;
    const height = (maxRow - minRow + 1) * CELL_SIZE + (maxRow - minRow) * GAP_SIZE;
    
    return `
      top: ${top}px;
      left: ${left}px;
      width: ${width}px;
      height: ${height}px;
    `;
  }}
  
  &:hover {
    filter: ${props => props.$isMoving ? 'none' : 'brightness(1.1)'};
  }
`;

const CarHead = styled.div<{ $direction: string }>`
  width: 15px;
  height: 15px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  position: absolute;
  
  ${props => {
    switch (props.$direction) {
      case 'up': return 'top: 5px; left: 50%; transform: translateX(-50%);';
      case 'down': return 'bottom: 5px; left: 50%; transform: translateX(-50%);';
      case 'left': return 'left: 5px; top: 50%; transform: translateY(-50%);';
      case 'right': return 'right: 5px; top: 50%; transform: translateY(-50%);';
      default: return '';
    }
  }}
`;

interface CarProps {
  car: CarType;
  isMoving: boolean;
  onClick: () => void;
}

const Car = ({ car, isMoving, onClick }: CarProps) => {
  return (
    <CarElement
      $head={car.head}
      $tail={car.tail}
      $color={car.color}
      $isMoving={isMoving}
      onClick={onClick}
    >
      <CarHead $direction={car.direction} />
    </CarElement>
  );
};

const Game = () => {
  const { boardSize, cars, status, movingCarId, initGame, moveCar } = useGameStore();
  
  useEffect(() => {
    initGame(DEFAULT_BOARD_SIZE, DEFAULT_CAR_COUNT);
  }, [initGame]);
  
  const handleCarClick = (carId: string) => {
    if (status !== 'playing' || movingCarId !== null) return;
    moveCar(carId);
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'won': return '🎉 You Won! All cars left the board!';
      case 'lost': return '😞 Game Over! No more moves available.';
      default: return 'Click a car to move it in its direction!';
    }
  };
  
  return (
    <GameContainer>
      <Title>🚗 Car Elimination Game</Title>
      
      <StatusMessage $status={status}>
        {getStatusText()}
      </StatusMessage>
      
      <Controls>
        <Button onClick={() => initGame(DEFAULT_BOARD_SIZE, DEFAULT_CAR_COUNT)}>New Game</Button>
      </Controls>
      
      <BoardWrapper>
        <Board $size={boardSize}>
          {Array.from({ length: boardSize * boardSize }).map((_, index) => (
            <Cell key={index} />
          ))}
          
          {cars.map(car => (
            <Car
              key={car.id}
              car={car}
              isMoving={movingCarId === car.id}
              onClick={() => handleCarClick(car.id)}
            />
          ))}
        </Board>
      </BoardWrapper>
    </GameContainer>
  );
};

export default Game;
