# Fun Retro

Easy to use and beautiful retrospective board — now fully peer-to-peer.

Built with [React](https://react.dev), [TypeScript](https://www.typescriptlang.org),
[Vite](https://vite.dev) and [UHST](https://github.com/uhst/uhst-client-js)
(User Hosted Secure Transmission). There is no backend and no database:
when you create a board, **your browser hosts it** and other participants
connect to you directly through the UHST relay.

## How it works

- Creating a board makes your browser the UHST **host** for that board.
  The board id is assigned by the UHST relay when hosting starts (host
  ids encode which relay serves the host). The board state is kept in
  your browser (and persisted to localStorage, so reloading the page is
  fine — the same relay-assigned id is requested again).
- The board URL (`/#<board-id>`) is all anyone needs to join. Joining
  browsers connect as UHST peers, send their changes (new cards, votes,
  column edits, …) to the host, and the host broadcasts the updated board
  state to everyone.
- Because the board lives in the creator's browser, it is only reachable
  while that browser is online. Closing the tab takes the board offline;
  reopening the same URL in the same browser brings it back.
- Per-participant vote allowances are tracked locally in each
  participant's browser, like in the original app.

## Features

- Create boards with custom name, vote limit and private writing
- Add, edit, delete, drag-to-move and drag-to-merge cards
- Voting with a per-participant maximum, unvoting, hidden vote counts
- Add, rename and delete columns (up to 6)
- Sort by creation date or votes, filter cards
- Board context line and inline board renaming
- Copy board to clipboard, export to PDF/CSV, import from CSV

## Development

Requires [Node.js](https://nodejs.org/en/) >= 20 and
[pnpm](https://pnpm.io).

```sh
pnpm install
pnpm dev        # start the dev server
pnpm test       # run the vitest suite
pnpm typecheck  # type-check without emitting
pnpm build      # type-check and build to dist/
pnpm preview    # serve the production build locally
```

To try the peer-to-peer sync locally, open the dev server in one browser,
create a board, and open the resulting URL in a second browser (or a
private window — a second tab in the same browser would find the board in
localStorage and try to host it again).

## Project layout

```
src/
  protocol.ts       # board actions + reducer shared by host and peers
  session.ts        # UHST host/client sessions (replaces Firebase)
  storage.ts        # localStorage persistence for hosted boards
  types.ts          # board/message/column types
  components/       # React components (board, columns, cards, modals…)
  hooks/            # useBoardSession, useHash
  utils/            # votes, csv, import/export helpers
  styles/           # SCSS ported from the original app
```

## Deployment

Every push to `main`/`master` is built and published to GitHub Pages by
`.github/workflows/publish.workflow.yml` (the repository's Pages source
must be set to "GitHub Actions" under Settings → Pages).

## Contribute to Fun Retro

Take a look at our
[Contributing](https://github.com/funretro/distributed/blob/master/CONTRIBUTING.md)
guide.
