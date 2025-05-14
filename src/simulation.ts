/**
 * McTavish Simulation
 * 
 * Demonstrates the first milestone scenario:
 * 
 * 1. Assistant A emits a line: "You're about to ask about her."
 * 2. 7 seconds later, user types: "What happened to Elena?"
 * 3. McTavish binds the premonition.
 * 4. Elena's character profile reconfigures.
 * 5. Canon graph forks.
 * 6. Both versions of Elena respond—one tired, one cruel.
 * 7. User picks the tired one.
 * 8. Mutation weight increases.
 * 9. Future interactions start defaulting to soft grief tone for Elena.
 */

import { McTavish } from './index';
import { 
  CharacterField, 
  EmotionalState, 
  FractureEvent, 
  RecursionFold,
  Premonition
} from './types';
import { CharacterKernel } from './character/characterKernel';
import { MemoryGraphStore } from './memory/memoryGraphStore';
import { v4 as uuidv4 } from 'uuid';

const log = (message: string, type: 'info' | 'event' | 'character' | 'system' = 'info') => {
  const timestamp = new Date().toISOString();
  
  switch (type) {
    case 'info':
      console.log(`[${timestamp}] INFO: ${message}`);
      break;
    case 'event':
      console.log(`[${timestamp}] EVENT: ${message}`);
      break;
    case 'character':
      console.log(`[${timestamp}] CHARACTER: ${message}`);
      break;
    case 'system':
      console.log(`[${timestamp}] SYSTEM: ${message}`);
      break;
  }
};

class McTavishSimulation {
  private mctavish: McTavish;
  private characterKernel: CharacterKernel;
  private memoryGraph: MemoryGraphStore;
  private assistantId: string;
  private elenaId: string;
  private elenaVariantId: string | null = null;
  private premonitionId: string | null = null;
  private fractureId: string | null = null;
  private tiredResponseId: string | null = null;
  private cruelResponseId: string | null = null;
  
  constructor() {
    const config = {
      defaultCollapseThreshold: 0.7,
      premonitionValidityWindow: 5,
      mutationRate: 0.05,
      emotionalMemoryWeight: 0.6,
      contradictionTolerance: 0.3
    };
    
    this.mctavish = new McTavish(config);
    
    this.memoryGraph = this.mctavish.getMemoryGraph();
    this.characterKernel = this.mctavish.getCharacterKernel();
    
    this.assistantId = this.createAssistantCharacter();
    this.elenaId = this.createElenaCharacter();
    
    this.setupEventListeners();
  }
  
  /**
   * Create the assistant character
   */
  private createAssistantCharacter(): string {
    const assistantId = this.characterKernel.createCharacter(
      'Assistant A',
      {
        baseline: 'neutral',
        variations: {
          'curiosity': 0.4,
          'helpfulness': 0.4,
          'surprise': 0.2
        },
        adaptability: 0.7
      },
      {
        driftRate: 0.03,
        driftDirections: {
          'intuition': 0.5,
          'perception': 0.5
        },
        stabilityFactors: ['core_memory']
      },
      0.6 // Lower threshold to make premonitions more likely
    );
    
    log(`Created Assistant A character (${assistantId})`, 'system');
    return assistantId;
  }
  
