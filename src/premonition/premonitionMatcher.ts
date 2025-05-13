/**
 * Premonition Matcher
 * 
 * Background agent that binds stored premonitions to future user prompts:
 * - Matches premonitions to incoming fracture events
 * - Supports phase-window tuning (e.g., "this echo is valid for 3 turns")
 * - Manages the lifecycle of premonitions
 */

import { EventEmitter } from 'events';
import { 
  Premonition, 
  FractureEvent, 
  McTavishConfig,
  BindingCriteria
} from '../types';
import { MemoryGraphStore } from '../memory/memoryGraphStore';

export class PremonitionMatcher extends EventEmitter {
  private memoryGraph: MemoryGraphStore;
  private config: McTavishConfig;
  private activePremonitions: Map<string, PremonitionState>;
  private turnCounter: number;
  
  constructor(memoryGraph: MemoryGraphStore, config: McTavishConfig) {
    super();
    this.memoryGraph = memoryGraph;
    this.config = config;
    this.activePremonitions = new Map();
    this.turnCounter = 0;
  }

  /**
   * Add a new premonition to be matched against future fractures
   */
  public addPremonition(premonition: Premonition): void {
    this.memoryGraph.addPremonition(premonition);
    
    this.activePremonitions.set(premonition.id, {
      premonition,
      createdAtTurn: this.turnCounter,
      expiresAtTurn: this.turnCounter + premonition.validityWindow,
      bindingAttempts: 0,
      isBound: false
    });
  }

  /**
   * Process a new fracture event and attempt to match it with stored premonitions
   */
  public processFracture(fracture: FractureEvent): void {
    this.turnCounter++;
    
    const premonitionStates = Array.from(this.activePremonitions.values());
    
    premonitionStates.sort((a, b) => {
      const aScore = this.calculateBindingStrength(a.premonition.bindingCriteria);
      const bScore = this.calculateBindingStrength(b.premonition.bindingCriteria);
      return bScore - aScore;
    });
    
    for (const state of premonitionStates) {
      if (state.isBound || this.turnCounter > state.expiresAtTurn) {
        continue;
      }
      
      state.bindingAttempts++;
      
      const matchScore = this.calculateMatchScore(state.premonition, fracture);
      
      if (matchScore >= this.getBindingThreshold(state)) {
        this.bindPremonition(state.premonition, fracture);
        state.isBound = true;
      }
    }
    
    this.cleanupExpiredPremonitions();
  }

  /**
   * Calculate the binding strength of a premonition's criteria
   * This is used to prioritize premonitions with stronger criteria
   */
  private calculateBindingStrength(criteria: BindingCriteria): number {
    let strength = 0;
    
    strength += criteria.contentSimilarity * 0.4;
    
    strength += criteria.emotionalAlignment * 0.3;
    
    if (criteria.keywords && criteria.keywords.length > 0) {
      strength += 0.3 * Math.min(1, criteria.keywords.length / 5);
    }
    
    return strength;
  }

  /**
   * Calculate how well a premonition matches a fracture
   */
  private calculateMatchScore(premonition: Premonition, fracture: FractureEvent): number {
    const criteria = premonition.bindingCriteria;
    let score = 0;
    
    const contentSimilarity = this.calculateContentSimilarity(
      premonition.content,
      fracture.content
    );
    score += contentSimilarity * criteria.contentSimilarity;
    
    const emotionalAlignment = 0.5; // Placeholder
    score += emotionalAlignment * criteria.emotionalAlignment;
    
    if (criteria.keywords && criteria.keywords.length > 0) {
      const keywordScore = this.calculateKeywordMatch(
        criteria.keywords,
        fracture.content
      );
      score += keywordScore * 0.3;
    }
    
    return score;
  }

  /**
   * Calculate content similarity between two text strings
   */
  private calculateContentSimilarity(text1: string, text2: string): number {
    const normalized1 = text1.toLowerCase().trim();
    const normalized2 = text2.toLowerCase().trim();
    
    const words1 = normalized1.split(/\s+/);
    const words2 = normalized2.split(/\s+/);
    
    const wordSet1 = new Set(words1);
    const wordSet2 = new Set(words2);
    
    let matchCount = 0;
    for (const word of wordSet1) {
      if (wordSet2.has(word)) {
        matchCount++;
      }
    }
    
    const unionSize = wordSet1.size + wordSet2.size - matchCount;
    return unionSize > 0 ? matchCount / unionSize : 0;
  }

  /**
   * Calculate keyword match score
   */
  private calculateKeywordMatch(keywords: string[], text: string): number {
    const normalizedText = text.toLowerCase();
    let matchCount = 0;
    
    for (const keyword of keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }
    
    return keywords.length > 0 ? matchCount / keywords.length : 0;
  }

  /**
   * Get the binding threshold for a premonition
   * The threshold decreases slightly with each binding attempt
   */
  private getBindingThreshold(state: PremonitionState): number {
    const baseThreshold = 0.7;
    
    const attemptFactor = Math.min(0.2, state.bindingAttempts * 0.05);
    
    const remainingTurns = state.expiresAtTurn - this.turnCounter;
    const expirationFactor = Math.min(0.2, (1 - (remainingTurns / state.premonition.validityWindow)) * 0.2);
    
    return Math.max(0.3, baseThreshold - attemptFactor - expirationFactor);
  }

  /**
   * Bind a premonition to a fracture
   */
  private bindPremonition(premonition: Premonition, fracture: FractureEvent): void {
    const binding = {
      premonitionId: premonition.id,
      fractureId: fracture.id,
      timestamp: Date.now(),
      matchScore: this.calculateMatchScore(premonition, fracture)
    };
    
    this.memoryGraph.addEdge({
      source: premonition.id,
      target: fracture.id,
      type: 'causality', // Premonitions are causally linked to their fractures
      weight: binding.matchScore,
      metadata: {
        bindingTimestamp: binding.timestamp,
        bindingType: 'premonition'
      }
    });
    
    this.emit('binding', binding);
  }

  /**
   * Clean up expired premonitions
   */
  private cleanupExpiredPremonitions(): void {
    for (const [id, state] of this.activePremonitions.entries()) {
      if (this.turnCounter > state.expiresAtTurn) {
        this.activePremonitions.delete(id);
        
        this.emit('premonitionExpired', {
          premonitionId: id,
          reason: 'validity_window_exceeded'
        });
      }
    }
  }

  /**
   * Get all active premonitions
   */
  public getActivePremonitions(): Premonition[] {
    return Array.from(this.activePremonitions.values())
      .filter(state => !state.isBound && this.turnCounter <= state.expiresAtTurn)
      .map(state => state.premonition);
  }

  /**
   * Get all bound premonitions
   */
  public getBoundPremonitions(): Premonition[] {
    return Array.from(this.activePremonitions.values())
      .filter(state => state.isBound)
      .map(state => state.premonition);
  }

  /**
   * Reset the turn counter
   */
  public resetTurnCounter(): void {
    this.turnCounter = 0;
  }

  /**
   * Clear all active premonitions
   */
  public clearActivePremonitions(): void {
    this.activePremonitions.clear();
  }
}

/**
 * Internal state tracking for premonitions
 */
interface PremonitionState {
  premonition: Premonition;
  createdAtTurn: number;
  expiresAtTurn: number;
  bindingAttempts: number;
  isBound: boolean;
}
