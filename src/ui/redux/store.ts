import { configureStore } from '@reduxjs/toolkit';
import canonReducer from './canonSlice';
import characterReducer from './characterSlice';
import premonitionReducer from './premonitionSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    canon: canonReducer,
    character: characterReducer,
    premonition: premonitionReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
