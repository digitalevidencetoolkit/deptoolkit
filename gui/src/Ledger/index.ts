export { default as LedgerEntryComponent } from './LedgerEntry.svelte';
import { ledgerData } from '../stores';

export type LedgerEntry = {
  title: string;
  url: string;
  sku: string;
  hash?: string;
  thumb?: string;
  history?: QLDBHistory;
};

export type EntryHistory = {
  originalTxDate: string;
  originalTxTime: string;
};

export type QLDBHistory = QLDBHistoryItem[];

type QLDBHistoryItem = {
  blockAddress: {};
  data: {};
  metadata: { txTime: string };
};

// @TODO: error handling!
export async function fetchData(): Promise<LedgerEntry[]> {
  const res = await fetch('http://localhost:3000/list-docs');
  const data = await res.json();
  return data;
}

/**
 * Handle the convoluted querying of a record's history
 * @param id string - the record's ID
 * @returns a promise of a history (an array of revisions)
 */
// @TODO: error handling!
async function fetchItemHistory(id: string): Promise<QLDBHistory> {
  const res = await fetch(`http://localhost:3000/history/${id}`);
  const data = await res.json();
  return data;
}

/**
 * Show a record's history in the UI: fetch this history
 * and add it to the `historyData` store
 * @param entry object - the record as represented in QLDB
 */
export async function addHistoryTo(entry: LedgerEntry) {
  const { sku } = entry;
  const itemHistoryData = await fetchItemHistory(sku);

  ledgerData.update(async (d: Promise<LedgerEntry[]>) => {
    // let newStore;
    let newStore = await d.then(data => {
      const itemToUpdate = data.find(e => e.sku === sku);
      const updatedItem = { ...itemToUpdate, history: itemHistoryData };

      return data.map((e: LedgerEntry) => {
        if (e.sku === sku) {
          return updatedItem;
        } else {
          return e;
        }
      });
    });
    return newStore;
  });
}

export const getOriginalTX = (h: QLDBHistory): EntryHistory => {
  const originalTx = h[0];
  const originalTxDate = new Date(originalTx.metadata.txTime);
  return {
    originalTxDate: originalTxDate.toDateString(),
    originalTxTime: originalTxDate.toLocaleTimeString(),
  };
};
