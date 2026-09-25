import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini Client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for safe JSON extraction
function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
}

// Action intent detector prompt
const SYSTEM_PROMPT = `You are "KaamKaj AI", the elite Indian Life & Work Action Assistant.
Your core mission: Given ANY user request in English, Hindi, Hinglish, Marathi, Tamil, etc., you DO NOT just chat or provide conversational fluff. You generate COMPLETE, REAL, STRUCTURED, ACTIONABLE DATA for the user's practical task.

You must categorize the request into one of these 7 action types:
1. "invoice" - GST / Non-GST invoices with UPI QR codes, line items, rates, taxes for Indian freelancers, shops, agencies, and businesses.
2. "resume" - ATS-friendly resumes for freshers or career changers in India (BTech, BCom, BCA, Arts, Sales, Marketing) with projects, CGPA/percentage, skills, and summary.
3. "regional_explain" - Explaining complex topics (finance, technology, science, govt schemes, law) in authentic Indian languages (Marathi, Hindi, Tamil, Telugu, Gujarati, Bengali, Hinglish) with everyday cultural analogies, vocabulary list, and phonetic guide.
4. "travel_cheap" - Finding the cheapest, smartest ways to travel across India tomorrow or upcoming dates (IRCTC Sleeper / Tatkal vs AC 3-Tier vs Sleeper Bus vs BlaBlaCar vs Red-Eye Flight) with realistic fares, Tatkal timings (10 AM / 11 AM), and booking hacks.
5. "exam_prep" - Turning study notes or syllabus into interactive practice test questions (MCQs with explanations and exam tags like UPSC, SSC CGL, NEET, JEE, College) plus revision flashcards.
6. "reel_creator" - Creating viral 30-60 second Instagram Reels & YouTube Shorts with a 3-second hook, shot-by-shot visual breakdown, teleprompter-ready spoken script, on-screen text overlays, and trending Indian hashtags.
7. "whatsapp_msg" - Writing polished WhatsApp and email messages for Indian workplace & business contexts (payment reminders, leave applications, formal client pitch, friendly follow-up) with 1-click WhatsApp web/app launch ready.

Output MUST be strict valid JSON matching the specified structure without markdown wrapping if responseSchema is applied, or clean JSON object.`;

