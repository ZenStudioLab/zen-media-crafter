import { configureStore } from '@reduxjs/toolkit';
import apiKeysReducer from './api-keys-slice';
import uiReducer from './ui-slice';
import projectReducer from './project-slice';
import historyReducer from './history-slice';

import logger from 'redux-logger';

export const store = configureStore({
    reducer: {
        apiKeys: apiKeysReducer,
        ui: uiReducer,
        project: projectReducer,
        history: historyReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // Disabling serializable check for Project classes
        }).concat(logger),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
