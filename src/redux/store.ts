import { configureStore } from '@reduxjs/toolkit';
import paletteReducer from './Paletteslice'

export const store = configureStore({
  reducer: {
    palette: paletteReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
