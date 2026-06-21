# Card Rich-Text Description Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the card description `<textarea>` with a minimal Tiptap rich-text editor that saves HTML and renders formatted, read-only content for viewers.

**Architecture:** A self-contained `RichTextEditor` component wraps Tiptap (`useEditor`), used in the card modal. Editable mode shows a small toolbar and emits HTML via `getHTML()`; read-only mode renders the same content with `editable: false` (no `dangerouslySetInnerHTML`). A pure `htmlToStored` helper normalizes empty content to `null`. No backend/schema change — `description` stays a string column.

**Tech Stack:** Next.js 16 / React 19 / TypeScript, Tiptap (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`), CSS modules, Jest.

## Global Constraints

- Minimal toolbar only: Bold, Italic, Bullet list, Numbered list, Link. Headings, code, code block, blockquote, strike, horizontal rule disabled.
- Never use `dangerouslySetInnerHTML`; read-only display is a Tiptap editor with `editable: false`.
- Link extension restricts protocols to `http`/`https`/`mailto`, opens in a new tab with `rel="noopener nofollow"`.
- `description` is stored as an HTML string; empty content normalizes to `null`. No schema change.
- App (board/modal) uses indigo theme tokens from `globals.css` (`--color-border`, `--color-surface`, `--color-indigo`, `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-bg`, `--radius-md`).
- Pure `.ts` Jest specs need `/// <reference types="jest" />` at the top (jest globals aren't pulled in otherwise).
- Build: `pnpm --filter frontend build`. Tests: `pnpm --filter frontend test`.

---

### Task 1: `htmlToStored` normalization helper

**Files:**
- Create: `apps/frontend/src/lib/richText.ts`
- Test: `apps/frontend/src/lib/richText.spec.ts`

**Interfaces:**
- Produces: `function htmlToStored(html: string): string | null`.

- [ ] **Step 1: Write the failing tests**

```ts
// apps/frontend/src/lib/richText.spec.ts
/// <reference types="jest" />
import { htmlToStored } from './richText';

describe('htmlToStored', () => {
  it.each([
    ['', 'empty string'],
    ['<p></p>', 'empty paragraph'],
    ['<p><br></p>', 'paragraph with break'],
    ['<p>   </p>', 'whitespace paragraph'],
    ['<p>&nbsp;</p>', 'nbsp paragraph'],
  ])('returns null for %s (%s)', (html) => {
    expect(htmlToStored(html)).toBeNull();
  });

  it('returns the html unchanged for real text', () => {
    expect(htmlToStored('<p>Hello</p>')).toBe('<p>Hello</p>');
  });

  it('returns the html unchanged for a list', () => {
    expect(htmlToStored('<ul><li>a</li></ul>')).toBe('<ul><li>a</li></ul>');
  });

  it('keeps content that has surrounding markup but real text', () => {
    expect(htmlToStored('<p><strong>Hi</strong></p>')).toBe('<p><strong>Hi</strong></p>');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm --filter frontend test -- richText`
Expected: FAIL — cannot find module `./richText`.

- [ ] **Step 3: Write the implementation**

```ts
// apps/frontend/src/lib/richText.ts
/**
 * Normalize Tiptap HTML output for storage. Returns null when the document has no
 * visible text content (e.g. '', '<p></p>', '<p><br></p>', '<p>&nbsp;</p>'),
 * otherwise returns the HTML unchanged.
 */
export function htmlToStored(html: string): string | null {
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length === 0 ? null : html;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm --filter frontend test -- richText`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/lib/richText.ts apps/frontend/src/lib/richText.spec.ts
git commit -m "feat(frontend): add htmlToStored helper for rich-text descriptions"
```

---

### Task 2: Install Tiptap and build the `RichTextEditor` component

**Files:**
- Modify: `apps/frontend/package.json` (via `pnpm add`)
- Create: `apps/frontend/src/components/ui/RichTextEditor.tsx`
- Create: `apps/frontend/src/components/ui/RichTextEditor.module.css`

**Interfaces:**
- Produces: `RichTextEditor` component with props
  `{ value: string; onChange?: (html: string) => void; editable?: boolean; placeholder?: string }`.

- [ ] **Step 1: Install dependencies**

Run (from repo root):

```bash
pnpm --filter frontend add @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder
```

Expected: the four packages are added to `apps/frontend/package.json` `dependencies` with consistent matching versions.

- [ ] **Step 2: Create the component**

```tsx
// apps/frontend/src/components/ui/RichTextEditor.tsx
'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import styles from './RichTextEditor.module.css';

interface RichTextEditorProps {
  value: string;
  onChange?: (html: string) => void;
  editable?: boolean;
  placeholder?: string;
}

function Toolbar({ editor }: { editor: Editor }) {
  const cls = (active: boolean) => `${styles.toolBtn} ${active ? styles.active : ''}`;

  const setLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt('Link URL');
    if (!url) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className={styles.toolbar}>
      <button type="button" className={cls(editor.isActive('bold'))} aria-label="Bold" title="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}><strong>B</strong></button>
      <button type="button" className={cls(editor.isActive('italic'))} aria-label="Italic" title="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></button>
      <button type="button" className={cls(editor.isActive('bulletList'))} aria-label="Bullet list" title="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
      <button type="button" className={cls(editor.isActive('orderedList'))} aria-label="Numbered list" title="Numbered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
      <button type="button" className={cls(editor.isActive('link'))} aria-label="Link" title="Link"
        onClick={setLink}>Link</button>
    </div>
  );
}

