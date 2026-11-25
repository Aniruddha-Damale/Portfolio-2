import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { adminAuth } from './src/lib/firebase-admin.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { requireAdmin, requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import {
  aboutBlocks,
  certificates,
  education,
  projects,
  skillCategories,
  skills,
  socialLinks,
} from './src/db/schema.ts';
import {
  createAboutBlockRecord,
  createCertificateRecord,
  createContactMessageRecord,
  createCustomSectionRecord,
  createEducationRecord,
  createProjectRecord,
  createSkillCategoryRecord,
  createSkillRecord,
  createSocialLinkRecord,
  deleteAboutBlockRecord,
  deleteCertificateRecord,
  deleteContactMessageRecord,
  deleteCustomSectionRecord,
  deleteEducationRecord,
  deleteProjectRecord,
  deleteSkillCategoryRecord,
  deleteSkillRecord,
  deleteSocialLinkRecord,
  getContactMessagesRecords,
  getFullPortfolio,
  getUploadedFileRecord,
  markContactMessageReadRecord,
  reorderRecords,
  saveUploadedFileRecord,
  updateAboutBlockRecord,
  updateAboutRecord,
  updateCertificateRecord,
  updateCustomSectionRecord,
  updateEducationRecord,
  updateProfileRecord,
  updateProjectRecord,
  updateResumeRecord,
  updateSettingsRecord,
  updateSkillCategoryRecord,
  updateSkillRecord,
  updateSocialLinkRecord,
} from './src/db/portfolio.ts';
import { runPortfolioChat } from './src/lib/gemini.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_UPLOAD_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'application/pdf',
]);

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('/')) return !trimmed.startsWith('//');
  try {
    const parsed = new URL(trimmed);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

const safeUrlSchema = z
  .string()
  .max(2048)
  .refine(isSafeUrl, { message: 'URL must start with https://, http://, mailto:, or /' });

function verifyMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;
  if (mimeType === 'application/pdf') {
    return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  }
  if (mimeType === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === 'image/gif') {
    const header = buffer.subarray(0, 4).toString('ascii');
    return header === 'GIF8';
  }
  if (mimeType === 'image/webp') {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  if (mimeType === 'image/x-icon' || mimeType === 'image/vnd.microsoft.icon') {
    return (
      buffer[0] === 0x00 &&
      buffer[1] === 0x00 &&
      (buffer[2] === 0x01 || buffer[2] === 0x02) &&
      buffer[3] === 0x00
    );
  }
  return false;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

const parseIdParam = (raw: string): number | null => {
  const num = Number(raw);
  if (!Number.isInteger(num) || num <= 0) return null;
  return num;
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '5mb' }));

  // =========================================================================
  // Auth Status Route
  // =========================================================================
  app.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
    return res.json({
      uid: req.dbUser!.uid,
      email: req.dbUser!.email,
      displayName: req.dbUser!.displayName,
      isAdmin: req.dbUser!.isAdmin,
    });
  });

  // =========================================================================
  // Public Portfolio Read Route
  // =========================================================================
  app.get('/api/portfolio', async (req, res) => {
    try {
      let includeHidden = false;
      if (req.query.includeHidden === '1') {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
          try {
            const decoded = await adminAuth.verifyIdToken(authHeader.slice(7).trim());
            const dbUser = await getOrCreateUser(
              decoded.uid,
              decoded.email ?? '',
              decoded.name ?? ''
            );
            if (dbUser.isAdmin) {
              includeHidden = true;
            }
          } catch {
            includeHidden = false;
          }
        }
      }
      const data = await getFullPortfolio(includeHidden);
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to load portfolio' });
    }
  });

  // =========================================================================
  // Public Stored File Delivery Route
  // =========================================================================
  app.get('/api/files/:id', async (req, res) => {
    const fileId = parseIdParam(req.params.id);
    if (!fileId) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }
    try {
      const file = await getUploadedFileRecord(fileId);
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      const buffer = Buffer.from(file.dataBase64, 'base64');
      const safeName = file.originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const disposition = req.query.download === '1' ? 'attachment' : 'inline';

      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Content-Disposition', `${disposition}; filename="${safeName}"`);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.send(buffer);
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to load file' });
    }
  });

  // =========================================================================
  // Public Contact Form Route
  // =========================================================================
  const contactSchema = z.object({
    name: z.string().trim().min(2, 'Please enter your name').max(120),
    email: z.string().trim().email('Please enter a valid email address').max(200),
    subject: z.string().trim().min(2, 'Please enter a subject').max(200),
    message: z.string().trim().min(10, 'Message should be at least 10 characters').max(4000),
  });

  app.post('/api/contact', async (req, res) => {
    try {
      const portfolio = await getFullPortfolio(false);
      if (!portfolio.settings.contactFormEnabled) {
        return res.status(403).json({ error: 'The contact form is currently disabled.' });
      }
      const parsed = contactSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: parsed.error.issues[0]?.message || 'Invalid contact form submission',
        });
      }
      const saved = await createContactMessageRecord(parsed.data);
      return res.status(201).json({ id: saved.id, message: 'Message received successfully.' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to send message' });
    }
  });

  // =========================================================================
  // Public Softly Waitlist Signup Route
  // =========================================================================
  const waitlistSchema = z.object({
    email: z.string().trim().email('Please enter a valid email address').max(200),
  });

  app.post('/api/waitlist', async (req, res) => {
    const parsed = waitlistSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Please enter a valid email address.',
      });
    }
    try {
      await createContactMessageRecord({
        name: 'Softly Waitlist',
        email: parsed.data.email,
        subject: 'Softly Early Access Waitlist',
        message: `Joined the Softly waitlist with ${parsed.data.email}.`,
      });
    } catch (error) {
      // Log and still confirm cleanly so transient DB errors don't block the user
      console.error('Waitlist persistence warning:', error);
    }
    return res.status(201).json({
      ok: true,
      email: parsed.data.email,
      message: "You're on the quiet list.",
    });
  });

  // =========================================================================
  // Public Gemini Multi-Turn Portfolio Chatbot Route
  // =========================================================================
  const chatSchema = z.object({
    message: z.string().trim().min(1, 'Please enter a message').max(1500),
    fastMode: z.boolean().optional().default(false),
    history: z
      .array(
        z.object({
          role: z.enum(['user', 'model']),
          text: z.string().max(4000),
        })
      )
      .max(24)
      .optional()
      .default([]),
  });

  app.post('/api/chat', async (req, res) => {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.issues[0]?.message || 'Invalid chat payload',
      });
    }
    try {
      const portfolio = await getFullPortfolio(false);
      const reply = await runPortfolioChat(
        portfolio as any,
        parsed.data.history,
        parsed.data.message,
        parsed.data.fastMode
      );
      return res.json({ reply });
    } catch (error: any) {
      console.error('Portfolio chat error:', error);
      return res
        .status(500)
        .json({ error: error.message || 'Unable to generate assistant reply right now.' });
    }
  });

  // =========================================================================
  // Admin Dashboard & CMS Protected Routes
  // =========================================================================
  app.get('/api/admin/portfolio', requireAdmin, async (_req, res) => {
    try {
      const [portfolio, messages] = await Promise.all([
        getFullPortfolio(true),
        getContactMessagesRecords(),
      ]);
      return res.json({ portfolio, messages });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Failed to load admin data' });
    }
  });

  // File Upload (Images & PDFs stored permanently in PostgreSQL)
  app.post(
    '/api/admin/upload',
    requireAdmin,
    (req, res, next) => {
      upload.single('file')(req, res, (err: any) => {
        if (err) {
          return res.status(400).json({
            error:
              err.code === 'LIMIT_FILE_SIZE'
                ? 'File exceeds the 10 MB upload limit.'
                : err.message || 'File upload error.',
          });
        }
        return next();
      });
    },
    async (req: AuthRequest, res) => {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file provided.' });
      }
      if (!ALLOWED_UPLOAD_MIMES.has(file.mimetype)) {
        return res.status(400).json({
          error: 'Unsupported file type. Allowed formats: PNG, JPG, WebP, GIF, ICO, and PDF.',
        });
      }
      if (!verifyMagicBytes(file.buffer, file.mimetype)) {
        return res.status(400).json({
          error: 'Uploaded file contents do not match the declared file format.',
        });
      }

      const category =
        typeof req.body?.category === 'string' && req.body.category.length <= 40
          ? req.body.category
          : 'general';

      try {
        const stored = await saveUploadedFileRecord({
          originalName: file.originalname.slice(0, 200),
          mimeType: file.mimetype,
          sizeBytes: file.size,
          category,
          dataBase64: file.buffer.toString('base64'),
        });

        return res.status(201).json({
          id: stored.id,
          url: `/api/files/${stored.id}`,
          fileName: stored.originalName,
          mimeType: stored.mimeType,
          sizeBytes: stored.sizeBytes,
        });
      } catch (error: any) {
        return res.status(500).json({ error: error.message || 'Failed to save uploaded file' });
      }
    }
  );

  // Profile / Home Section
  const profileSchema = z.object({
    fullName: z.string().trim().min(1).max(160),
    title: z.string().trim().min(1).max(240),
    intro: z.string().trim().min(1).max(2000),
    avatarUrl: safeUrlSchema.optional().default(''),
    heroBgStyle: z.enum(['editorial', 'grid', 'minimal', 'custom']).optional().default('editorial'),
    heroBgImageUrl: safeUrlSchema.optional().default(''),
    primaryCtaText: z.string().trim().min(1).max(60),
    secondaryCtaText: z.string().trim().min(1).max(60),
    showAvatar: z.boolean(),
    showPrimaryCta: z.boolean(),
    showSecondaryCta: z.boolean(),
    showSocialIcons: z.boolean(),
    showLocation: z.boolean(),
    location: z.string().trim().max(120).optional().default(''),
  });

  app.put('/api/admin/profile', requireAdmin, async (req, res) => {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid profile data' });
    }
    try {
      const updated = await updateProfileRecord(parsed.data);
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // About Me Section & Blocks
  const aboutSchema = z.object({
    heading: z.string().trim().min(1).max(160),
    subheading: z.string().trim().max(600).optional().default(''),
    imageUrl: safeUrlSchema.optional().default(''),
    showImage: z.boolean(),
    areasOfInterest: z.array(z.string().trim().min(1).max(80)).max(24),
  });

  app.put('/api/admin/about', requireAdmin, async (req, res) => {
    const parsed = aboutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid About Me data' });
    }
    try {
      const updated = await updateAboutRecord(parsed.data);
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  const aboutBlockSchema = z.object({
    title: z.string().trim().min(1).max(160),
    content: z.string().trim().min(1).max(4000),
    isVisible: z.boolean().optional().default(true),
  });

  app.post('/api/admin/about-blocks', requireAdmin, async (req, res) => {
    const parsed = aboutBlockSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid block data' });
    }
    try {
      const created = await createAboutBlockRecord(parsed.data);
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/about-blocks/reorder', requireAdmin, async (req, res) => {
    const parsed = z.object({ ids: z.array(z.number().int().positive()) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid ordering list' });
    try {
      await reorderRecords(aboutBlocks, parsed.data.ids);
      return res.json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/about-blocks/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    const parsed = aboutBlockSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid block data' });
    try {
      const updated = await updateAboutBlockRecord(id, parsed.data);
      if (!updated) return res.status(404).json({ error: 'Block not found' });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/admin/about-blocks/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    try {
      await deleteAboutBlockRecord(id);
      return res.json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Skill Categories
  const skillCategorySchema = z.object({
    name: z.string().trim().min(1).max(120),
    description: z.string().trim().max(400).optional().default(''),
    icon: z.string().trim().max(60).optional().default('Code2'),
    isVisible: z.boolean().optional().default(true),
  });

  app.post('/api/admin/skill-categories', requireAdmin, async (req, res) => {
    const parsed = skillCategorySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid skill category data' });
    try {
      const created = await createSkillCategoryRecord(parsed.data);
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/skill-categories/reorder', requireAdmin, async (req, res) => {
    const parsed = z.object({ ids: z.array(z.number().int().positive()) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid ordering list' });
    try {
      await reorderRecords(skillCategories, parsed.data.ids);
      return res.json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/skill-categories/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    const parsed = skillCategorySchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid category data' });
    try {
      const updated = await updateSkillCategoryRecord(id, parsed.data);
      if (!updated) return res.status(404).json({ error: 'Category not found' });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/admin/skill-categories/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    try {
      await deleteSkillCategoryRecord(id);
      return res.json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Skills
  const skillSchema = z.object({
    categoryId: z.number().int().positive(),
    name: z.string().trim().min(1).max(100),
    description: z.string().trim().max(300).optional().default(''),
    icon: z.string().trim().max(2048).optional().default('Code2'),
    iconType: z.enum(['lucide', 'image']).optional().default('lucide'),
    isVisible: z.boolean().optional().default(true),
  });

  app.post('/api/admin/skills', requireAdmin, async (req, res) => {
    const parsed = skillSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid skill data' });
    if (parsed.data.iconType === 'image' && !isSafeUrl(parsed.data.icon)) {
      return res.status(400).json({ error: 'Invalid skill icon image URL' });
    }
    try {
      const created = await createSkillRecord(parsed.data);
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/skills/reorder', requireAdmin, async (req, res) => {
    const parsed = z.object({ ids: z.array(z.number().int().positive()) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid ordering list' });
    try {
      await reorderRecords(skills, parsed.data.ids);
      return res.json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/skills/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    const parsed = skillSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid skill data' });
    if (parsed.data.iconType === 'image' && parsed.data.icon && !isSafeUrl(parsed.data.icon)) {
      return res.status(400).json({ error: 'Invalid skill icon image URL' });
    }
    try {
      const updated = await updateSkillRecord(id, parsed.data);
      if (!updated) return res.status(404).json({ error: 'Skill not found' });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/admin/skills/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    try {
      await deleteSkillRecord(id);
      return res.json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Projects
  const projectSchema = z.object({
    title: z.string().trim().min(1, 'Project title is required').max(160),
    subtitle: z.string().trim().max(240).optional().default(''),
    description: z.string().trim().min(1, 'Project description is required').max(4000),
    imageUrl: safeUrlSchema.optional().default(''),
    technologies: z.array(z.string().trim().min(1).max(60)).max(30).optional().default([]),
    features: z.array(z.string().trim().min(1).max(300)).max(30).optional().default([]),
    githubUrl: safeUrlSchema.optional().default(''),
    liveDemoUrl: safeUrlSchema.optional().default(''),
    category: z.string().trim().min(1).max(80).optional().default('Software'),
    status: z.string().trim().min(1).max(60).optional().default('In Progress'),
    isFeatured: z.boolean().optional().default(false),
    isVisible: z.boolean().optional().default(true),
  });

  app.post('/api/admin/projects', requireAdmin, async (req, res) => {
    const parsed = projectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid project data' });
    }
    try {
      const created = await createProjectRecord(parsed.data);
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/projects/reorder', requireAdmin, async (req, res) => {
    const parsed = z.object({ ids: z.array(z.number().int().positive()) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid ordering list' });
    try {
      await reorderRecords(projects, parsed.data.ids);
      return res.json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/projects/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    const parsed = projectSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid project data' });
    }
    try {
      const updated = await updateProjectRecord(id, parsed.data);
      if (!updated) return res.status(404).json({ error: 'Project not found' });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/admin/projects/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    try {
      await deleteProjectRecord(id);
      return res.json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Education
  const educationSchema = z.object({
    collegeName: z.string().trim().min(1).max(200),
    degree: z.string().trim().min(1).max(200),
    branch: z.string().trim().max(200).optional().default(''),
    universityName: z.string().trim().max(200).optional().default(''),
    academicYear: z.string().trim().max(80).optional().default(''),
    currentSemester: z.string().trim().max(80).optional().default(''),
    achievements: z.array(z.string().trim().min(1).max(300)).max(20).optional().default([]),
    description: z.string().trim().max(2500).optional().default(''),
    logoUrl: safeUrlSchema.optional().default(''),
    isVisible: z.boolean().optional().default(true),
  });

  app.post('/api/admin/education', requireAdmin, async (req, res) => {
    const parsed = educationSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid education data' });
    try {
      const created = await createEducationRecord(parsed.data);
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/education/reorder', requireAdmin, async (req, res) => {
    const parsed = z.object({ ids: z.array(z.number().int().positive()) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid ordering list' });
    try {
      await reorderRecords(education, parsed.data.ids);
      return res.json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/education/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    const parsed = educationSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid education data' });
    try {
      const updated = await updateEducationRecord(id, parsed.data);
      if (!updated) return res.status(404).json({ error: 'Education record not found' });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/admin/education/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    try {
      await deleteEducationRecord(id);
      return res.json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Certificates
  const certificateSchema = z.object({
    title: z.string().trim().min(1).max(200),
    issuer: z.string().trim().min(1).max(240),
    badgeType: z.string().trim().max(80).optional().default('CERTIFICATION'),
    issueDate: z.string().trim().max(120).optional().default(''),
    credentialId: z.string().trim().max(120).optional().default(''),
    credentialIdLabel: z.string().trim().max(60).optional().default('Credential ID'),
    scoreBreakdown: z.string().trim().max(300).optional().default(''),
    description: z.string().trim().max(2000).optional().default(''),
    skillTags: z.array(z.string().trim().min(1).max(60)).max(15).optional().default([]),
    actionLabel: z.string().trim().max(80).optional().default(''),
    fileUrl: safeUrlSchema.optional().default(''),
    fileType: z.enum(['image', 'pdf']).optional().default('image'),
    verificationUrl: safeUrlSchema.optional().default(''),
    isVisible: z.boolean().optional().default(true),
  });

  app.post('/api/admin/certificates', requireAdmin, async (req, res) => {
    const parsed = certificateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid certificate data' });
    try {
      const created = await createCertificateRecord(parsed.data);
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/certificates/reorder', requireAdmin, async (req, res) => {
    const parsed = z.object({ ids: z.array(z.number().int().positive()) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid ordering list' });
    try {
      await reorderRecords(certificates, parsed.data.ids);
      return res.json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/certificates/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    const parsed = certificateSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid certificate data' });
    try {
      const updated = await updateCertificateRecord(id, parsed.data);
      if (!updated) return res.status(404).json({ error: 'Certificate not found' });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/admin/certificates/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    try {
      await deleteCertificateRecord(id);
      return res.json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Social Links
  const socialLinkSchema = z.object({
    platform: z.string().trim().min(1).max(80),
    label: z.string().trim().min(1).max(100),
    url: safeUrlSchema.optional().default(''),
    icon: z.string().trim().max(60).optional().default('Link'),
    showInHero: z.boolean().optional().default(true),
    showInContact: z.boolean().optional().default(true),
    isVisible: z.boolean().optional().default(true),
  });

  app.post('/api/admin/social-links', requireAdmin, async (req, res) => {
    const parsed = socialLinkSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid social link data' });
    try {
      const created = await createSocialLinkRecord(parsed.data);
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/social-links/reorder', requireAdmin, async (req, res) => {
    const parsed = z.object({ ids: z.array(z.number().int().positive()) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid ordering list' });
    try {
      await reorderRecords(socialLinks, parsed.data.ids);
      return res.json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/social-links/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    const parsed = socialLinkSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid social link data' });
    try {
      const updated = await updateSocialLinkRecord(id, parsed.data);
      if (!updated) return res.status(404).json({ error: 'Social link not found' });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/admin/social-links/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    try {
      await deleteSocialLinkRecord(id);
      return res.json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Resume
  const resumeSchema = z.object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).optional().default(''),
    fileUrl: safeUrlSchema.optional().default(''),
    fileName: z.string().trim().max(255).optional().default(''),
    fileSize: z.number().int().min(0).optional().default(0),
  });

  app.put('/api/admin/resume', requireAdmin, async (req, res) => {
    const parsed = resumeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid resume data' });
    try {
      const updated = await updateResumeRecord(parsed.data);
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Website Settings
  const settingsSchema = z.object({
    siteTitle: z.string().trim().min(1).max(160).optional(),
    logoText: z.string().trim().min(1).max(80).optional(),
    logoUrl: safeUrlSchema.optional(),
    faviconUrl: safeUrlSchema.optional(),
    defaultTheme: z.enum(['light', 'dark']).optional(),
    accentColor: z.enum(['blue', 'indigo', 'violet', 'cobalt']).optional(),
    navLabels: z.record(z.string(), z.string().max(40)).optional(),
    sectionOrder: z.array(z.string().max(60)).max(30).optional(),
    sectionVisibility: z.record(z.string(), z.boolean()).optional(),
    contactEmail: z
      .string()
      .trim()
      .max(200)
      .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email format')
      .optional(),
    showContactEmail: z.boolean().optional(),
    contactIntro: z.string().trim().max(1000).optional(),
    contactFormEnabled: z.boolean().optional(),
    footerContent: z.string().trim().max(600).optional(),
    copyrightText: z.string().trim().max(300).optional(),
  });

  app.put('/api/admin/settings', requireAdmin, async (req, res) => {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid settings' });
    }
    try {
      const updated = await updateSettingsRecord(parsed.data);
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Contact Messages Inbox
  app.get('/api/admin/messages', requireAdmin, async (_req, res) => {
    try {
      const messages = await getContactMessagesRecords();
      return res.json(messages);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/admin/messages/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    const parsed = z.object({ isRead: z.boolean() }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid status' });
    try {
      const updated = await markContactMessageReadRecord(id, parsed.data.isRead);
      if (!updated) return res.status(404).json({ error: 'Message not found' });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/admin/messages/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    try {
      await deleteContactMessageRecord(id);
      return res.json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Custom Sections (Future Expansion: Internships, Experience, Hackathons, Blog, Awards, Research)
  const customSectionItemSchema = z.object({
    id: z.string().min(1).max(80),
    title: z.string().trim().min(1).max(200),
    subtitle: z.string().trim().max(200).optional().default(''),
    date: z.string().trim().max(80).optional().default(''),
    description: z.string().trim().max(3000).optional().default(''),
    url: safeUrlSchema.optional().default(''),
    tags: z.array(z.string().trim().max(60)).max(15).optional().default([]),
  });

  const customSectionSchema = z.object({
    slug: z
      .string()
      .trim()
      .min(2)
      .max(60)
      .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    title: z.string().trim().min(1).max(160),
    subtitle: z.string().trim().max(400).optional().default(''),
    sectionType: z.enum(['timeline', 'cards', 'articles']).optional().default('cards'),
    items: z.array(customSectionItemSchema).max(50).optional().default([]),
    isVisible: z.boolean().optional().default(true),
  });

  app.post('/api/admin/custom-sections', requireAdmin, async (req, res) => {
    const parsed = customSectionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid section data' });
    }
    try {
      const created = await createCustomSectionRecord(parsed.data);
      return res.status(201).json(created);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/admin/custom-sections/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    const parsed = customSectionSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid section data' });
    }
    try {
      const updated = await updateCustomSectionRecord(id, parsed.data);
      if (!updated) return res.status(404).json({ error: 'Section not found' });
      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/admin/custom-sections/:id', requireAdmin, async (req, res) => {
    const id = parseIdParam(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid ID' });
    try {
      await deleteCustomSectionRecord(id);
      return res.json({ ok: true });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // =========================================================================
  // Frontend Serving (Vite dev middleware in dev, dist/ in production)
  // =========================================================================
  app.use('/videos', express.static(path.resolve(__dirname, 'public/videos')));
  app.use('/certificates', express.static(path.resolve(__dirname, 'public/certificates')));
  app.use('/assets/aistudio', express.static(path.resolve(__dirname, 'public/assets/aistudio')));

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
