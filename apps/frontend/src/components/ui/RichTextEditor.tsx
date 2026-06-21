'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Link2 } from 'lucide-react';
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
        onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></button>
      <button type="button" className={cls(editor.isActive('italic'))} aria-label="Italic" title="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></button>
      <button type="button" className={cls(editor.isActive('bulletList'))} aria-label="Bullet list" title="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></button>
      <button type="button" className={cls(editor.isActive('orderedList'))} aria-label="Numbered list" title="Numbered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></button>
      <button type="button" className={cls(editor.isActive('link'))} aria-label="Link" title="Link"
        onClick={setLink}><Link2 size={16} /></button>
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

  if (!editable) {
    return (
      <div className={styles.readonly}>
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <Toolbar editor={editor} />
      <div className={styles.editorScroll}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
