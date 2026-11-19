'use client';

import { createContext, useContext } from 'react';

/**
 * True once persisted progress has been loaded from localStorage into the store.
 * Until then the store holds empty defaults (that is what the server rendered), so components that
 * seed local state from the store or write to it on mount must wait for this flag.
 */
export const ProgressHydrationContext = createContext(false);

export const useProgressHydrated = () => useContext(ProgressHydrationContext);
