# Existing card code backfill

## Goal

Allow a project administrator to assign generated card codes to existing cards that do not already have one, without changing cards that are already coded or issuing duplicate numbers.

## Scope

- Add an explicit bulk action to the existing Card codes section in project settings.
- Add an admin-only backend endpoint for the bulk action.
- Reuse the project's current `cardCodePattern` and `nextCardNumber` sequence.
- Skip existing cards whose summary already starts with the system's bracketed code format.
- Report how many cards were updated and the resulting next card number.

The feature does not regenerate existing codes, remove codes, introduce a separate code column, change the configured pattern, or enable card codes automatically.

## User experience

The project settings modal shows a `Generate codes for existing cards` button below the current code preview. It is available only to administrators and is disabled when card code generation is off, the pattern is empty, the pattern lacks `{NUMBER}`, or a request is already running.

Selecting the action asks for confirmation because card summaries will change. After confirmation, the frontend calls the bulk endpoint. A successful result displays one of these outcomes:

- `Generated codes for N cards` when at least one card changed.
- `All existing cards already have codes` when no card changed.

The settings modal updates its displayed `nextCardNumber` from the response and triggers its existing `onChange` callback so the board reloads. API failures use the modal's existing error area and leave the action available for retry.

## Coded-card detection

The existing generator stores a code directly in the card summary as `[CODE] Title`. For this backfill, a card is considered coded when its summary begins with a non-empty, single-line bracketed token followed by whitespace. The detection rule is equivalent to `/^\[[^\]\r\n]+\]\s/u`.

This generic bracket rule remains valid if an administrator changes the project pattern after some cards have already received codes. A pre-existing user-authored summary in the same bracketed format is conservatively treated as coded and is not modified.

## Backend API

Add `POST /projects/:id/card-codes/backfill` to `ProjectsController`. The route uses `ProjectPermissionGuard` and requires `admin` permission for the project ID in the route.

The response shape is:

```ts
interface CardCodeBackfillResult {
  updatedCount: number;
  nextCardNumber: number;
}
```

If card code generation is disabled or the stored pattern is invalid, the endpoint rejects the request with HTTP 400 and changes nothing. A project access failure continues to use the existing guard behavior.

## Transaction and data flow

`ProjectsService` performs the operation in one database transaction:

1. Lock the project row with a pessimistic write lock.
2. Validate `cardCodeEnabled`, a non-empty pattern, and the presence of `{NUMBER}`.
3. Load the project's non-deleted cards in ascending `createdAt` order with `id` as a deterministic tie-breaker.
4. Filter out summaries that already satisfy the coded-card detection rule.
5. Render one code per remaining card, starting at the locked project's `nextCardNumber`.
6. Update only the eligible cards' summaries.
7. Increment and save `nextCardNumber` by exactly the number of updated cards.
8. Commit and return `updatedCount` plus the new counter.

The same project-row lock used by new-card code allocation serializes normal creation and backfill. A failed update rolls back both summaries and the counter, preventing partial assignment or skipped numbers.

The coded-summary predicate remains a small exported pure helper. Code rendering remains in `card-code.service.ts`; allocation for new and existing cards must share the same rendering and counter rules rather than duplicate pattern logic.

## Frontend integration

Add `api.backfillCardCodes(projectId)` returning `CardCodeBackfillResult`. `ProjectSettingsModal` owns the running and result states because the operation is initiated and reported there. The existing board page already passes `onChange={loadBoard}`, so no new cross-component state mechanism is needed.

The action does not save unsaved changes to the enabled checkbox or pattern field. It operates only on settings already persisted by the existing Save button. If the local form differs from the persisted settings, the backfill button remains disabled until those settings are saved, preventing the preview from implying that unsaved values will be used.

## Error handling

- Cancelled confirmation sends no request.
- Invalid or disabled persisted settings produce a backend 400 with no data changes.
- Permission failures produce the existing 403 response.
- Transaction failures roll back every title and the counter.
- The frontend surfaces the API message in the existing settings error container.

## Testing

Backend tests cover:

- coded-summary detection, including bracketed, multiline, and uncoded summaries;
- deterministic sequential assignment to only uncoded cards;
- exact counter advancement;
- no-op results when every card is already coded;
- rejection with no writes when generation is disabled or the pattern is invalid;
- rollback-compatible transactional use and project locking;
- admin permission metadata on the controller route.

Frontend tests cover:

- the API request path and response type through the settings behavior;
- disabled action for disabled, invalid, unsaved, or busy settings;
- confirmation cancellation;
- updated-count and no-op success messages;
- counter refresh and `onChange` invocation;
- surfaced API errors and retry availability.

The full backend and frontend test suites and both production builds will be run after implementation.

## Acceptance criteria

- An administrator can explicitly generate codes for all existing uncoded cards in a project.
- Existing bracket-coded summaries remain unchanged.
- Running the action twice does not add a second code or advance the counter on the second run.
- Assigned numbers are unique and continue from `nextCardNumber`.
- Concurrent new-card creation cannot receive a number assigned by the backfill.
- The UI reports exactly how many cards changed and refreshes the board.
- A failed operation does not leave partial title or counter updates.
