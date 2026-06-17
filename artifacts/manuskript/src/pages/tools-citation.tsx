import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Quote, Plus, ClipboardCopy, Trash2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

type CitStyle = "apa7" | "mla9" | "harvard" | "chicago17" | "ieee";
type RefType = "book" | "journal" | "website" | "thesis" | "conference" | "report";

const STYLES: { id: CitStyle; label: string; full: string }[] = [
  { id: "apa7", label: "APA 7th", full: "American Psychological Association, 7th Edition" },
  { id: "mla9", label: "MLA 9th", full: "Modern Language Association, 9th Edition" },
  { id: "harvard", label: "Harvard", full: "Harvard Author-Date" },
  { id: "chicago17", label: "Chicago 17th", full: "Chicago Manual of Style, 17th Edition (Author-Date)" },
  { id: "ieee", label: "IEEE", full: "Institute of Electrical and Electronics Engineers" },
];

const REF_TYPES: { id: RefType; label: string }[] = [
  { id: "book", label: "Book" },
  { id: "journal", label: "Journal Article" },
  { id: "website", label: "Website / Web Page" },
  { id: "thesis", label: "Thesis / Dissertation" },
  { id: "conference", label: "Conference Paper" },
  { id: "report", label: "Report / Working Paper" },
];

interface Author { last: string; first: string }

function parseAuthors(str: string): Author[] {
  if (!str.trim()) return [];
  return str.split(";").map((s) => {
    const [last = "", first = ""] = s.split(",").map((p) => p.trim());
    return { last, first };
  }).filter((a) => a.last);
}

function initials(first: string): string {
  if (!first) return "";
  return first.trim().split(/\s+/).map((p) => {
    if (/^[A-Z]\.$/.test(p)) return p;
    return p.charAt(0).toUpperCase() + ".";
  }).join(" ");
}

function apaAuthorList(authors: Author[]): string {
  if (!authors.length) return "";
  const fmt = (a: Author) => a.first ? `${a.last}, ${initials(a.first)}` : a.last;
  if (authors.length === 1) return fmt(authors[0]);
  if (authors.length <= 20) {
    const all = authors.map(fmt);
    return all.slice(0, -1).join(", ") + ", & " + all[all.length - 1];
  }
  return authors.slice(0, 19).map(fmt).join(", ") + ", . . . " + fmt(authors[authors.length - 1]);
}

function mlaAuthorList(authors: Author[]): string {
  if (!authors.length) return "";
  const first = authors[0];
  const firstFmt = first.first ? `${first.last}, ${first.first}` : first.last;
  if (authors.length === 1) return firstFmt;
  if (authors.length === 2) {
    const second = authors[1];
    const secondFmt = second.first ? `${second.first} ${second.last}` : second.last;
    return `${firstFmt}, and ${secondFmt}`;
  }
  return `${firstFmt}, et al.`;
}

function harvardAuthorList(authors: Author[]): string {
  if (!authors.length) return "";
  const fmt = (a: Author) => a.first ? `${a.last}, ${initials(a.first)}` : a.last;
  if (authors.length === 1) return fmt(authors[0]);
  if (authors.length <= 3) {
    const all = authors.map(fmt);
    return all.slice(0, -1).join(", ") + " and " + all[all.length - 1];
  }
  return fmt(authors[0]) + " et al.";
}

function chicagoAuthorList(authors: Author[]): string {
  if (!authors.length) return "";
  const first = authors[0];
  const firstFmt = first.first ? `${first.last}, ${first.first}` : first.last;
  if (authors.length === 1) return firstFmt;
  if (authors.length <= 3) {
    const rest = authors.slice(1).map((a) => a.first ? `${a.first} ${a.last}` : a.last);
    return firstFmt + ", " + (rest.length === 1 ? "and " : "") + rest.join(", and ");
  }
  return firstFmt + ", et al.";
}

function ieeeAuthorList(authors: Author[]): string {
  if (!authors.length) return "";
  const fmt = (a: Author) => a.first ? `${initials(a.first)} ${a.last}` : a.last;
  if (authors.length === 1) return fmt(authors[0]);
  if (authors.length <= 6) {
    const all = authors.map(fmt);
    return all.slice(0, -1).join(", ") + ", and " + all[all.length - 1];
  }
  return fmt(authors[0]) + " et al.";
}

interface Fields {
  authors: string; year: string; title: string;
  publisher: string; publisherCity: string; edition: string;
  journal: string; volume: string; issue: string;
  startPage: string; endPage: string; doi: string;
  websiteName: string; url: string; accessDate: string; publishDate: string;
  thesisType: string; institution: string; repository: string;
  conferenceName: string; confLocation: string; confPages: string;
  reportNum: string; organization: string;
}

