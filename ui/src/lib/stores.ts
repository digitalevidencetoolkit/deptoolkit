import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import type { LedgerEntry } from './Ledger/index';

export const ledgerData: Writable<Promise<LedgerEntry[]>> = writable(null);
