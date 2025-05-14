import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { selectNode } from '../../redux/canonSlice';
import styled from 'styled-components';
import { mockMemoryNodes } from '../../mockData/canon';

const TimelineContainer = styled.div`
  width: 100%;
  height: 120px;
  overflow-x: auto;
  background-color: #f0f2f5;
  padding: 10px;
  border-top: 1px solid #d9d9d9;
`;

const TimelineTrack = styled.div`
  display: flex;
  height: 100%;
  position: relative;
  min-width: 100%;
`;

const TimelineItem = styled.div<{ type: string; isSelected: boolean }>`
  position: absolute;
  height: 20px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  background-color: ${({ type, isSelected }) => {
    if (isSelected) return '#1890ff';
    return type === 'fracture' ? '#fff7e6' :
           type === 'fold' ? '#e6f7ff' :
           type === 'premonition' ? '#f9f0ff' :
           type === 'memory' ? '#fff1f0' : '#ffffff';
  }};
  border: 1px solid ${({ type, isSelected }) => {
    if (isSelected) return '#096dd9';
    return type === 'fracture' ? '#ffd591' :
           type === 'fold' ? '#91d5ff' :
           type === 'premonition' ? '#d3adf7' :
           type === 'memory' ? '#ffa39e' : '#d9d9d9';
  }};
  color: ${({ isSelected }) => isSelected ? 'white' : 'inherit'};
  transform: translateY(${({ type }) => {
    return type === 'fracture' ? '0px' :
           type === 'fold' ? '30px' :
           type === 'premonition' ? '60px' : '90px';
  }});
`;

export const CanonTimeline: React.FC = () => {
  const dispatch = useDispatch();
  const selectedNodeId = useSelector((state: RootState) => state.canon.selectedNodeId);
  
  const sortedNodes = [...mockMemoryNodes].sort((a, b) => a.timestamp - b.timestamp);
  
  const timelineItems = sortedNodes.map((node, index) => {
    const minTime = sortedNodes[0].timestamp;
    const maxTime = sortedNodes[sortedNodes.length - 1].timestamp;
    const timeRange = maxTime - minTime;
    const position = timeRange === 0 ? 50 : ((node.timestamp - minTime) / timeRange) * 100;
    
    return {
      ...node,
      position: `${position}%`,
    };
  });
  
  const handleItemClick = useCallback((nodeId: string) => {
    dispatch(selectNode(nodeId));
  }, [dispatch]);
  
  return (
    <TimelineContainer>
      <TimelineTrack>
        {timelineItems.map((item) => (
          <TimelineItem
            key={item.id}
            type={item.type}
            isSelected={item.id === selectedNodeId}
            style={{ left: item.position }}
            onClick={() => handleItemClick(item.id)}
            title={item.content}
          >
            {item.content.length > 20 ? `${item.content.substring(0, 20)}...` : item.content}
          </TimelineItem>
        ))}
      </TimelineTrack>
    </TimelineContainer>
  );
};