const EMPTY: Fields = {
  authors: "", year: "", title: "",
  publisher: "", publisherCity: "", edition: "",
  journal: "", volume: "", issue: "",
  startPage: "", endPage: "", doi: "",
  websiteName: "", url: "", accessDate: "", publishDate: "",
  thesisType: "Doctoral dissertation", institution: "", repository: "",
  conferenceName: "", confLocation: "", confPages: "",
  reportNum: "", organization: "",
};

function pages(s: string, e: string) {
  if (s && e) return `${s}–${e}`;
  if (s) return s;
  return "";
}

function doi(d: string) {
  if (!d) return "";
  const clean = d.replace(/^https?:\/\/doi\.org\//i, "");
  return `https://doi.org/${clean}`;
}

function formatCitation(f: Fields, style: CitStyle, type: RefType, refNum: number): string {
  const authors = parseAuthors(f.authors);
  const pg = pages(f.startPage, f.endPage);
  const doiStr = doi(f.doi);

  if (type === "book") {
    switch (style) {
      case "apa7": {
        const ed = f.edition ? ` (${f.edition})` : "";
        const pub = f.publisher ? `. ${f.publisher}.` : ".";
        const d = doiStr ? ` ${doiStr}` : "";
        return `${apaAuthorList(authors)} (${f.year || "n.d."}). *${f.title}*${ed}${pub}${d}`;
      }
      case "mla9": {
        const ed = f.edition ? `, ${f.edition}` : "";
        return `${mlaAuthorList(authors)}. *${f.title}*${ed}. ${f.publisher || ""}${f.publisher ? ", " : ""}${f.year || "n.d."}.`;
      }
      case "harvard": {
        const city = f.publisherCity ? `${f.publisherCity}: ` : "";
        const ed = f.edition ? ` ${f.edition}.` : "";
        return `${harvardAuthorList(authors)} (${f.year || "n.d."}) *${f.title}*.${ed} ${city}${f.publisher || ""}.`;
      }
      case "chicago17": {
        const city = f.publisherCity ? `${f.publisherCity}: ` : "";
        const ed = f.edition ? `, ${f.edition}` : "";
        return `${chicagoAuthorList(authors)}. ${f.year || "n.d."}. *${f.title}*${ed}. ${city}${f.publisher || ""}.`;
      }
      case "ieee": {
        const ed = f.edition ? `, ${f.edition} ed.` : "";
        const city = f.publisherCity ? `${f.publisherCity}: ` : "";
        return `[${refNum}] ${ieeeAuthorList(authors)}, *${f.title}*${ed} ${city}${f.publisher || ""}, ${f.year || "n.d."}.`;
      }
    }
  }

  if (type === "journal") {
    switch (style) {
      case "apa7": {
        const vol = f.volume ? `, *${f.volume}*` : "";
        const iss = f.issue ? `(${f.issue})` : "";
        const p = pg ? `, ${pg}` : "";
        const d = doiStr ? ` ${doiStr}` : "";
        return `${apaAuthorList(authors)} (${f.year || "n.d."}). ${f.title}. *${f.journal || "Journal"}*${vol}${iss}${p}.${d}`;
      }
      case "mla9": {
        const vol = f.volume ? `, vol. ${f.volume}` : "";
        const iss = f.issue ? `, no. ${f.issue}` : "";
        const p = pg ? `, pp. ${pg}` : "";
        return `${mlaAuthorList(authors)}. "${f.title}." *${f.journal || "Journal"}*${vol}${iss}, ${f.year || "n.d."}${p}.`;
      }
      case "harvard": {
        const vol = f.volume ? `, vol. ${f.volume}` : "";
        const iss = f.issue ? `, no. ${f.issue}` : "";
        const p = pg ? `, pp. ${pg}` : "";
        return `${harvardAuthorList(authors)} (${f.year || "n.d."}) '${f.title}', *${f.journal || "Journal"}*${vol}${iss}${p}.`;
      }
      case "chicago17": {
        const vol = f.volume ? ` ${f.volume}` : "";
        const iss = f.issue ? `, no. ${f.issue}` : "";
        const p = pg ? `: ${pg}` : "";
        return `${chicagoAuthorList(authors)}. ${f.year || "n.d."}. "${f.title}." *${f.journal || "Journal"}*${vol}${iss}${p}.`;
      }
      case "ieee": {
        const vol = f.volume ? `, vol. ${f.volume}` : "";
        const iss = f.issue ? `, no. ${f.issue}` : "";
        const p = pg ? `, pp. ${pg}` : "";
        const d = doiStr ? `, doi: ${f.doi}` : "";
        return `[${refNum}] ${ieeeAuthorList(authors)}, "${f.title}," *${f.journal || "Journal"}*${vol}${iss}${p}, ${f.year || "n.d."}${d}.`;
      }
    }
  }

  if (type === "website") {
    switch (style) {
      case "apa7": {
        const site = f.websiteName ? ` *${f.websiteName}*.` : "";
        const acc = f.accessDate ? ` Retrieved ${f.accessDate}, from` : "";
        return `${apaAuthorList(authors)} (${f.year || "n.d."}${f.publishDate ? ", " + f.publishDate : ""}). *${f.title}*.${site}${acc} ${f.url || ""}`;
      }
      case "mla9": {
        const site = f.websiteName ? ` *${f.websiteName}*,` : "";
        const date = f.publishDate && f.year ? ` ${f.publishDate} ${f.year},` : "";
        return `${mlaAuthorList(authors)}. "${f.title}."${site}${date} ${f.url || ""}.`;
      }
      case "harvard": {
        const acc = f.accessDate ? ` [Accessed: ${f.accessDate}]` : "";
        return `${harvardAuthorList(authors)} (${f.year || "n.d."}) *${f.title}* [Online]. Available at: ${f.url || ""}${acc}.`;
      }
      case "chicago17": {
        const date = f.publishDate ? ` ${f.publishDate}` : "";
        return `${chicagoAuthorList(authors)}. ${f.year || "n.d."}. "${f.title}."${f.websiteName ? ` *${f.websiteName}*.` : ""}${date}. ${f.url || ""}`;
      }
      case "ieee": {
        const acc = f.accessDate ? ` [Accessed: ${f.accessDate}]` : "";
        return `[${refNum}] ${ieeeAuthorList(authors)}, "${f.title}," *${f.websiteName || "Website"}*. [Online]. Available: ${f.url || ""}${acc}.`;
      }
    }
  }

  if (type === "thesis") {
    const tType = f.thesisType || "Doctoral dissertation";
    switch (style) {
      case "apa7": {
        const repo = f.repository ? ` ${f.repository}.` : "";
        return `${apaAuthorList(authors)} (${f.year || "n.d."}). *${f.title}* [${tType}, ${f.institution || "Institution"}].${repo}`;
      }
      case "mla9":
        return `${mlaAuthorList(authors)}. "${f.title}." ${tType}, ${f.institution || "Institution"}, ${f.year || "n.d."}.`;
      case "harvard":
        return `${harvardAuthorList(authors)} (${f.year || "n.d."}) *${f.title}*. ${tType}. ${f.institution || "Institution"}.`;
      case "chicago17":
        return `${chicagoAuthorList(authors)}. ${f.year || "n.d."}. "${f.title}." ${tType}, ${f.institution || "Institution"}.`;
      case "ieee":
        return `[${refNum}] ${ieeeAuthorList(authors)}, "${f.title}," ${tType}, ${f.institution || "Institution"}, ${f.year || "n.d."}.`;
    }
  }

  if (type === "conference") {
    const conf = f.conferenceName || "Conference";
    const loc = f.confLocation ? `, ${f.confLocation}` : "";
    const p = f.confPages ? `, pp. ${f.confPages}` : "";
    switch (style) {
      case "apa7":
        return `${apaAuthorList(authors)} (${f.year || "n.d."}). ${f.title}. *${conf}*${loc}${p}.`;
      case "mla9":
        return `${mlaAuthorList(authors)}. "${f.title}." *${conf}*, ${f.year || "n.d."}${p}.`;
      case "harvard":
        return `${harvardAuthorList(authors)} (${f.year || "n.d."}) '${f.title}', *${conf}*${loc}${p}.`;
      case "chicago17":
        return `${chicagoAuthorList(authors)}. ${f.year || "n.d."}. "${f.title}." *${conf}*${loc}${p}.`;
      case "ieee":
        return `[${refNum}] ${ieeeAuthorList(authors)}, "${f.title}," in *${conf}*${loc}, ${f.year || "n.d."}${p}.`;
    }
  }

  if (type === "report") {
    const org = f.organization || "Organisation";
    const num = f.reportNum ? ` (Report No. ${f.reportNum})` : "";
    switch (style) {
      case "apa7":
        return `${apaAuthorList(authors)} (${f.year || "n.d."}). *${f.title}*${num}. ${org}.`;
      case "mla9":
        return `${mlaAuthorList(authors)}. *${f.title}*. ${org}, ${f.year || "n.d."}.`;
      case "harvard":
        return `${harvardAuthorList(authors)} (${f.year || "n.d."}) *${f.title}*. ${org}${num}.`;
      case "chicago17":
        return `${chicagoAuthorList(authors)}. ${f.year || "n.d."}. *${f.title}*. ${org}.`;
      case "ieee":
        return `[${refNum}] ${ieeeAuthorList(authors)}, "${f.title}," ${org}${num}, ${f.year || "n.d."}.`;
    }
  }

  return "";
}

function renderCitation(text: string) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, i) =>
    part.startsWith("*") && part.endsWith("*")
      ? <em key={i}>{part.slice(1, -1)}</em>
      : <span key={i}>{part}</span>
  );
}

