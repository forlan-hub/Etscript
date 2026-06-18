import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { useCreateManuscript, useCreateJob, useUpdateJob } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  FileText,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { LETTER_CATEGORIES, TEMPLATES, type LetterData } from "@/lib/templates";
import { format as formatDate } from "date-fns";

const ALL_LETTER_TEMPLATES = TEMPLATES.filter((t) => t.suite === "letters");

const TYPE_REF_CODES: Record<string, string> = {
  letter_resignation: "RES",
  letter_cover: "COV",
  letter_appointment: "APT",
  letter_promotion: "PRO",
  letter_confirmation: "CNF",
  letter_query: "QRY",
  letter_warning: "WRN",
  letter_termination: "TRM",
  letter_recommendation: "REC",
  letter_reference: "REF",
  letter_acceptance: "ACC",
  letter_formal_business: "BUS",
  letter_request: "REQ",
  letter_complaint: "CMP",
  letter_partnership_proposal: "PPL",
  letter_introduction: "INT",
};

const TYPE_SUBJECTS: Record<string, string> = {
  letter_resignation: "RE: LETTER OF RESIGNATION",
  letter_cover: "RE: JOB APPLICATION",
  letter_appointment: "RE: LETTER OF APPOINTMENT",
  letter_promotion: "RE: LETTER OF PROMOTION",
  letter_confirmation: "RE: LETTER OF CONFIRMATION",
  letter_query: "RE: QUERY",
  letter_warning: "RE: LETTER OF WARNING",
  letter_termination: "RE: LETTER OF TERMINATION",
  letter_recommendation: "RE: LETTER OF RECOMMENDATION",
  letter_reference: "RE: REFERENCE LETTER",
  letter_acceptance: "RE: LETTER OF ACCEPTANCE",
  letter_formal_business: "RE: FORMAL BUSINESS CORRESPONDENCE",
  letter_request: "RE: REQUEST",
  letter_complaint: "RE: COMPLAINT",
  letter_partnership_proposal: "RE: PARTNERSHIP PROPOSAL",
  letter_introduction: "RE: INTRODUCTION",
};

function getTodayString(): string {
  return formatDate(new Date(), "MMMM d, yyyy");
}

function generateRefNumber(letterType: string): string {
  const code = TYPE_REF_CODES[letterType] ?? "LTR";
  const now = new Date();
  const year = now.getFullYear();
  const seq =
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  return `ETL/${code}/${year}/${seq}`;
}

function getSalutation(recipientName: string): string {
  if (!recipientName.trim()) return "Dear Sir/Madam,";
  const parts = recipientName.trim().split(/\s+/);
  const surname = parts[parts.length - 1] ?? recipientName;
  return `Dear ${surname},`;
}

function getClosing(letterType: string): string {
  const formal = [
    "letter_appointment", "letter_promotion", "letter_confirmation",
    "letter_query", "letter_warning", "letter_termination", "letter_formal_business",
  ];
  if (formal.includes(letterType)) return "Yours faithfully,";
  if (letterType === "letter_cover") return "Yours sincerely,";
  return "Yours faithfully,";
}

function parseRawLetter(raw: string): string[] {
  return raw
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter((p) => p.length > 0);
}

const WHAT_WE_ADD = [
  "Reference number (corporate format)",
  "Date positioned top-right",
  "Proper paragraph spacing",
  "Signature block with name & title",
  "Corporate-standard layout",
];

