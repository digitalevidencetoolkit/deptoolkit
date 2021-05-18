import { QLDB } from 'aws-sdk';
import {
  LedgerSummary,
  ListLedgersRequest,
  ListLedgersResponse,
} from 'aws-sdk/clients/qldb';

/**
 * List all ledgers.
 * @param qldbClient The QLDB control plane client to use.
 * @returns Promise which fulfills with a LedgerSummary array.
 */
export async function listLedgers(qldbClient: QLDB): Promise<LedgerSummary[]> {
  const ledgerSummaries: LedgerSummary[] = [];
  let nextToken: string = null;
  do {
    const request: ListLedgersRequest = { NextToken: nextToken };
    const result: ListLedgersResponse = await qldbClient
      .listLedgers(request)
      .promise();
    ledgerSummaries.push.apply(ledgerSummaries, result.Ledgers);
    nextToken = result.NextToken;
  } while (nextToken != null);
  return ledgerSummaries;
}
