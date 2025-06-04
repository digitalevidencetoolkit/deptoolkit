Welcome to the documentation of the Digital Evidence Preservation Toolkit, a one-click tool to archive and annotate webpages while demonstrating chain of custody throughout. The Toolkit is a proof-of-concept software for researchers and small teams sifting through online material.

With only one click of the mouse, the material will be **archived in a framework demonstrating chain of custody** and **stored durably**. Once included in the growing database, users will be able to **go back to search through** and **annotate the material**, and to **export working copies** of said material for publication and dissemination.

A database built thusly can be handed to a prosecutor ten years down the line, and they will be able to say with mathematical certainty: **“the material in this archive is identical and contemporary to the one saved at the time, ten years ago.”**

---

### **The flow from 30,000ft:**

A **browser extension** is tasked with passing data from the user to the system.
The system receives this data through HTTP requests and **records it into the ledger.
A GUI of the library** is served by the system, and this can also add data to the ledger. **Annotations** can be added to the archive through the UI. **Working copies,** true to the originals, can be exported through the UI.

---

### 🤔 What is where?

To install and hit the ground running, see [Getting Started](./getting_started.md).

**The browser extension** is currently written in **plain JS** (as well as some HTML/CSS). The JS assets are bundled and moved in place by Webpack, which also provides auto-reloading of the extension in-browser.

**The app and API** are currently written in (mostly) **Node & TypeScript**. It presently exposes REST endpoints (such as `/list-docs`, `/form`, etc.) and handles the interfacing with QLDB.

An **example UI** is included and built in **Svelte**, an amazing frontend framework. It demonstrates how some of the above API endpoints can be implemented and some of the capabilities of the tool.

All the above runs with `docker-compose`, as well as standalone `npm` scripts.

---

### 🥱 So, where are we ${today}?

#### The API

Both the browser extension and the app/API are in a functioning state, though features need to be developed in sync to be considered complete.

Among other things, the browser extension is able to POST an object of the following shape to the API endpoint `/form` (ed: this name is terrible):

```tsx
{ url: string,
	title: string,
	scr: Base64DataURI,
  one_file: HTMLCodeString }
```

We're including:

- **a base64-encoded screenshot PNG** which, disappointingly, is only the visible part of the screen (see [`browser.tabs.captureVisibleTab`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/Tabs/captureVisibleTab)).
  Moving to a full-page screenshot will involve some fiddling with simulating a scroll while capturing with Screen Capture API, I'm told.
  These screenshots can be quite large (from a few hundred kbs to a couple of mbs) so on the app/API side we account for a chunked, streamed payload. All data from the browser is grouped in a `FormData()`.
- **a long string of HTML code** which contains all HTML, inlined styles and JavaScript, as well as encoded images where possible.
  This is most definitely not quite `.mhtml`, which apparently is not supported on Firefox anymore since Quantum. Go figure!

---

A main `Record` type is defined as the central data structure flowing through the application.

```tsx
type Record {

  // list of files preserved and hashed
  // type Bundle
  bundle: [
    { typ: 'screenshot' | 'one_file' | 'screenshot_thumbnail',
      hash: 'aaaaaaa'
    }, {...}
  ],

  // user-created data about the record
  // most probably after the original archive
  // type Annotations
  annotations: [
    description: 'description',
    other_key: 'other val'
  ],

  // data points about the page saved
  // type Data
  data: {
    title: 'page title',
    url: 'https://foo.bar.com'
  }

}
```

**Examples of this data flowing:**

- Upon receiving `POST /form` , the API wrangles the payload data into this shape, which can then be passed to `Ledger.insertDoc` to be added to the ledger.
  (this includes side effects such as the writing to disk of screenshots and of the one-file archive)
- The frontend consumes the result of `GET /list-docs`, which still fetches data from QLDB after passing it through two successive formatting functions:
  - `Record.fromLedger`, which takes QLDB-shaped data and builds a nice `Record` as defined above,
  - then `Record.toFrontend` , which takes a `Record` and builds a simplified shape for the frontend.

**Central to this type definition is the _Bundle:_**

```tsx
type Bundle = File.File[];

type File = {
  kind: "screenshot" | "one_file" | "screenshot_thumbnail";
  hash: "xxx";
};
```

A Bundle is a list of files, which can only be of some kinds. At the back of our mind, these are the three kinds of files we're interested in for now:

- a page screenshot,
- and its thumbnail for rendering in the UI,
- as well as a one-file download of all the HTML/CSS/JS assets

The QLDB logic can be found under the `QLDB.*` namespace.

### The UI

The webapp uses [SvelteKit](https://kit.svelte.dev), a JS framework. It implements two notables routes – the two main use stories:

- The Library: `src/routes/library.svelte`
- The Verification: `src/routes/verify.svelte`

**Library** renders a list of ledger entries, with their accompanying metadata. It supports the querying of a record's history, as well as the addition of metadata (i.e. a "description" field).

- details about how each of these features is replicated through the API

**Verification** implements the lookup process and surfacing of information made possible by the tool.

---

### Miscellaneous

#### On uniqueness

Each record in our database contains a list of files that make it up (as of Aug 10th: a screenshot, its thumbnail, and a one-file HTML archive). Each is represented by its _kind_ and its hash (sha256).

The ID of the record is the hash of the concatenated hashes of its files:

`Record.id = hash(Record.files.sort().map(File.id).join(''))`

With self-identifiable data, it is possible to associate files to their ledger entries, since the ID can be computed from the files.

#### On ledgers

"A non ledger database is table-centric. A ledger database is log-centric. **The log is the database.**" ([Ivan Moto](https://ivan.mw/2019-11-24/what-is-a-ledger-database))

"Standard databases track a sequence of transactions that add, delete, or change entries. Ledger databases add a layer of digital signatures for each transaction so anyone can audit the list and see that it was constructed correctly. More importantly, no one has gone back to adjust a previous transaction — to change history, so to speak." ([VentureBeat](https://venturebeat.com/2021/01/18/database-trends-why-you-need-a-ledger-database/))

