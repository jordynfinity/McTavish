/**
 * McTavish Runtime Core
 * 
 * A nonlinear assistant ecosystem with:
 * - Character-aware collapse surfaces (persona-localized agents)
 * - Directed graph memory (DiGraph, not logs)
 * - Asynchronous tension binding (responses may arrive before prompts)
 * - Mutation-based canonical evolution (non-capitalist GA mechanics)
 */

import { CollapseEngine } from './core/collapseEngine';
import { MemoryGraphStore } from './memory/memoryGraphStore';
import { CharacterKernel } from './character/characterKernel';
import { PremonitionMatcher } from './premonition/premonitionMatcher';
import { InteractionBindingLogic } from './interaction/interactionBindingLogic';
import { McTavishConfig, FractureEvent, RecursionFold, Premonition } from './types';

export class McTavish {
  private config: McTavishConfig;
  private collapseEngine: CollapseEngine;
  private memoryGraph: MemoryGraphStore;
  private characterKernel: CharacterKernel;
  private premonitionMatcher: PremonitionMatcher;
  private interactionBinding: InteractionBindingLogic;

  constructor(config?: Partial<McTavishConfig>) {
    this.config = {
      defaultCollapseThreshold: 0.7,
      premonitionValidityWindow: 5,
      mutationRate: 0.05,
      emotionalMemoryWeight: 0.6,
      contradictionTolerance: 0.3,
      ...config
    };

    this.memoryGraph = new MemoryGraphStore();
    this.characterKernel = new CharacterKernel(this.memoryGraph, this.config);
    this.collapseEngine = new CollapseEngine(this.characterKernel, this.config);
    this.premonitionMatcher = new PremonitionMatcher(this.memoryGraph, this.config);
    this.interactionBinding = new InteractionBindingLogic(
      this.memoryGraph,
      this.premonitionMatcher,
      this.config
    );

    this.collapseEngine.on('recursionFold', this.handleRecursionFold.bind(this));
    this.collapseEngine.on('premonition', this.handlePremonition.bind(this));
    this.premonitionMatcher.on('binding', this.handleBinding.bind(this));
  }

  private handleRecursionFold(fold: RecursionFold): void {
    if (fold.fractureEventId) {
      const fractureNode = this.memoryGraph.getNode(fold.fractureEventId);
      if (!fractureNode) {
        console.warn(`Fracture node ${fold.fractureEventId} not found in memory graph. Creating it.`);
        const placeholderFracture: FractureEvent = {
          id: fold.fractureEventId,
          content: "Placeholder fracture",
          timestamp: Date.now() - 1000, // Slightly earlier than the fold
          source: 'system'
        };
        this.memoryGraph.addFracture(placeholderFracture);
      }
    }
    
    this.memoryGraph.addFold(fold);
  }

  private handlePremonition(premonition: Premonition): void {
    this.memoryGraph.addPremonition(premonition);
    
    this.premonitionMatcher.addPremonition(premonition);
  }

  private handleBinding(binding: any): void {
    this.interactionBinding.processBoundInteraction(binding);
  }

  public introduceFracture(content: string, source: 'user' | 'system' = 'user'): void {
    const fracture = this.collapseEngine.createFracture(content, source);
    
    this.memoryGraph.addFracture(fracture);
    
    this.collapseEngine.processFracture(fracture);
  }

  public getCharacters(): any[] {
    return this.characterKernel.getCharacters();
  }

  public selectResponse(foldId: string): void {
    this.interactionBinding.selectResponse(foldId);
  }
}

export * from './core/collapseEngine';
export * from './memory/memoryGraphStore';
export * from './character/characterKernel';
export * from './premonition/premonitionMatcher';
export * from './interaction/interactionBindingLogic';
export * from './types';