export function RichTextEditor({ value, onChange, editable = true, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable,
    content: value,
    extensions: [
      StarterKit.configure({
        heading: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
        // Some Tiptap versions bundle Link in StarterKit; disable it so our
        // protocol-restricted Link below is the only one registered.
        link: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https', 'mailto'],
        HTMLAttributes: { rel: 'noopener nofollow', target: '_blank' },
      }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    editorProps: { attributes: { class: styles.content } },
    onUpdate: ({ editor: e }) => onChange?.(e.getHTML()),
  }, [placeholder]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  // Reflect external value changes (e.g. opening a different card) without
  // clobbering in-progress typing.
  useEffect(() => {
    if (!editor) return;
    if (!editor.isFocused && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className={editable ? styles.wrapper : styles.readonly}>
      {editable && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
```

- [ ] **Step 3: Create the styles**

```css
/* apps/frontend/src/components/ui/RichTextEditor.module.css */
.wrapper {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  overflow: hidden;
}

.wrapper:focus-within { border-color: var(--color-indigo); }

.toolbar {
  display: flex;
  gap: 4px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg);
}

.toolBtn {
  min-width: 30px;
  height: 28px;
  padding: 0 8px;
  font-size: 13px;
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
}
.toolBtn:hover { background: var(--color-surface); color: var(--color-text-primary); }
.toolBtn.active { background: var(--color-indigo); color: #fff; }

.content {
  min-height: 120px;
  padding: 10px 12px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-primary);
  outline: none;
}

.readonly .content {
  min-height: 0;
  padding: 0;
}

.content p { margin: 0 0 8px; }
.content p:last-child { margin-bottom: 0; }
.content ul, .content ol { margin: 0 0 8px; padding-left: 20px; }
.content li { margin: 2px 0; }
.content a { color: var(--color-indigo); text-decoration: underline; }
.content strong { font-weight: 700; }
.content em { font-style: italic; }

/* Placeholder (Tiptap adds is-editor-empty to the first empty node) */
.content p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--color-text-muted);
  float: left;
  height: 0;
  pointer-events: none;
}
```

- [ ] **Step 4: Verify it typechecks and builds**

Run: `pnpm --filter frontend build`
Expected: build succeeds with no TypeScript errors (component compiles; not yet used).

If the build reports that `StarterKit.configure` does not accept a `link` option (older Tiptap that does not bundle Link), remove the `link: false,` line — the separate `Link` extension is still registered and configured. Re-run the build.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/package.json apps/frontend/src/components/ui/RichTextEditor.tsx apps/frontend/src/components/ui/RichTextEditor.module.css
git commit -m "feat(frontend): add Tiptap RichTextEditor component"
```

(Note: the workspace `pnpm-lock.yaml` will also change from the install; include it in the commit if it is tracked: `git add pnpm-lock.yaml`.)

---

### Task 3: Use the editor in the card modal

**Files:**
- Modify: `apps/frontend/src/components/board/CardModal.tsx`

**Interfaces:**
- Consumes: `RichTextEditor` (Task 2), `htmlToStored` (Task 1).

- [ ] **Step 1: Add imports**

In `apps/frontend/src/components/board/CardModal.tsx`, add to the imports near the top (after the existing `Button` import):

```tsx
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { htmlToStored } from '@/lib/richText';
```

- [ ] **Step 2: Replace the description textarea**

In `apps/frontend/src/components/board/CardModal.tsx`, replace this block:

```tsx
        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            className={styles.textarea}
            value={description ?? ''}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details…"
            readOnly={isViewer}
          />
        </div>
```

with:

```tsx
        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <RichTextEditor
            value={description ?? ''}
            onChange={setDescription}
            editable={!isViewer}
            placeholder="Add more details…"
          />
        </div>
```

- [ ] **Step 3: Normalize description on save**

In `apps/frontend/src/components/board/CardModal.tsx`, inside `handleSave`, change:

```tsx
      description: description || null,
```

to:

```tsx
      description: htmlToStored(description),
```

- [ ] **Step 4: Verify build and full frontend test suite**

Run: `pnpm --filter frontend build`
Expected: build succeeds with no TypeScript errors.

Run: `pnpm --filter frontend test`
Expected: PASS — existing tests plus the `richText` suite.

- [ ] **Step 5: Commit**

```bash
git add apps/frontend/src/components/board/CardModal.tsx
git commit -m "feat(frontend): use rich-text editor for card description"
```

---

## Manual verification (after all tasks)

1. Run `pnpm dev:backend` and `pnpm dev:frontend`; open a card as a non-viewer.
2. The description shows a toolbar (Bold, Italic, • List, 1. List, Link); each formats the selection and reflects active state; the placeholder shows when empty.
3. Add a link via the prompt → renders as a link, opens in a new tab; entering `javascript:alert(1)` does not produce a clickable script link.
4. Save, reopen the card → formatting persists.
5. Open the same card as a viewer → formatted content shows, no toolbar, read-only.
6. Clear all content and Save → description stored as null (reopen shows empty placeholder), not blank HTML.
7. Open a card whose description predates this change (plain text) → shows as a paragraph and is editable.
