import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { setActivePremonition, clearActivePremonition, bindPremonition } from '../../redux/premonitionSlice';
import styled from 'styled-components';
import { mockPremonitions } from '../../mockData/premonitions';

const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
`;

const PremonitionList = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 250px;
  background-color: rgba(249, 240, 255, 0.9);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
`;

const PremonitionItem = styled.div<{ isActive: boolean }>`
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  background-color: ${({ isActive }) => isActive ? '#f9f0ff' : 'white'};
  border: 1px solid ${({ isActive }) => isActive ? '#d3adf7' : '#d9d9d9'};
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    border-color: #b37feb;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.09);
  }
`;

const PremonitionContent = styled.div`
  margin-bottom: 4px;
`;

const PremonitionMeta = styled.div`
  font-size: 10px;
  color: #8c8c8c;
`;

const DevToolsPanel = styled.div`
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 300px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #52c41a;
  border-radius: 8px;
  padding: 16px;
  font-family: monospace;
  font-size: 12px;
  pointer-events: auto;
`;

const ShimmeringLine = styled.div<{ x1: number; y1: number; x2: number; y2: number }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  
  &::after {
    content: '';
    position: absolute;
    top: ${({ y1 }) => `${y1}px`};
    left: ${({ x1 }) => `${x1}px`};
    width: ${({ x1, x2 }) => `${Math.abs(x2 - x1)}px`};
    height: ${({ y1, y2 }) => `${Math.abs(y2 - y1)}px`};
    background: linear-gradient(
      to right,
      rgba(211, 173, 247, 0) 0%,
      rgba(211, 173, 247, 0.5) 50%,
      rgba(211, 173, 247, 0) 100%
    );
    transform: ${({ x1, y1, x2, y2 }) => {
      const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
      return `rotate(${angle}deg)`;
    }};
    transform-origin: ${({ x1, y1 }) => `${x1}px ${y1}px`};
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.7;
    }
    100% {
      opacity: 0.3;
    }
  }
`;

export const PremonitionOverlay: React.FC = () => {
  const dispatch = useDispatch();
  const showPremonitions = useSelector((state: RootState) => state.ui.showPremonitions);
  const activePremonitionId = useSelector((state: RootState) => state.premonition.activePremonitionId);
  const premonitions = mockPremonitions;
  
  const handlePremonitionClick = useCallback((premonitionId: string) => {
    if (activePremonitionId === premonitionId) {
      dispatch(clearActivePremonition({}));
    } else {
      dispatch(setActivePremonition(premonitionId));
    }
  }, [dispatch, activePremonitionId]);
  
  if (!showPremonitions) {
    return null;
  }
  
  return (
    <OverlayContainer>
      {/* Shimmering lines connecting premonitions to potential binding points */}
      <ShimmeringLine x1={300} y1={200} x2={500} y2={300} />
      <ShimmeringLine x1={400} y1={150} x2={600} y2={400} />
      
      {/* Premonition list */}
      <PremonitionList>
        <h3>Premonitions</h3>
        {premonitions.map((premonition) => (
          <PremonitionItem
            key={premonition.id}
            isActive={activePremonitionId === premonition.id}
            onClick={() => handlePremonitionClick(premonition.id)}
          >
            <PremonitionContent>{premonition.content}</PremonitionContent>
            <PremonitionMeta>
              Validity: {premonition.validityWindow} turns • {premonition.emotionalState.dominant}
            </PremonitionMeta>
          </PremonitionItem>
        ))}
      </PremonitionList>
      
      {/* DevTools panel */}
      <DevToolsPanel>
        <h4>Premonition Stack</h4>
        <pre>
          {JSON.stringify(
            premonitions.map(p => ({
              id: p.id.substring(0, 8),
              content: p.content.substring(0, 20) + '...',
              validityWindow: p.validityWindow,
              bindingCriteria: p.bindingCriteria
            })),
            null,
            2
          )}
        </pre>
      </DevToolsPanel>
    </OverlayContainer>
  );
};