function plainText(text: string) {
  return text.replace(/\*/g, "");
}

const FIELD_SETS: Record<RefType, Array<{ key: keyof Fields; label: string; hint?: string; type?: string }[]>> = {
  book: [
    [{ key: "authors", label: "Authors *", hint: 'Last, First; Last, First — e.g. "Okafor, Emeka; Smith, Jane"' }],
    [{ key: "year", label: "Year *", type: "number" }, { key: "title", label: "Title *" }],
    [{ key: "edition", label: "Edition", hint: 'e.g. "3rd ed."' }, { key: "publisher", label: "Publisher" }],
    [{ key: "publisherCity", label: "Publisher City" }, { key: "doi", label: "DOI", hint: "if available" }],
  ],
  journal: [
    [{ key: "authors", label: "Authors *", hint: 'Last, First; Last, First' }],
    [{ key: "year", label: "Year *", type: "number" }, { key: "title", label: "Article Title *" }],
    [{ key: "journal", label: "Journal Name *" }],
    [{ key: "volume", label: "Volume" }, { key: "issue", label: "Issue" }, { key: "startPage", label: "From Page" }, { key: "endPage", label: "To Page" }],
    [{ key: "doi", label: "DOI" }],
  ],
  website: [
    [{ key: "authors", label: "Authors", hint: 'Last, First (if available)' }],
    [{ key: "year", label: "Year" }, { key: "publishDate", label: "Publish Date", hint: 'e.g. "January 15"' }],
    [{ key: "title", label: "Page Title *" }],
    [{ key: "websiteName", label: "Website / Source Name" }],
    [{ key: "url", label: "URL *" }, { key: "accessDate", label: "Date Accessed", hint: 'e.g. "June 17, 2026"' }],
  ],
  thesis: [
    [{ key: "authors", label: "Author *", hint: 'Last, First' }],
    [{ key: "year", label: "Year *", type: "number" }, { key: "title", label: "Thesis Title *" }],
    [{ key: "thesisType", label: "Type", hint: '"Doctoral dissertation" or "Master\'s thesis"' }],
    [{ key: "institution", label: "Institution *" }, { key: "repository", label: "Repository / Database" }],
  ],
  conference: [
    [{ key: "authors", label: "Authors *", hint: 'Last, First; Last, First' }],
    [{ key: "year", label: "Year *", type: "number" }, { key: "title", label: "Paper Title *" }],
    [{ key: "conferenceName", label: "Conference Name *" }],
    [{ key: "confLocation", label: "Location" }, { key: "confPages", label: "Pages", hint: 'e.g. "12–18"' }],
  ],
  report: [
    [{ key: "authors", label: "Authors *", hint: 'Last, First; Last, First' }],
    [{ key: "year", label: "Year *", type: "number" }, { key: "title", label: "Report Title *" }],
    [{ key: "organization", label: "Organisation *" }, { key: "reportNum", label: "Report Number" }],
  ],
};