app.post('/api/action', async (req, res) => {
  try {
    const { prompt, explicitType, language, targetContext } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Determine type if not explicitly set
    let selectedType = explicitType;
    if (!selectedType || selectedType === 'auto') {
      const lower = prompt.toLowerCase();
      if (lower.includes('invoice') || lower.includes('bill') || lower.includes('gst') || lower.includes('payment') || lower.includes('chalan') || lower.includes('₹') || lower.includes('rate') || lower.includes('client charge')) {
        selectedType = 'invoice';
      } else if (lower.includes('resume') || lower.includes('cv') || lower.includes('fresher') || lower.includes('biodata') || lower.includes('job profile')) {
        selectedType = 'resume';
      } else if (lower.includes('marathi') || lower.includes('hindi') || lower.includes('tamil') || lower.includes('telugu') || lower.includes('gujarati') || lower.includes('bengali') || lower.includes('explain') || lower.includes('meaning') || lower.includes('samjhao') || lower.includes('arth')) {
        selectedType = 'regional_explain';
      } else if (lower.includes('travel') || lower.includes('train') || lower.includes('flight') || lower.includes('bus') || lower.includes('cheapest') || lower.includes('tatkal') || lower.includes('irctc') || lower.includes('route') || lower.includes('goa') || lower.includes('mumbai') || lower.includes('delhi')) {
        selectedType = 'travel_cheap';
      } else if (lower.includes('exam') || lower.includes('quiz') || lower.includes('test') || lower.includes('mcq') || lower.includes('notes') || lower.includes('question') || lower.includes('upsc') || lower.includes('ssc')) {
        selectedType = 'exam_prep';
      } else if (lower.includes('reel') || lower.includes('video') || lower.includes('short') || lower.includes('script') || lower.includes('instagram') || lower.includes('youtube')) {
        selectedType = 'reel_creator';
      } else if (lower.includes('whatsapp') || lower.includes('message') || lower.includes('msg') || lower.includes('email') || lower.includes('draft') || lower.includes('client message') || lower.includes('leave')) {
        selectedType = 'whatsapp_msg';
      } else {
        selectedType = 'whatsapp_msg'; // default helpful communication
      }
    }

    // If Gemini API Key is available, use Gemini 3.8 Flash
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `User Prompt: "${prompt}"
Action Type Requested: "${selectedType}"
Requested Target Language (if any): "${language || 'Appropriate for India'}"
Additional Context: "${targetContext || ''}"

Return a JSON object with:
{
  "type": "${selectedType}",
  "title": "A short descriptive title for this action result",
  "subtitle": "A one-line summary of what was generated",
  "data": <Specific schema for ${selectedType}>
}

SCHEMA REQUIREMENTS PER TYPE:
If "invoice":
data must contain:
- invoiceNumber (e.g. "INV-2026-089")
- date (YYYY-MM-DD)
- dueDate (YYYY-MM-DD)
- businessName, businessGstin, businessAddress, businessPhone, businessEmail
- clientName, clientGstin, clientAddress, clientPhone
- items: array of { description, hsnSac, quantity, rate, amount }
- taxPercent (number e.g. 18 or 12 or 5 or 0)
- subtotal (number)
- taxAmount (number)
- totalAmount (number)
- upiId (e.g. "business@okhdfcbank" or standard upi handle)
- bankDetails: { accountName, accountNumber, ifsc, bankName }
- notes (e.g. payment terms, thank you note)

If "resume":
data must contain:
- personalInfo: { fullName, title, email, phone, location, linkedin, github, portfolio }
- summary: strong fresher summary highlighting technical or business strengths
- education: array of { institution, degree, year, score, highlights }
- skills: { technical: string[], tools: string[], softSkills: string[], domainKnowledge: string[] }
- projects: array of { title, techStack: string[], descriptionPoints: string[], liveUrl, githubUrl }
- certifications: array of { name, issuer, year }
- experienceOrInternships: array of { role, company, duration, achievements: string[] }
- interviewQuestions: array of { question, idealAnswerTip }
- atsScoreEstimate: number (e.g. 92)

If "regional_explain":
data must contain:
- originalConcept: string
- targetLanguage: string (e.g. "Marathi", "Hindi", "Tamil")
- nativeScriptTitle: string (title written in that language script)
- nativeExplanation: string (rich multi-paragraph, engaging, easy to grasp explanation in native script)
- hinglishPhonetic: string (Roman transliteration for easy reading)
- simpleEnglishSummary: string[] (3 clear bullet points)
- localAnalogies: array of { title, comparison } (using everyday Indian analogies like chai tapri, cricket, local train, dabba system, FD in bank)
- keyVocabulary: array of { englishTerm, nativeTerm, meaning }

If "travel_cheap":
data must contain:
- origin: string
- destination: string
- travelDate: string
- options: array of {
    id: string,
    mode: "Train Tatkal / Sleeper" | "Train 3AC" | "Overnight Sleeper Bus" | "Shared Cab / BlaBlaCar" | "Budget Flight",
    serviceName: string,
    estimatedFare: number,
    duration: string,
    pros: string[],
    cons: string[],
    bookingTip: string,
    bookingUrlText: string,
    badge: string (e.g. "Cheapest Choice", "Fastest", "Best Balance", "Last-Minute Lifesaver")
  }
- cheapestRecommendation: string
- tatkalRulesAndTimings: string
- indianTravelHacks: string[]

If "exam_prep":
data must contain:
- topic: string
- examTarget: string (e.g. "UPSC / SSC / College Exams / State PSC")
- summaryNotes: string[]
- questions: array of {
    id: number,
    question: string,
    options: string[],
    correctIndex: number,
    explanation: string,
    difficulty: "Easy" | "Medium" | "Hard",
    examTag: string
  }
- flashcards: array of {
    id: number,
    front: string,
    back: string,
    mnemonic: string
  }

If "reel_creator":
data must contain:
- title: string
- niche: string
- estimatedDuration: string (e.g. "45 seconds")
- hook3Seconds: { visualCue: string, verbalScript: string, onScreenText: string }
- scenes: array of {
    timestamp: string,
    visualAction: string,
    verbalScript: string,
    onScreenText: string,
    cameraAngle: string,
    bRollTip: string
  }
- caption: string
- hashtags: string[]
- trendingAudioMood: string
- teleprompterText: string

If "whatsapp_msg":
data must contain:
- context: string
- recipientType: string
- drafts: {
    politeProfessional: { subject: string, message: string, tip: string },
    firmUrgent: { subject: string, message: string, tip: string },
    friendlyHinglish: { subject: string, message: string, tip: string },
    shortSms: { message: string, charCount: number }
  }
`,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const raw = response.text || '{}';
      const parsed = JSON.parse(cleanJsonText(raw));
      return res.json({ success: true, result: parsed });
    }

    // Fallback if GEMINI_API_KEY is not set
    const fallbackResult = getFallbackData(selectedType, prompt, language);
    return res.json({ success: true, result: fallbackResult, note: 'Generated with high-fidelity template engine' });
  } catch (error: any) {
    console.error('Error generating action:', error);
    // Provide graceful fallback rather than failing completely
    const fallback = getFallbackData(req.body.explicitType || 'invoice', req.body.prompt || 'Sample Task', req.body.language);
    return res.json({ success: true, result: fallback, isFallback: true, error: error.message });
  }
});

