import { GoogleGenAI } from '@google/genai';
import type { PortfolioPayload } from '../types/portfolio.ts';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('AI assistant is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function buildPortfolioContext(portfolio: PortfolioPayload): string {
  const skillsText = portfolio.skillCategories
    .map(
      (cat) =>
        `- ${cat.name}: ${cat.skills.map((s) => s.name).join(', ') || 'None listed'}`
    )
    .join('\n');

  const projectsText = portfolio.projects
    .map(
      (p) =>
        `- ${p.title} (${p.category}, ${p.status}${p.isFeatured ? ', Featured' : ''}): ${p.description} | Technologies: ${p.technologies.join(', ')} | Key Features: ${p.features.join('; ')}${p.githubUrl ? ` | GitHub: ${p.githubUrl}` : ''}${p.liveDemoUrl ? ` | Live Demo: ${p.liveDemoUrl}` : ''}`
    )
    .join('\n');

  const educationText = portfolio.education
    .map(
      (e) =>
        `- ${e.degree}${e.branch ? ` in ${e.branch}` : ''} at ${e.collegeName}${e.universityName ? ` (${e.universityName})` : ''}, ${e.academicYear}${e.currentSemester ? `, ${e.currentSemester}` : ''}. ${e.description}`
    )
    .join('\n');

  const certsText = portfolio.certificates
    .map(
      (c) =>
        `- ${c.title} [${c.badgeType || 'Certification'}] by ${c.issuer} (${c.issueDate})${c.credentialId ? ` | ${c.credentialIdLabel || 'Credential ID'}: ${c.credentialId}` : ''}${c.scoreBreakdown ? ` | ${c.scoreBreakdown}` : ''}: ${c.description}${c.skillTags?.length ? ` | Skills: ${c.skillTags.join(', ')}` : ''}${c.verificationUrl ? ` | Verify: ${c.verificationUrl}` : ''}`
    )
    .join('\n');

  const aboutText = portfolio.about.blocks
    .map((b) => `${b.title}: ${b.content}`)
    .join('\n');

  const socialsText = portfolio.socialLinks
    .filter((s) => s.url)
    .map((s) => `- ${s.platform}: ${s.url}`)
    .join('\n');

  return [
    `You are the official Portfolio Assistant for ${portfolio.profile.fullName} (${portfolio.profile.title}).`,
    `Answer visitor and recruiter questions concisely, accurately, and professionally using ONLY the live portfolio data below.`,
    `Do not invent fake contact details, percentages, or experiences not listed below. If something is not yet added, politely mention that the owner has not listed it yet and suggest using the Contact section.`,
    `Keep answers clear, structured, and under 180 words unless the user asks for detailed technical information.`,
    '',
    `PROFILE:`,
    `Name: ${portfolio.profile.fullName}`,
    `Title: ${portfolio.profile.title}`,
    `Introduction: ${portfolio.profile.intro}`,
    portfolio.profile.location ? `Location: ${portfolio.profile.location}` : '',
    '',
    `ABOUT ME:`,
    `Areas of Interest: ${portfolio.about.areasOfInterest.join(', ')}`,
    aboutText,
    '',
    `SKILLS:`,
    skillsText || 'No skills listed yet.',
    '',
    `PROJECTS:`,
    projectsText || 'No projects listed yet.',
    '',
    `EDUCATION:`,
    educationText || 'No education entries listed yet.',
    '',
    `CERTIFICATES & ACHIEVEMENTS:`,
    certsText || 'No certificates uploaded yet.',
    '',
    `RESUME:`,
    `${portfolio.resume.title} — ${portfolio.resume.fileUrl ? 'PDF resume available for preview and download.' : 'No PDF uploaded yet.'}`,
    '',
    `CONTACT & SOCIAL LINKS:`,
    portfolio.settings.contactEmail && portfolio.settings.showContactEmail
      ? `Email: ${portfolio.settings.contactEmail}`
      : 'Email: Not publicly listed (contact form available).',
    socialsText || 'No social URLs configured yet.',
  ]
    .filter(Boolean)
    .join('\n');
}

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export async function runPortfolioChat(
  portfolio: PortfolioPayload,
  history: ChatTurn[],
  message: string,
  fastMode = false
): Promise<string> {
  const ai = getGeminiClient();
  const model = fastMode ? 'gemini-3.1-flash-lite' : 'gemini-4-hydrogen';
  const systemInstruction = buildPortfolioContext(portfolio);

  const normalizedTurns: ChatTurn[] = [];
  for (const turn of history.slice(-16)) {
    const cleaned = turn.text.trim();
    if (!cleaned) continue;
    if (normalizedTurns.length === 0 && turn.role !== 'user') continue;
    const prev = normalizedTurns[normalizedTurns.length - 1];
    if (prev && prev.role === turn.role) {
      prev.text = `${prev.text}\n${cleaned}`;
    } else {
      normalizedTurns.push({ role: turn.role, text: cleaned });
    }
  }
  if (normalizedTurns.length > 0 && normalizedTurns[normalizedTurns.length - 1].role === 'user') {
    normalizedTurns.pop();
  }

  const formattedHistory = normalizedTurns.map((turn) => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));

  const chat = ai.chats.create({
    model,
    history: formattedHistory,
    config: {
      systemInstruction,
    },
  });

  const response = await chat.sendMessage({ message });
  const text = response.text?.trim();
  if (!text) {
    throw new Error('The assistant returned an empty response. Please try again.');
  }
  return text;
}
