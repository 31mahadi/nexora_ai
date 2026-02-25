"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect, useRef } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content...",
  minHeight = "120px",
}: RichTextEditorProps) {
  const isInternalChange = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-indigo-600 underline" },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[80px] px-3 py-2 text-zinc-700",
      },
      handleDOMEvents: {
        blur: () => {
          if (editor && !isInternalChange.current) {
            const html = editor.getHTML();
            if (html !== value) onChange(html);
          }
        },
      },
    },
    onUpdate: ({ editor }) => {
      isInternalChange.current = true;
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
      isInternalChange.current = false;
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML() && !isInternalChange.current) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div
      className="rounded-lg border border-zinc-300 bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1"
      style={{ minHeight }}
    >
      <div className="flex border-b border-zinc-200 bg-zinc-50 px-2 py-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-2 py-1 text-sm font-medium ${
            editor.isActive("bold") ? "bg-zinc-200" : "hover:bg-zinc-100"
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded px-2 py-1 text-sm italic ${
            editor.isActive("italic") ? "bg-zinc-200" : "hover:bg-zinc-100"
          }`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive("bulletList") ? "bg-zinc-200" : "hover:bg-zinc-100"
          }`}
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive("orderedList") ? "bg-zinc-200" : "hover:bg-zinc-100"
          }`}
        >
          1.
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
