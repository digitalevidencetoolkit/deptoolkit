import { Writable, writable } from 'svelte/store';
import type { LedgerEntry } from './Ledger/index';

export const ledgerData: Writable<Promise<LedgerEntry[]>> = writable(null);
