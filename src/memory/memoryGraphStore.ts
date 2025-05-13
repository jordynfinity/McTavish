/**
 * Memory Graph Store
 * 
 * Represents canon as a dynamic directed graph:
 * - Nodes = messages, memories, events
 * - Edges = causality, emotional link, divergence, contradiction
 * - Supports multiple characters operating simultaneously
 */

import { Graph } from 'graphlib';
import { v4 as uuidv4 } from 'uuid';
import { 
  MemoryNode, 
  MemoryEdge, 
  FractureEvent, 
  RecursionFold, 
  Premonition 
} from '../types';

export class MemoryGraphStore {
  private graph: Graph;
  private nodes: Map<string, MemoryNode>;
  private edges: Map<string, MemoryEdge>;
  
  constructor() {
    this.graph = new Graph({ directed: true });
    this.nodes = new Map();
    this.edges = new Map();
  }

  /**
   * Add a fracture event to the memory graph
   */
  public addFracture(fracture: FractureEvent): string {
    const node: MemoryNode = {
      id: fracture.id,
      type: 'fracture',
      content: fracture.content,
      timestamp: fracture.timestamp,
      metadata: fracture.metadata
    };
    
    return this.addNode(node);
  }

  /**
   * Add a recursion fold to the memory graph
   */
  public addFold(fold: RecursionFold): string {
    const node: MemoryNode = {
      id: fold.id,
      type: 'fold',
      content: fold.content,
      timestamp: fold.timestamp,
      metadata: {
        characterId: fold.characterId,
        emotionalState: fold.emotionalState,
        ...fold.metadata
      }
    };
    
    const nodeId = this.addNode(node);
    
    if (fold.fractureEventId) {
      this.addEdge({
        source: fold.fractureEventId,
        target: nodeId,
        type: 'causality',
        weight: 1.0
      });
    }
    
    return nodeId;
  }

  /**
   * Add a premonition to the memory graph
   */
  public addPremonition(premonition: Premonition): string {
    const node: MemoryNode = {
      id: premonition.id,
      type: 'premonition',
      content: premonition.content,
      timestamp: premonition.timestamp,
      metadata: {
        characterId: premonition.characterId,
        emotionalState: premonition.emotionalState,
        validityWindow: premonition.validityWindow,
        bindingCriteria: premonition.bindingCriteria,
        ...premonition.metadata
      }
    };
    
    return this.addNode(node);
  }

  /**
   * Add a memory node (general purpose memory)
   */
  public addMemory(content: string, characterId: string, metadata?: Record<string, any>): string {
    const node: MemoryNode = {
      id: uuidv4(),
      type: 'memory',
      content,
      timestamp: Date.now(),
      metadata: {
        characterId,
        ...metadata
      }
    };
    
    return this.addNode(node);
  }

  /**
   * Add a node to the graph
   */
  private addNode(node: MemoryNode): string {
    this.nodes.set(node.id, node);
    this.graph.setNode(node.id, node);
    return node.id;
  }

  /**
   * Add an edge to the graph
   */
  public addEdge(edge: MemoryEdge): string {
    const edgeId = `${edge.source}-${edge.target}-${edge.type}`;
    
    if (!this.graph.hasNode(edge.source) || !this.graph.hasNode(edge.target)) {
      throw new Error(`Cannot create edge: one or both nodes do not exist`);
    }
    
    this.edges.set(edgeId, edge);
    this.graph.setEdge(edge.source, edge.target, edge);
    
    return edgeId;
  }

  /**
   * Create a divergence edge between two nodes
   */
  public createDivergence(sourceId: string, targetId: string, weight: number = 0.5): string {
    return this.addEdge({
      source: sourceId,
      target: targetId,
      type: 'divergence',
      weight
    });
  }

  /**
   * Create a contradiction edge between two nodes
   */
  public createContradiction(sourceId: string, targetId: string, weight: number = 0.8): string {
    return this.addEdge({
      source: sourceId,
      target: targetId,
      type: 'contradiction',
      weight
    });
  }

  /**
   * Create an emotional link between two nodes
   */
  public createEmotionalLink(sourceId: string, targetId: string, weight: number = 0.6): string {
    return this.addEdge({
      source: sourceId,
      target: targetId,
      type: 'emotional',
      weight
    });
  }

