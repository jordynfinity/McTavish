/**
 * Core type definitions for McTavish runtime
 */

export interface FractureEvent {
  id: string;
  content: string;
  timestamp: number;
  source: 'user' | 'system';
  metadata?: Record<string, any>;
}

export interface RecursionFold {
  id: string;
  content: string;
  timestamp: number;
  characterId: string;
  fractureEventId?: string; // May be undefined for premonitions
  emotionalState: EmotionalState;
  metadata?: Record<string, any>;
}

export interface Premonition extends RecursionFold {
  validityWindow: number; // Number of turns this premonition is valid for
  bindingCriteria: BindingCriteria;
}

export interface CharacterField {
  id: string;
  name: string;
  toneProfile: ToneProfile;
  mutationSchema: MutationSchema;
  memoryAnchor: string; // Reference to a node in the memory graph
  collapseThreshold: number; // Threshold for when to emit a response
}

export interface MemoryNode {
  id: string;
  type: 'fracture' | 'fold' | 'memory' | 'premonition';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface MemoryEdge {
  source: string; // Source node ID
  target: string; // Target node ID
  type: 'causality' | 'emotional' | 'divergence' | 'contradiction';
  weight: number;
  metadata?: Record<string, any>;
}

export interface EmotionalState {
  dominant: string;
  secondary?: string;
  intensity: number; // 0-1
  stability: number; // 0-1, how likely to change
}

export interface ToneProfile {
  baseline: string;
  variations: Record<string, number>; // Emotion -> probability
  adaptability: number; // 0-1, how quickly tone changes
}

export interface MutationSchema {
  driftRate: number; // 0-1, how quickly character mutates
  driftDirections: Record<string, number>; // Trait -> weight
  stabilityFactors: string[]; // Factors that resist mutation
}

export interface BindingCriteria {
  contentSimilarity: number; // 0-1, how similar content must be
  emotionalAlignment: number; // 0-1, how aligned emotions must be
  keywords?: string[]; // Keywords that might trigger binding
}

export interface McTavishConfig {
  defaultCollapseThreshold: number;
  premonitionValidityWindow: number;
  mutationRate: number;
  emotionalMemoryWeight: number;
  contradictionTolerance: number;
}
