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
import { ArrowRight, ArrowLeft, Loader2, Mail, User, Building2, CalendarDays, FileText } from "lucide-react";
import { LETTER_CATEGORIES, TEMPLATES, type LetterData } from "@/lib/templates";
import { format as formatDate } from "date-fns";

const ALL_LETTER_TEMPLATES = TEMPLATES.filter((t) => t.suite === "letters");

function getTodayString(): string {
  return formatDate(new Date(), "MMMM d, yyyy");
}

function getSuggestedClosing(letterType: string): string {
  const hrTypes = ["letter_appointment", "letter_promotion", "letter_confirmation", "letter_query", "letter_warning", "letter_termination"];
  if (hrTypes.includes(letterType)) return "Yours faithfully,";
  if (letterType === "letter_cover") return "Yours sincerely,";
  return "Yours faithfully,";
}

function getSuggestedSubject(letterType: string): string {
  const tpl = ALL_LETTER_TEMPLATES.find((t) => t.id === letterType);
  return tpl ? `RE: ${tpl.label}` : "";
}

function getSuggestedSalutation(recipientName: string): string {
  if (!recipientName.trim()) return "Dear Sir/Madam,";
  const name = recipientName.trim().split(" ").pop() ?? recipientName;
  return `Dear ${name},`;
}

