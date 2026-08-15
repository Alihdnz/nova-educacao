"use client";

import {
  Bold,
  Eye,
  Heading2,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  PencilLine,
  Quote,
} from "lucide-react";
import { useRef, useState } from "react";

import { LessonContentRenderer } from "@/components/content/lesson-content-renderer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LessonEditorProps = {
  error?: string[];
  onChange: (content: string) => void;
  value: string;
};

type Tool = {
  icon: typeof Bold;
  label: string;
  prefix: string;
  suffix?: string;
  placeholder: string;
};

const tools: Tool[] = [
  { icon: Heading2, label: "Subtítulo", prefix: "## ", placeholder: "Subtítulo" },
  { icon: Bold, label: "Negrito", prefix: "**", suffix: "**", placeholder: "texto" },
  { icon: Italic, label: "Itálico", prefix: "_", suffix: "_", placeholder: "texto" },
  { icon: List, label: "Lista", prefix: "- ", placeholder: "item" },
  { icon: ListOrdered, label: "Lista numerada", prefix: "1. ", placeholder: "item" },
  { icon: Quote, label: "Citação", prefix: "> ", placeholder: "citação" },
  {
    icon: Link2,
    label: "Link",
    prefix: "[",
    suffix: "](https://exemplo.com)",
    placeholder: "texto do link",
  },
  {
    icon: ImageIcon,
    label: "Imagem no conteúdo",
    prefix: "![",
    suffix: "](https://exemplo.com/imagem.jpg)",
    placeholder: "descrição da imagem",
  },
  { icon: Minus, label: "Separador", prefix: "\n---\n", placeholder: "" },
];

export function LessonEditor({ error, onChange, value }: LessonEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyTool(tool: Tool) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || tool.placeholder;
    const suffix = tool.suffix ?? "";
    const nextValue = `${value.slice(0, start)}${tool.prefix}${selected}${suffix}${value.slice(end)}`;
    const selectionStart = start + tool.prefix.length;
    const selectionEnd = selectionStart + selected.length;

    onChange(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  }

  return (
    <div className={cn("overflow-hidden rounded-md border", error?.length && "border-destructive")}>
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-2 py-1.5">
        <div className="flex flex-wrap gap-0.5" aria-label="Formatação do conteúdo" role="toolbar">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                aria-label={tool.label}
                className={buttonVariants({ size: "icon", variant: "ghost" })}
                key={tool.label}
                onClick={() => applyTool(tool)}
                title={tool.label}
                type="button"
              >
                <Icon aria-hidden="true" />
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-2 rounded-md border bg-background p-0.5" role="tablist">
          <button
            aria-selected={mode === "edit"}
            className={cn(
              "flex h-8 items-center justify-center gap-1.5 rounded px-2.5 text-xs font-medium",
              mode === "edit" ? "bg-foreground text-background" : "text-muted-foreground",
            )}
            onClick={() => setMode("edit")}
            role="tab"
            type="button"
          >
            <PencilLine aria-hidden="true" className="size-3.5" />
            Editar
          </button>
          <button
            aria-selected={mode === "preview"}
            className={cn(
              "flex h-8 items-center justify-center gap-1.5 rounded px-2.5 text-xs font-medium",
              mode === "preview" ? "bg-foreground text-background" : "text-muted-foreground",
            )}
            onClick={() => setMode("preview")}
            role="tab"
            type="button"
          >
            <Eye aria-hidden="true" className="size-3.5" />
            Preview
          </button>
        </div>
      </div>

      <textarea
        aria-invalid={error?.length ? true : undefined}
        className={cn(
          "min-h-[28rem] w-full resize-y bg-background px-4 py-3 font-mono text-sm leading-6 outline-none",
          mode !== "edit" && "hidden",
        )}
        id="content"
        maxLength={300000}
        name="content"
        onChange={(event) => onChange(event.target.value)}
        ref={textareaRef}
        required
        value={value}
      />

      {mode === "preview" ? (
        <div className="min-h-[28rem] bg-background px-5 py-4 sm:px-7">
          {value.trim() ? (
            <LessonContentRenderer content={value} />
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">Preview sem conteúdo.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

