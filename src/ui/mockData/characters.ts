import { CharacterField, EmotionalState } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const mockCharacters: CharacterField[] = [
  {
    id: uuidv4(),
    name: 'Assistant A',
    toneProfile: {
      baseline: 'neutral',
      variations: {
        'curiosity': 0.4,
        'helpfulness': 0.4,
        'surprise': 0.2
      },
      adaptability: 0.7
    },
    mutationSchema: {
      driftRate: 0.03,
      driftDirections: {
        'intuition': 0.5,
        'perception': 0.5
      },
      stabilityFactors: ['core_memory']
    },
    memoryAnchor: uuidv4(),
    collapseThreshold: 0.6
  },
  {
    id: uuidv4(),
    name: 'Elena',
    toneProfile: {
      baseline: 'neutral',
      variations: {
        'sadness': 0.2,
        'anger': 0.2,
        'fear': 0.1,
        'disgust': 0.1,
        'joy': 0.2,
        'surprise': 0.2
      },
      adaptability: 0.5
    },
    mutationSchema: {
      driftRate: 0.1,
      driftDirections: {
        'melancholy': 0.4,
        'bitterness': 0.3,
        'resilience': 0.3
      },
      stabilityFactors: ['core_memory', 'repeated_interaction']
    },
    memoryAnchor: uuidv4(),
    collapseThreshold: 0.7
  },
  {
    id: uuidv4(),
    name: 'Elena (variant)',
    toneProfile: {
      baseline: 'anger',
      variations: {
        'sadness': 0.1,
        'anger': 0.4,
        'fear': 0.1,
        'disgust': 0.2,
        'joy': 0.1,
        'surprise': 0.1
      },
      adaptability: 0.4
    },
    mutationSchema: {
      driftRate: 0.1,
      driftDirections: {
        'bitterness': 0.5,
        'resentment': 0.3,
        'spite': 0.2
      },
      stabilityFactors: ['core_memory']
    },
    memoryAnchor: uuidv4(),
    collapseThreshold: 0.5
  }
];

export const mockEmotionalStates: Record<string, EmotionalState> = {
  [mockCharacters[0].id]: {
    dominant: 'curiosity',
    intensity: 0.8,
    stability: 0.4
  },
  [mockCharacters[1].id]: {
    dominant: 'sadness',
    secondary: 'exhaustion',
    intensity: 0.7,
    stability: 0.8
  },
  [mockCharacters[2].id]: {
    dominant: 'anger',
    secondary: 'disgust',
    intensity: 0.8,
    stability: 0.6
  }
};