export default function LettersPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const createManuscript = useCreateManuscript();
  const createJob = useCreateJob();
  const updateJob = useUpdateJob();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [letterType, setLetterType] = useState("");
  const [date, setDate] = useState(getTodayString());
  const [senderName, setSenderName] = useState("");
  const [senderTitle, setSenderTitle] = useState("");
  const [senderOrg, setSenderOrg] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientTitle, setRecipientTitle] = useState("");
  const [recipientOrg, setRecipientOrg] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [subject, setSubject] = useState("");
  const [salutation, setSalutation] = useState("Dear Sir/Madam,");
  const [bodyText, setBodyText] = useState("");
  const [closing, setClosing] = useState("Yours faithfully,");
  const [signatoryName, setSignatoryName] = useState("");
  const [signatoryTitle, setSignatoryTitle] = useState("");
  const [theme, setTheme] = useState("classic");

  const handleLetterTypeChange = (value: string) => {
    setLetterType(value);
    if (!subject) setSubject(getSuggestedSubject(value));
    setClosing(getSuggestedClosing(value));
  };

  const handleRecipientNameChange = (value: string) => {
    setRecipientName(value);
    setSalutation(getSuggestedSalutation(value));
  };

  const validateForm = (): string | null => {
    if (!letterType) return "Please select a letter type.";
    if (!senderOrg.trim()) return "Sender organisation is required.";
    if (!recipientName.trim()) return "Recipient name is required.";
    if (!subject.trim()) return "Subject line is required.";
    if (!bodyText.trim()) return "Letter body cannot be empty.";
    if (!signatoryName.trim()) return "Signatory name is required.";
    return null;
  };

  const handleGenerate = async () => {
    const error = validateForm();
    if (error) {
      toast({ title: "Incomplete form", description: error, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const bodyParagraphs = bodyText
        .split(/\n{2,}/)
        .map((p) => p.replace(/\n/g, " ").trim())
        .filter(Boolean);

      const letterData: LetterData = {
        letterType,
        date,
        senderName,
        senderTitle,
        senderOrg,
        senderAddress,
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
      };

      const tpl = ALL_LETTER_TEMPLATES.find((t) => t.id === letterType);
      const manuscriptTitle = subject.replace(/^re:\s*/i, "").trim() || tpl?.label || "Professional Letter";

      const manuscript = await createManuscript.mutateAsync({
        data: { title: manuscriptTitle, originalFilename: undefined },
      });

      const job = await createJob.mutateAsync({ data: { manuscriptId: manuscript.id } });

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

      setLocation(`/preview/${job.id}`);
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to create letter", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const letterLabel = ALL_LETTER_TEMPLATES.find((t) => t.id === letterType)?.label;

  return (
    <AppLayout title="Letter Builder">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-semibold">Professional Letter Builder</h1>
            <p className="text-sm text-muted-foreground">
              Fill in the details and Etscript will format a professional letter ready to download.
            </p>
          </div>
        </div>

        {/* Letter Type */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-lg">Letter Type</CardTitle>
            <CardDescription>Select the type of letter you need to generate.</CardDescription>
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
            {letterLabel && (
              <p className="text-xs text-muted-foreground mt-2">
                {ALL_LETTER_TEMPLATES.find((t) => t.id === letterType)?.desc}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sender Details */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" /> Sender Details
            </CardTitle>
            <CardDescription>The organisation or individual sending this letter.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="senderOrg">Organisation / Company Name <span className="text-destructive">*</span></Label>
              <Input id="senderOrg" value={senderOrg} onChange={(e) => setSenderOrg(e.target.value)} placeholder="e.g. FurstoneTech Solutions Limited" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderName">Contact Name (optional)</Label>
              <Input id="senderName" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="e.g. Jane Smith" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderTitle">Title / Department (optional)</Label>
              <Input id="senderTitle" value={senderTitle} onChange={(e) => setSenderTitle(e.target.value)} placeholder="e.g. HR Director" />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="senderAddress">Address (optional)</Label>
              <Input id="senderAddress" value={senderAddress} onChange={(e) => setSenderAddress(e.target.value)} placeholder="e.g. 14 Victoria Island, Lagos, Nigeria" />
            </div>
          </CardContent>
        </Card>

        {/* Date and Recipient */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Recipient & Date
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="date">
                <CalendarDays className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />Date
              </Label>
              <Input id="date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="e.g. June 14, 2026" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name <span className="text-destructive">*</span></Label>
              <Input id="recipientName" value={recipientName} onChange={(e) => handleRecipientNameChange(e.target.value)} placeholder="e.g. Mr. John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientTitle">Recipient Title / Role</Label>
              <Input id="recipientTitle" value={recipientTitle} onChange={(e) => setRecipientTitle(e.target.value)} placeholder="e.g. Software Engineer" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientOrg">Recipient Organisation</Label>
              <Input id="recipientOrg" value={recipientOrg} onChange={(e) => setRecipientOrg(e.target.value)} placeholder="e.g. Acme Corp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientAddress">Recipient Address</Label>
              <Input id="recipientAddress" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} placeholder="e.g. Abuja, Nigeria" />
            </div>
          </CardContent>
        </Card>

        {/* Letter Content */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Letter Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line <span className="text-destructive">*</span></Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. RE: Letter of Appointment" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salutation">Salutation</Label>
              <Input id="salutation" value={salutation} onChange={(e) => setSalutation(e.target.value)} placeholder="e.g. Dear Sir/Madam," />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body <span className="text-destructive">*</span></Label>
              <Textarea
                id="body"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder={"Write each paragraph separated by a blank line.\n\nFor example, this is the first paragraph.\n\nThis is the second paragraph."}
                className="min-h-[180px] font-sans text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Separate paragraphs with a blank line (press Enter twice).
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="closing">Closing</Label>
                <Input id="closing" value={closing} onChange={(e) => setClosing(e.target.value)} placeholder="e.g. Yours faithfully," />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signatory */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-lg">Signatory</CardTitle>
            <CardDescription>The person signing the letter.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signatoryName">Full Name <span className="text-destructive">*</span></Label>
              <Input id="signatoryName" value={signatoryName} onChange={(e) => setSignatoryName(e.target.value)} placeholder="e.g. Jane Smith" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signatoryTitle">Title / Position</Label>
              <Input id="signatoryTitle" value={signatoryTitle} onChange={(e) => setSignatoryTitle(e.target.value)} placeholder="e.g. HR Director" />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="font-serif text-lg">Appearance</CardTitle>
            <CardDescription>Choose a visual style for your letter.</CardDescription>
          </CardHeader>
          <CardContent>
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
                    {t === "classic" ? "Serif, traditional" : t === "modern" ? "Sans-serif, clean" : "Elegant, premium"}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button variant="outline" onClick={() => setLocation("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button onClick={handleGenerate} disabled={isSubmitting} className="px-8 gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                Generate Letter <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
