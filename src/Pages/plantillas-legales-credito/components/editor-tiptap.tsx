"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link2,
  Link2Off,
  Highlighter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AdvancedDialogERP } from "@/utils/components/dialog/advanced-dialog";

interface TiptapEditorProps {
  content?: string;
  onUpdate?: (html: string) => void;
  onSave?: (html: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  isPending: boolean;
}

export function TiptapEditor({
  content = "",
  onUpdate,
  onSave,
  placeholder = "Escribe algo...",
  className,
  editable = true,
  isPending,
}: TiptapEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");

  const [openConfirm, setOpenConfirm] = useState<boolean>(false);

  const handleClose = () => setOpenConfirm(!openConfirm);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate?.(html);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3",
          "prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
          "prose-p:my-2 prose-ul:my-2 prose-ol:my-2",
          "[&_p]:min-h-[1em] [&_p:empty]:min-h-[1em] [&_p]:my-2", // ← agrega esto

          "prose-li:my-1",
        ),
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: linkUrl })
      .run();

    setLinkUrl("");
  }, [editor, linkUrl]);

  const handleSave = async () => {
    if (!editor || !onSave) return;
    await onSave(editor.getHTML());
    editor.commands.setContent("<p></p>");

    handleClose();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border rounded-lg bg-background", className)}>
      {/* Toolbar */}
      <div className="border-b bg-muted/30 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10">
        {/* Text Formatting */}
        <div className="flex gap-0.5">
          <Toggle
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            aria-label="Negrita"
          >
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Cursiva"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("underline")}
            onPressedChange={() =>
              editor.chain().focus().toggleUnderline().run()
            }
            aria-label="Subrayado"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("strike")}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            aria-label="Tachado"
          >
            <Strikethrough className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("code")}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
            aria-label="Código"
          >
            <Code className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("highlight")}
            onPressedChange={() =>
              editor.chain().focus().toggleHighlight().run()
            }
            aria-label="Resaltar"
          >
            <Highlighter className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Headings */}
        <div className="flex gap-0.5">
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 1 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            aria-label="Título 1"
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 2 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            aria-label="Título 2"
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 3 })}
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            aria-label="Título 3"
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists */}
        <div className="flex gap-0.5">
          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
            aria-label="Lista con viñetas"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
            aria-label="Lista numerada"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("blockquote")}
            onPressedChange={() =>
              editor.chain().focus().toggleBlockquote().run()
            }
            aria-label="Cita"
          >
            <Quote className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Alignment */}
        <div className="flex gap-0.5">
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "left" })}
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("left").run()
            }
            aria-label="Alinear izquierda"
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "center" })}
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("center").run()
            }
            aria-label="Alinear centro"
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "right" })}
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("right").run()
            }
            aria-label="Alinear derecha"
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "justify" })}
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("justify").run()
            }
            aria-label="Justificar"
          >
            <AlignJustify className="h-4 w-4" />
          </Toggle>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Link */}
        <Popover>
          <PopoverTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive("link")}
              aria-label="Enlace"
            >
              <Link2 className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="flex gap-2">
              <Input
                placeholder="https://ejemplo.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setLink();
                  }
                }}
              />
              <Button onClick={setLink} size="sm">
                Aplicar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <Toggle
          size="sm"
          pressed={false}
          onPressedChange={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
          aria-label="Quitar enlace"
        >
          <Link2Off className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6" />

        {/* Undo/Redo */}
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            aria-label="Deshacer"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            aria-label="Rehacer"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {onSave && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <Button onClick={handleClose} size="sm" variant="default">
              Guardar
            </Button>
          </>
        )}
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} className="min-h-[200px]" />

      <AdvancedDialogERP
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title="Confirmar nueva plantilla legal"
        description="Asegúrate de que el nombre, la versión y las variables sean correctos. Esta acción no se puede deshacer.
        "
        confirmButton={{
          label: "Registrar plantilla",
          disabled: isPending,
          loading: isPending,
          loadingText: "Guardando...",
          onClick: handleSave,
        }}
        cancelButton={{
          onClick: handleClose,
          label: "Revisar de nuevo",
          disabled: isPending,
          variant: "outline",
        }}
      />
    </div>
  );
}