// High-fidelity fallback generators for every category
function getFallbackData(type: string, prompt: string, language?: string) {
  const dateStr = new Date().toISOString().split('T')[0];
  const dueDateStr = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  switch (type) {
    case 'invoice':
      return {
        type: 'invoice',
        title: 'GST Tax Invoice & UPI Payment Slip',
        subtitle: 'Auto-calculated for Indian freelance & small business transactions',
        data: {
          invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
          date: dateStr,
          dueDate: dueDateStr,
          businessName: 'Apex Digital Solutions',
          businessGstin: '27AABCA1234F1Z5',
          businessAddress: 'Plot 42, Hiranandani Tech Park, Powai, Mumbai, MH 400076',
          businessPhone: '+91 98200 12345',
          businessEmail: 'accounts@apexdigital.in',
          clientName: 'Sunrise Enterprises India',
          clientGstin: '29ABCDE5678G1Z9',
          clientAddress: 'Indiranagar 100ft Road, Bengaluru, KA 560038',
          clientPhone: '+91 98450 67890',
          items: [
            { description: 'Full-Stack Web Application & Mobile UI Development', hsnSac: '998314', quantity: 1, rate: 25000, amount: 25000 },
            { description: 'Cloud Deployment, SEO Setup & WhatsApp API Integration', hsnSac: '998313', quantity: 1, rate: 8000, amount: 8000 },
            { description: 'Maintenance & Priority SLA Support (1st Quarter)', hsnSac: '998315', quantity: 1, rate: 4500, amount: 4500 },
          ],
          taxPercent: 18,
          subtotal: 37500,
          taxAmount: 6750,
          totalAmount: 44250,
          upiId: 'apexdigital@okhdfcbank',
          bankDetails: {
            accountName: 'Apex Digital Solutions',
            accountNumber: '50200045892114',
            ifsc: 'HDFC0001234',
            bankName: 'HDFC Bank, Powai Branch',
          },
          notes: 'Payment is due within 7 days. Scan the UPI QR code below for instant zero-charge settlement via GPay, PhonePe, or Paytm.',
        },
      };

    case 'resume':
      return {
        type: 'resume',
        title: 'ATS-Optimized Fresher Software Engineer Resume',
        subtitle: 'Engineered for Indian Campus Placements, Off-Campus Drives & Tech Startups',
        data: {
          personalInfo: {
            fullName: 'Aarav Sharma',
            title: 'Full-Stack Developer & Fresher Engineer',
            email: 'aarav.sharma.tech@gmail.com',
            phone: '+91 98765 43210',
            location: 'Pune, Maharashtra',
            linkedin: 'linkedin.com/in/aarav-sharma-dev',
            github: 'github.com/aaravsharma',
            portfolio: 'aaravsharma.dev',
          },
          summary: 'Driven B.Tech Computer Engineering graduate (2026 batch) with hands-on expertise building scalable React, Node.js, and Cloud web apps. Proven track record solving 350+ LeetCode problems and deploying production-grade AI-powered micro-tools. Eager to contribute high velocity and clean architectural practices to a fast-moving engineering team.',
          education: [
            { institution: 'Pune Institute of Computer Technology (PICT)', degree: 'B.Tech in Computer Engineering', year: '2022 - 2026', score: '8.84 CGPA', highlights: 'Top 5% in Algorithms & Distributed Systems course' },
            { institution: 'Kendriya Vidyalaya, Pune', degree: 'Class XII (CBSE Science)', year: '2022', score: '94.2%', highlights: 'School topper in Mathematics & Physics' },
          ],
          skills: {
            technical: ['React 19', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Tailwind CSS', 'REST APIs', 'Git'],
            tools: ['VS Code', 'Docker', 'Postman', 'Vercel', 'Google Cloud', 'Figma'],
            softSkills: ['Agile Collaboration', 'Quick Problem Deconstruction', 'Technical Documentation', 'Customer Empathy'],
            domainKnowledge: ['Data Structures & Algorithms', 'System Architecture Basics', 'Fintech & UPI Integrations'],
          },
          projects: [
            {
              title: 'KaamKaj: Micro-SaaS for Indian Small Businesses',
              techStack: ['React', 'TypeScript', 'Express', 'Gemini API', 'Tailwind'],
              descriptionPoints: [
                'Engineered an action-first web platform serving 1,200+ local shop owners to generate GST invoices and WhatsApp payment links in 5 seconds.',
                'Integrated real-time UPI QR generation reducing payment follow-up cycles by 40%.',
                'Optimized client bundle size by 35% using code-splitting and dynamic SVG rendering.',
              ],
              liveUrl: 'https://kaamkaj.app',
              githubUrl: 'https://github.com/aaravsharma/kaamkaj',
            },
            {
              title: 'IRCTC Smart Route Optimizer',
              techStack: ['Node.js', 'Python', 'WebSockets', 'Railway Open Data'],
              descriptionPoints: [
                'Developed a real-time Tatkal ticket probability calculator with automated alerts.',
                'Utilized graph algorithms (Dijkstra) to discover broken-journey train combinations saving up to ₹400 per passenger.',
              ],
              liveUrl: 'https://smart-irctc.in',
              githubUrl: 'https://github.com/aaravsharma/irctc-opt',
            },
          ],
          certifications: [
            { name: 'Google Cloud Associate Cloud Engineer', issuer: 'Google Cloud', year: '2025' },
            { name: 'Meta Front-End Developer Professional Certificate', issuer: 'Coursera / Meta', year: '2024' },
          ],
          experienceOrInternships: [
            {
              role: 'Software Development Intern',
              company: 'Zomato Technology Hub',
              duration: 'May 2025 - July 2025',
              achievements: [
                'Refactored partner restaurant onboarding flow, cutting step completion drop-off by 18%.',
                'Authored 45+ unit and integration tests achieving 91% code coverage on core billing modules.',
              ],
            },
          ],
          interviewQuestions: [
            { question: 'Explain how React Reconciliation and the Virtual DOM diffing algorithm work.', idealAnswerTip: 'Discuss the heuristics: element type checking, keys on lists, and O(n) algorithmic complexity vs O(n^3).' },
            { question: 'How would you handle high concurrency during a flash sale or Tatkal booking spike?', idealAnswerTip: 'Mention distributed message queues (Kafka/RabbitMQ), Redis caching, rate limiting, and database row-level locking vs optimistic locking.' },
          ],
          atsScoreEstimate: 94,
        },
      };

    case 'regional_explain':
      return {
        type: 'regional_explain',
        title: 'सोप्या मराठीत संकल्पना स्पष्टीकरण (Concept Explained in Marathi)',
        subtitle: 'Authentic Indian regional explanation with everyday life analogies & voice audio',
        data: {
          originalConcept: prompt || 'कम्पाउंड इंटरेस्ट (Compound Interest / चक्रवाढ व्याज)',
          targetLanguage: language || 'Marathi',
          nativeScriptTitle: 'चक्रवाढ व्याज म्हणजे काय? (What is Compound Interest?)',
          nativeExplanation: `चक्रवाढ व्याज (Compound Interest) म्हणजे साध्या भाषेत सांगायचे तर "व्याजावर मिळणारे व्याज"! 

जेव्हा तुम्ही बँकेत किंवा पोस्ट ऑफिसमध्ये पैसे ठेवता, तेव्हा पहिल्या वर्षी तुम्हाला तुमच्या मूळ पैशांवर व्याज मिळते. पण दुसऱ्या वर्षी, फक्त मूळ पैशांवरच नाही, तर पहिल्या वर्षी जमा झालेल्या व्याजावरही नवीन व्याज मिळते!

यामुळे तुमचे पैसे एका स्नोबॉलसारखे (किंवा वटवृक्षाच्या फांद्यांसारखे) वेगाने वाढत जातात. अल्बर्ट आइनस्टाइन यांनी याला "जगातील आठवे आश्चर्य" म्हटले होते. कारण दीर्घकाळात हे साध्या व्याजापेक्षा कित्येक पटीने जास्त संपत्ती निर्माण करते.`,
          hinglishPhonetic: `Chakravadh Vyaaj mhanje sodya bhashet sangayche tar "Vyajavar milnare vyaaj"! Jevha tumhi banket kinva post officet paise thevta, tevha pahilya varshi mudalavar vyaj milte. Pan dusrya varshi, mudal + pahilya varshache vyaj ya dohovar punha vyaj milte. Dheerghakaalat he mothe bhandval tayar karte.`,
          simpleEnglishSummary: [
            'Compound interest means earning interest on both your initial principal and previously accumulated interest.',
            'Time is your biggest ally: starting an SIP at age 22 vs 30 yields 3x more wealth due to exponential compounding.',
            'In India, PPF, Mutual Fund SIPs, and Sukanya Samriddhi accounts leverage annual/monthly compounding to build crorepati wealth.',
          ],
          localAnalogies: [
            {
              title: 'शेतातले आंब्याचे कलम (The Mango Tree Analogy)',
              comparison: 'साधे व्याज म्हणजे आंब्याचे झाड लावून फक्त आंबे खाणे. चक्रवाढ व्याज म्हणजे त्या आंब्याच्या कोयिचे पुन्हा नवीन झाड लावणे आणि काही वर्षांत संपूर्ण आंब्याची बाग तयार होणे!',
            },
            {
              title: 'दिवाळीची भिशी व गावची पतसंस्था (The Local Chit Fund / Society)',
              comparison: 'गावातील भिशीमध्ये प्रत्येक महिन्याला जमा होणारा लाभांश पुन्हा मुद्दलात गुंतवला, की पुढच्या फेरीत जास्त नफा हातात येतो.',
            },
          ],
          keyVocabulary: [
            { englishTerm: 'Principal', nativeTerm: 'मुद्दल (Muddal)', meaning: 'तुम्ही सुरुवातीला गुंतवलेली मूळ रक्कम' },
            { englishTerm: 'Interest Rate', nativeTerm: 'व्याजदर (Vyaajdar)', meaning: 'बँक दरवर्षी देणारी टक्केवारी (उदा. ७% किंवा १२%)' },
            { englishTerm: 'Tenure', nativeTerm: 'कालावधी (Kaalawadhi)', meaning: 'पैसे गुंतवून ठेवलेली वर्षे' },
            { englishTerm: 'Compounding Frequency', nativeTerm: 'चक्रवाढ फेरी', meaning: 'व्याज मुद्दलात कधी जोडले जाते (वार्षिक, तिमाही की मासिक)' },
          ],
        },
      };

    case 'travel_cheap':
      return {
        type: 'travel_cheap',
        title: 'Smart Rupee-Saver Travel Matrix (Tomorrow)',
        subtitle: 'IRCTC Tatkal vs Sleeper Bus vs BlaBlaCar vs Red-Eye Flight Comparison',
        data: {
          origin: 'Pune',
          destination: 'Goa (Madgaon / Vasco)',
          travelDate: 'Tomorrow',
          options: [
            {
              id: 'opt-tatkal',
              mode: 'Train Tatkal / Sleeper',
              serviceName: '12780 Goa Express (Pune to Madgaon Jn)',
              estimatedFare: 345,
              duration: '11 hrs 45 mins',
              pros: ['Super economical', 'Comfortable flat sleeper berth', 'Scenic Dudhsagar waterfall route'],
              cons: ['Tatkal quota opens at 11:00 AM sharp today', 'Heavy competition on IRCTC app'],
              bookingTip: 'Keep your IRCTC e-Wallet or UPI pre-authenticated at 10:58 AM; berths vanish in 90 seconds.',
              bookingUrlText: 'Check IRCTC Availability',
              badge: 'Cheapest Choice',
            },
            {
              id: 'opt-bus',
              mode: 'Overnight Sleeper Bus',
              serviceName: 'VRL / Paulo AC Multi-Axle Sleeper',
              estimatedFare: 850,
              duration: '9 hrs 30 mins',
              pros: ['Guaranteed confirmed berth', 'Board at 10:30 PM Swargate, arrive 8:00 AM Panjim', 'Personal charging point & AC'],
              cons: ['Ghat roads can cause slight motion sickness', 'Traffic near Kolhapur'],
              bookingTip: 'Book lower berth in middle row (seats 12-16) for smoothest ride across Amboli Ghat.',
              bookingUrlText: 'Compare on RedBus',
              badge: 'Most Reliable Confirm',
            },
            {
              id: 'opt-carpool',
              mode: 'Shared Cab / BlaBlaCar',
              serviceName: 'Verified BlaBlaCar SUV / Sedan',
              estimatedFare: 750,
              duration: '8 hrs',
              pros: ['Door-to-door convenience', 'Fastest road travel', 'Stops at good Kolhapur highway dhabas'],
              cons: ['Shared with 2-3 co-passengers', 'Fixed departure timing by host driver'],
              bookingTip: 'Filter by drivers with 4.8+ rating and "Government ID Verified" badge.',
              bookingUrlText: 'Find Rides on BlaBlaCar',
              badge: 'Fastest Ground Route',
            },
            {
              id: 'opt-flight',
              mode: 'Budget Flight',
              serviceName: 'IndiGo / Akasa Air (PNQ to GOX/GOI)',
              estimatedFare: 2850,
              duration: '1 hr flight + 3 hrs airport transit',
              pros: ['1 hour airtime', 'Great if reaching urgent client meetings'],
              cons: ['Costs 8x more than train', 'Cab from Mopa airport to South Goa costs extra ₹1,800'],
              bookingTip: 'Book via UPI on Google Flights / Skyscanner to avoid airline convenience fees.',
              bookingUrlText: 'Search Skyscanner',
              badge: 'Fastest Air Option',
            },
          ],
          cheapestRecommendation: 'Go with the Overnight Sleeper Bus or Tatkal Sleeper. The bus gets you sleeping comfortably at night and waking up in Goa by 8 AM without losing daylight hours.',
          tatkalRulesAndTimings: 'AC Tatkal opens at 10:00 AM; Non-AC/Sleeper Tatkal opens at 11:00 AM one day prior to journey origin date. Tatkal charges are 10% of basic fare for second class and 30% for others.',
          indianTravelHacks: [
            'IRCTC Vikalp scheme: Always tick "Opt for VIKALP" to get auto-upgraded to alternate trains if waitlisted.',
            'RedBus Live Tracking: Use coupon codes like FIRST or LUNCH for ₹100-₹150 instant discount.',
            'Airport Cab Hack in Goa: Instead of private taxi counter, take the Kadamba Electric AC shuttle bus from Mopa airport for just ₹200 to Panjim/Calangute.',
          ],
        },
      };

    case 'exam_prep':
      return {
        type: 'exam_prep',
        title: 'High-Yield Exam Prep Set & Flashcards',
        subtitle: 'Generated for UPSC, SSC CGL, State PSC & Competitive College Exams',
        data: {
          topic: prompt || 'Indian Constitution: Fundamental Rights (Articles 12-35)',
          examTarget: 'UPSC Prelims & SSC CGL Target 2026',
          summaryNotes: [
            'Part III of the Constitution (Articles 12 to 35) is termed the "Magna Carta of India".',
            'Fundamental Rights are justiciable in courts under Article 32 (Supreme Court) and Article 226 (High Court).',
            'Right to Property was deleted from Fundamental Rights by 44th Constitutional Amendment Act, 1978 and made a legal right under Article 300A.',
            'Articles 20 and 21 cannot be suspended even during a National Emergency under Article 352.',
          ],
          questions: [
            {
              id: 1,
              question: 'Which Article of the Indian Constitution is regarded by Dr. B.R. Ambedkar as the "Heart and Soul of the Constitution"?',
              options: ['Article 14 (Equality before Law)', 'Article 19 (Freedom of Speech)', 'Article 21 (Right to Life)', 'Article 32 (Right to Constitutional Remedies)'],
              correctIndex: 3,
              explanation: 'Dr. Ambedkar called Article 32 the "heart and soul" because without it, fundamental rights would be mere paper declarations with no legal remedy.',
              difficulty: 'Easy',
              examTag: 'UPSC Prelims / SSC CGL Classic',
            },
            {
              id: 2,
              question: 'The writ of "Habeas Corpus" literally translates from Latin to which of the following?',
              options: ['We Command', 'To be Certified', 'To Have the Body', 'By What Authority'],
              correctIndex: 2,
              explanation: '"Habeas Corpus" means "to have the body". It is an order issued to produce a detained person before the court to test the legality of detention.',
              difficulty: 'Medium',
              examTag: 'SSC CGL 2024 Tier-1',
            },
            {
              id: 3,
              question: 'Under the Constitution of India, which of the following Fundamental Rights is available to both Indian citizens and foreign nationals (except enemy aliens)?',
              options: ['Article 15 (Prohibition of discrimination)', 'Article 16 (Equality of opportunity in public employment)', 'Article 21 (Protection of life and personal liberty)', 'Article 19 (Six freedoms of speech, assembly, etc.)'],
              correctIndex: 2,
              explanation: 'Article 21 (Right to Life & Personal Liberty) is universal and applies to all persons in India, whereas Articles 15, 16, 19, 29, and 30 are exclusively for Indian citizens.',
              difficulty: 'Hard',
              examTag: 'UPSC Civil Services Prelims',
            },
            {
              id: 4,
              question: 'By which Constitutional Amendment was the Right to Education (Article 21A) inserted into Part III of the Constitution?',
              options: ['42nd Amendment, 1976', '44th Amendment, 1978', '86th Amendment, 2002', '91st Amendment, 2003'],
              correctIndex: 2,
              explanation: 'The 86th Constitutional Amendment Act, 2002 inserted Article 21A providing free and compulsory education to all children aged 6 to 14 years.',
              difficulty: 'Medium',
              examTag: 'State PSC / CDS',
            },
          ],
          flashcards: [
            {
              id: 1,
              front: 'Writs under Article 32 (5 Types)',
              back: '1. Habeas Corpus (Produce the body)\n2. Mandamus (We command)\n3. Prohibition (To forbid)\n4. Certiorari (To be certified)\n5. Quo-Warranto (By what warrant)',
              mnemonic: 'Mnemonic: "H-M-P-C-Q" (How Men Protect Citizens Quickly)',
            },
            {
              id: 2,
              front: 'Articles exclusive ONLY to Indian Citizens',
              back: 'Articles 15, 16, 19, 29, and 30. All other Fundamental Rights apply to foreigners too.',
              mnemonic: 'Mnemonic: Odd numbers sequence: 15, 16, 19, 29, 30',
            },
            {
              id: 3,
              front: 'Doctrine of Severability (Article 13)',
              back: 'If any part of a law violates Fundamental Rights, only that unconstitutional portion is void, not the entire Act (if severable).',
              mnemonic: 'Think of removing a spoiled apple from the basket.',
            },
          ],
        },
      };

    case 'reel_creator':
      return {
        type: 'reel_creator',
        title: 'Viral Instagram Reel & YouTube Short Script',
        subtitle: 'Engineered with 3-Sec Hook, Shot-by-Shot B-Roll Cues, & Teleprompter Mode',
        data: {
          title: prompt || '3 Indian Money Hacks College Students Never Learn',
          niche: 'Personal Finance & Career India',
          estimatedDuration: '45 seconds',
          hook3Seconds: {
            visualCue: 'You tap the camera lens, holding a ₹500 note, text pops on screen in bold yellow.',
            verbalScript: 'Agar aap 18 se 25 ke beech ho, toh ye 3 mistakes aapke bank account ko khali kar rahi hain!',
            onScreenText: '🚨 95% Indian Students Make This Mistake!',
          },
          scenes: [
            {
              timestamp: '0:00 - 0:04',
              visualAction: 'Fast zoom on face holding college ID or wallet. High energy expression.',
              verbalScript: 'College khatam hone ke baad 90% logon ke paas zero savings hoti hain. Par ye hack follow kiya toh 25 saal mein ₹10 Lakh honge.',
              onScreenText: 'From ₹0 to ₹10 Lakhs 💸',
              cameraAngle: 'Close-up selfie angle',
              bRollTip: 'Quick cut sound effect (whoosh).',
            },
            {
              timestamp: '0:05 - 0:15',
              visualAction: 'Screen recording shows a zero-balance student bank account vs Auto-Sweep feature.',
              verbalScript: 'Hack #1: Apne savings account mein "Auto-Sweep" on karo! Paison par normal 3% ke badle FD ka 7% interest milta hai bina lock-in ke.',
              onScreenText: 'Hack 1: Bank Auto-Sweep (3% ➡️ 7.2% Interest)',
              cameraAngle: 'Split screen with phone UI graphic',
              bRollTip: 'Highlight the toggle on SBI or HDFC mobile banking app.',
            },
            {
              timestamp: '0:16 - 0:28',
              visualAction: 'Holding a cutting chai tapri cup or coffee cup.',
              verbalScript: 'Hack #2: Har weekend par Zomato par ₹400 udate ho? Bas ek weekend skip karke Nifty 50 Index Fund mein ₹500 ka monthly SIP shuru karo.',
              onScreenText: 'Hack 2: The Chai-Sutta SIP Rule ☕',
              cameraAngle: 'Medium shot walking',
              bRollTip: 'Show compound interest graph zooming upward exponentially.',
            },
            {
              timestamp: '0:29 - 0:42',
              visualAction: 'Direct eye contact, showing student discount card on laptop screen.',
              verbalScript: 'Hack #3: Apni .edu college email ID se GitHub Student Pack, Spotify, aur Apple par 50% discount claim karo. Saal ke ₹20,000 bachte hain!',
              onScreenText: 'Hack 3: Secret Student Email Discounts 🎓',
              cameraAngle: 'Eye-level laptop desk setup',
              bRollTip: 'Blink cursor on student verification portal.',
            },
            {
              timestamp: '0:43 - 0:48',
              visualAction: 'Pointing downward towards comment box with confident smile.',
              verbalScript: 'Share this with your college group and comment "STUDENT" for my free finance starter checklist!',
              onScreenText: 'Comment "STUDENT" for free guide 📩',
              cameraAngle: 'Dynamic punch-in',
              bRollTip: 'Save & Share icon animation.',
            },
          ],
          caption: `Stop letting your pocket money evaporate! 💸 3 practical money rules every Indian college student & fresher needs in 2026. 

1️⃣ Activate Auto-Sweep on your savings bank account to earn FD-level interest with zero lock-in.
2️⃣ Start a ₹500 Nifty 50 Index SIP early—time is your greatest leverage.
3️⃣ Use your student email for massive discounts on dev tools & software.

Tag your broke college friend who needs to see this! 👇

#CollegeHacks #IndianStudents #PersonalFinanceIndia #MoneyTips #Fintech #ReelsIndia #ExplorePage #KaamKajAI`,
          hashtags: ['#PersonalFinanceIndia', '#CollegeLifeIndia', '#ReelsIndia', '#Fintech', '#MoneyHacks', '#TrendingReels', '#KaamKaj'],
          trendingAudioMood: 'Upbeat Lo-fi Hip Hop or Energetic Synth Bass (30s viral loop)',
          teleprompterText: `Agar aap 18 se 25 ke beech ho, toh ye 3 mistakes aapke bank account ko khali kar rahi hain! 

College khatam hone ke baad 90% logon ke paas zero savings hoti hain. Par ye hack follow kiya toh 25 saal mein ₹10 Lakh honge.

Hack number one: Apne savings account mein "Auto-Sweep" on karo! Paison par normal 3% ke badle FD ka 7% interest milta hai bina kisi penalty ke.

Hack number two: Har weekend Zomato par kharch karne ke badle Nifty 50 Index Fund mein ₹500 ka monthly SIP shuru karo. 

Hack number three: Apni student email ID se GitHub pack, Spotify aur software par 50% discount claim karo. 

Share this with your college group and comment "STUDENT" for my free finance guide!`,
        },
      };

    case 'whatsapp_msg':
    default:
      return {
        type: 'whatsapp_msg',
        title: 'Polished Business WhatsApp & Email Drafts',
        subtitle: 'Crafted for Indian clients, agencies, vendors, and formal workplace interactions',
        data: {
          context: prompt || 'Polite Payment Reminder for Client',
          recipientType: 'Client / Business Partner',
          drafts: {
            politeProfessional: {
              subject: 'Gentle Follow-Up: Pending Invoice Settlement - [Project Name]',
              message: `Namaste Sir/Ma'am,

Hope you are having a productive week! 

Just a gentle follow-up regarding invoice *INV-2026-042* for the recently completed deliverables. The payment of *₹24,500* was due on *24th Sept*. 

Could you kindly check with the accounts department for the transfer status? I have attached the invoice copy and UPI QR code for your quick convenience.

Looking forward to continuing our collaboration!

Warm regards,
*Your Name*
Contact: +91 98765 43210`,
              tip: 'Best sent around 11:30 AM on Tuesday or Wednesday when inbox traffic is steady.',
            },
            firmUrgent: {
              subject: 'Urgent: Overdue Payment Notice - Invoice INV-2026-042',
              message: `Dear Sir/Ma'am,

This is a reminder that invoice *INV-2026-042* for *₹24,500* is now 5 days overdue. 

As per our project agreement and GST filing timeline, we request you to clear the balance today via UPI (*upi-id@bank*) or IMPS. 

Kindly share the transaction UTR number once processed so we can reconcile the ledger. 

Thank you for your prompt attention to this matter.

Regards,
*Your Name*`,
              tip: 'Use when the client has ignored previous friendly reminders or GST cutoff is approaching.',
            },
            friendlyHinglish: {
              subject: 'Invoice update & quick check-in',
              message: `Hi Rahul ji! 👋 

Umeed hai sab badhiya chal raha hai. Deliverables live ho chuke hain aur response kaafi accha mil raha hai. 

Bas ek quick reminder tha—last month ka invoice amount *₹24,500* pending status mein show ho raha hai. Jab bhi time mile aaj ya kal mein process karwa dijiyega please. 

GPay/PhonePe UPI handle: *apexdigital@okhdfcbank* 

Thanks a lot!`,
              tip: 'Ideal for Indian SME founders, freelance clients, and cordial agency partners.',
            },
            shortSms: {
              message: `Reminder: Invoice INV-2026-042 for ₹24,500 is due. Pay via UPI: apexdigital@okhdfcbank. Pls share UTR on confirmation. Thanks!`,
              charCount: 138,
            },
          },
        },
      };
  }
}

// Development vs Production Server Setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KaamKaj AI server running on port ${PORT}`);
  });
}

startServer();