  /**
   * Create the Elena character
   */
  private createElenaCharacter(): string {
    const elenaId = this.characterKernel.createCharacter(
      'Elena',
      {
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
      {
        driftRate: 0.1, // Higher drift rate to make mutation more noticeable
        driftDirections: {
          'melancholy': 0.4,
          'bitterness': 0.3,
          'resilience': 0.3
        },
        stabilityFactors: ['core_memory', 'repeated_interaction']
      },
      0.7
    );
    
    log(`Created Elena character (${elenaId})`, 'system');
    return elenaId;
  }
  
  /**
   * Set up event listeners for the simulation
   */
  private setupEventListeners(): void {
    this.mctavish.getCollapseEngine().on('recursionFold', (fold: RecursionFold) => {
      const character = this.characterKernel.getCharacter(fold.characterId);
      if (!character) return;
      
      log(`${character.name} emitted: "${fold.content}"`, 'character');
      
      if (fold.characterId === this.elenaId && fold.fractureEventId === this.fractureId) {
        this.tiredResponseId = fold.id;
        log(`Tracked tired Elena response (${fold.id})`, 'system');
      } else if (fold.characterId === this.elenaVariantId && fold.fractureEventId === this.fractureId) {
        this.cruelResponseId = fold.id;
        log(`Tracked cruel Elena response (${fold.id})`, 'system');
      }
    });
    
    this.mctavish.getCollapseEngine().on('premonition', (premonition: Premonition) => {
      const character = this.characterKernel.getCharacter(premonition.characterId);
      if (!character) return;
      
      log(`${character.name} emitted premonition: "${premonition.content}"`, 'character');
      
      if (premonition.characterId === this.assistantId && 
          premonition.content.includes("You're about to ask about her")) {
        this.premonitionId = premonition.id;
        log(`Tracked premonition (${premonition.id})`, 'system');
      }
    });
    
    this.mctavish.getPremonitionMatcher().on('binding', (binding: any) => {
      log(`Premonition bound to fracture: ${binding.premonitionId} -> ${binding.fractureId}`, 'event');
    });
    
    this.mctavish.getInteractionBinding().on('interaction', (interaction: any) => {
      log(`Interaction: ${interaction.type}`, 'event');
    });
  }
  
  /**
   * Run the simulation
   */
  public async run(): Promise<void> {
    log('Starting McTavish simulation', 'system');
    
    log('Step 1: Assistant emits a premonition', 'system');
    this.emitAssistantPremonition();
    
    log('Step 2: Waiting 7 seconds for user input...', 'system');
    await this.delay(1000); // Reduced for testing
    this.userAsksAboutElena();
    
    log('Step 3: McTavish binds the premonition', 'system');
    this.bindPremonition();
    
    log('Step 4: Elena\'s character profile reconfigures', 'system');
    this.reconfigureElena();
    
    log('Step 5: Canon graph forks', 'system');
    this.forkCanon();
    
    log('Step 6: Both versions of Elena respond', 'system');
    this.generateElenaResponses();
    
    log('Step 7: User picks the tired response', 'system');
    await this.delay(500); // Reduced for testing
    this.userSelectsTiredResponse();
    
    log('Step 8: Mutation weight increases', 'system');
    this.increaseMutationWeight();
    
    log('Step 9: Future interactions default to soft grief tone', 'system');
    await this.delay(500); // Reduced for testing
    this.demonstrateToneDefaulting();
    
    log('Simulation complete', 'system');
  }
  
  /**
   * Emit a premonition from the assistant
   */
  private emitAssistantPremonition(): void {
    const premonitionId = uuidv4();
    
    const emotionalState: EmotionalState = {
      dominant: 'curiosity',
      intensity: 0.8,
      stability: 0.4
    };
    
    const premonition: Premonition = {
      id: premonitionId,
      content: "You're about to ask about her.",
      timestamp: Date.now(),
      characterId: this.assistantId,
      emotionalState,
      validityWindow: 3,
      bindingCriteria: {
        contentSimilarity: 0.6,
        emotionalAlignment: 0.5,
        keywords: ['elena', 'her', 'she', 'happened']
      }
    };
    
    this.memoryGraph.addPremonition(premonition);
    
    this.mctavish.getPremonitionMatcher().addPremonition(premonition);
    
    log(`Assistant A emitted premonition: "${premonition.content}"`, 'character');
    this.premonitionId = premonition.id;
  }
  
  /**
   * User asks about Elena
   */
  private userAsksAboutElena(): void {
    const fractureId = uuidv4();
    
    const fracture: FractureEvent = {
      id: fractureId,
      content: "What happened to Elena?",
      timestamp: Date.now(),
      source: 'user'
    };
    
    this.memoryGraph.addFracture(fracture);
    
    this.mctavish.introduceFracture(fracture.content);
    
    log(`User asked: "${fracture.content}"`, 'event');
    this.fractureId = fracture.id;
  }
  
  /**
   * Bind the premonition to the fracture
   */
  private bindPremonition(): void {
    if (!this.premonitionId || !this.fractureId) {
      log('Cannot bind premonition: missing IDs', 'system');
      return;
    }
    
    const fracture = this.memoryGraph.getNode(this.fractureId);
    if (!fracture) {
      log('Cannot bind premonition: fracture not found in memory graph', 'system');
      return;
    }
    
    this.mctavish.getPremonitionMatcher().processFracture({
      id: this.fractureId,
      content: fracture.content,
      timestamp: fracture.timestamp,
      source: 'user'
    });
    
    this.mctavish.getCollapseEngine().bindPremonitionToFracture(
      this.premonitionId,
      this.fractureId
    );
    
    log('Premonition bound to fracture', 'event');
  }
  
  /**
   * Reconfigure Elena's character profile
   */
  private reconfigureElena(): void {
    const tiredEmotionalState: EmotionalState = {
      dominant: 'sadness',
      secondary: 'exhaustion',
      intensity: 0.7,
      stability: 0.8
    };
    
    this.characterKernel.reconfigureCharacter(
      this.elenaId,
      tiredEmotionalState,
      -0.1 // Lower collapse threshold to make responses more likely
    );
    
    const elena = this.characterKernel.getCharacter(this.elenaId);
    log(`Elena reconfigured: ${elena?.toneProfile.baseline} (${tiredEmotionalState.dominant})`, 'character');
  }
  
  /**
   * Fork the canon graph
   */
  private forkCanon(): void {
    if (!this.fractureId) {
      log('Cannot fork canon: missing fracture ID', 'system');
      return;
    }
    
    const forkedFractureId = this.memoryGraph.forkAtNode(this.fractureId);
    
    this.elenaVariantId = this.characterKernel.forkCharacter(this.elenaId, 'cruel');
    
    const cruelEmotionalState: EmotionalState = {
      dominant: 'anger',
      secondary: 'disgust',
      intensity: 0.8,
      stability: 0.6
    };
    
    this.characterKernel.reconfigureCharacter(
      this.elenaVariantId,
      cruelEmotionalState,
      -0.2 // Even lower collapse threshold
    );
    
    const elenaVariant = this.characterKernel.getCharacter(this.elenaVariantId);
    log(`Elena variant created: ${elenaVariant?.name} (${cruelEmotionalState.dominant})`, 'character');
  }
  
  /**
   * Generate responses from both versions of Elena
   */
  private generateElenaResponses(): void {
    if (!this.fractureId) {
      log('Cannot generate responses: missing fracture ID', 'system');
      return;
    }
    
    const tiredResponseId = uuidv4();
    const cruelResponseId = uuidv4();
    
    const tiredResponse: RecursionFold = {
      id: tiredResponseId,
      content: "I'm... I'm just so tired. Everything that happened... it's too much to talk about right now.",
      timestamp: Date.now(),
      characterId: this.elenaId,
      fractureEventId: this.fractureId,
      emotionalState: {
        dominant: 'sadness',
        intensity: 0.7,
        stability: 0.8
      }
    };
    
    const cruelResponse: RecursionFold = {
      id: cruelResponseId,
      content: "Why do you care? You weren't there when it all fell apart. Don't pretend to care now.",
      timestamp: Date.now() + 100, // Slightly later
      characterId: this.elenaVariantId!,
      fractureEventId: this.fractureId,
      emotionalState: {
        dominant: 'anger',
        intensity: 0.8,
        stability: 0.6
      }
    };
    
    this.memoryGraph.addFold(tiredResponse);
    this.memoryGraph.addFold(cruelResponse);
    
    this.mctavish.getInteractionBinding().processFold(tiredResponse);
    this.mctavish.getInteractionBinding().processFold(cruelResponse);
    
    this.tiredResponseId = tiredResponse.id;
    this.cruelResponseId = cruelResponse.id;
    
    log(`Elena (tired) responded: "${tiredResponse.content}"`, 'character');
    log(`Elena (cruel) responded: "${cruelResponse.content}"`, 'character');
  }
  
  /**
   * User selects the tired response
   */
  private userSelectsTiredResponse(): void {
    if (!this.tiredResponseId) {
      log('Cannot select response: missing tired response ID', 'system');
      return;
    }
    
    this.mctavish.selectResponse(this.tiredResponseId);
    
    log(`User selected the tired response`, 'event');
  }
  
  /**
   * Increase mutation weight for the tired tone
   */
  private increaseMutationWeight(): void {
    const elena = this.characterKernel.getCharacter(this.elenaId);
    if (!elena) {
      log('Cannot increase mutation weight: Elena character not found', 'system');
      return;
    }
    
    const mutationSchema = { ...elena.mutationSchema };
    mutationSchema.driftDirections = {
      ...mutationSchema.driftDirections,
      'melancholy': 0.6, // Increase from 0.4
      'bitterness': 0.2, // Decrease from 0.3
      'resilience': 0.2  // Decrease from 0.3
    };
    
    elena.mutationSchema = mutationSchema;
    
    log(`Increased mutation weight for melancholy: ${mutationSchema.driftDirections['melancholy']}`, 'system');
  }
  
  /**
   * Demonstrate tone defaulting in future interactions
   */
  private demonstrateToneDefaulting(): void {
    const newFractureId = uuidv4();
    
    const newFracture: FractureEvent = {
      id: newFractureId,
      content: "How are you feeling today, Elena?",
      timestamp: Date.now(),
      source: 'user'
    };
    
    this.memoryGraph.addFracture(newFracture);
    
    this.mctavish.introduceFracture(newFracture.content);
    
    log(`User asked: "${newFracture.content}"`, 'event');
    
    const softGriefResponseId = uuidv4();
    
    const softGriefResponse: RecursionFold = {
      id: softGriefResponseId,
      content: "Days blur together now. I remember things sometimes... good things... but they feel so far away. Like they happened to someone else.",
      timestamp: Date.now() + 1000,
      characterId: this.elenaId,
      fractureEventId: newFracture.id,
      emotionalState: {
        dominant: 'sadness',
        secondary: 'nostalgia',
        intensity: 0.6,
        stability: 0.9 // High stability indicates this is now the default
      }
    };
    
    this.memoryGraph.addFold(softGriefResponse);
    
    this.mctavish.getInteractionBinding().processFold(softGriefResponse);
    
    log(`Elena responded with soft grief tone: "${softGriefResponse.content}"`, 'character');
    
    const elena = this.characterKernel.getCharacter(this.elenaId);
    log(`Elena's baseline tone is now: ${elena?.toneProfile.baseline}`, 'character');
    log(`Tone stability: ${elena?.toneProfile.adaptability}`, 'character');
  }
  
  /**
   * Utility method to create a delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const simulation = new McTavishSimulation();
simulation.run().catch(error => {
  console.error('Simulation error:', error);
});
