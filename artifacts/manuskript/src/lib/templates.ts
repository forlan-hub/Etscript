export type DocumentSuite = "publishing" | "academic" | "business" | "letters";

export type DocumentTemplate = {
  id: string;
  label: string;
  suite: DocumentSuite;
  desc: string;
  defaultTarget: string;
  defaultTheme: string;
  defaultFont: string;
  defaultLineSpacing: string;
  isPremium: boolean;
};

export type SuiteDefinition = {
  id: DocumentSuite;
  label: string;
  desc: string;
  isPremium: boolean;
};

export const SUITES: SuiteDefinition[] = [
  {
    id: "publishing",
    label: "Publishing",
    desc: "Novels, memoirs, biographies, eBooks and more",
    isPremium: false,
  },
  {
    id: "academic",
    label: "Academic",
    desc: "Theses, dissertations, research papers, journal articles",
    isPremium: true,
  },
  {
    id: "business",
    label: "Business & Corporate",
    desc: "Business plans, proposals, reports, company profiles",
    isPremium: false,
  },
  {
    id: "letters",
    label: "Professional Letters",
    desc: "HR letters, career documents, business correspondence",
    isPremium: false,
  },
];

export const TEMPLATES: DocumentTemplate[] = [
  { id: "novel", label: "Novel", suite: "publishing", desc: "Standard fiction layout with chapter structure", defaultTarget: "amazon_kdp_paperback", defaultTheme: "classic", defaultFont: "Georgia", defaultLineSpacing: "1.5", isPremium: false },
  { id: "memoir", label: "Memoir", suite: "publishing", desc: "Personal narrative with elegant, intimate styling", defaultTarget: "amazon_kdp_paperback", defaultTheme: "premium", defaultFont: "Garamond", defaultLineSpacing: "1.5", isPremium: false },
  { id: "autobiography", label: "Autobiography", suite: "publishing", desc: "First-person life story with structured timeline", defaultTarget: "amazon_kdp_paperback", defaultTheme: "classic", defaultFont: "Georgia", defaultLineSpacing: "1.5", isPremium: false },
  { id: "biography", label: "Biography", suite: "publishing", desc: "Third-person life narrative, formal and authoritative", defaultTarget: "amazon_kdp_paperback", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: false },
  { id: "motivational_book", label: "Motivational Book", suite: "publishing", desc: "Uplifting content with bold chapter structure", defaultTarget: "amazon_kdp_paperback", defaultTheme: "modern", defaultFont: "Georgia", defaultLineSpacing: "1.5", isPremium: false },
  { id: "self_help_book", label: "Self-Help Book", suite: "publishing", desc: "Actionable advice with clear section breaks", defaultTarget: "amazon_kdp_paperback", defaultTheme: "modern", defaultFont: "Georgia", defaultLineSpacing: "1.5", isPremium: false },
  { id: "business_book", label: "Business Book", suite: "publishing", desc: "Professional insight with structured chapters", defaultTarget: "amazon_kdp_paperback", defaultTheme: "modern", defaultFont: "Arial", defaultLineSpacing: "1.5", isPremium: false },
  { id: "christian_book", label: "Christian Book", suite: "publishing", desc: "Faith-based content with reverent styling", defaultTarget: "amazon_kdp_paperback", defaultTheme: "classic", defaultFont: "Georgia", defaultLineSpacing: "1.5", isPremium: false },
  { id: "devotional", label: "Devotional", suite: "publishing", desc: "Daily reflections with compact, clean formatting", defaultTarget: "amazon_kdp_paperback", defaultTheme: "premium", defaultFont: "Garamond", defaultLineSpacing: "1.5", isPremium: false },
  { id: "children_book", label: "Children's Book", suite: "publishing", desc: "Large type, generous margins, playful layout", defaultTarget: "ebook", defaultTheme: "modern", defaultFont: "Arial", defaultLineSpacing: "2.0", isPremium: false },
  { id: "workbook", label: "Workbook", suite: "publishing", desc: "Activity-based layout with exercises and open spacing", defaultTarget: "a4_print", defaultTheme: "modern", defaultFont: "Arial", defaultLineSpacing: "1.5", isPremium: false },
  { id: "journal", label: "Journal", suite: "publishing", desc: "Reflective writing with comfortable open layout", defaultTarget: "amazon_kdp_paperback", defaultTheme: "classic", defaultFont: "Georgia", defaultLineSpacing: "2.0", isPremium: false },
  { id: "ebook", label: "eBook", suite: "publishing", desc: "Reflowable digital format optimised for screens", defaultTarget: "ebook", defaultTheme: "modern", defaultFont: "Georgia", defaultLineSpacing: "1.5", isPremium: false },
  { id: "training_manual_pub", label: "Training Manual", suite: "publishing", desc: "Instructional content with numbered sections", defaultTarget: "a4_print", defaultTheme: "modern", defaultFont: "Arial", defaultLineSpacing: "1.5", isPremium: false },

  { id: "undergraduate_project", label: "Undergraduate Project", suite: "academic", desc: "Final year project with standard academic formatting", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "2.0", isPremium: true },
  { id: "hnd_project", label: "HND Project", suite: "academic", desc: "Higher National Diploma project documentation", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "2.0", isPremium: true },
  { id: "masters_thesis", label: "Master's Thesis", suite: "academic", desc: "Graduate thesis with front matter and citations", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "2.0", isPremium: true },
  { id: "phd_thesis", label: "PhD Thesis", suite: "academic", desc: "Doctoral thesis with comprehensive structure", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "2.0", isPremium: true },
  { id: "dissertation", label: "Dissertation", suite: "academic", desc: "Extended research argument and analysis", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "2.0", isPremium: true },
  { id: "research_paper", label: "Research Paper", suite: "academic", desc: "Structured research with abstract and references", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "2.0", isPremium: true },
  { id: "journal_article", label: "Journal Article", suite: "academic", desc: "Peer-review-ready article format", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: true },
  { id: "seminar_paper", label: "Seminar Paper", suite: "academic", desc: "Academic presentation paper with structured sections", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "2.0", isPremium: true },
  { id: "conference_paper", label: "Conference Paper", suite: "academic", desc: "Conference submission with abstract and references", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: true },

  { id: "company_profile", label: "Company Profile", suite: "business", desc: "Professional company overview and credentials", defaultTarget: "a4_print", defaultTheme: "modern", defaultFont: "Arial", defaultLineSpacing: "1.5", isPremium: false },
  { id: "business_proposal", label: "Business Proposal", suite: "business", desc: "Structured proposal with executive summary", defaultTarget: "a4_print", defaultTheme: "modern", defaultFont: "Arial", defaultLineSpacing: "1.5", isPremium: false },
  { id: "business_plan", label: "Business Plan", suite: "business", desc: "Comprehensive plan with financial sections", defaultTarget: "a4_print", defaultTheme: "modern", defaultFont: "Arial", defaultLineSpacing: "1.5", isPremium: false },
  { id: "feasibility_report", label: "Feasibility Report", suite: "business", desc: "Assessment report with findings and recommendations", defaultTarget: "a4_print", defaultTheme: "modern", defaultFont: "Arial", defaultLineSpacing: "1.5", isPremium: false },
  { id: "annual_report", label: "Annual Report", suite: "business", desc: "Year-end corporate report with structured sections", defaultTarget: "a4_print", defaultTheme: "modern", defaultFont: "Arial", defaultLineSpacing: "1.5", isPremium: false },
  { id: "corporate_training_manual", label: "Training Manual", suite: "business", desc: "Instructional corporate documentation", defaultTarget: "a4_print", defaultTheme: "modern", defaultFont: "Arial", defaultLineSpacing: "1.5", isPremium: false },
  { id: "internal_report", label: "Internal Report", suite: "business", desc: "Internal communication with clear structure", defaultTarget: "a4_print", defaultTheme: "modern", defaultFont: "Arial", defaultLineSpacing: "1.5", isPremium: false },
  { id: "consultancy_report", label: "Consultancy Report", suite: "business", desc: "Professional advisory report with recommendations", defaultTarget: "a4_print", defaultTheme: "modern", defaultFont: "Arial", defaultLineSpacing: "1.5", isPremium: false },
  { id: "market_research_report", label: "Market Research Report", suite: "business", desc: "Research findings with data-driven structure", defaultTarget: "a4_print", defaultTheme: "modern", defaultFont: "Arial", defaultLineSpacing: "1.5", isPremium: false },
  { id: "strategic_plan", label: "Strategic Plan", suite: "business", desc: "Long-range planning document with objectives", defaultTarget: "a4_print", defaultTheme: "modern", defaultFont: "Arial", defaultLineSpacing: "1.5", isPremium: false },

  { id: "letter_appointment", label: "Appointment Letter", suite: "letters", desc: "Formal letter confirming a job appointment", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: false },
  { id: "letter_promotion", label: "Promotion Letter", suite: "letters", desc: "Letter communicating an employee promotion", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: false },
  { id: "letter_confirmation", label: "Confirmation Letter", suite: "letters", desc: "Staff confirmation after probationary period", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: false },
  { id: "letter_query", label: "Query Letter", suite: "letters", desc: "Formal query issued to an employee", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: false },
  { id: "letter_warning", label: "Warning Letter", suite: "letters", desc: "Official warning for misconduct or performance", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: false },
  { id: "letter_termination", label: "Termination Letter", suite: "letters", desc: "Letter terminating an employment relationship", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: false },
  { id: "letter_cover", label: "Cover Letter", suite: "letters", desc: "Professional application cover letter", defaultTarget: "a4_print", defaultTheme: "modern", defaultFont: "Arial", defaultLineSpacing: "1.5", isPremium: false },
  { id: "letter_recommendation", label: "Recommendation Letter", suite: "letters", desc: "Endorsement letter for a candidate or employee", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: false },
  { id: "letter_reference", label: "Reference Letter", suite: "letters", desc: "Character or professional reference letter", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: false },
  { id: "letter_acceptance", label: "Acceptance Letter", suite: "letters", desc: "Letter accepting an offer, position, or invitation", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: false },
  { id: "letter_resignation", label: "Resignation Letter", suite: "letters", desc: "Formal notice of intention to leave a position", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: false },
  { id: "letter_formal_business", label: "Formal Business Letter", suite: "letters", desc: "General formal correspondence between organisations", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: false },
  { id: "letter_request", label: "Request Letter", suite: "letters", desc: "Formal letter requesting action or information", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: false },
  { id: "letter_complaint", label: "Complaint Letter", suite: "letters", desc: "Formal letter registering a complaint", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: false },
  { id: "letter_partnership_proposal", label: "Partnership Proposal Letter", suite: "letters", desc: "Letter proposing a business partnership", defaultTarget: "a4_print", defaultTheme: "modern", defaultFont: "Arial", defaultLineSpacing: "1.5", isPremium: false },
  { id: "letter_introduction", label: "Introduction Letter", suite: "letters", desc: "Letter introducing yourself, a team, or a company", defaultTarget: "a4_print", defaultTheme: "classic", defaultFont: "Times New Roman", defaultLineSpacing: "1.5", isPremium: false },
];

