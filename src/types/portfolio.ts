export interface ProfileData {
  id: number;
  fullName: string;
  title: string;
  intro: string;
  avatarUrl: string;
  heroBgStyle: string;
  heroBgImageUrl: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  showAvatar: boolean;
  showPrimaryCta: boolean;
  showSecondaryCta: boolean;
  showSocialIcons: boolean;
  showLocation: boolean;
  location: string;
  updatedAt?: string;
}

export interface AboutBlockData {
  id: number;
  title: string;
  content: string;
  sortOrder: number;
  isVisible: boolean;
}

export interface AboutMeData {
  id: number;
  heading: string;
  subheading: string;
  imageUrl: string;
  showImage: boolean;
  areasOfInterest: string[];
  blocks: AboutBlockData[];
}

export interface SkillItemData {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  icon: string;
  iconType: 'lucide' | 'image';
  sortOrder: number;
  isVisible: boolean;
}

export interface SkillCategoryData {
  id: number;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  isVisible: boolean;
  skills: SkillItemData[];
}

export interface ProjectData {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  technologies: string[];
  features: string[];
  githubUrl: string;
  liveDemoUrl: string;
  category: string;
  status: string;
  isFeatured: boolean;
  isVisible: boolean;
  sortOrder: number;
}

export interface EducationData {
  id: number;
  collegeName: string;
  degree: string;
  branch: string;
  universityName: string;
  academicYear: string;
  currentSemester: string;
  achievements: string[];
  description: string;
  logoUrl: string;
  isVisible: boolean;
  sortOrder: number;
}

export interface CertificateData {
  id: number;
  title: string;
  issuer: string;
  badgeType: string;
  issueDate: string;
  credentialId: string;
  credentialIdLabel: string;
  scoreBreakdown: string;
  description: string;
  skillTags: string[];
  actionLabel: string;
  fileUrl: string;
  fileType: 'image' | 'pdf';
  verificationUrl: string;
  isVisible: boolean;
  sortOrder: number;
}

export interface SocialLinkData {
  id: number;
  platform: string;
  label: string;
  url: string;
  icon: string;
  showInHero: boolean;
  showInContact: boolean;
  isVisible: boolean;
  sortOrder: number;
}

export interface ResumeData {
  id: number;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  updatedAt?: string;
}

export interface WebsiteSettingsData {
  id: number;
  siteTitle: string;
  logoText: string;
  logoUrl: string;
  faviconUrl: string;
  defaultTheme: 'light' | 'dark';
  accentColor: 'blue' | 'indigo' | 'violet' | 'cobalt';
  navLabels: Record<string, string>;
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
  contactEmail: string;
  showContactEmail: boolean;
  contactIntro: string;
  contactFormEnabled: boolean;
  footerContent: string;
  copyrightText: string;
}

export interface ContactMessageData {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface CustomSectionItemData {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  url?: string;
  tags?: string[];
}

export interface CustomSectionData {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  sectionType: 'timeline' | 'cards' | 'articles';
  items: CustomSectionItemData[];
  isVisible: boolean;
  sortOrder: number;
}

export interface PortfolioPayload {
  profile: ProfileData;
  about: AboutMeData;
  skillCategories: SkillCategoryData[];
  projects: ProjectData[];
  education: EducationData[];
  certificates: CertificateData[];
  socialLinks: SocialLinkData[];
  resume: ResumeData;
  settings: WebsiteSettingsData;
  customSections: CustomSectionData[];
}

export interface AuthUserInfo {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
}