export default function CitationBuilderPage() {
  const [style, setStyle] = useState<CitStyle>("apa7");
  const [refType, setRefType] = useState<RefType>("book");
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [citations, setCitations] = useState<string[]>([]);
  const { toast } = useToast();

  const setF = (k: keyof Fields) => (v: string) => setFields((f) => ({ ...f, [k]: v }));
  const onInput = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF(k)(e.target.value);

  const currentCitation = formatCitation(fields, style, refType, citations.length + 1);
  const canAdd = !!fields.title || !!fields.url;

  const handleAdd = () => {
    if (!canAdd) return;
    setCitations((prev) => [...prev, currentCitation]);
    setFields(EMPTY);
    toast({ title: "Reference added to list" });
  };

  const handleCopySingle = async (text: string) => {
    const html = `<p>${text.replace(/\*([^*]+)\*/g, "<em>$1</em>")}</p>`;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([plainText(text)], { type: "text/plain" }) }),
      ]);
    } catch {
      await navigator.clipboard.writeText(plainText(text));
    }
    toast({ title: "Copied to clipboard" });
  };

  const handleCopyAll = async () => {
    const isIeee = style === "ieee";
    const html = citations.map((c) => `<p>${c.replace(/\*([^*]+)\*/g, "<em>$1</em>")}</p>`).join("\n");
    const text = isIeee
      ? citations.map(plainText).join("\n")
      : citations.map(plainText).sort().join("\n");
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": new Blob([html], { type: "text/html" }), "text/plain": new Blob([text], { type: "text/plain" }) }),
      ]);
    } catch {
      await navigator.clipboard.writeText(text);
    }
    toast({ title: `${citations.length} reference${citations.length > 1 ? "s" : ""} copied` });
  };

  const fieldRows = FIELD_SETS[refType];

  return (
    <AppLayout title="Citation Builder">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <Link href="/tools">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" /> Tools
            </Button>
          </Link>
        </div>

        <div className="flex items-start gap-3">
          <Quote className="w-7 h-7 text-primary mt-0.5 shrink-0" />
          <div>
            <h1 className="text-2xl font-serif font-medium">Citation Builder</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Build formatted references in APA 7th, MLA 9th, Harvard, Chicago 17th, or IEEE.
            </p>
          </div>
        </div>

        {/* Style + Type selector */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Citation Style</Label>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    style === s.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {STYLES.find((s) => s.id === style)?.full}
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Reference Type</Label>
            <Select value={refType} onValueChange={(v) => { setRefType(v as RefType); setFields(EMPTY); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REF_TYPES.map((t) => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Reference Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fieldRows.map((row, ri) => (
                <div key={ri} className={`grid gap-3 ${row.length > 1 ? `grid-cols-${Math.min(row.length, 2)}` : ""}`}>
                  {row.map((f) => (
                    <div key={f.key} className="space-y-1">
                      <Label className="text-sm">
                        {f.label}
                        {f.hint && <span className="font-normal text-muted-foreground ml-1 text-xs">— {f.hint}</span>}
                      </Label>
                      {f.key === "thesisType" ? (
                        <Select value={fields.thesisType} onValueChange={setF("thesisType")}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Doctoral dissertation">Doctoral dissertation</SelectItem>
                            <SelectItem value="Master's thesis">Master's thesis</SelectItem>
                            <SelectItem value="Undergraduate thesis">Undergraduate thesis</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : f.key === "authors" ? (
                        <Textarea
                          rows={2}
                          placeholder={f.hint ?? ""}
                          value={fields[f.key]}
                          onChange={onInput(f.key)}
                          className="text-sm"
                        />
                      ) : (
                        <Input
                          type={f.type ?? "text"}
                          placeholder={f.hint ?? ""}
                          value={fields[f.key]}
                          onChange={onInput(f.key)}
                          className="text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* Live preview */}
              {currentCitation && (
                <div className="rounded-md bg-secondary/40 border border-border p-3 mt-4">
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">Preview</p>
                  <p className="text-sm leading-relaxed">{renderCitation(currentCitation)}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 gap-2"
                  disabled={!canAdd}
                  onClick={handleAdd}
                >
                  <Plus className="w-4 h-4" /> Add to Reference List
                </Button>
                {currentCitation && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopySingle(currentCitation)}
                    title="Copy this citation"
                  >
                    <ClipboardCopy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reference list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Reference List {citations.length > 0 && <Badge variant="secondary" className="ml-1">{citations.length}</Badge>}
              </h2>
              {citations.length > 0 && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopyAll}>
                  <ClipboardCopy className="w-3.5 h-3.5" />
                  Copy All
                </Button>
              )}
            </div>

            {citations.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border h-48 flex flex-col items-center justify-center text-center p-8 gap-3">
                <Quote className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Add references to build your list. They'll appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {citations.map((c, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-4 group">
                    <p className="text-sm leading-relaxed pr-8">{renderCitation(c)}</p>
                    <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopySingle(c)}
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        <ClipboardCopy className="w-3 h-3" /> Copy
                      </button>
                      <button
                        onClick={() => setCitations((prev) => prev.filter((_, j) => j !== i))}
                        className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-2 rounded-lg bg-secondary/30 border border-border p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      {style !== "ieee"
                        ? "References will be sorted alphabetically when you copy all."
                        : "IEEE references are numbered in order of appearance."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