export function getTemplatesBySuite(suiteId: DocumentSuite): DocumentTemplate[] {
  return TEMPLATES.filter((t) => t.suite === suiteId);
}

export function getTemplate(id: string): DocumentTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getDocumentSuite(bookType: string | null): DocumentSuite {
  if (!bookType) return "publishing";
  if (bookType.startsWith("letter_")) return "letters";
  return TEMPLATES.find((t) => t.id === bookType)?.suite ?? "publishing";
}

export const CITATION_STYLES = [
  { id: "apa7", label: "APA 7th Edition" },
  { id: "mla", label: "MLA" },
  { id: "harvard", label: "Harvard" },
  { id: "chicago", label: "Chicago" },
  { id: "ieee", label: "IEEE" },
] as const;

export type CitationStyleId = (typeof CITATION_STYLES)[number]["id"];

export const LETTER_CATEGORIES: Record<string, string[]> = {
  "HR Letters": ["letter_appointment", "letter_promotion", "letter_confirmation", "letter_query", "letter_warning", "letter_termination"],
  "Career Documents": ["letter_cover", "letter_recommendation", "letter_reference", "letter_acceptance", "letter_resignation"],
  "Business Correspondence": ["letter_formal_business", "letter_request", "letter_complaint", "letter_partnership_proposal", "letter_introduction"],
};

export type LetterData = {
  letterType: string;
  date: string;
  senderName: string;
  senderTitle: string;
  senderOrg: string;
  senderAddress: string;
  recipientName: string;
  recipientTitle: string;
  recipientOrg: string;
  recipientAddress: string;
  subject: string;
  salutation: string;
  bodyParagraphs: string[];
  closing: string;
  signatoryName: string;
  signatoryTitle: string;
};
