# Card Rich-Text Description — Design

Date: 2026-06-21
Status: Approved (pending spec review)

## Goal

Replace the plain `<textarea>` for a card's description with a lightweight rich-text
editor (Tiptap) so users can write and read formatted descriptions. The same component
renders the formatted content read-only for viewers. Scope is the card modal only.

## Decisions

- **Editor:** Tiptap (`@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link`).
- **Minimal toolbar:** Bold, Italic, Bullet list, Numbered list, Link. Headings, code,
  code block, and blockquote are disabled.
- **No `dangerouslySetInnerHTML`.** Read-only display uses a Tiptap instance with
  `editable: false`, so only known nodes/marks render — unknown/script content is dropped
  on parse. The Link extension restricts protocols to `http`/`https`/`mailto`.
- **Storage:** `description` stays a string column holding HTML. No schema change. Empty
  content (`<p></p>` / whitespace) normalizes to `null`.
- **Back-compat:** existing plain-text descriptions load into Tiptap as a paragraph.
- **Card face unchanged:** the board card still shows summary + badges; no description
  preview is added.
- **No image/file upload** (no upload backend).

## Architecture

```
CardModal
   description: string (HTML)
   └── <RichTextEditor
          value={description}
          onChange={setDescription}   // editable mode only
          editable={!isViewer}
          placeholder="Add more details…" />
                │
                ├── editable=true  → toolbar + ProseMirror editor; emits getHTML()
                └── editable=false → formatted content only (no toolbar, no border)

Save: htmlToStored(description) → string | null → existing onSave/updateCard flow
```

`RichTextEditor` is self-contained: give it `value`/`editable`, it renders; give it
`onChange`, it reports HTML. `htmlToStored` is a pure helper, testable without ProseMirror.

## Components

### `htmlToStored(html: string): string | null` (`apps/frontend/src/lib/richText.ts`)

Normalizes editor output for storage. Returns `null` when the HTML represents an empty
document; otherwise returns the HTML unchanged.
- Treat as empty when the text content (tags stripped, `&nbsp;`/whitespace collapsed) is
  empty — covers `''`, `<p></p>`, `<p><br></p>`, `<p>   </p>`.
- Implementation: strip tags to text, replace `&nbsp;` and ` ` with space, trim; if
  the result is empty return `null`, else return the original `html`.

### `RichTextEditor` (`apps/frontend/src/components/ui/RichTextEditor.tsx` + `.module.css`)

Props:
```ts
interface RichTextEditorProps {
  value: string;
  onChange?: (html: string) => void;
  editable?: boolean;   // default true
  placeholder?: string;
}
```

Behaviour:
- `useEditor` with:
  - `StarterKit` configured to disable `heading`, `code`, `codeBlock`, `blockquote`,
    `horizontalRule`, `strike` (keep paragraph, bold, italic, bulletList, orderedList,
    listItem, history). Keep defaults for the rest needed by lists.
  - `Link.configure({ openOnClick: false, autolink: true, protocols: ['http','https','mailto'], HTMLAttributes: { rel: 'noopener nofollow', target: '_blank' } })`.
  - `editable: props.editable ?? true`.
  - `content: value`.
  - `onUpdate: ({ editor }) => onChange?.(editor.getHTML())` (only meaningful when editable).
  - `immediatelyRender: false` (Next.js SSR safety).
- Keep the editor's `editable` in sync via `editor.setEditable(editable)` in an effect.
- When the incoming `value` differs from `editor.getHTML()` and the editor is **not**
  focused/editable (e.g. opening a different card read-only), call
  `editor.commands.setContent(value)` — avoids clobbering in-progress typing.
- Toolbar (rendered only when `editable`): buttons for Bold, Italic, Bullet list,
  Numbered list, Link. Each toggles via editor commands (`toggleBold`, `toggleItalic`,
  `toggleBulletList`, `toggleOrderedList`) and shows active state with `editor.isActive(...)`.
  Link button: if a selection has a link, unset it; otherwise `window.prompt` for a URL and
  `setLink({ href })` (ignored if the prompt is empty/cancelled).
- Read-only mode: render `<EditorContent>` only (no toolbar), styled with no border so it
  reads as formatted text.
- Styling via CSS module using the app's indigo theme tokens (`--color-border`,
  `--color-surface`, `--color-indigo`, `--radius-md`, etc.) to match the existing modal
  inputs. Basic prose styles for `ul/ol/li/a/strong/em` inside the content area.

### Card modal wiring (`apps/frontend/src/components/board/CardModal.tsx`)

- Replace the description `<textarea>` (lines ~64-73) with:
  `<RichTextEditor value={description ?? ''} onChange={setDescription} editable={!isViewer} placeholder="Add more details…" />`.
- In `handleSave`, change `description: description || null` to
  `description: htmlToStored(description)`.

## Data flow

Open card → `description` (HTML or legacy plain text) seeds the editor → user formats →
`onUpdate` pushes `getHTML()` into `description` state → Save normalizes via
`htmlToStored` and calls the existing `onSave`/`api.updateCard`. Viewers get
`editable={false}`: formatted, read-only, no toolbar.

## Error handling

- Pure client state; no new network paths.
- Empty/whitespace docs save as `null` (no blank HTML stored).
- Links with disallowed protocols (e.g. `javascript:`) are dropped by the Link extension.

## Testing

- Unit tests for `htmlToStored` (`apps/frontend/src/lib/richText.spec.ts`): `''`,
  `<p></p>`, `<p><br></p>`, `<p>   </p>`, `<p>&nbsp;</p>` → `null`; real content
  (`<p>Hello</p>`, `<ul><li>a</li></ul>`) → returned unchanged. (Add
  `/// <reference types="jest" />` since it is a pure `.ts` spec — see the project note.)
- `RichTextEditor`/toolbar interactions rely on ProseMirror + DOM and are brittle under
  jsdom, so they are verified manually (see below), plus `pnpm --filter frontend build`.

## Manual verification

1. Open a card as a non-viewer: toolbar shows Bold/Italic/Bullet/Numbered/Link; typing and
   each button format text; Save persists; reopening shows the formatting.
2. Add a link via the prompt; it renders and opens in a new tab; a `javascript:` URL is
   rejected.
3. Open the same card as a viewer: formatted content shows, no toolbar, read-only.
4. Clear all content and Save: description stored as empty (null), not blank HTML.
5. Open a card with a legacy plain-text description: it shows as a paragraph and is editable.

## Out of scope

- Image/file upload or insert-by-URL.
- Headings, code blocks, blockquotes, tables, mentions, markdown toggle, attachments.
- A formatted description preview on the board card face.
- Server-side HTML sanitization (not needed: we never use `dangerouslySetInnerHTML`).
