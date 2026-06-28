import { useCallback, useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { WorkflowStepper } from "@/components/workflow-stepper";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { useRoute, useLocation } from "wouter";
import {
  useGetJob,
  useGetJobEditorContent,
  useUpdateJob,
  useProcessJob,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bold,
  Italic,
  Type,
  Undo2,
  Redo2,
  Save,
  Loader2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  ChevronDown,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function extractChapterTitles(html: string): string[] {
  return (html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) ?? []).map((h) =>
    h.replace(/<[^>]+>/g, ""),
  );
}

const SECTION_TYPES = [
  { label: "Disclaimer", keyword: "DISCLAIMER" },
  { label: "Copyright", keyword: "COPYRIGHT" },
  { label: "Dedication", keyword: "DEDICATION" },
  { label: "Reader's Notice", keyword: "READER NOTICE" },
  { label: "Foreword", keyword: "FOREWORD" },
  { label: "Preface", keyword: "PREFACE" },
  { label: "Introduction", keyword: "INTRODUCTION" },
  { label: "Conclusion", keyword: "CONCLUSION" },
  { label: "Epilogue", keyword: "EPILOGUE" },
  { label: "Appendix", keyword: "APPENDIX" },
  { label: "About the Author", keyword: "ABOUT THE AUTHOR" },
] as const;

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      disabled={disabled}
      className={cn(
        "h-7 w-7 flex items-center justify-center rounded text-sm transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
        disabled && "opacity-40 cursor-not-allowed",
      )}
    >
      {children}
    </button>
  );
}