  /**
   * Get a node by ID
   */
  public getNode(nodeId: string): MemoryNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes
   */
  public getAllNodes(): MemoryNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get all edges
   */
  public getAllEdges(): MemoryEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * Get all nodes of a specific type
   */
  public getNodesByType(type: 'fracture' | 'fold' | 'memory' | 'premonition'): MemoryNode[] {
    return Array.from(this.nodes.values()).filter(node => node.type === type);
  }

  /**
   * Get all edges of a specific type
   */
  public getEdgesByType(type: 'causality' | 'emotional' | 'divergence' | 'contradiction'): MemoryEdge[] {
    return Array.from(this.edges.values()).filter(edge => edge.type === type);
  }

  /**
   * Get all nodes related to a specific character
   */
  public getNodesByCharacter(characterId: string): MemoryNode[] {
    return Array.from(this.nodes.values()).filter(node => 
      node.metadata && node.metadata.characterId === characterId
    );
  }

  /**
   * Get all successors of a node (outgoing edges)
   */
  public getSuccessors(nodeId: string): MemoryNode[] {
    const successorIds = this.graph.successors(nodeId) || [];
    return successorIds.map(id => this.nodes.get(id)!).filter(Boolean);
  }

  /**
   * Get all predecessors of a node (incoming edges)
   */
  public getPredecessors(nodeId: string): MemoryNode[] {
    const predecessorIds = this.graph.predecessors(nodeId) || [];
    return predecessorIds.map(id => this.nodes.get(id)!).filter(Boolean);
  }

  /**
   * Get all edges between two nodes
   */
  public getEdgesBetween(sourceId: string, targetId: string): MemoryEdge[] {
    const edgeObject = this.graph.edge(sourceId, targetId);
    return edgeObject ? [edgeObject as MemoryEdge] : [];
  }

  /**
   * Find paths between two nodes
   */
  public findPaths(sourceId: string, targetId: string, maxDepth: number = 5): string[][] {
    const paths: string[][] = [];
    this.dfs(sourceId, targetId, [sourceId], paths, maxDepth);
    return paths;
  }

  /**
   * Depth-first search to find paths
   */
  private dfs(
    current: string, 
    target: string, 
    path: string[], 
    allPaths: string[][], 
    maxDepth: number
  ): void {
    if (path.length > maxDepth) return;
    
    if (current === target) {
      allPaths.push([...path]);
      return;
    }
    
    const successors = this.graph.successors(current) || [];
    for (const successor of successors) {
      if (!path.includes(successor)) {
        path.push(successor);
        this.dfs(successor, target, path, allPaths, maxDepth);
        path.pop();
      }
    }
  }

  /**
   * Fork the memory graph at a specific node
   * Creates a divergence branch in the graph
   */
  public forkAtNode(nodeId: string): string {
    const originalNode = this.getNode(nodeId);
    if (!originalNode) {
      throw new Error(`Cannot fork: node ${nodeId} does not exist`);
    }
    
    const forkedNode: MemoryNode = {
      ...originalNode,
      id: uuidv4(),
      timestamp: Date.now(),
      metadata: {
        ...originalNode.metadata,
        forkedFrom: nodeId
      }
    };
    
    const forkedNodeId = this.addNode(forkedNode);
    
    this.createDivergence(nodeId, forkedNodeId);
    
    return forkedNodeId;
  }

  /**
   * Get the canonical path through the memory graph
   * This is the path with the highest weight edges
   */
  public getCanonicalPath(): MemoryNode[] {
    const nodes = this.getAllNodes();
    if (nodes.length === 0) return [];
    
    const startNode = nodes.reduce((earliest, current) => 
      current.timestamp < earliest.timestamp ? current : earliest
    );
    
    const path: MemoryNode[] = [startNode];
    let current = startNode.id;
    
    const visited = new Set<string>([current]);
    
    while (true) {
      const successors = this.getSuccessors(current);
      if (successors.length === 0) break;
      
      let bestSuccessor: MemoryNode | null = null;
      let bestWeight = -1;
      
      for (const successor of successors) {
        if (visited.has(successor.id)) continue;
        
        const edges = this.getEdgesBetween(current, successor.id);
        if (edges.length === 0) continue;
        
        const edge = edges[0];
        if (edge.weight > bestWeight) {
          bestWeight = edge.weight;
          bestSuccessor = successor;
        }
      }
      
      if (!bestSuccessor) break;
      
      path.push(bestSuccessor);
      current = bestSuccessor.id;
      visited.add(current);
    }
    
    return path;
  }

  /**
   * Clear the entire graph
   */
  public clear(): void {
    this.graph = new Graph({ directed: true });
    this.nodes.clear();
    this.edges.clear();
  }
}
