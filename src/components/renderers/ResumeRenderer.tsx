import React, { useState, useRef } from 'react';
import {
  Printer,
  Copy,
  CheckCircle,
  Sparkles,
  Award,
  BookOpen,
  Briefcase,
  Code,
  GraduationCap,
  ExternalLink,
  Github,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  HelpCircle,
  FileText,
  Download,
  Loader2,
} from 'lucide-react';
import { ResumeData } from '../../types';
import { exportElementToPdf } from '../../utils/pdfExport';

interface ResumeRendererProps {
  initialData: ResumeData;
  onSave?: (updated: ResumeData) => void;
}

export const ResumeRenderer: React.FC<ResumeRendererProps> = ({ initialData, onSave }) => {
  const [resume, setResume] = useState<ResumeData>(initialData);
  const [theme, setTheme] = useState<'modern' | 'formal' | 'slate'>('modern');
  const [showInterviewPrep, setShowInterviewPrep] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!resumeRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const cleanFileName = `Resume_${(resume.personalInfo.fullName || 'Fresher').replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      await exportElementToPdf(resumeRef.current, {
        filename: cleanFileName,
        orientation: 'portrait',
      });
    } catch (err) {
      console.error('Error generating Resume PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyPlainText = () => {
    const plainText = `${resume.personalInfo.fullName.toUpperCase()}
${resume.personalInfo.title} | ${resume.personalInfo.location}
Email: ${resume.personalInfo.email} | Phone: ${resume.personalInfo.phone}
${resume.personalInfo.linkedin ? `LinkedIn: ${resume.personalInfo.linkedin}` : ''} | ${
      resume.personalInfo.github ? `GitHub: ${resume.personalInfo.github}` : ''
    }

SUMMARY:
${resume.summary}

EDUCATION:
${resume.education
  .map((e) => `${e.degree} - ${e.institution} (${e.year}) | Score: ${e.score}\nHighlights: ${e.highlights || ''}`)
  .join('\n\n')}

TECHNICAL SKILLS:
Programming & Tech: ${resume.skills.technical.join(', ')}
Tools & Platforms: ${resume.skills.tools.join(', ')}
Soft Skills: ${resume.skills.softSkills.join(', ')}

PROJECTS:
${resume.projects
  .map(
    (p) => `${p.title} [${p.techStack.join(', ')}]
${p.descriptionPoints.map((pt) => `• ${pt}`).join('\n')}`
  )
  .join('\n\n')}

${
  resume.experienceOrInternships && resume.experienceOrInternships.length > 0
    ? `EXPERIENCE & INTERNSHIPS:
${resume.experienceOrInternships
  .map(
    (exp) => `${exp.role} - ${exp.company} (${exp.duration})
${exp.achievements.map((a) => `• ${a}`).join('\n')}`
  )
  .join('\n\n')}`
    : ''
}
`;
    navigator.clipboard.writeText(plainText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Control Bar */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ATS Score: {resume.atsScoreEstimate || 94}/100</span>
          </div>

          <div className="hidden sm:flex items-center gap-1">
            <span className="text-slate-400">Theme:</span>
            <button
              onClick={() => setTheme('modern')}
              className={`px-2 py-0.5 rounded text-xs transition ${
                theme === 'modern' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Modern Tech
            </button>
            <button
              onClick={() => setTheme('formal')}
              className={`px-2 py-0.5 rounded text-xs transition ${
                theme === 'formal' ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              IIT/IIM Formal
            </button>
            <button
              onClick={() => setTheme('slate')}
              className={`px-2 py-0.5 rounded text-xs transition ${
                theme === 'slate' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Warm Accent
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {resume.interviewQuestions && resume.interviewQuestions.length > 0 && (
            <button
              onClick={() => setShowInterviewPrep(!showInterviewPrep)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition ${
                showInterviewPrep
                  ? 'bg-purple-600 text-white border-purple-500'
                  : 'bg-slate-800 text-purple-300 border-purple-500/40 hover:bg-slate-750'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Interview Questions ({resume.interviewQuestions.length})</span>
            </button>
          )}

          <button
            onClick={handleCopyPlainText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition"
            title="Copy plain text for Naukri, LinkedIn, Internshala"
          >
            {isCopied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied ATS Text' : 'Copy Plaintext'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold shadow-md shadow-blue-600/20 transition active:scale-95"
            title="Save Resume as PDF file on your computer"
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download as PDF'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 font-medium border border-slate-700 transition"
            title="Print or system print dialog"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Interview Prep Drawer if open */}
      {showInterviewPrep && resume.interviewQuestions && (
        <div className="no-print bg-purple-950/30 border border-purple-800/60 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Top Interview Questions Recruiters Will Ask From This Resume:</span>
            </h3>
            <button
              onClick={() => setShowInterviewPrep(false)}
              className="text-xs text-purple-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="space-y-2">
            {resume.interviewQuestions.map((q, idx) => (
              <div key={idx} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
                <p className="font-semibold text-slate-200">
                  {idx + 1}. {q.question}
                </p>
                <p className="text-purple-300/90 mt-1 pl-3 border-l-2 border-purple-500 text-[11px]">
                  <span className="font-semibold text-purple-200">Ideal Answer Tip:</span> {q.idealAnswerTip}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Printable A4 ATS Resume Canvas */}
      <div
        ref={resumeRef}
        className={`printable-document bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 font-sans ${
          theme === 'formal' ? 'font-serif' : 'font-sans'
        }`}
      >
        {/* Resume Header */}
        <div
          className={`border-b-2 pb-5 ${
            theme === 'modern'
              ? 'border-blue-600'
              : theme === 'slate'
              ? 'border-orange-500'
              : 'border-slate-900'
          }`}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {resume.personalInfo.fullName}
              </h1>
              <p
                className={`text-sm sm:text-base font-semibold mt-0.5 ${
                  theme === 'modern'
                    ? 'text-blue-700'
                    : theme === 'slate'
                    ? 'text-orange-600'
                    : 'text-slate-700'
                }`}
              >
                {resume.personalInfo.title}
              </p>
            </div>
            <div className="text-xs text-slate-600 space-y-1 sm:text-right font-medium">
              <div className="flex items-center sm:justify-end gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{resume.personalInfo.location}</span>
              </div>
              <div className="flex items-center sm:justify-end gap-1.5">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>{resume.personalInfo.email}</span>
              </div>
              <div className="flex items-center sm:justify-end gap-1.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{resume.personalInfo.phone}</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap gap-4 mt-3 pt-2 text-[11px] text-slate-600 font-medium">
            {resume.personalInfo.linkedin && (
              <span className="flex items-center gap-1">
                <Linkedin className="w-3 h-3 text-blue-600" />
                {resume.personalInfo.linkedin}
              </span>
            )}
            {resume.personalInfo.github && (
              <span className="flex items-center gap-1">
                <Github className="w-3 h-3 text-slate-800" />
                {resume.personalInfo.github}
              </span>
            )}
            {resume.personalInfo.portfolio && (
              <span className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-slate-500" />
                {resume.personalInfo.portfolio}
              </span>
            )}
          </div>
        </div>

        {/* Professional Summary */}
        <section className="mt-5">
          <h2
            className={`text-xs font-bold uppercase tracking-wider mb-2 ${
              theme === 'modern' ? 'text-blue-800' : 'text-slate-900'
            }`}
          >
            Professional Summary
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed text-justify">{resume.summary}</p>
        </section>

        {/* Education Section */}
        <section className="mt-5">
          <h2
            className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${
              theme === 'modern' ? 'text-blue-800' : 'text-slate-900'
            }`}
          >
            Education
          </h2>
          <div className="space-y-2.5">
            {resume.education.map((edu, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex justify-between items-baseline font-bold text-slate-900">
                  <span>{edu.degree}</span>
                  <span className="text-slate-600 font-semibold">{edu.year}</span>
                </div>
                <div className="flex justify-between items-baseline text-slate-600 mt-0.5">
                  <span>{edu.institution}</span>
                  <span className="font-semibold text-emerald-800">{edu.score}</span>
                </div>
                {edu.highlights && <p className="text-[11px] text-slate-500 mt-0.5">{edu.highlights}</p>}
              </div>
            ))}
          </div>
        </section>

        {/* Technical Skills */}
        <section className="mt-5">
          <h2
            className={`text-xs font-bold uppercase tracking-wider mb-2 ${
              theme === 'modern' ? 'text-blue-800' : 'text-slate-900'
            }`}
          >
            Technical & Professional Skills
          </h2>
          <div className="space-y-1 text-xs">
            <p>
              <span className="font-bold text-slate-800">Programming & Core Tech: </span>
              <span className="text-slate-700">{resume.skills.technical.join(', ')}</span>
            </p>
            <p>
              <span className="font-bold text-slate-800">Tools, Platforms & Cloud: </span>
              <span className="text-slate-700">{resume.skills.tools.join(', ')}</span>
            </p>
            <p>
              <span className="font-bold text-slate-800">Soft Skills & Methodologies: </span>
              <span className="text-slate-700">{resume.skills.softSkills.join(', ')}</span>
            </p>
            {resume.skills.domainKnowledge && (
              <p>
                <span className="font-bold text-slate-800">Domain Competencies: </span>
                <span className="text-slate-700">{resume.skills.domainKnowledge.join(', ')}</span>
              </p>
            )}
          </div>
        </section>

        {/* Key Projects */}
        <section className="mt-5">
          <h2
            className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${
              theme === 'modern' ? 'text-blue-800' : 'text-slate-900'
            }`}
          >
            Key Technical Projects
          </h2>
          <div className="space-y-3">
            {resume.projects.map((proj, idx) => (
              <div key={idx} className="text-xs">
                <div className="flex flex-wrap justify-between items-baseline gap-1 font-bold text-slate-900">
                  <span className="text-sm font-bold text-slate-900">{proj.title}</span>
                  <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    {proj.techStack.join(' • ')}
                  </span>
                </div>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-slate-700 pl-1 leading-normal">
                  {proj.descriptionPoints.map((pt, pIdx) => (
                    <li key={pIdx} className="text-[11.5px]">
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Experience or Internships */}
        {resume.experienceOrInternships && resume.experienceOrInternships.length > 0 && (
          <section className="mt-5">
            <h2
              className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${
                theme === 'modern' ? 'text-blue-800' : 'text-slate-900'
              }`}
            >
              Internships & Practical Experience
            </h2>
            <div className="space-y-3">
              {resume.experienceOrInternships.map((exp, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between items-baseline font-bold text-slate-900">
                    <span>
                      {exp.role} — <span className="font-semibold text-slate-700">{exp.company}</span>
                    </span>
                    <span className="text-slate-600">{exp.duration}</span>
                  </div>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-slate-700 pl-1">
                    {exp.achievements.map((ach, aIdx) => (
                      <li key={aIdx} className="text-[11.5px]">
                        {ach}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <section className="mt-5 pt-3 border-t border-slate-200">
            <h2
              className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${
                theme === 'modern' ? 'text-blue-800' : 'text-slate-900'
              }`}
            >
              Certifications & Honors
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
              {resume.certifications.map((c, idx) => (
                <span key={idx}>
                  • <span className="font-semibold text-slate-800">{c.name}</span> ({c.issuer},{' '}
                  {c.year})
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
