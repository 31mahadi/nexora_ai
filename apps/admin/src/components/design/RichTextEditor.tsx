"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import ImageExtension from "@tiptap/extension-image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link2,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo2,
  Redo2,
  Heading2,
  Heading3,
  Type,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ImagePlus,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  resizable?: boolean;
  showCharCount?: boolean;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded transition-colors ${
        active ? "bg-zinc-200 text-zinc-900" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {children}
    </button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content...",
  minHeight = "120px",
  maxHeight = "400px",
  resizable = true,
  showCharCount = true,
}: RichTextEditorProps) {
  const isInternalChange = useRef(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-indigo-600 underline" },
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ImageExtension.configure({ inline: false, allowBase64: true }),
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

  const setLink = useCallback(() => {
    if (!editor) return;
    if (editor.isActive("link")) {
      if (linkUrl) {
        editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
      } else {
        editor.chain().focus().unsetLink().run();
      }
    } else {
      const url = linkUrl || (typeof window !== "undefined" ? window.prompt("Enter URL:") : null);
      if (url) {
        editor.chain().focus().setLink({ href: url.startsWith("http") ? url : `https://${url}` }).run();
      }
    }
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const openLinkInput = useCallback(() => {
    if (!editor) return;
    const attrs = editor.getAttributes("link");
    setLinkUrl(attrs.href || "");
    setShowLinkInput(true);
    setTimeout(() => linkInputRef.current?.focus(), 0);
  }, [editor]);

  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkInput]);

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setLink();
    }
    if (e.key === "Escape") {
      setShowLinkInput(false);
      setLinkUrl("");
      editor?.commands.focus();
    }
  };

  const text = editor?.getText() ?? "";
  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (!editor) return null;

  return (
    <div
      className="flex flex-col rounded-lg border border-zinc-300 bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-1"
      style={{ minHeight }}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 px-2 py-1">
        <div className="flex items-center border-r border-zinc-200 pr-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            title="Inline code"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center border-r border-zinc-200 px-1">
          {showLinkInput ? (
            <div className="flex items-center gap-1">
              <input
                ref={linkInputRef}
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={handleLinkKeyDown}
                placeholder="https://..."
                className="h-7 w-48 rounded border border-zinc-300 px-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={setLink}
                className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl("");
                  editor.commands.focus();
                }}
                className="rounded px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
              >
                Cancel
              </button>
            </div>
          ) : (
            <ToolbarButton
              onClick={openLinkInput}
              active={editor.isActive("link")}
              title="Add link (Ctrl+K)"
            >
              <Link2 className="h-4 w-4" />
            </ToolbarButton>
          )}
        </div>

        <div className="flex items-center border-r border-zinc-200 px-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            title="Bullet list"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            title="Numbered list"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center border-r border-zinc-200 px-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            title="Code block"
          >
            <Type className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal rule"
          >
            <Minus className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center border-r border-zinc-200 px-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Align left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Align center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Align right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center border-r border-zinc-200 px-1">
          <ToolbarButton
            onClick={() => {
              const url = typeof window !== "undefined" ? window.prompt("Image URL:") : null;
              if (url) editor.chain().focus().setImage({ src: url }).run();
            }}
            title="Insert image"
          >
            <ImagePlus className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center px-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-4 w-4" />
          </ToolbarButton>
        </div>
      </div>

      {/* Editor */}
      <div
        className={`overflow-y-auto ${resizable ? "resize-y" : ""}`}
        style={{ maxHeight: resizable ? maxHeight : undefined }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Footer: character count */}
      {showCharCount && (
        <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-500">
          <span>
            {charCount} {charCount === 1 ? "character" : "characters"} · {wordCount}{" "}
            {wordCount === 1 ? "word" : "words"}
          </span>
          <span className="text-zinc-400">Ctrl+B bold | Ctrl+I italic | Ctrl+K link</span>
        </div>
      )}
    </div>
  );
}
