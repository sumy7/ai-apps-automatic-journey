import styled, { css } from 'styled-components';
import { useGameStore } from './store';
import type { Car as CarType, Position } from './types';
import { useEffect } from 'react';

// Layout constants - Increased for larger board and fuller cars
const CELL_SIZE = 60;
const GAP_SIZE = 3;
const DEFAULT_BOARD_SIZE = 8;
const DEFAULT_CAR_COUNT = 15;

// Main container with widescreen layout
const GameContainer = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  width: 100%;
  
  @media (prefers-color-scheme: dark) {
    background-color: #1a1a2e;
  }
  
  @media (prefers-color-scheme: light) {
    background-color: #f5f5f5;
  }
  
  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

// Sidebar for controls and stats
const Sidebar = styled.aside`
  width: 320px;
  min-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  border-right: 1px solid rgba(128, 128, 128, 0.2);
  
  @media (prefers-color-scheme: dark) {
    background-color: #16162a;
  }
  
  @media (prefers-color-scheme: light) {
    background-color: #ffffff;
  }
  
  @media (max-width: 1024px) {
    width: 100%;
    min-width: unset;
    border-right: none;
    border-bottom: 1px solid rgba(128, 128, 128, 0.2);
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    padding: 16px;
    gap: 12px;
  }
`;

// Main game area
const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: auto;
`;

// Section in sidebar
const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  @media (max-width: 1024px) {
    min-width: 140px;
  }
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (prefers-color-scheme: dark) {
    color: #888;
  }
  
  @media (prefers-color-scheme: light) {
    color: #666;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (prefers-color-scheme: dark) {
    color: #eee;
  }
  
  @media (prefers-color-scheme: light) {
    color: #333;
  }
  
  @media (max-width: 1024px) {
    width: 100%;
    justify-content: center;
  }
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
  
  @media (prefers-color-scheme: dark) {
    color: #999;
  }
  
  @media (prefers-color-scheme: light) {
    color: #666;
  }
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

const StatusMessage = styled.div<{ $status: 'playing' | 'won' | 'lost' }>`
  font-size: 14px;
  font-weight: 600;
  padding: 12px 16px;
  border-radius: 8px;
  text-align: center;
  
  ${props => {
    switch (props.$status) {
      case 'won': 
        return `
          color: #4CAF50;
          background-color: rgba(76, 175, 80, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.3);
        `;
      case 'lost': 
        return `
          color: #F44336;
          background-color: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
        `;
      default: 
        return `
          color: #2196F3;
          background-color: rgba(33, 150, 243, 0.1);
          border: 1px solid rgba(33, 150, 243, 0.3);
        `;
    }
  }}
  
  @media (max-width: 1024px) {
    width: 100%;
  }
`;

// Stats panel
const StatsPanel = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  
  @media (max-width: 1024px) {
    display: flex;
    gap: 16px;
  }
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border-radius: 8px;
  
  @media (prefers-color-scheme: dark) {
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  @media (prefers-color-scheme: light) {
    background-color: rgba(0, 0, 0, 0.03);
  }
  
  @media (max-width: 1024px) {
    padding: 8px 12px;
    flex-direction: row;
    align-items: center;
  }
`;

const StatValue = styled.span`
  font-size: 24px;
  font-weight: 700;
  
  @media (prefers-color-scheme: dark) {
    color: #fff;
  }
  
  @media (prefers-color-scheme: light) {
    color: #333;
  }
  
  @media (max-width: 1024px) {
    font-size: 18px;
    margin-left: 8px;
  }
`;

const StatLabel = styled.span`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  
  @media (prefers-color-scheme: dark) {
    color: #888;
  }
  
  @media (prefers-color-scheme: light) {
    color: #666;
  }
`;

const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  @media (max-width: 1024px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const Button = styled.button`
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background-color: #1976D2;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    background-color: #9e9e9e;
    cursor: not-allowed;
    transform: none;
  }
`;

const PowerUpButton = styled(Button)<{ $remaining: number }>`
  background-color: ${props => props.$remaining > 0 ? '#FF9800' : '#9e9e9e'};
  
  &:hover {
    background-color: ${props => props.$remaining > 0 ? '#F57C00' : '#9e9e9e'};
  }
`;

const PowerUpBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 700;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 10px;
`;

const Divider = styled.hr`
  border: none;
  height: 1px;
  margin: 8px 0;
  
  @media (prefers-color-scheme: dark) {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  @media (prefers-color-scheme: light) {
    background-color: rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 1024px) {
    display: none;
  }
`;

// Game area header
const GameHeader = styled.div`
  text-align: center;
  margin-bottom: 16px;
  display: none;
  
  @media (max-width: 1024px) {
    display: block;
  }
`;

const BoardWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  perspective: 1000px;
  
  @media (max-width: 768px) {
    padding: 20px;
    transform: scale(0.8);
  }
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
  const { boardSize, cars, status, movingCarId, flipPowerUpCount, moveCount, initialCarCount, initGame, moveCar, activateFlipPowerUp } = useGameStore();
  
  // Initialize game on mount only
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
  
  const handleNewGame = () => {
    initGame(DEFAULT_BOARD_SIZE, DEFAULT_CAR_COUNT);
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'won': return '🎉 Victory! All cars eliminated!';
      case 'lost': return '😞 No moves left!';
      default: return 'Tap any car to move it';
    }
  };
  
  const carsEliminated = initialCarCount - cars.length;
  
  return (
    <GameContainer>
      {/* Sidebar */}
      <Sidebar>
        <Title>
          <span>🚗</span>
          <span>Car Elimination</span>
        </Title>
        
        <Subtitle>
          Click on cars to move them in their direction. Clear the board to win!
        </Subtitle>
        
        <Divider />
        
        <Section>
          <SectionTitle>Game Status</SectionTitle>
          <StatusMessage $status={status}>
            {getStatusText()}
          </StatusMessage>
        </Section>
        
        <Section>
          <SectionTitle>Statistics</SectionTitle>
          <StatsPanel>
            <StatCard>
              <StatLabel>Cars Left</StatLabel>
              <StatValue>{cars.length}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Eliminated</StatLabel>
              <StatValue>{carsEliminated}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Moves</StatLabel>
              <StatValue>{moveCount}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Power-ups</StatLabel>
              <StatValue>{flipPowerUpCount}</StatValue>
            </StatCard>
          </StatsPanel>
        </Section>
        
        <Divider />
        
        <Section>
          <SectionTitle>Actions</SectionTitle>
          <Controls>
            <Button onClick={handleNewGame}>
              🎮 New Game
            </Button>
            <PowerUpButton 
              $remaining={flipPowerUpCount}
              onClick={handleFlipPowerUp}
              disabled={flipPowerUpCount <= 0 || status !== 'playing' || movingCarId !== null}
            >
              🔄 Flip 3 Cars
              <PowerUpBadge>{flipPowerUpCount}</PowerUpBadge>
            </PowerUpButton>
          </Controls>
        </Section>
      </Sidebar>
      
      {/* Main Game Area */}
      <MainContent>
        <GameHeader>
          <StatusMessage $status={status}>
            {getStatusText()}
          </StatusMessage>
        </GameHeader>
        
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
      </MainContent>
    </GameContainer>
  );
};

export default Game;
