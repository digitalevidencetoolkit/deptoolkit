# Testing Provision Audit

This document describes the work to be undertaken to improve test coverage of
the code base.

## Scope

This document will look at the following files:

- `index.ts`,
- all source files in the `src` folder.

## tldr;

First:

- Write interfaces for modules provided by the `src` folder (at the moment:
`ledger`, `store`, `verify`)
- inject these modules as an app dependency, using the interface to type them
- test the app using mocks implementing these interfaces (testing an Express
app can be done with eg the `supertest` module)

Then:

- test the modules themselves, and the helpers they're using
- if possible, test the app using the real modules (integration test)

Side quest: setup a PR gate that runs the test script (`npm test`) and unlock
the merge button only when the tests pass.

Unrelated side quest: setup lint using e.g. `eslint` and `prettier`, and setup
another PR gate for it. Automated formatting can be done via an editor extention
(e.g. Prettify in VS Code) and/or a git commit hook.

## `src/types`

This also contains simple bits of logic associated with the types described.

The logic contained in `Annotations.ts`, `Bundle.ts`, and `Record.ts` may be
unit tested.

The file names also start with an upper case letter, in contrast with the rest
of the codebase.

## `helpers.ts`

Simple functional logic that may be easily unit tested.

## `src/store`

This writes a given "new bundle" to a store. Currently writes to disk, in the
hard-coded `./out` directory, but could also write to e.g. an S3 store.

The `newBundle` function should take the writer as a parameter; this way its own
(simple) logic could be unit tested by passing a mock.

Each writer implementation can be also be unit tested in isolation. `writeOne`
shouldn't read the module-level `config` variable but instead have this data
directly embedded in itself, or passed as a parameter.

*Unknown*: test a function writing something to disk. Either use mocks for the `File`
APIs, or ensure the test is run in a clean testing environment that is setup
and teared down properly between each run.

## `src/qldb`, `src/ledger`, `src/verify`

### `qldb`

This provides a functional interface to an Amazon QLDB database. Each function
is self contained, but uses a module-level driver created from some module-level
constants.

Note: I am not familiar with QLDB. From a cursory search it doesn't like it's
easy to either
- use a mock QLDB interface for testing,
- or use a test ledger setup and teared down for each test.

One approach could be to use a ledger specifically for tests, and write the
tests accordingly (ie not assuming that the ledger is empty, and asserting its
state before and after calling the function under test).

### `ledger`

This is an adapter between the rest of the app and the functions contained in
the `qldb` module.

One could argue this is mostly piping helpers and functions from the `qldb` module,
in a relatively straightforward manner, and that testing would add little value
if these other pieces are tested.

If `qldb` cannot be tested, or if we want to add tests to that layer anyway,
an approach would be to abstract the interface provided by the `qldb` module,
and use this interface as a parameter for the `ledger` functions. The interface
is then implemented by `qldb` for the real-world operations, and some mock
functions in a test environment.

### `verify`

Test using a `ledger` interface and providing a mock implementation.

## `index.ts`

This file is the app itself. The various routes the app exposes can be tested
with e.g. `supertest`. Since it uses the `ledger` module, it should be passed
as a parameter when creating the app; from there it could either:

- be mocked altogether,
- or be created with a mock qldb driver,
- or be created with the test qldb driver (as described in the `qldb` section)

The same procedure can be applied to the `store` dependency.

Integration tests can be realized when using the real modules instead of mocks
to create the app under test.