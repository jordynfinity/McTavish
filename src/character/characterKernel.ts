/**
 * Character Kernel
 * 
 * Each character is a runtime scope:
 * - Personal mutation logic
 * - Memory traversal preference
 * - Collapse threshold tuning
 * 
 * Supports multiple simultaneous characters per canon
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  CharacterField, 
  ToneProfile, 
  MutationSchema, 
  EmotionalState,
  RecursionFold,
  McTavishConfig
} from '../types';
import { MemoryGraphStore } from '../memory/memoryGraphStore';

export class CharacterKernel {
  private characters: Map<string, CharacterField>;
  private memoryGraph: MemoryGraphStore;
  private config: McTavishConfig;
  private emotionalStates: Map<string, EmotionalState>;
  
  constructor(memoryGraph: MemoryGraphStore, config: McTavishConfig) {
    this.characters = new Map();
    this.memoryGraph = memoryGraph;
    this.config = config;
    this.emotionalStates = new Map();
  }

  /**
   * Create a new character
   */
  public createCharacter(
    name: string,
    toneProfile?: Partial<ToneProfile>,
    mutationSchema?: Partial<MutationSchema>,
    collapseThreshold?: number
  ): string {
    const defaultToneProfile: ToneProfile = {
      baseline: 'neutral',
      variations: {
        'joy': 0.2,
        'sadness': 0.2,
        'anger': 0.1,
        'fear': 0.1,
        'surprise': 0.2,
        'disgust': 0.1
      },
      adaptability: 0.5
    };
    
    const defaultMutationSchema: MutationSchema = {
      driftRate: this.config.mutationRate,
      driftDirections: {
        'openness': 0.2,
        'conscientiousness': 0.2,
        'extraversion': 0.2,
        'agreeableness': 0.2,
        'neuroticism': 0.2
      },
      stabilityFactors: ['core_memory', 'repeated_interaction']
    };
    
    const memoryAnchorId = this.memoryGraph.addMemory(
      `Character creation: ${name}`,
      'system',
      { type: 'character_anchor' }
    );
    
    const character: CharacterField = {
      id: uuidv4(),
      name,
      toneProfile: { ...defaultToneProfile, ...toneProfile },
      mutationSchema: { ...defaultMutationSchema, ...mutationSchema },
      memoryAnchor: memoryAnchorId,
      collapseThreshold: collapseThreshold ?? this.config.defaultCollapseThreshold
    };
    
    this.emotionalStates.set(character.id, {
      dominant: character.toneProfile.baseline,
      intensity: 0.5,
      stability: 0.7
    });
    
    this.characters.set(character.id, character);
    
    return character.id;
  }

  /**
   * Get a character by ID
   */
  public getCharacter(characterId: string): CharacterField | undefined {
    return this.characters.get(characterId);
  }

  /**
   * Get all characters
   */
  public getCharacters(): CharacterField[] {
    return Array.from(this.characters.values());
  }

  /**
   * Get a character's current emotional state
   */
  public getEmotionalState(characterId: string): EmotionalState | undefined {
    return this.emotionalStates.get(characterId);
  }

  /**
   * Update a character's emotional state
   */
  public updateEmotionalState(characterId: string, emotionalState: Partial<EmotionalState>): void {
    const currentState = this.emotionalStates.get(characterId);
    if (!currentState) return;
    
    this.emotionalStates.set(characterId, {
      ...currentState,
      ...emotionalState
    });
  }

  /**
   * Apply mutation to a character based on an interaction
   */
  public applyMutation(characterId: string, fold: RecursionFold): void {
    const character = this.getCharacter(characterId);
    if (!character) return;
    
    const { driftRate, driftDirections } = character.mutationSchema;
    
    this.updateEmotionalState(characterId, {
      dominant: fold.emotionalState.dominant,
      intensity: fold.emotionalState.intensity,
      stability: Math.min(1, this.emotionalStates.get(characterId)?.stability ?? 0.5 + 0.1)
    });
    
    const toneProfile = { ...character.toneProfile };
    
    if (fold.emotionalState.dominant in toneProfile.variations) {
      toneProfile.variations[fold.emotionalState.dominant] = Math.min(
        1,
        toneProfile.variations[fold.emotionalState.dominant] + driftRate * fold.emotionalState.intensity
      );
      
      const totalOtherWeight = 1 - toneProfile.variations[fold.emotionalState.dominant];
      const otherEmotions = Object.keys(toneProfile.variations).filter(
        e => e !== fold.emotionalState.dominant
      );
      
      let sumOtherWeights = 0;
      for (const emotion of otherEmotions) {
        sumOtherWeights += toneProfile.variations[emotion];
      }
      
      if (sumOtherWeights > 0) {
        for (const emotion of otherEmotions) {
          toneProfile.variations[emotion] = (toneProfile.variations[emotion] / sumOtherWeights) * totalOtherWeight;
        }
      }
    }
    
    if (fold.emotionalState.stability > 0.7) {
      toneProfile.baseline = fold.emotionalState.dominant;
    }
    
    for (const [trait, weight] of Object.entries(driftDirections)) {
      console.log(`Character ${character.name} drifting ${trait} by ${driftRate * weight * fold.emotionalState.intensity}`);
    }
    
    character.toneProfile = toneProfile;
    
    const intensityFactor = fold.emotionalState.intensity * 0.2;
    character.collapseThreshold = Math.max(
      0.1,
      Math.min(
        0.9,
        this.config.defaultCollapseThreshold - intensityFactor
      )
    );
    
    this.characters.set(characterId, character);
  }

  /**
   * Get a character's memory traversal preference
   * This determines how a character navigates the memory graph
   */
  public getMemoryTraversalPreference(characterId: string): MemoryTraversalPreference {
    const character = this.getCharacter(characterId);
    if (!character) {
      return {
        emotionalWeight: 0.5,
        recencyWeight: 0.3,
        causalityWeight: 0.2,
        contradictionTolerance: 0.5,
        maxDepth: 5
      };
    }
    
    const emotionalState = this.getEmotionalState(characterId);
    
    return {
      emotionalWeight: this.config.emotionalMemoryWeight,
      recencyWeight: 0.3,
      causalityWeight: 0.2,
      contradictionTolerance: this.config.contradictionTolerance,
      maxDepth: 5 + Math.floor(Math.random() * 3) // 5-7
    };
  }

  /**
   * Traverse the memory graph according to a character's preferences
   * Returns relevant memory nodes for the character
   */
  public traverseMemory(
    characterId: string, 
    startNodeId?: string, 
    maxNodes: number = 10
  ): string[] {
    const character = this.getCharacter(characterId);
    if (!character) return [];
    
    const startId = startNodeId ?? character.memoryAnchor;
    
    const preferences = this.getMemoryTraversalPreference(characterId);
    
    const emotionalState = this.getEmotionalState(characterId);
    if (!emotionalState) return [];
    
    return this.weightedMemoryTraversal(
      startId,
      preferences,
      emotionalState,
      maxNodes
    );
  }

  /**
   * Perform a weighted traversal of the memory graph
   */
  private weightedMemoryTraversal(
    startNodeId: string,
    preferences: MemoryTraversalPreference,
    emotionalState: EmotionalState,
    maxNodes: number
  ): string[] {
    const visited = new Set<string>();
    
    const queue: [string, number][] = [[startNodeId, 1.0]];
    
    const result: string[] = [];
    
    while (queue.length > 0 && result.length < maxNodes) {
      queue.sort((a, b) => b[1] - a[1]);
      
      const [nodeId, priority] = queue.shift()!;
      
      if (visited.has(nodeId)) continue;
      
      visited.add(nodeId);
      
      result.push(nodeId);
      
      const successors = this.memoryGraph.getSuccessors(nodeId);
      
      for (const successor of successors) {
        if (visited.has(successor.id)) continue;
        
        const edgesBetween = this.memoryGraph.getEdgesBetween(nodeId, successor.id);
        if (edgesBetween.length === 0) continue;
        
        const edge = edgesBetween[0];
        
        if (edge.type === 'contradiction' && edge.weight > preferences.contradictionTolerance) {
          continue;
        }
        
        let emotionalPriority = 0;
        let recencyPriority = 0;
        let causalityPriority = 0;
        
        if (edge.type === 'emotional') {
          emotionalPriority = edge.weight;
          
          if (
            successor.metadata?.emotionalState?.dominant === emotionalState.dominant
          ) {
            emotionalPriority *= 1.5;
          }
        }
        
        const ageInMs = Date.now() - successor.timestamp;
        const ageInHours = ageInMs / (1000 * 60 * 60);
        recencyPriority = Math.max(0, 1 - (ageInHours / 24)); // Decay over 24 hours
        
        if (edge.type === 'causality') {
          causalityPriority = edge.weight;
        }
        
        const overallPriority = 
          (emotionalPriority * preferences.emotionalWeight) +
          (recencyPriority * preferences.recencyWeight) +
          (causalityPriority * preferences.causalityWeight);
        
        queue.push([successor.id, overallPriority * priority * 0.9]); // Decay priority with depth
      }
    }
    
    return result;
  }

  /**
   * Fork a character to create a variation
   */
  public forkCharacter(characterId: string, nameModifier: string = 'variant'): string {
    const original = this.getCharacter(characterId);
    if (!original) throw new Error(`Character ${characterId} not found`);
    
    const newMemoryAnchorId = this.memoryGraph.addMemory(
      `Character fork: ${original.name} -> ${original.name} (${nameModifier})`,
      'system',
      { 
        type: 'character_fork',
        originalCharacterId: characterId,
        originalMemoryAnchor: original.memoryAnchor
      }
    );
    
    this.memoryGraph.createEmotionalLink(original.memoryAnchor, newMemoryAnchorId, 0.8);
    
    this.memoryGraph.createDivergence(original.memoryAnchor, newMemoryAnchorId, 0.5);
    
    const forkedCharacter: CharacterField = {
      ...original,
      id: uuidv4(),
      name: `${original.name} (${nameModifier})`,
      memoryAnchor: newMemoryAnchorId
    };
    
    this.characters.set(forkedCharacter.id, forkedCharacter);
    
    const originalEmotionalState = this.emotionalStates.get(characterId);
    if (originalEmotionalState) {
      this.emotionalStates.set(forkedCharacter.id, { ...originalEmotionalState });
    }
    
    return forkedCharacter.id;
  }

  /**
   * Reconfigure a character based on a specific emotional state
   */
  public reconfigureCharacter(
    characterId: string, 
    emotionalState: EmotionalState,
    collapseThresholdAdjustment: number = 0
  ): void {
    const character = this.getCharacter(characterId);
    if (!character) return;
    
    this.updateEmotionalState(characterId, emotionalState);
    
    const toneProfile = { ...character.toneProfile };
    toneProfile.baseline = emotionalState.dominant;
    
    const dominantWeight = Math.min(0.5, 0.3 + (emotionalState.intensity * 0.2));
    
    const remainingWeight = 1 - dominantWeight;
    const otherEmotions = Object.keys(toneProfile.variations).filter(
      e => e !== emotionalState.dominant
    );
    
    for (const emotion of otherEmotions) {
      toneProfile.variations[emotion] = remainingWeight / otherEmotions.length;
    }
    
    toneProfile.variations[emotionalState.dominant] = dominantWeight;
    
    toneProfile.adaptability = 1 - emotionalState.stability;
    
    character.toneProfile = toneProfile;
    
    character.collapseThreshold = Math.max(
      0.1,
      Math.min(
        0.9,
        character.collapseThreshold + collapseThresholdAdjustment
      )
    );
    
    this.characters.set(characterId, character);
  }
}

/**
 * Memory traversal preference for a character
 */
interface MemoryTraversalPreference {
  emotionalWeight: number;
  recencyWeight: number;
  causalityWeight: number;
  contradictionTolerance: number;
  maxDepth: number;
}
