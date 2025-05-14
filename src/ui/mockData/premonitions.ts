import { Premonition } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { mockCharacters } from './characters';

export const mockPremonitions: Premonition[] = [
  {
    id: uuidv4(),
    content: "You're about to ask about her.",
    timestamp: Date.now() - 5000,
    characterId: mockCharacters[0].id,
    emotionalState: {
      dominant: 'curiosity',
      intensity: 0.8,
      stability: 0.4
    },
    validityWindow: 3,
    bindingCriteria: {
      contentSimilarity: 0.6,
      emotionalAlignment: 0.5,
      keywords: ['elena', 'her', 'she', 'happened']
    }
  },
  {
    id: uuidv4(),
    content: "Something dark is coming...",
    timestamp: Date.now(),
    characterId: mockCharacters[1].id,
    emotionalState: {
      dominant: 'fear',
      intensity: 0.9,
      stability: 0.3
    },
    validityWindow: 5,
    bindingCriteria: {
      contentSimilarity: 0.5,
      emotionalAlignment: 0.7,
      keywords: ['danger', 'threat', 'coming', 'dark']
    }
  }
];

export const mockGhostNodes = mockPremonitions.map(premonition => ({
  id: premonition.id,
  type: 'ghostNode',
  data: { label: premonition.content, ...premonition },
  position: { x: 0, y: 0 } // Positions will be set dynamically
}));