export default function LettersPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createManuscript = useCreateManuscript();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptional, setShowOptional] = useState(false);

  // Core inputs
  const [letterType, setLetterType] = useState("");
  const [rawText, setRawText] = useState("");

  // About you (signatory)
  const [signatoryName, setSignatoryName] = useState("");
  const [signatoryTitle, setSignatoryTitle] = useState("");
  const [senderOrg, setSenderOrg] = useState("");

  // Recipient
  const [recipientName, setRecipientName] = useState("");
  const [recipientTitle, setRecipientTitle] = useState("");
  const [recipientOrg, setRecipientOrg] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  // Formatting details (auto-generated, user-editable)
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(getTodayString());
  const [closing, setClosing] = useState("Yours faithfully,");
  const [theme, setTheme] = useState("classic");

  const handleLetterTypeChange = (value: string) => {
    setLetterType(value);
    setReference(generateRefNumber(value));
    setClosing(getClosing(value));
  };

  const validateForm = (): string | null => {
    if (!letterType) return "Please select the letter type.";
    if (!rawText.trim()) return "Please paste or write your letter content.";
    if (!signatoryName.trim()) return "Your full name is required.";
    if (!recipientName.trim()) return "Recipient name is required.";
    return null;
  };

  const handleFormat = async () => {
    const error = validateForm();
    if (error) {
      toast({ title: "Incomplete", description: error, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const bodyParagraphs = parseRawLetter(rawText);
      const tpl = ALL_LETTER_TEMPLATES.find((t) => t.id === letterType);
      const subject = TYPE_SUBJECTS[letterType] ?? `RE: ${tpl?.label ?? "LETTER"}`;
      const salutation = getSalutation(recipientName);
      const manuscriptTitle =
        subject.replace(/^re:\s*/i, "").trim() || tpl?.label || "Professional Letter";

      const letterData: LetterData = {
        letterType,
        date,
        senderName: signatoryName,
        senderTitle: signatoryTitle,
        senderOrg,
        senderAddress: "",
        recipientName,
        recipientTitle,
        recipientOrg,
        recipientAddress,
        subject,
        salutation,
        bodyParagraphs,
        closing,
        signatoryName,
        signatoryTitle,
        reference: reference.trim() || undefined,
      };

      const manuscript = await createManuscript.mutateAsync({
        data: { title: manuscriptTitle, originalFilename: undefined },
      });

      const job = await createJob.mutateAsync({
        data: { manuscriptId: manuscript.id },
      });

      await updateJob.mutateAsync({
        id: job.id,
        data: {
          bookType: letterType,
          publishingTarget: "a4_print",
          theme,
          fontFamily: tpl?.defaultFont ?? "Times New Roman",
          lineSpacing: "1.5",
          letterData: JSON.stringify(letterData),
        },
      });

      setLocation(`/review/${job.id}`);
    } catch {
      toast({
        title: "Something went wrong",
        description: "Could not format the letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title="Letter Formatter">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-serif font-semibold">Professional Letter Formatter</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Write your letter naturally. Etscript applies corporate-standard structure and formatting.
          </p>
        </div>

        {/* What we add */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">What Etscript adds for you</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {WHAT_WE_ADD.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Letter Type */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base">Letter Type</CardTitle>
            <CardDescription>Determines the reference code, subject line, and closing.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={letterType} onValueChange={handleLetterTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select letter type…" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LETTER_CATEGORIES).map(([category, ids]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {category}
                    </div>
                    {ids.map((id) => {
                      const tpl = ALL_LETTER_TEMPLATES.find((t) => t.id === id);
                      return tpl ? (
                        <SelectItem key={id} value={id}>
                          {tpl.label}
                        </SelectItem>
                      ) : null;
                    })}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Raw Letter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Your Letter
            </CardTitle>
            <CardDescription>
              Paste or type your letter. Don't worry about layout — write naturally.
              Separate paragraphs with a blank line.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={
                "I am writing to formally tender my resignation from my position as Senior Software Engineer, effective 30 days from today's date.\n\nI want to thank you and the team for the opportunity to contribute to the company's growth over the past three years.\n\nPlease let me know how I can assist with the handover process during my notice period."
              }
              className="min-h-[240px] font-sans text-sm leading-relaxed resize-y"
            />
            {rawText.trim() && (
              <p className="text-xs text-muted-foreground mt-1.5">
                {parseRawLetter(rawText).length} paragraph{parseRawLetter(rawText).length !== 1 ? "s" : ""} detected
              </p>
            )}
          </CardContent>
        </Card>

        {/* About You */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base">About You</CardTitle>
            <CardDescription>Used for the sender block and signature.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="signatoryName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="signatoryName"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                placeholder="e.g. Amaka Okafor"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signatoryTitle">Job Title / Position</Label>
              <Input
                id="signatoryTitle"
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senderOrg">Organisation / Department</Label>
              <Input
                id="senderOrg"
                value={senderOrg}
                onChange={(e) => setSenderOrg(e.target.value)}
                placeholder="e.g. FurstoneTech Solutions"
              />
            </div>
          </CardContent>
        </Card>

        {/* Recipient */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base">Recipient</CardTitle>
            <CardDescription>Who is receiving this letter?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="recipientName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="recipientName"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Mr. John Adeyemi"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="recipientTitle">Title / Role</Label>
                <Input
                  id="recipientTitle"
                  value={recipientTitle}
                  onChange={(e) => setRecipientTitle(e.target.value)}
                  placeholder="e.g. Head of HR"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowOptional((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showOptional ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              {showOptional ? "Hide" : "Add"} organisation & address (optional)
            </button>

            {showOptional && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="recipientOrg">Organisation</Label>
                  <Input
                    id="recipientOrg"
                    value={recipientOrg}
                    onChange={(e) => setRecipientOrg(e.target.value)}
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="recipientAddress">Address</Label>
                  <Input
                    id="recipientAddress"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="e.g. Victoria Island, Lagos"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formatting Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base">Formatting Details</CardTitle>
            <CardDescription>Auto-generated based on your letter type. Adjust if needed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. ETL/RES/2026/0617"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  placeholder="e.g. June 17, 2026"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="closing">Closing</Label>
                <Input
                  id="closing"
                  value={closing}
                  onChange={(e) => setClosing(e.target.value)}
                  placeholder="e.g. Yours faithfully,"
                />
              </div>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <Label>Style</Label>
              <div className="grid grid-cols-3 gap-3">
                {(["classic", "modern", "premium"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`rounded-lg border-2 p-3 text-left transition-all ${
                      theme === t
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="font-medium text-sm capitalize">{t}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {t === "classic"
                        ? "Serif, traditional"
                        : t === "modern"
                          ? "Sans-serif, clean"
                          : "Elegant, premium"}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center pt-2 pb-8">
          <Button variant="outline" onClick={() => setLocation("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button onClick={handleFormat} disabled={isSubmitting} className="px-8 gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Formatting…
              </>
            ) : (
              <>
                Format Letter <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
