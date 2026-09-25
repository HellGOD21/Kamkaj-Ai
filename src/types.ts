export type ActionType =
  | 'invoice'
  | 'resume'
  | 'regional_explain'
  | 'travel_cheap'
  | 'exam_prep'
  | 'reel_creator'
  | 'whatsapp_msg';

export interface InvoiceItem {
  description: string;
  hsnSac: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  businessName: string;
  businessGstin?: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  clientName: string;
  clientGstin?: string;
  clientAddress: string;
  clientPhone?: string;
  items: InvoiceItem[];
  taxPercent: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  upiId: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  notes: string;
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  education: Array<{
    institution: string;
    degree: string;
    year: string;
    score: string;
    highlights?: string;
  }>;
  skills: {
    technical: string[];
    tools: string[];
    softSkills: string[];
    domainKnowledge?: string[];
  };
  projects: Array<{
    title: string;
    techStack: string[];
    descriptionPoints: string[];
    liveUrl?: string;
    githubUrl?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year: string;
  }>;
  experienceOrInternships?: Array<{
    role: string;
    company: string;
    duration: string;
    achievements: string[];
  }>;
  interviewQuestions?: Array<{
    question: string;
    idealAnswerTip: string;
  }>;
  atsScoreEstimate: number;
}

export interface RegionalExplainData {
  originalConcept: string;
  targetLanguage: string;
  nativeScriptTitle: string;
  nativeExplanation: string;
  hinglishPhonetic: string;
  simpleEnglishSummary: string[];
  localAnalogies: Array<{
    title: string;
    comparison: string;
  }>;
  keyVocabulary: Array<{
    englishTerm: string;
    nativeTerm: string;
    meaning: string;
  }>;
}

export interface TravelOption {
  id: string;
  mode: string;
  serviceName: string;
  estimatedFare: number;
  duration: string;
  pros: string[];
  cons: string[];
  bookingTip: string;
  bookingUrlText: string;
  badge?: string;
}

export interface TravelData {
  origin: string;
  destination: string;
  travelDate: string;
  options: TravelOption[];
  cheapestRecommendation: string;
  tatkalRulesAndTimings: string;
  indianTravelHacks: string[];
}

export interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  examTag: string;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  mnemonic?: string;
}

export interface ExamPrepData {
  topic: string;
  examTarget: string;
  summaryNotes: string[];
  questions: ExamQuestion[];
  flashcards: Flashcard[];
}

export interface ReelScene {
  timestamp: string;
  visualAction: string;
  verbalScript: string;
  onScreenText: string;
  cameraAngle: string;
  bRollTip: string;
}

export interface ReelData {
  title: string;
  niche: string;
  estimatedDuration: string;
  hook3Seconds: {
    visualCue: string;
    verbalScript: string;
    onScreenText: string;
  };
  scenes: ReelScene[];
  caption: string;
  hashtags: string[];
  trendingAudioMood: string;
  teleprompterText: string;
}

export interface WhatsAppDrafts {
  politeProfessional: { subject: string; message: string; tip: string };
  firmUrgent: { subject: string; message: string; tip: string };
  friendlyHinglish: { subject: string; message: string; tip: string };
  shortSms: { message: string; charCount: number };
}

export interface WhatsAppData {
  context: string;
  recipientType: string;
  drafts: WhatsAppDrafts;
}

export interface ActionResult {
  id: string;
  type: ActionType;
  title: string;
  subtitle: string;
  timestamp: number;
  prompt: string;
  data: any;
}
