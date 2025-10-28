# AWS QLDB Deprecation Notice

## Critical Timeline

**AWS QLDB End of Life: July 31, 2025**

Amazon Web Services has announced the deprecation and discontinuation of Amazon Quantum Ledger Database (QLDB). The service will be fully shut down on **July 31, 2025**.

- **Official AWS Announcement**: [Amazon QLDB end of life](https://aws.amazon.com/qldb/)
- **Migration Deadline**: July 31, 2025
- **Current Status**: Service still operational but deprecated

## Impact on DEPToolkit

### Critical Dependencies

The Digital Evidence Preservation Toolkit (DEPToolkit) is **fundamentally built on AWS QLDB** as its core immutable ledger database. QLDB provides the cryptographically verifiable, append-only transaction log that enables the toolkit's chain-of-custody guarantees for digital evidence.

**Affected Components**:
- `src/qldb/index.ts` - All QLDB driver operations (queries, inserts, history tracking)
- `src/ledger/index.ts` - Ledger abstraction layer wrapping QLDB
- `ui/src/lib/Ledger/` - Frontend components for ledger interaction
- `package.json` - Dependency on `amazon-qldb-driver-nodejs@^2.2.0`

### What This Means

1. **The toolkit cannot function without a ledger database** - QLDB is not optional
2. **All archive integrity guarantees depend on the ledger** - This is the core feature
3. **Migration is mandatory** - There is no workaround or fallback option
4. **Production use is not recommended** - Systems may become inoperable after July 2025

## Potential Migration Paths

The following are potential alternatives to AWS QLDB. Each has tradeoffs and would require significant development work:

### 1. Amazon Aurora PostgreSQL with pg_audit

**Description**: Use PostgreSQL with audit logging extensions to track all changes.

**Pros**:
- Mature, well-supported AWS service
- SQL compatibility makes migration easier
- Built-in replication and backup

**Cons**:
- Not a true ledger database (requires application-level guarantees)
- No built-in cryptographic verification of history
- Would require custom implementation of chain-of-custody features

### 2. Custom Blockchain/Merkle Tree Solution

**Description**: Build a custom ledger using blockchain principles or Merkle trees for verification.

**Pros**:
- Full control over implementation
- Can tailor to specific evidence preservation requirements
- True cryptographic guarantees

**Cons**:
- Significant development effort
- Requires cryptography and distributed systems expertise
- Maintenance burden

### 3. Hyperledger Fabric or Other Enterprise Blockchain

**Description**: Use an enterprise blockchain platform designed for permissioned networks.

**Pros**:
- Designed for chain-of-custody and audit use cases
- Established ecosystem and tooling
- Cryptographically verifiable

**Cons**:
- Complex infrastructure requirements
- Steep learning curve
- May be overkill for single-tenant use cases

### 4. ImmuDB or Similar Open Source Ledger Databases

**Description**: Migrate to an open-source ledger database like [ImmuDB](https://immudb.io/).

**Pros**:
- Purpose-built for immutable data storage
- SQL-like query interface
- Built-in cryptographic verification
- Active development

**Cons**:
- Less mature than AWS services
- Self-hosting required (or third-party hosting)
- Smaller community compared to PostgreSQL/MySQL

### 5. Azure Confidential Ledger or Google Cloud Spanner (Ledger mode)

**Description**: Migrate to alternative cloud provider ledger services.

**Pros**:
- Managed services similar to QLDB
- Purpose-built for ledger use cases

**Cons**:
- Vendor lock-in to different cloud provider
- May have different feature sets
- Cost considerations

## Migration Considerations

### Technical Requirements

Any replacement solution must provide:

1. **Immutability** - Once written, data cannot be modified or deleted
2. **Cryptographic Verification** - Ability to prove data has not been tampered with
3. **Complete History Tracking** - Full audit trail of all changes over time
4. **Query Capabilities** - Ability to query both current state and historical data
5. **Document-Oriented Storage** - Support for flexible schema (JSON-like documents)

### Migration Effort Estimate

A full migration will require:

- **Code Refactoring**: Rewrite `src/qldb/` and potentially `src/ledger/`
- **Data Migration**: Export existing QLDB data before July 31, 2025
- **Testing**: Extensive testing to ensure integrity guarantees are maintained
- **Documentation Updates**: Revise all setup and operational documentation

**Estimated Effort**: 2-4 months of development work (depending on chosen solution)

## Current Recommendations

1. **Do not deploy to production** - Any new production deployments are at risk
2. **Plan for migration** - Begin evaluating alternatives as soon as possible
3. **Export data regularly** - Ensure you can retrieve data from QLDB before shutdown
4. **Monitor AWS communications** - Watch for any updates or extensions to the deadline

## Migration Status

**Current Status**: ⚠️ No migration work has started

**Next Steps**:
1. Evaluate and select replacement ledger technology
2. Design migration architecture
3. Implement proof-of-concept with chosen solution
4. Plan data migration strategy
5. Execute full migration

## Contributing

If you have expertise in ledger databases, blockchain technology, or have experience with any of the alternatives listed above, contributions and guidance would be greatly appreciated.

Contact: basile@digitalevidencetoolkit.org

## References

- [AWS QLDB Deprecation Notice](https://aws.amazon.com/qldb/)
- [QLDB Developer Guide](https://docs.aws.amazon.com/qldb/latest/developerguide/)
- [DEPToolkit Documentation](./README.md)

---

**Last Updated**: 2025-10-28
