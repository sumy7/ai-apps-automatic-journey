import styled, { css } from 'styled-components';
import { useGameStore } from './store';
import type { Car as CarType, Position } from './types';
import { useEffect } from 'react';

// Layout constants - Increased for larger board and fuller cars
const CELL_SIZE = 60;
const GAP_SIZE = 3;
const DEFAULT_BOARD_SIZE = 8;
const DEFAULT_CAR_COUNT = 15;

const GameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
  
  @media (prefers-color-scheme: dark) {
    background-color: #1a1a2e;
  }
  
  @media (prefers-color-scheme: light) {
    background-color: #f5f5f5;
  }
`;

const Title = styled.h1`
  margin: 0;
  
  @media (prefers-color-scheme: dark) {
    color: #eee;
  }
  
  @media (prefers-color-scheme: light) {
    color: #333;
  }
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
  flex-wrap: wrap;
  justify-content: center;
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
  
  &:disabled {
    background-color: #9e9e9e;
    cursor: not-allowed;
  }
`;

const PowerUpButton = styled(Button)<{ $remaining: number }>`
  background-color: ${props => props.$remaining > 0 ? '#FF9800' : '#9e9e9e'};
  
  &:hover {
    background-color: ${props => props.$remaining > 0 ? '#F57C00' : '#9e9e9e'};
  }
`;

const BoardWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px;
  perspective: 1000px;
`;

// 45-degree isometric view with 3D effect
const Board = styled.div<{ $size: number }>`
  position: relative;
  display: grid;
  grid-template-columns: repeat(${props => props.$size}, ${CELL_SIZE}px);
  grid-template-rows: repeat(${props => props.$size}, ${CELL_SIZE}px);
  gap: ${GAP_SIZE}px;
  padding: ${GAP_SIZE}px;
  border-radius: 8px;
  transform-style: preserve-3d;
  transform: rotateX(45deg) rotateZ(45deg);
  box-shadow: 
    20px 20px 40px rgba(0, 0, 0, 0.3),
    -5px -5px 20px rgba(255, 255, 255, 0.1);
  
  @media (prefers-color-scheme: dark) {
    background-color: #2d2d44;
  }
  
  @media (prefers-color-scheme: light) {
    background-color: #333;
  }
`;

const Cell = styled.div`
  width: ${CELL_SIZE}px;
  height: ${CELL_SIZE}px;
  border-radius: 4px;
  transform-style: preserve-3d;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
  
  @media (prefers-color-scheme: dark) {
    background-color: #3d3d5c;
  }
  
  @media (prefers-color-scheme: light) {
    background-color: #e0e0e0;
  }
`;

// 3D car styling with depth effect
const car3DStyles = css<{ $color: string }>`
  /* Main body gradient for 3D effect */
  background: linear-gradient(
    135deg,
    ${props => props.$color} 0%,
    ${props => props.$color}dd 50%,
    ${props => props.$color}aa 100%
  );
  
  /* 3D box shadow for depth */
  box-shadow: 
    3px 3px 0 0 ${props => props.$color}88,
    6px 6px 0 0 ${props => props.$color}66,
    9px 9px 0 0 ${props => props.$color}44,
    12px 12px 15px rgba(0, 0, 0, 0.4);
  
  /* Subtle inner highlight for 3D effect */
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 50%;
    bottom: 50%;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.4) 0%,
      transparent 100%
    );
    border-radius: 6px 0 0 0;
    pointer-events: none;
  }
`;

const CarElement = styled.div<{ 
  $head: Position; 
  $tail: Position; 
  $color: string;
  $isMoving: boolean;
}>`
  position: absolute;
  border-radius: 10px;
  cursor: ${props => props.$isMoving ? 'not-allowed' : 'pointer'};
  transition: all 0.15s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
  
  ${car3DStyles}
  
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
    filter: ${props => props.$isMoving ? 'none' : 'brightness(1.15)'};
    transform: ${props => props.$isMoving ? 'none' : 'translateZ(5px)'};
  }
`;

const CarHead = styled.div<{ $direction: string }>`
  width: 20px;
  height: 20px;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6));
  border-radius: 50%;
  position: absolute;
  box-shadow: 
    inset -2px -2px 4px rgba(0, 0, 0, 0.2),
    2px 2px 4px rgba(0, 0, 0, 0.3);
  
  ${props => {
    switch (props.$direction) {
      case 'up': return 'top: 8px; left: 50%; transform: translateX(-50%);';
      case 'down': return 'bottom: 8px; left: 50%; transform: translateX(-50%);';
      case 'left': return 'left: 8px; top: 50%; transform: translateY(-50%);';
      case 'right': return 'right: 8px; top: 50%; transform: translateY(-50%);';
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
  const { boardSize, cars, status, movingCarId, flipPowerUpCount, initGame, moveCar, activateFlipPowerUp } = useGameStore();
  
  useEffect(() => {
    initGame(DEFAULT_BOARD_SIZE, DEFAULT_CAR_COUNT);
  }, [initGame]);
  
  const handleCarClick = (carId: string) => {
    if (status !== 'playing' || movingCarId !== null) return;
    moveCar(carId);
  };
  
  const handleFlipPowerUp = () => {
    if (status !== 'playing' || movingCarId !== null || flipPowerUpCount <= 0) return;
    activateFlipPowerUp();
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
        <PowerUpButton 
          $remaining={flipPowerUpCount}
          onClick={handleFlipPowerUp}
          disabled={flipPowerUpCount <= 0 || status !== 'playing' || movingCarId !== null}
        >
          🔄 Flip 3 Cars ({flipPowerUpCount} left)
        </PowerUpButton>
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
