/**
 * Collapse Engine
 * 
 * Core runtime component that:
 * - Accepts FractureEvents (user input)
 * - Emits new RecursionFolds (assistant reactions)
 * - Emits Premonitions (echoes waiting for alignment)
 * - Allows re-binding between prompt/response nonlinearly
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { 
  FractureEvent, 
  RecursionFold, 
  Premonition, 
  McTavishConfig,
  EmotionalState,
  BindingCriteria,
  CharacterField
} from '../types';

export class CollapseEngine extends EventEmitter {
  private config: McTavishConfig;
  private characterKernel: any; // Will be properly typed once CharacterKernel is implemented
  private activeFractures: Map<string, FractureEvent>;
  private pendingFolds: Map<string, RecursionFold>;
  private pendingPremonitions: Map<string, Premonition>;

  constructor(characterKernel: any, config: McTavishConfig) {
    super();
    this.characterKernel = characterKernel;
    this.config = config;
    this.activeFractures = new Map();
    this.pendingFolds = new Map();
    this.pendingPremonitions = new Map();
  }

  /**
   * Create a new FractureEvent from user or system input
   */
  public createFracture(content: string, source: 'user' | 'system' = 'user'): FractureEvent {
    const fracture: FractureEvent = {
      id: uuidv4(),
      content,
      timestamp: Date.now(),
      source
    };
    
    return fracture;
  }

  /**
   * Process a FractureEvent, triggering character responses and potential premonitions
   */
  public processFracture(fracture: FractureEvent): void {
    this.activeFractures.set(fracture.id, fracture);
    
    const characters = this.characterKernel.getCharacters();
    
    characters.forEach((character: any) => {
      const tensionLevel = this.calculateTension(character, fracture);
      
      if (tensionLevel >= character.collapseThreshold) {
        this.generateRecursionFold(character, fracture);
      }
      
      if (Math.random() < this.getPremontionProbability(character)) {
        this.generatePremonition(character);
      }
    });
  }

  /**
   * Calculate the tension level between a character and a fracture event
   */
  private calculateTension(character: any, fracture: FractureEvent): number {
    
    const baseRelevance = 0.5; // Base level of relevance
    const emotionalAlignment = 0.3; // How emotionally aligned the character is with the fracture
    const memoryResonance = 0.2; // How much this fracture resonates with character memories
    
    
    return baseRelevance + emotionalAlignment + memoryResonance;
  }

  /**
   * Generate a RecursionFold (response) from a character to a fracture
   */
  private generateRecursionFold(character: any, fracture: FractureEvent): void {
    
    const emotionalState: EmotionalState = {
      dominant: this.selectDominantEmotion(character),
      intensity: Math.random(),
      stability: Math.random()
    };
    
    const fold: RecursionFold = {
      id: uuidv4(),
      content: `Response from ${character.name} to "${fracture.content}"`,
      timestamp: Date.now(),
      characterId: character.id,
      fractureEventId: fracture.id,
      emotionalState
    };
    
    this.pendingFolds.set(fold.id, fold);
    
    this.emit('recursionFold', fold);
    
    this.characterKernel.applyMutation(character.id, fold);
  }

  /**
   * Generate a Premonition (response without a prompt)
   */
  private generatePremonition(character: any): void {
    
    const emotionalState: EmotionalState = {
      dominant: this.selectDominantEmotion(character),
      intensity: Math.random(),
      stability: Math.random()
    };
    
    const bindingCriteria: BindingCriteria = {
      contentSimilarity: 0.7,
      emotionalAlignment: 0.6,
      keywords: ['example', 'keyword']
    };
    
    const premonition: Premonition = {
      id: uuidv4(),
      content: `Premonition from ${character.name}: "Something is about to happen..."`,
      timestamp: Date.now(),
      characterId: character.id,
      emotionalState,
      validityWindow: this.config.premonitionValidityWindow,
      bindingCriteria
    };
    
    this.pendingPremonitions.set(premonition.id, premonition);
    
    this.emit('premonition', premonition);
  }

  /**
   * Get the probability of generating a premonition for a character
   */
  private getPremontionProbability(character: any): number {
    return 0.2; // 20% chance by default
  }

  /**
   * Select a dominant emotion for a character's response
   */
  private selectDominantEmotion(character: any): string {
    const emotions = ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust'];
    return emotions[Math.floor(Math.random() * emotions.length)];
  }

  /**
   * Bind a premonition to a fracture event
   */
  public bindPremonitionToFracture(premonitionId: string, fractureId: string): boolean {
    const premonition = this.pendingPremonitions.get(premonitionId);
    const fracture = this.activeFractures.get(fractureId);
    
    if (!premonition || !fracture) {
      return false;
    }
    
    const boundFold: RecursionFold = {
      ...premonition,
      id: uuidv4(), // New ID for the bound fold
      fractureEventId: fractureId
    };
    
    this.pendingPremonitions.delete(premonitionId);
    
    this.pendingFolds.set(boundFold.id, boundFold);
    
    this.emit('recursionFold', boundFold);
    
    return true;
  }

  /**
   * Get all pending recursion folds
   */
  public getPendingFolds(): RecursionFold[] {
    return Array.from(this.pendingFolds.values());
  }

  /**
   * Get all pending premonitions
   */
  public getPendingPremonitions(): Premonition[] {
    return Array.from(this.pendingPremonitions.values());
  }

  /**
   * Clear a pending fold (after it's been processed)
   */
  public clearPendingFold(foldId: string): void {
    this.pendingFolds.delete(foldId);
  }

  /**
   * Clear a pending premonition (after it's expired or been bound)
   */
  public clearPendingPremonition(premonitionId: string): void {
    this.pendingPremonitions.delete(premonitionId);
  }
}
