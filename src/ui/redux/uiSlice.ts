import { createSlice, PayloadAction, Slice } from '@reduxjs/toolkit';

interface UiState {
  activeTab: 'graph' | 'timeline' | 'messages';
  isSidebarOpen: boolean;
  zoomLevel: number;
  showPremonitions: boolean;
}

const initialState: UiState = {
  activeTab: 'graph',
  isSidebarOpen: true,
  zoomLevel: 1,
  showPremonitions: true,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<UiState['activeTab']>) => {
      state.activeTab = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setZoomLevel: (state, action: PayloadAction<number>) => {
      state.zoomLevel = action.payload;
    },
    togglePremonitions: (state) => {
      state.showPremonitions = !state.showPremonitions;
    }
  },
}) as Slice<UiState>;

export const { setActiveTab, toggleSidebar, setZoomLevel, togglePremonitions } = uiSlice.actions;

export default uiSlice.reducer;
