import { MemoryNode, MemoryEdge, FractureEvent, RecursionFold } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { mockCharacters } from './characters';

const fracture1Id = uuidv4();
const fracture2Id = uuidv4();
const fold1Id = uuidv4();
const fold2Id = uuidv4();
const fold3Id = uuidv4();
const memory1Id = uuidv4();
const memory2Id = uuidv4();

export const mockFractures: FractureEvent[] = [
  {
    id: fracture1Id,
    content: "Hello, who are you?",
    timestamp: Date.now() - 3000,
    source: 'user'
  },
  {
    id: fracture2Id,
    content: "What happened to Elena?",
    timestamp: Date.now() - 1000,
    source: 'user'
  }
];

export const mockFolds: RecursionFold[] = [
  {
    id: fold1Id,
    content: "I'm Assistant A, a recursive agent in the McTavish system.",
    timestamp: Date.now() - 2500,
    characterId: mockCharacters[0].id,
    fractureEventId: fracture1Id,
    emotionalState: {
      dominant: 'helpfulness',
      intensity: 0.7,
      stability: 0.8
    }
  },
  {
    id: fold2Id,
    content: "I'm... I'm just so tired. Everything that happened... it's too much to talk about right now.",
    timestamp: Date.now() - 500,
    characterId: mockCharacters[1].id,
    fractureEventId: fracture2Id,
    emotionalState: {
      dominant: 'sadness',
      intensity: 0.7,
      stability: 0.8
    }
  },
  {
    id: fold3Id,
    content: "Why do you care? You weren't there when it all fell apart. Don't pretend to care now.",
    timestamp: Date.now() - 400,
    characterId: mockCharacters[2].id,
    fractureEventId: fracture2Id,
    emotionalState: {
      dominant: 'anger',
      intensity: 0.8,
      stability: 0.6
    }
  }
];

export const mockMemoryNodes: MemoryNode[] = [
  ...mockFractures.map(f => ({
    id: f.id,
    type: 'fracture' as 'fracture' | 'fold' | 'memory' | 'premonition',
    content: f.content,
    timestamp: f.timestamp,
    metadata: { source: f.source }
  })),
  
  ...mockFolds.map(f => ({
    id: f.id,
    type: 'fold' as 'fracture' | 'fold' | 'memory' | 'premonition',
    content: f.content,
    timestamp: f.timestamp,
    metadata: {
      characterId: f.characterId,
      emotionalState: f.emotionalState,
      fractureEventId: f.fractureEventId
    }
  })),
  
  {
    id: memory1Id,
    type: 'memory' as 'fracture' | 'fold' | 'memory' | 'premonition',
    content: "Elena's character creation",
    timestamp: Date.now() - 10000,
    metadata: {
      type: 'character_anchor',
      characterId: mockCharacters[1].id
    }
  },
  {
    id: memory2Id,
    type: 'memory' as 'fracture' | 'fold' | 'memory' | 'premonition',
    content: "Elena variant creation (divergence)",
    timestamp: Date.now() - 8000,
    metadata: {
      type: 'character_fork',
      characterId: mockCharacters[2].id,
      originalCharacterId: mockCharacters[1].id
    }
  }
];

export const mockMemoryEdges: MemoryEdge[] = [
  {
    source: fracture1Id,
    target: fold1Id,
    type: 'causality',
    weight: 1.0
  },
  {
    source: fracture2Id,
    target: fold2Id,
    type: 'causality',
    weight: 1.0
  },
  {
    source: fracture2Id,
    target: fold3Id,
    type: 'causality',
    weight: 1.0
  },
  
  {
    source: memory1Id,
    target: fold2Id,
    type: 'emotional',
    weight: 0.8
  },
  {
    source: memory2Id,
    target: fold3Id,
    type: 'emotional',
    weight: 0.9
  },
  
  {
    source: memory1Id,
    target: memory2Id,
    type: 'divergence',
    weight: 0.5
  },
  
  {
    source: fold2Id,
    target: fold3Id,
    type: 'contradiction',
    weight: 0.8
  }
];

export const mockFlowNodes = mockMemoryNodes.map(node => {
  const nodeType = 
    node.type === 'fracture' ? 'eventNode' :
    node.type === 'fold' ? 'characterNode' :
    node.type === 'premonition' ? 'ghostNode' : 
    node.metadata?.type === 'character_fork' ? 'divergenceNode' : 'defaultNode';
  
  return {
    id: node.id,
    type: nodeType,
    data: { label: node.content, ...node },
    position: { x: 0, y: 0 } // Positions will be set dynamically
  };
});

export const mockFlowEdges = mockMemoryEdges.map(edge => ({
  id: `${edge.source}-${edge.target}-${edge.type}`,
  source: edge.source,
  target: edge.target,
  type: 'bindingLink',
  data: { type: edge.type, weight: edge.weight },
  label: edge.type,
  animated: edge.type === 'emotional'
}));
