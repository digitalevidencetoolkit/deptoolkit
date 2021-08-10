import * as Ledger from './index';
export { default as LedgerEntryComponent } from './LedgerEntry.svelte';
import { ledgerData } from '../stores';

export type LedgerEntry = {
  title: string;
  url: string;
  sku: string;
  screenshot_hash?: string;
  thumb_hash?: string;
  one_file_hash?: string;
  history?: QLDBHistory;
  description?: string;
};

export type OriginalTx = {
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

const getTXDateFromBlock = (b: QLDBHistoryItem): Date =>
  new Date(b.metadata.txTime);

export const getOriginalTX = (h: QLDBHistory): OriginalTx => {
  const originalTx = h[0];
  const originalTxDate = getTXDateFromBlock(originalTx);
  return {
    originalTxDate: originalTxDate.toDateString(),
    originalTxTime: originalTxDate.toLocaleTimeString(),
  };
};

/**
 * Sends the edits to a document to the API
 * @param thing a FormData from the form popping up for each document
 * @param id the ID of the document to edit
 **/
// @TODO: make this function return a fulfilling or rejecting promise
export async function postDocumentRevision(thing: FormData, id: string) {
  const res = await fetch(`http://localhost:3000/edit-description/${id}`, {
    method: 'POST',
    body: thing,
  });

  // @TODO: implement store.update() to avoid a full page refresh
  if (res.ok === true) {
    ledgerData.set(Ledger.fetchData());
  }
}