export default function ReviewPage() {
  const [, params] = useRoute("/review/:jobId");
  const jobId = params?.jobId ? parseInt(params.jobId, 10) : 0;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [chapters, setChapters] = useState<string[]>([]);
  const [contentLoaded, setContentLoaded] = useState(false);
  const skipNextSave = useRef(false);

  const { data: job } = useGetJob(jobId, { query: { enabled: !!jobId } as any });
  const { data: editorContent, isLoading: isContentLoading } = useGetJobEditorContent(jobId, {
    query: { enabled: !!jobId } as any,
  });
  const updateJob = useUpdateJob();
  const processJob = useProcessJob();

  const saveContent = useCallback(
    async (html: string) => {
      setSaveStatus("saving");
      try {
        await updateJob.mutateAsync({ id: jobId, data: { editedContent: html } });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      }
    },
    [jobId, updateJob],
  );

  const debouncedSave = useCallback(debounce(saveContent, 1500), [saveContent]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing your manuscript…" }),
      CharacterCount,
    ],
    content: "",
    onUpdate: ({ editor: ed }) => {
      if (skipNextSave.current) {
        skipNextSave.current = false;
        return;
      }
      const html = ed.getHTML();
      setChapters(extractChapterTitles(html));
      debouncedSave(html);
      setSaveStatus("saving");
    },
  });

  useEffect(() => {
    if (editor && editorContent?.html && !contentLoaded) {
      skipNextSave.current = true;
      editor.commands.setContent(editorContent.html);
      setChapters(extractChapterTitles(editorContent.html));
      setContentLoaded(true);
    }
  }, [editor, editorContent, contentLoaded]);

  const scrollToChapter = (title: string) => {
    const editorEl = document.querySelector(".tiptap");
    if (!editorEl) return;
    for (const h of Array.from(editorEl.querySelectorAll("h2"))) {
      if (h.textContent?.trim() === title) {
        h.scrollIntoView({ behavior: "smooth", block: "start" });
        break;
      }
    }
  };

  const applySectionType = (keyword: string) => {
    if (!editor) return;
    editor.commands.command(({ tr, state }) => {
      const { $from } = state.selection;
      const depth = $from.depth > 0 ? $from.depth : 1;
      const start = $from.start(depth);
      const end = $from.end(depth);
      const headingNode = state.schema.nodes.heading.create(
        { level: 2 },
        state.schema.text(keyword),
      );
      tr.replaceRangeWith(start - 1, end + 1, headingNode);
      return true;
    });
    editor.commands.focus();
  };

  const handleRegenerate = async () => {
    if (!editor) return;
    const html = editor.getHTML();
    await updateJob.mutateAsync({ id: jobId, data: { editedContent: html } });
    await processJob.mutateAsync({ id: jobId });
    toast({
      title: "Book files regenerated",
      description: "Your edits have been applied to the formatted PDF and DOCX.",
    });
  };

  const wordCount = editor
    ? (editor.storage.characterCount as { words: () => number }).words()
    : (editorContent?.wordCount ?? 0);

  const isGenerating = processJob.isPending || updateJob.isPending;

  return (
    <AppLayout title="Review & Edit">
      <div className="max-w-6xl mx-auto">
        <WorkflowStepper currentStep={4} jobId={jobId} />

        <div className="flex gap-6">
          <aside className="hidden lg:flex flex-col w-48 shrink-0">
            <div className="sticky top-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Chapters
              </p>
              <ScrollArea className="h-[calc(100vh-240px)]">
                <div className="space-y-0.5 pr-2">
                  {chapters.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic px-2">
                      No chapter headings found
                    </p>
                  ) : (
                    chapters.map((ch, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => scrollToChapter(ch)}
                        className="w-full text-left text-xs py-1.5 px-2 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors truncate block"
                      >
                        {ch}
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 px-3 py-2 border border-border rounded-t-lg bg-secondary/40 flex-wrap">
              <ToolbarButton
                title="Book Title (H1)"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                active={editor?.isActive("heading", { level: 1 })}
              >
                <span className="text-[11px] font-bold">H1</span>
              </ToolbarButton>
              <ToolbarButton
                title="Chapter Heading (H2)"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                active={editor?.isActive("heading", { level: 2 })}
              >
                <span className="text-[11px] font-bold">H2</span>
              </ToolbarButton>
              <ToolbarButton
                title="Body Text"
                onClick={() => editor?.chain().focus().setParagraph().run()}
                active={editor?.isActive("paragraph")}
              >
                <Type className="w-3.5 h-3.5" />
              </ToolbarButton>
              <Separator orientation="vertical" className="h-5 mx-0.5" />
              <ToolbarButton
                title="Bold"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                active={editor?.isActive("bold")}
              >
                <Bold className="w-3.5 h-3.5" />
              </ToolbarButton>
              <ToolbarButton
                title="Italic"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                active={editor?.isActive("italic")}
              >
                <Italic className="w-3.5 h-3.5" />
              </ToolbarButton>
              <Separator orientation="vertical" className="h-5 mx-0.5" />
              <ToolbarButton
                title="Undo"
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
              >
                <Undo2 className="w-3.5 h-3.5" />
              </ToolbarButton>
              <ToolbarButton
                title="Redo"
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
              >
                <Redo2 className="w-3.5 h-3.5" />
              </ToolbarButton>
              <Separator orientation="vertical" className="h-5 mx-0.5" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 h-7 px-2 rounded text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  >
                    <Tag className="w-3 h-3" />
                    Section
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    Convert block to section type
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {SECTION_TYPES.map((s) => (
                    <DropdownMenuItem
                      key={s.keyword}
                      onSelect={() => applySectionType(s.keyword)}
                      className="text-xs"
                    >
                      {s.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                {saveStatus === "saving" && (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving…
                  </span>
                )}
                {saveStatus === "saved" && (
                  <span className="flex items-center gap-1 text-green-600">
                    <Save className="w-3 h-3" /> Saved
                  </span>
                )}
                {saveStatus === "error" && (
                  <span className="text-destructive">Save failed</span>
                )}
              </div>
            </div>

            <div
              className="border-x border-b border-border rounded-b-lg bg-background overflow-y-auto"
              style={{ minHeight: 480, maxHeight: "calc(100vh - 300px)" }}
            >
              {isContentLoading ? (
                <div className="flex items-center justify-center h-60 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading manuscript…
                </div>
              ) : (
                <EditorContent
                  editor={editor}
                  className="etscript-editor p-6 focus:outline-none"
                />
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation(`/customize/${jobId}`)}
                  className="gap-1.5 text-muted-foreground"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </Button>
                <span className="text-sm text-muted-foreground">
                  {wordCount.toLocaleString()} words
                </span>
                <Badge variant="outline" className="text-xs">
                  {chapters.length} chapter{chapters.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  disabled={isGenerating || !contentLoaded}
                  className="gap-1.5"
                >
                  {isGenerating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  Apply & Generate Files
                </Button>
                <Button
                  onClick={() => setLocation(`/preview/${jobId}`)}
                  className="gap-1.5"
                >
                  Continue to Preview <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
