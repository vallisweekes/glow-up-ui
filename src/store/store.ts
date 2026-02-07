import { configureStore } from '@reduxjs/toolkit';
import { glowApi } from './api';

export const store = configureStore({
  reducer: {
    [glowApi.reducerPath]: glowApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(glowApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
