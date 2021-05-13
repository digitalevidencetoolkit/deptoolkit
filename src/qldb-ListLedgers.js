import qldb from 'aws-sdk/clients/qldb.js';

/**
 * List all ledgers.
 * @param qldbClient The QLDB control plane client to use.
 * @returns Promise which fulfills with a LedgerSummary array.
 */
export async function listLedgers(qldbClient) {
  const ledgerSummaries = [];
  let nextToken = null;
  do {
    const request = { NextToken: nextToken };
    const result = await qldbClient.listLedgers(request).promise();
    ledgerSummaries.push.apply(ledgerSummaries, result.Ledgers);
    nextToken = result.NextToken;
  } while (nextToken != null);
  return [ledgerSummaries];
}
