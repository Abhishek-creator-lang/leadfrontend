'use client';

import { createContext, useContext } from 'react';
import type { SessionUser } from '@/constants/roles';

/** The signed-in user (or null for guests), resolved on the server in the root layout. */
export const SessionContext = createContext<SessionUser | null>(null);

export const useCurrentUser = () => useContext(SessionContext);
