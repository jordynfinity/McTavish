import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';
import { MemoryNode, MemoryEdge, FractureEvent, RecursionFold } from '../../types';
import { mockMemoryNodes, mockMemoryEdges, mockFractures, mockFolds } from '../mockData/canon';

interface CanonState {
  nodes: MemoryNode[];
  edges: MemoryEdge[];
  fractures: FractureEvent[];
  folds: RecursionFold[];
  selectedNodeId: string | null;
  activePath: string[];
  currentForkId: string | null;
}

const initialState: CanonState = {
  nodes: mockMemoryNodes,
  edges: mockMemoryEdges,
  fractures: mockFractures,
  folds: mockFolds,
  selectedNodeId: null,
  activePath: [],
  currentForkId: null,
};

export const canonSlice = createSlice({
  name: 'canon',
  initialState,
  reducers: {
    selectNode: (state, action: PayloadAction<string>) => {
      state.selectedNodeId = action.payload;
    },
    clearSelection: (state) => {
      state.selectedNodeId = null;
    },
    setActivePath: (state, action: PayloadAction<string[]>) => {
      state.activePath = action.payload;
    },
    selectFork: (state, action: PayloadAction<string>) => {
      state.currentForkId = action.payload;
    },
    addFracture: (state, action: PayloadAction<FractureEvent>) => {
      state.fractures.push(action.payload);
      state.nodes.push({
        id: action.payload.id,
        type: 'fracture',
        content: action.payload.content,
        timestamp: action.payload.timestamp,
        metadata: { source: action.payload.source }
      });
    },
    addFold: (state, action: PayloadAction<RecursionFold>) => {
      state.folds.push(action.payload);
      state.nodes.push({
        id: action.payload.id,
        type: 'fold',
        content: action.payload.content,
        timestamp: action.payload.timestamp,
        metadata: {
          characterId: action.payload.characterId,
          emotionalState: action.payload.emotionalState,
          fractureEventId: action.payload.fractureEventId
        }
      });
      if (action.payload.fractureEventId) {
        state.edges.push({
          source: action.payload.fractureEventId,
          target: action.payload.id,
          type: 'causality',
          weight: 1.0
        });
      }
    }
  },
}) as Slice<CanonState>;

export const { selectNode, clearSelection, setActivePath, selectFork, addFracture, addFold } = canonSlice.actions;

export default canonSlice.reducer;
