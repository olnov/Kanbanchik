# Card deep links

## Goal

Give every card a stable URL that an authorized project member can copy from the browser and open directly. Opening the URL must display the board with that card's existing modal open.

## Scope

- Add a Next.js App Router route at `/projects/{projectId}/board/cards/{cardId}`.
- Update the browser URL when a user opens or closes an existing card.
- Restore the open card from the URL after a reload or when the URL is pasted into a new tab.
- Keep all existing project authentication and authorization rules.
- Handle a card ID that is not present on the requested project board.

This feature does not create public card access, separate card permissions, share tokens, or a standalone card page. Creating a new card remains a board-only modal and does not receive a URL until the card exists.

## Architecture

The current board page owns board loading, the selected-card state, and the card modal. Its client-side implementation will be moved into a reusable board page component that accepts an optional `cardId` route value.

Two App Router pages will render that component:

- `/projects/[id]/board` without an initial card ID.
- `/projects/[id]/board/cards/[cardId]` with the card ID from the route.

Both routes continue to load the full board through the existing protected `GET /projects/{projectId}/board` endpoint. No backend endpoint or database change is required: a card is resolved only from the already-authorized board response. This guarantees that the URL does not bypass project access checks and that a card from another project cannot be opened under the wrong project URL.

## Navigation and state

When an existing card is clicked, the board uses `router.push` to navigate to its nested card route. The selected modal card is derived from the current route card ID and the unfiltered board data, not from the visible filtered cards. Therefore a direct link still opens its card even when the user's saved filters would otherwise hide it.

Closing the modal uses `router.push` to navigate to the board route. This creates normal browser history entries: Back and Forward restore the corresponding open or closed state. Saving an existing card closes it by navigating to the board route after the update succeeds. Deleting it does the same after deletion succeeds.

The add-card modal remains local UI state. Once creation finishes, the existing behavior closes it and reloads the board.

## Invalid and inaccessible cards

Project access failures continue to use the existing board loading error. If the project loads successfully but `cardId` is absent from that project's board data, the page shows a clear "Card not found in this project" message with an action to return to the board. It must not open a similarly identified card from any other project or issue an unprotected card lookup.

## Components and responsibilities

- Shared board page component: loads board data and assignees, resolves the route card ID, owns non-route modal state, and performs navigation.
- Board and Card components: retain their existing presentation and callbacks; the page-level callback converts a card click into navigation.
- App Router page files: unwrap route parameters and pass them into the shared board page component.
- Route helper: builds board and card paths in one testable place to avoid duplicated string construction.

## Testing

Frontend tests will cover:

- stable board and card URL construction;
- clicking an existing card requests navigation to its card URL;
- a route card ID opens the matching card from the unfiltered board data;
- closing an existing card requests navigation back to the board URL;
- an unknown or cross-project card ID produces the not-found state;
- existing board interactions and card rendering continue to work.

The frontend test suite and production build will be run after implementation. Since authorization remains on the existing board endpoint and no backend behavior changes, no backend tests are required for this feature.

## Acceptance criteria

- While a card modal is open, copying the browser address yields a card-specific URL.
- An authenticated user with project access can paste that URL into a new tab and see the correct card modal over the board.
- A user without project access cannot retrieve the board or card through this URL.
- Reload, Back, and Forward keep the URL and modal state synchronized.
- Saved board filters do not prevent a linked card from opening.
- A missing card produces a recoverable not-found state.
