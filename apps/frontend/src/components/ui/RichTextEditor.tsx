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
        // StarterKit bundles Link; disable it so our protocol-restricted Link is the only one.
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
