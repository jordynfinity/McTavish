import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import styled from 'styled-components';
import { MemoryNode } from '../../../types';

const NodeContainer = styled.div<{ nodeType: string }>`
  padding: 10px;
  border-radius: 5px;
  width: 180px;
  background-color: ${({ nodeType }) => 
    nodeType === 'characterNode' ? '#e6f7ff' :
    nodeType === 'eventNode' ? '#fff7e6' :
    nodeType === 'ghostNode' ? '#f9f0ff' :
    nodeType === 'divergenceNode' ? '#fff1f0' : '#ffffff'
  };
  border: 1px solid ${({ nodeType }) => 
    nodeType === 'characterNode' ? '#91d5ff' :
    nodeType === 'eventNode' ? '#ffd591' :
    nodeType === 'ghostNode' ? '#d3adf7' :
    nodeType === 'divergenceNode' ? '#ffa39e' : '#d9d9d9'
  };
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const NodeTitle = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const NodeContent = styled.div`
  font-size: 12px;
  word-break: break-word;
`;

export const CharacterNode = memo(({ data }: NodeProps<MemoryNode>) => {
  const characterId = data?.metadata?.characterId || 'Unknown';
  const characterName = 
    characterId === "character-assistant-a" ? "Assistant A" :
    characterId === "character-elena" ? "Elena" : 
    characterId === "character-elena-variant" ? "Elena (variant)" : 
    String(characterId).substring(0, 8);
  
  return (
    <NodeContainer nodeType="characterNode">
      <Handle type="target" position={Position.Top} />
      <NodeTitle>{characterName}</NodeTitle>
      <NodeContent>{data.content}</NodeContent>
      <Handle type="source" position={Position.Bottom} />
    </NodeContainer>
  );
});

export const EventNode = memo(({ data }: NodeProps<MemoryNode>) => {
  return (
    <NodeContainer nodeType="eventNode">
      <Handle type="target" position={Position.Top} />
      <NodeTitle>Event</NodeTitle>
      <NodeContent>{data.content}</NodeContent>
      <Handle type="source" position={Position.Bottom} />
    </NodeContainer>
  );
});

export const GhostNode = memo(({ data }: NodeProps<MemoryNode>) => {
  return (
    <NodeContainer nodeType="ghostNode">
      <Handle type="target" position={Position.Top} />
      <NodeTitle>Premonition</NodeTitle>
      <NodeContent>{data.content}</NodeContent>
      <Handle type="source" position={Position.Bottom} />
    </NodeContainer>
  );
});

export const DivergenceNode = memo(({ data }: NodeProps<MemoryNode>) => {
  return (
    <NodeContainer nodeType="divergenceNode">
      <Handle type="target" position={Position.Top} />
      <NodeTitle>Divergence</NodeTitle>
      <NodeContent>{data.content}</NodeContent>
      <Handle type="source" position={Position.Bottom} />
    </NodeContainer>
  );
});
