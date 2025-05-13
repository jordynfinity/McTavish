/**
 * Interaction Binding Logic
 * 
 * Manages the complex relationships between fractures and folds:
 * - No single message-response mapping
 * - Reverse binding (response → prompt)
 * - Deferred binding (response hangs until match)
 * - Forked collapse (multiple characters respond, multiple valid bindings)
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { 
  FractureEvent, 
  RecursionFold, 
  McTavishConfig 
} from '../types';
import { MemoryGraphStore } from '../memory/memoryGraphStore';
import { PremonitionMatcher } from '../premonition/premonitionMatcher';

export class InteractionBindingLogic extends EventEmitter {
  private memoryGraph: MemoryGraphStore;
  private premonitionMatcher: PremonitionMatcher;
  private config: McTavishConfig;
  private pendingBindings: Map<string, BindingState>;
  private selectedResponses: Map<string, string>; // FractureId -> FoldId
  
  constructor(
    memoryGraph: MemoryGraphStore, 
    premonitionMatcher: PremonitionMatcher,
    config: McTavishConfig
  ) {
    super();
    this.memoryGraph = memoryGraph;
    this.premonitionMatcher = premonitionMatcher;
    this.config = config;
    this.pendingBindings = new Map();
    this.selectedResponses = new Map();
    
    this.premonitionMatcher.on('binding', this.handlePremonitionBinding.bind(this));
  }

  /**
   * Process a new fracture event
   */
  public processFracture(fracture: FractureEvent): void {
    this.memoryGraph.addFracture(fracture);
    
    this.checkDeferredBindings(fracture);
    
    this.pendingBindings.set(fracture.id, {
      fractureId: fracture.id,
      boundFoldIds: [],
      selectedFoldId: null,
      timestamp: Date.now(),
      status: 'pending'
    });
  }

  /**
   * Process a new recursion fold
   */
  public processFold(fold: RecursionFold): void {
    this.memoryGraph.addFold(fold);
    
    if (fold.fractureEventId) {
      this.bindFoldToFracture(fold.id, fold.fractureEventId);
    } else {
      this.storeDeferredFold(fold);
    }
  }

  /**
   * Process a bound interaction (premonition -> fracture)
   */
  public processBoundInteraction(binding: any): void {
    const premonitionNode = this.memoryGraph.getNode(binding.premonitionId);
    const fractureNode = this.memoryGraph.getNode(binding.fractureId);
    
    if (!premonitionNode || !fractureNode) {
      return;
    }
    
    if (!this.pendingBindings.has(binding.fractureId)) {
      this.pendingBindings.set(binding.fractureId, {
        fractureId: binding.fractureId,
        boundFoldIds: [],
        selectedFoldId: null,
        timestamp: Date.now(),
        status: 'pending'
      });
    }
    
    const bindingState = this.pendingBindings.get(binding.fractureId)!;
    bindingState.boundFoldIds.push(binding.premonitionId);
    
    this.emit('interaction', {
      type: 'premonition_binding',
      premonitionId: binding.premonitionId,
      fractureId: binding.fractureId,
      timestamp: Date.now()
    });
  }

  /**
   * Bind a fold to a fracture
   */
  private bindFoldToFracture(foldId: string, fractureId: string): void {
    let bindingState = this.pendingBindings.get(fractureId);
    
    if (!bindingState) {
      bindingState = {
        fractureId,
        boundFoldIds: [],
        selectedFoldId: null,
        timestamp: Date.now(),
        status: 'pending'
      };
      this.pendingBindings.set(fractureId, bindingState);
    }
    
    if (!bindingState.boundFoldIds.includes(foldId)) {
      bindingState.boundFoldIds.push(foldId);
    }
    
    this.emit('interaction', {
      type: 'fold_binding',
      foldId,
      fractureId,
      timestamp: Date.now()
    });
  }

  /**
   * Store a deferred fold (no fracture yet)
   */
  private storeDeferredFold(fold: RecursionFold): void {
    this.emit('interaction', {
      type: 'deferred_fold',
      foldId: fold.id,
      timestamp: Date.now()
    });
  }

  /**
   * Check for deferred folds that could bind to a new fracture
   */
  private checkDeferredBindings(fracture: FractureEvent): void {
    const foldNodes = this.memoryGraph.getNodesByType('fold');
    const deferredFolds = foldNodes.filter(node => 
      !node.metadata?.fractureEventId
    );
    
    for (const foldNode of deferredFolds) {
      const contentSimilarity = this.calculateContentSimilarity(
        foldNode.content,
        fracture.content
      );
      
      if (contentSimilarity > 0.5) {
        this.memoryGraph.addEdge({
          source: foldNode.id,
          target: fracture.id,
          type: 'causality',
          weight: contentSimilarity,
          metadata: {
            bindingType: 'deferred',
            bindingTimestamp: Date.now(),
            fractureEventId: fracture.id // Store the fracture ID in the edge metadata
          }
        });
        
        
        this.bindFoldToFracture(foldNode.id, fracture.id);
      }
    }
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
   * Handle a premonition binding event
   */
  private handlePremonitionBinding(binding: any): void {
    this.processBoundInteraction(binding);
  }

  /**
   * Select a specific response for a fracture
   */
  public selectResponse(foldId: string): void {
    const foldNode = this.memoryGraph.getNode(foldId);
    if (!foldNode || foldNode.type !== 'fold') {
      return;
    }
    
    const fractureId = foldNode.metadata?.fractureEventId;
    if (!fractureId) {
      return;
    }
    
    const bindingState = this.pendingBindings.get(fractureId);
    if (!bindingState) {
      return;
    }
    
    bindingState.selectedFoldId = foldId;
    bindingState.status = 'resolved';
    
    this.selectedResponses.set(fractureId, foldId);
    
    this.memoryGraph.addEdge({
      source: fractureId,
      target: foldId,
      type: 'causality',
      weight: 1.0,
      metadata: {
        selected: true,
        selectionTimestamp: Date.now()
      }
    });
    
    this.emit('interaction', {
      type: 'response_selection',
      foldId,
      fractureId,
      timestamp: Date.now()
    });
  }

  /**
   * Get all responses for a fracture
   */
  public getResponsesForFracture(fractureId: string): string[] {
    const bindingState = this.pendingBindings.get(fractureId);
    return bindingState ? bindingState.boundFoldIds : [];
  }

  /**
   * Get the selected response for a fracture
   */
  public getSelectedResponse(fractureId: string): string | null {
    return this.selectedResponses.get(fractureId) || null;
  }

  /**
   * Fork a fracture to create multiple response paths
   */
  public forkFracture(fractureId: string): string {
    const forkedFractureId = this.memoryGraph.forkAtNode(fractureId);
    
    this.pendingBindings.set(forkedFractureId, {
      fractureId: forkedFractureId,
      boundFoldIds: [],
      selectedFoldId: null,
      timestamp: Date.now(),
      status: 'pending'
    });
    
    this.emit('interaction', {
      type: 'fracture_fork',
      originalFractureId: fractureId,
      forkedFractureId,
      timestamp: Date.now()
    });
    
    return forkedFractureId;
  }

  /**
   * Create a reverse binding (response → prompt)
   */
  public createReverseBinding(foldId: string, content: string): string {
    const fracture: FractureEvent = {
      id: uuidv4(),
      content,
      timestamp: Date.now(),
      source: 'system',
      metadata: {
        reverseBindingFoldId: foldId
      }
    };
    
    this.memoryGraph.addFracture(fracture);
    
    this.bindFoldToFracture(foldId, fracture.id);
    
    this.memoryGraph.addEdge({
      source: foldId,
      target: fracture.id,
      type: 'causality',
      weight: 1.0,
      metadata: {
        reverseBinding: true,
        bindingTimestamp: Date.now()
      }
    });
    
    this.emit('interaction', {
      type: 'reverse_binding',
      foldId,
      fractureId: fracture.id,
      timestamp: Date.now()
    });
    
    return fracture.id;
  }

  /**
   * Get all pending bindings
   */
  public getPendingBindings(): BindingState[] {
    return Array.from(this.pendingBindings.values())
      .filter(binding => binding.status === 'pending');
  }

  /**
   * Get all resolved bindings
   */
  public getResolvedBindings(): BindingState[] {
    return Array.from(this.pendingBindings.values())
      .filter(binding => binding.status === 'resolved');
  }
}

/**
 * State of a binding between fractures and folds
 */
interface BindingState {
  fractureId: string;
  boundFoldIds: string[];
  selectedFoldId: string | null;
  timestamp: number;
  status: 'pending' | 'resolved';
}
