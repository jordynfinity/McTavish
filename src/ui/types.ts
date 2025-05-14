import { Node, Edge } from 'reactflow';
import { MemoryNode, MemoryEdge, CharacterField, EmotionalState, Premonition } from '../types';

export type CanonNode = Node<MemoryNode>;
export type CanonEdge = Edge<MemoryEdge>;

export interface CharacterCardProps {
  character: CharacterField;
  emotionalState?: EmotionalState;
  isActive: boolean;
  onClick: (id: string) => void;
}

export interface MessageItemProps {
  content: string;
  timestamp: number;
  isUser: boolean;
  characterName?: string;
}

export interface PremonitionCardProps {
  premonition: Premonition;
  isActive: boolean;
  onClick: (id: string) => void;
}
