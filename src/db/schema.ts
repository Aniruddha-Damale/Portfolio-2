import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  url?: string;
  tags?: string[];
}

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').default('').notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const profile = pgTable('profile', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  title: text('title').notNull(),
  intro: text('intro').notNull(),
  avatarUrl: text('avatar_url').default('').notNull(),
  heroBgStyle: text('hero_bg_style').default('editorial').notNull(),
  heroBgImageUrl: text('hero_bg_image_url').default('').notNull(),
  primaryCtaText: text('primary_cta_text').default('View My Projects').notNull(),
  secondaryCtaText: text('secondary_cta_text').default('Download Resume').notNull(),
  showAvatar: boolean('show_avatar').default(true).notNull(),
  showPrimaryCta: boolean('show_primary_cta').default(true).notNull(),
  showSecondaryCta: boolean('show_secondary_cta').default(true).notNull(),
  showSocialIcons: boolean('show_social_icons').default(true).notNull(),
  showLocation: boolean('show_location').default(false).notNull(),
  location: text('location').default('').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const aboutMe = pgTable('about_me', {
  id: serial('id').primaryKey(),
  heading: text('heading').default('About Me').notNull(),
  subheading: text('subheading').default('').notNull(),
  imageUrl: text('image_url').default('').notNull(),
  showImage: boolean('show_image').default(true).notNull(),
  areasOfInterest: jsonb('areas_of_interest')
    .$type<string[]>()
    .default([
      'Software Development',
      'Web Development',
      'Artificial Intelligence',
      'IoT',
    ])
    .notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const aboutBlocks = pgTable('about_blocks', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const skillCategories = pgTable('skill_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').default('').notNull(),
  icon: text('icon').default('Code2').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id')
    .references(() => skillCategories.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description').default('').notNull(),
  icon: text('icon').default('Code2').notNull(),
  iconType: text('icon_type').default('lucide').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const skillCategoriesRelations = relations(skillCategories, ({ many }) => ({
  skills: many(skills),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
  category: one(skillCategories, {
    fields: [skills.categoryId],
    references: [skillCategories.id],
  }),
}));

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle').default('').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').default('').notNull(),
  technologies: jsonb('technologies').$type<string[]>().default([]).notNull(),
  features: jsonb('features').$type<string[]>().default([]).notNull(),
  githubUrl: text('github_url').default('').notNull(),
  liveDemoUrl: text('live_demo_url').default('').notNull(),
  category: text('category').default('Software').notNull(),
  status: text('status').default('In Progress').notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const education = pgTable('education', {
  id: serial('id').primaryKey(),
  collegeName: text('college_name').notNull(),
  degree: text('degree').notNull(),
  branch: text('branch').default('').notNull(),
  universityName: text('university_name').default('').notNull(),
  academicYear: text('academic_year').default('').notNull(),
  currentSemester: text('current_semester').default('').notNull(),
  achievements: jsonb('achievements').$type<string[]>().default([]).notNull(),
  description: text('description').default('').notNull(),
  logoUrl: text('logo_url').default('').notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const certificates = pgTable('certificates', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  issuer: text('issuer').notNull(),
  badgeType: text('badge_type').default('CERTIFICATION').notNull(),
  issueDate: text('issue_date').default('').notNull(),
  credentialId: text('credential_id').default('').notNull(),
  credentialIdLabel: text('credential_id_label').default('Credential ID').notNull(),
  scoreBreakdown: text('score_breakdown').default('').notNull(),
  description: text('description').default('').notNull(),
  skillTags: jsonb('skill_tags').$type<string[]>().default([]).notNull(),
  actionLabel: text('action_label').default('').notNull(),
  fileUrl: text('file_url').default('').notNull(),
  fileType: text('file_type').default('image').notNull(),
  verificationUrl: text('verification_url').default('').notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const socialLinks = pgTable('social_links', {
  id: serial('id').primaryKey(),
  platform: text('platform').notNull(),
  label: text('label').notNull(),
  url: text('url').default('').notNull(),
  icon: text('icon').default('Link').notNull(),
  showInHero: boolean('show_in_hero').default(true).notNull(),
  showInContact: boolean('show_in_contact').default(true).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
});

export const resume = pgTable('resume', {
  id: serial('id').primaryKey(),
  title: text('title').default('Resume & Curriculum Vitae').notNull(),
  description: text('description')
    .default(
      'View or download my latest resume highlighting academic background, software projects, and technical skills.'
    )
    .notNull(),
  fileUrl: text('file_url').default('').notNull(),
  fileName: text('file_name').default('').notNull(),
  fileSize: integer('file_size').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const websiteSettings = pgTable('website_settings', {
  id: serial('id').primaryKey(),
  siteTitle: text('site_title').default('Developer Portfolio').notNull(),
  logoText: text('logo_text').default('DevPortfolio').notNull(),
  logoUrl: text('logo_url').default('').notNull(),
  faviconUrl: text('favicon_url').default('').notNull(),
  defaultTheme: text('default_theme').default('light').notNull(),
  accentColor: text('accent_color').default('blue').notNull(),
  navLabels: jsonb('nav_labels')
    .$type<Record<string, string>>()
    .default({
      about: 'About',
      skills: 'Skills',
      projects: 'Projects',
      education: 'Education',
      certificates: 'Certificates',
      resume: 'Resume',
      contact: 'Contact',
    })
    .notNull(),
  sectionOrder: jsonb('section_order')
    .$type<string[]>()
    .default([
      'home',
      'about',
      'skills',
      'projects',
      'education',
      'certificates',
      'resume',
      'contact',
    ])
    .notNull(),
  sectionVisibility: jsonb('section_visibility')
    .$type<Record<string, boolean>>()
    .default({
      home: true,
      about: true,
      skills: true,
      projects: true,
      education: true,
      certificates: true,
      resume: true,
      contact: true,
    })
    .notNull(),
  contactEmail: text('contact_email').default('').notNull(),
  showContactEmail: boolean('show_contact_email').default(true).notNull(),
  contactIntro: text('contact_intro')
    .default(
      'Open to software development internships, collaborative projects, and technical discussions.'
    )
    .notNull(),
  contactFormEnabled: boolean('contact_form_enabled').default(true).notNull(),
  footerContent: text('footer_content')
    .default('Built for continuous learning, clean engineering, and thoughtful software.')
    .notNull(),
  copyrightText: text('copyright_text')
    .default('© 2026 Personal Developer Portfolio. All rights reserved.')
    .notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const customSections = pgTable('custom_sections', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  subtitle: text('subtitle').default('').notNull(),
  sectionType: text('section_type').default('cards').notNull(),
  items: jsonb('items').$type<CustomSectionItem[]>().default([]).notNull(),
  isVisible: boolean('is_visible').default(true).notNull(),
  sortOrder: integer('sort_order').default(100).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const uploadedFiles = pgTable('uploaded_files', {
  id: serial('id').primaryKey(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  category: text('category').default('general').notNull(),
  dataBase64: text('data_base64').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
