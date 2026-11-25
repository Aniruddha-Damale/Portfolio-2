import { asc, desc, eq } from 'drizzle-orm';
import { db } from './index.ts';
import {
  aboutBlocks,
  aboutMe,
  certificates,
  contactMessages,
  customSections,
  education,
  profile,
  projects,
  resume,
  skillCategories,
  skills,
  socialLinks,
  uploadedFiles,
  websiteSettings,
  type CustomSectionItem,
} from './schema.ts';

let seedPromise: Promise<void> | null = null;

async function ensureSeededInternal() {
  const existingProfile = await db.select({ id: profile.id }).from(profile).limit(1);
  if (existingProfile.length === 0) {
    await db.insert(profile).values({
      fullName: 'ANIRUDDHA DAMALE',
      title: 'Computer Engineering Student • Full Stack Developer • Android App Developer • Builder',
      intro:
        'Building practical software solutions that bridge modern web architectures, mobile apps, and real-world problem solving.',
      avatarUrl: '',
      heroBgStyle: 'editorial',
      heroBgImageUrl: '',
      primaryCtaText: 'View Projects',
      secondaryCtaText: 'Download Resume',
      showAvatar: false,
      showPrimaryCta: true,
      showSecondaryCta: true,
      showSocialIcons: true,
      showLocation: true,
      location: 'Pune, Maharashtra, India',
    });
  }

  const existingAbout = await db.select({ id: aboutMe.id }).from(aboutMe).limit(1);
  if (existingAbout.length === 0) {
    await db.insert(aboutMe).values({
      heading: 'Engineering software from algorithms to mobile builds',
      subheading:
        'Clean Architecture • Algorithmic Efficiency • Cross-Platform Web & Android Delivery',
      imageUrl: '',
      showImage: false,
      areasOfInterest: [
        'Clean Architecture',
        'Algorithmic Efficiency',
        'Full Stack Web Development',
        'Cross-Platform Android Delivery',
      ],
    });
  }

  const existingBlocks = await db.select({ id: aboutBlocks.id }).from(aboutBlocks).limit(1);
  if (existingBlocks.length === 0) {
    await db.insert(aboutBlocks).values([
      {
        title: 'Academic & Engineering Focus',
        content:
          'I am a Second-Year Bachelor of Technology (SY B.Tech) Computer Engineering student based in Pune, Maharashtra, focused on turning foundational computer science theory into dependable, user-facing software.',
        sortOrder: 0,
        isVisible: true,
      },
      {
        title: 'Systems & Full-Stack Foundations',
        content:
          'My technical interests span Data Structures & Algorithms, Software Systems Architecture, and modern Full Stack Web Development using React, Vite, and Node.js.',
        sortOrder: 1,
        isVisible: true,
      },
      {
        title: 'Cross-Platform Web & Android Builds',
        content:
          'Beyond browser interfaces, I build cross-platform mobile experiences packaged into installable Android APKs via Capacitor—bridging clean responsive design, edge/cloud telemetry visualization, and practical daily-use applications like SmartCity 360 and SaveIQ.',
        sortOrder: 2,
        isVisible: true,
      },
    ]);
  }

  const existingCats = await db.select({ id: skillCategories.id }).from(skillCategories).limit(1);
  if (existingCats.length === 0) {
    const [langCat, webCat, toolsCat, conceptsCat] = await db
      .insert(skillCategories)
      .values([
        {
          name: 'Languages',
          description: 'Systems programming, web scripting, and low-level architecture',
          icon: 'Code2',
          sortOrder: 0,
          isVisible: true,
        },
        {
          name: 'Web & Mobile Frameworks',
          description: 'Full-stack interfaces and cross-platform Android packaging',
          icon: 'Layers',
          sortOrder: 1,
          isVisible: true,
        },
        {
          name: 'Developer Tools',
          description: 'Daily engineering environment, compilers, and deployment platforms',
          icon: 'Wrench',
          sortOrder: 2,
          isVisible: true,
        },
        {
          name: 'Core Concepts',
          description: 'Foundational computer science principles driving reliable software',
          icon: 'Cpu',
          sortOrder: 3,
          isVisible: true,
        },
      ])
      .returning();

    await db.insert(skills).values([
      { categoryId: langCat.id, name: 'C', description: 'Pointers, memory & core procedural systems', icon: 'Cpu', iconType: 'lucide', sortOrder: 0, isVisible: true },
      { categoryId: langCat.id, name: 'C++', description: 'OOP, STL & competitive problem solving', icon: 'Binary', iconType: 'lucide', sortOrder: 1, isVisible: true },
      { categoryId: langCat.id, name: 'JavaScript', description: 'ES6+, async flows & DOM architecture', icon: 'Braces', iconType: 'lucide', sortOrder: 2, isVisible: true },
      { categoryId: langCat.id, name: 'HTML5', description: 'Semantic markup & accessible layouts', icon: 'Code2', iconType: 'lucide', sortOrder: 3, isVisible: true },
      { categoryId: langCat.id, name: 'CSS3', description: 'Responsive grids, Flexbox & motion', icon: 'Palette', iconType: 'lucide', sortOrder: 4, isVisible: true },

      { categoryId: webCat.id, name: 'React', description: 'Hooks, modular state & component trees', icon: 'Layers', iconType: 'lucide', sortOrder: 0, isVisible: true },
      { categoryId: webCat.id, name: 'Vite', description: 'Fast HMR bundling & optimized builds', icon: 'Sparkles', iconType: 'lucide', sortOrder: 1, isVisible: true },
      { categoryId: webCat.id, name: 'Node.js', description: 'REST endpoints & server-side runtime', icon: 'Server', iconType: 'lucide', sortOrder: 2, isVisible: true },
      { categoryId: webCat.id, name: 'Capacitor / Android APK Builds', description: 'Native Android bridge & APK packaging', icon: 'Smartphone', iconType: 'lucide', sortOrder: 3, isVisible: true },
      { categoryId: webCat.id, name: 'Responsive UI/UX', description: 'Mobile-first & desktop-grade ergonomics', icon: 'Globe', iconType: 'lucide', sortOrder: 4, isVisible: true },

      { categoryId: toolsCat.id, name: 'VS Code', description: 'Primary editor, debugging & extensions', icon: 'Laptop', iconType: 'lucide', sortOrder: 0, isVisible: true },
      { categoryId: toolsCat.id, name: 'MinGW / GCC', description: 'Local C/C++ compilation & profiling', icon: 'Terminal', iconType: 'lucide', sortOrder: 1, isVisible: true },
      { categoryId: toolsCat.id, name: 'Git & GitHub', description: 'Branching, commits & code reviews', icon: 'GitBranch', iconType: 'lucide', sortOrder: 2, isVisible: true },
      { categoryId: toolsCat.id, name: 'GitHub Pages', description: 'Static web hosting & live demos', icon: 'Globe', iconType: 'lucide', sortOrder: 3, isVisible: true },
      { categoryId: toolsCat.id, name: 'Google AI Studio', description: 'Rapid prototyping & workflow automation', icon: 'Sparkles', iconType: 'lucide', sortOrder: 4, isVisible: true },
      { categoryId: toolsCat.id, name: 'Antigravity IDE', description: 'Modern agentic development workflow', icon: 'FileCode2', iconType: 'lucide', sortOrder: 5, isVisible: true },

      { categoryId: conceptsCat.id, name: 'Data Structures & Algorithms', description: 'Optimal storage, traversal & problem modeling', icon: 'Binary', iconType: 'lucide', sortOrder: 0, isVisible: true },
      { categoryId: conceptsCat.id, name: 'Time Complexity Analysis', description: 'Big-O asymptotic performance evaluation', icon: 'Cpu', iconType: 'lucide', sortOrder: 1, isVisible: true },
      { categoryId: conceptsCat.id, name: 'Object-Oriented Programming', description: 'Encapsulation, polymorphism & clean abstractions', icon: 'Layers', iconType: 'lucide', sortOrder: 2, isVisible: true },
      { categoryId: conceptsCat.id, name: 'Cloud & Edge Computing', description: 'Telemetry routing, APIs & distributed nodes', icon: 'Cloud', iconType: 'lucide', sortOrder: 3, isVisible: true },
    ]);
  }

  const existingProjects = await db.select({ id: projects.id }).from(projects).limit(1);
  if (existingProjects.length === 0) {
    await db.insert(projects).values([
      {
        title: 'SmartCity 360',
        subtitle: 'Urban Telemetry & Real-Time Monitoring Platform',
        description:
          'Interactive smart city dashboard visualizing live urban traffic telemetry, environmental sensors, air quality metrics, and critical civic alerts across city sectors.',
        imageUrl: '/src/assets/images/project_smartcity_360_1795364448450.jpg',
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'GitHub Pages'],
        features: [
          'Interactive City Dashboard',
          'Real-Time Sensor & Edge/Cloud Data Visualization',
          'Responsive Modern UI',
          'Live Public Deployment',
        ],
        githubUrl: 'https://github.com/Aniruddha-Damale/smartcity-360',
        liveDemoUrl: 'https://aniruddha-damale.github.io/smartcity-360/',
        category: 'Featured Web Application',
        status: 'Live Deployed',
        isFeatured: true,
        isVisible: true,
        sortOrder: 0,
      },
      {
        title: 'SaveIQ',
        subtitle: 'Smart Personal Finance & Expense Tracking App',
        description:
          'Cross-platform web and Android application built to simplify expense tracking, budgeting, and financial insights, packaged as a native Android APK.',
        imageUrl: '/src/assets/images/project_saveiq_ai_1795364450041.jpg',
        technologies: ['Vite', 'Node.js', 'Capacitor', 'Android APK', 'GitHub'],
        features: [
          'Cross-Platform Web & Android APK Support',
          'Smart Expense Categorization',
          'Secure API & Environment Architecture',
          'Clean Mobile-First Interface',
        ],
        githubUrl: 'https://github.com/Aniruddha-Damale/SaveIQ',
        liveDemoUrl: 'https://save-iq-topaz.vercel.app/',
        category: 'Full-Stack Web & Android Application',
        status: 'Live Deployed',
        isFeatured: true,
        isVisible: true,
        sortOrder: 1,
      },
    ]);
  }

  const existingEducation = await db.select({ id: education.id }).from(education).limit(1);
  if (existingEducation.length === 0) {
    await db.insert(education).values([
      {
        collegeName: 'Pune, Maharashtra, India',
        degree: 'Bachelor of Technology (B.Tech) in Computer Engineering',
        branch: 'Currently in Second Year (SY B.Tech)',
        universityName: 'Undergraduate Degree',
        academicYear: '2025 – 2029 (Expected)',
        currentSemester: 'SY B.Tech',
        achievements: [
          '01. Data Structures & Algorithms — Trees, graphs, dynamic programming, sorting/searching, and asymptotic time-space complexity.',
          '02. Discrete Mathematics — Graph theory, combinatorics, formal logic, recurrence relations, and algebraic structures.',
          '03. Object-Oriented Programming & Systems Design — Modular architecture, abstraction, clean code principles, and scalable application patterns.',
          '04. Hands-On Software Engineering Projects — End-to-end architecture, modular codebases, version control, and live production deployments.',
        ],
        description:
          'Pursuing core computer science and systems engineering fundamentals while translating classroom theory into deployed web applications and native Android builds.',
        logoUrl: '',
        isVisible: true,
        sortOrder: 0,
      },
    ]);
  }

  const existingCustom = await db.select({ id: customSections.id }).from(customSections).limit(1);
  if (existingCustom.length === 0) {
    await db.insert(customSections).values([
      {
        slug: 'experience',
        title: 'Hands-On Engineering & Rapid Prototyping',
        subtitle: 'EXPERIENCE & ACTIVITIES',
        sectionType: 'timeline',
        isVisible: true,
        sortOrder: 0,
        items: [
          {
            id: 'exp-1',
            title: 'Independent Full-Stack & Android Developer',
            subtitle: 'Self-Directed Product Engineering · Pune, India',
            date: '2025 – PRESENT',
            description:
              'Designing, building, and shipping production-ready web dashboards and cross-platform Android applications from initial wireframes to public release.',
            tags: [
              'End-to-end software architecture covering semantic frontend interfaces and Node.js API integrations.',
              'UI/UX design tailored for both desktop telemetry consoles and mobile-first personal finance workflows.',
              'Native Android APK packaging and testing via Capacitor bridge tooling.',
              'Automated static deployment and continuous version delivery through GitHub & GitHub Pages.',
            ],
          },
          {
            id: 'exp-2',
            title: 'Hackathon & Technical Builder',
            subtitle: 'Collegiate & Open Engineering Initiatives · Pune, Maharashtra',
            date: '2025 – PRESENT',
            description:
              'Rapidly prototyping civic-tech and consumer utility software under tight engineering timelines with a focus on real-world applicability.',
            tags: [
              'Rapid prototyping from problem statement to working live demo within 24–48 hour build sprints.',
              'System architecture planning integrating edge/cloud data visualization models and responsive web views.',
              'Collaborative Git workflows, clean code structuring, and live technical pitch demonstrations.',
            ],
          },
        ],
      },
    ]);
  }

  const existingCertificates = await db.select({ id: certificates.id }).from(certificates).limit(1);
  if (existingCertificates.length === 0) {
    await db.insert(certificates).values([
      {
        title: 'AI Specialist – BFSI Virtual Internship',
        issuer: 'SmartBridge & Nasscom FutureSkills Prime (Digital Skilling Initiative)',
        badgeType: 'VIRTUAL INTERNSHIP',
        issueDate: 'Aug 24, 2026 – Sep 26, 2026 (Issued: Nov 4, 2026)',
        credentialId: 'VIP-BFSI-2026-0228',
        credentialIdLabel: 'Credential ID',
        scoreBreakdown: '',
        description:
          'Completed an industry-integrated virtual internship program with hands-on exposure to AI in Financial Services, Risk & Fraud Detection, Data Analytics for BFSI, and Insurance Workflows.',
        skillTags: [
          'AI in Finance',
          'Risk & Fraud Detection',
          'BFSI Analytics',
          'Insurance Workflows',
        ],
        actionLabel: '',
        fileUrl: '/certificates/nasscom-bfsi-ai-specialist.pdf',
        fileType: 'pdf',
        verificationUrl: '',
        isVisible: true,
        sortOrder: 0,
      },
      {
        title: 'Generative AI Content Creation',
        issuer: 'Adobe (via Coursera)',
        badgeType: 'COURSE CERTIFICATE',
        issueDate: 'November 1, 2025',
        credentialId: 'RIGZDFJGIHGN',
        credentialIdLabel: 'Credential ID',
        scoreBreakdown: '',
        description:
          'Authorized online course by Adobe covering generative AI workflows, creative content generation, and AI-assisted digital media production.',
        skillTags: ['Generative AI', 'Adobe AI Workflows', 'Content Creation'],
        actionLabel: 'Verify on Coursera',
        fileUrl: '/certificates/adobe-coursera-generative-ai.pdf',
        fileType: 'pdf',
        verificationUrl: 'https://coursera.org/verify/RIGZDFJGIHGN',
        isVisible: true,
        sortOrder: 1,
      },
      {
        title: 'Bajaj Manufacturing Systems – Employability Skills (BMS-ES)',
        issuer: 'Bajaj Auto Ltd. (CSR Initiative)',
        badgeType: 'INDUSTRY PROGRAM',
        issueDate: 'August 26, 2026',
        credentialId: '555464-37-2026-08-26',
        credentialIdLabel: 'Credential ID',
        scoreBreakdown: '',
        description:
          "Certificate of Appreciation awarded for completing Bajaj Auto's structured employability skills and manufacturing systems training program.",
        skillTags: ['Manufacturing Systems', 'Employability Skills', 'Industry Readiness'],
        actionLabel: '',
        fileUrl: '/certificates/bajaj-bms-employability-skills.pdf',
        fileType: 'pdf',
        verificationUrl: '',
        isVisible: true,
        sortOrder: 2,
      },
      {
        title: 'Urban Sociology (NPTEL Online Certification)',
        issuer: 'Indian Institute of Technology (IIT) Kharagpur • NPTEL / SWAYAM (MoE, Govt. of India)',
        badgeType: 'IIT KHARAGPUR • 2 CREDITS',
        issueDate: 'Aug – Sep 2026 (4-Week Course)',
        credentialId: 'NPTEL26HS23451262701743',
        credentialIdLabel: 'Roll No',
        scoreBreakdown:
          'Consolidated Score: 58% (Online Assignments: 22.5/25 | Proctored Exam: 35.25/75)',
        description:
          'Completed a 4-week proctored NPTEL certification course offered by IIT Kharagpur examining urban systems, civic infrastructure, and societal dynamics.',
        skillTags: ['Urban Systems', 'Civic Infrastructure', 'IIT Kharagpur'],
        actionLabel: '',
        fileUrl: '/certificates/nptel-iit-kgp-urban-sociology.pdf',
        fileType: 'pdf',
        verificationUrl: '',
        isVisible: true,
        sortOrder: 3,
      },
    ]);
  }

  const existingSocials = await db.select({ id: socialLinks.id }).from(socialLinks).limit(1);
  if (existingSocials.length === 0) {
    await db.insert(socialLinks).values([
      {
        platform: 'GitHub',
        label: 'GitHub',
        url: 'https://github.com/Aniruddha-Damale',
        icon: 'Github',
        showInHero: true,
        showInContact: true,
        isVisible: true,
        sortOrder: 0,
      },
      {
        platform: 'LinkedIn',
        label: 'LinkedIn',
        url: 'https://www.linkedin.com/in/aniruddha-damale-73707a3ba?utm_source=share_via&utm_content=profile&utm_medium=member_android',
        icon: 'Linkedin',
        showInHero: true,
        showInContact: true,
        isVisible: true,
        sortOrder: 1,
      },
      {
        platform: 'Email',
        label: 'Email',
        url: 'mailto:aniruddhann11@gmail.com',
        icon: 'Mail',
        showInHero: true,
        showInContact: true,
        isVisible: true,
        sortOrder: 2,
      },
    ]);
  }

  const existingResume = await db.select({ id: resume.id }).from(resume).limit(1);
  if (existingResume.length === 0) {
    await db.insert(resume).values({
      title: 'Resume & Curriculum Vitae',
      description:
        'Review my SY B.Tech Computer Engineering profile, full-stack web & Android projects, and technical stack. Upload or replace a PDF resume anytime in the Admin Dashboard.',
      fileUrl: '',
      fileName: '',
      fileSize: 0,
    });
  }

  const existingSettings = await db.select({ id: websiteSettings.id }).from(websiteSettings).limit(1);
  if (existingSettings.length === 0) {
    await db.insert(websiteSettings).values({
      siteTitle: 'ANIRUDDHA DAMALE — Developer Portfolio',
      logoText: 'ANIRUDDHA PORTFOLIO',
      logoUrl: '',
      faviconUrl: '',
      defaultTheme: 'dark',
      accentColor: 'blue',
      navLabels: {
        about: 'About',
        skills: 'Skills',
        projects: 'Projects',
        education: 'Education',
        certificates: 'Certificates',
        resume: 'Resume',
        contact: 'Contact',
      },
      sectionOrder: [
        'home',
        'about',
        'education',
        'skills',
        'projects',
        'certificates',
        'resume',
        'contact',
      ],
      sectionVisibility: {
        home: true,
        about: true,
        skills: true,
        projects: true,
        education: true,
        certificates: true,
        resume: true,
        contact: true,
      },
      contactEmail: 'aniruddhann11@gmail.com',
      showContactEmail: true,
      contactIntro:
        'Open to software engineering internships, collaborative web or Android builds, and technical hackathon teams.',
      contactFormEnabled: true,
      footerContent: 'Built in Pune, India.',
      copyrightText: '© 2026 ANIRUDDHA DAMALE. Built in Pune, India.',
    });
  }
}

export async function ensureSeeded() {
  if (!seedPromise) {
    seedPromise = ensureSeededInternal().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  await seedPromise;
}

export async function getFullPortfolio(includeHidden = false) {
  try {
    await ensureSeeded();

    const [
      profileRows,
      aboutRows,
      blockRows,
      catRows,
      skillRows,
      projectRows,
      educationRows,
      certRows,
      socialRows,
      resumeRows,
      settingsRows,
      customSectionRows,
    ] = await Promise.all([
      db.select().from(profile).orderBy(asc(profile.id)).limit(1),
      db.select().from(aboutMe).orderBy(asc(aboutMe.id)).limit(1),
      db.select().from(aboutBlocks).orderBy(asc(aboutBlocks.sortOrder), asc(aboutBlocks.id)),
      db.select().from(skillCategories).orderBy(asc(skillCategories.sortOrder), asc(skillCategories.id)),
      db.select().from(skills).orderBy(asc(skills.sortOrder), asc(skills.id)),
      db.select().from(projects).orderBy(asc(projects.sortOrder), asc(projects.id)),
      db.select().from(education).orderBy(asc(education.sortOrder), asc(education.id)),
      db.select().from(certificates).orderBy(asc(certificates.sortOrder), asc(certificates.id)),
      db.select().from(socialLinks).orderBy(asc(socialLinks.sortOrder), asc(socialLinks.id)),
      db.select().from(resume).orderBy(asc(resume.id)).limit(1),
      db.select().from(websiteSettings).orderBy(asc(websiteSettings.id)).limit(1),
      db.select().from(customSections).orderBy(asc(customSections.sortOrder), asc(customSections.id)),
    ]);

    const filteredBlocks = includeHidden ? blockRows : blockRows.filter((b) => b.isVisible);
    const filteredCategories = (includeHidden ? catRows : catRows.filter((c) => c.isVisible)).map(
      (cat) => ({
        ...cat,
        skills: skillRows
          .filter((s) => s.categoryId === cat.id && (includeHidden || s.isVisible))
          .map((s) => ({
            ...s,
            iconType: (s.iconType === 'image' ? 'image' : 'lucide') as 'lucide' | 'image',
          })),
      })
    );

    const filteredProjects = includeHidden ? projectRows : projectRows.filter((p) => p.isVisible);
    const filteredEducation = includeHidden ? educationRows : educationRows.filter((e) => e.isVisible);
    const filteredCertificates = (includeHidden ? certRows : certRows.filter((c) => c.isVisible)).map(
      (c) => ({
        ...c,
        fileType: (c.fileType === 'pdf' ? 'pdf' : 'image') as 'image' | 'pdf',
      })
    );
    const filteredSocials = includeHidden ? socialRows : socialRows.filter((s) => s.isVisible);
    const filteredCustom = (
      includeHidden ? customSectionRows : customSectionRows.filter((cs) => cs.isVisible)
    ).map((cs) => ({
      ...cs,
      sectionType: (['timeline', 'cards', 'articles'].includes(cs.sectionType)
        ? cs.sectionType
        : 'cards') as 'timeline' | 'cards' | 'articles',
    }));

    return {
      profile: profileRows[0],
      about: {
        ...aboutRows[0],
        blocks: filteredBlocks,
      },
      skillCategories: filteredCategories,
      projects: filteredProjects,
      education: filteredEducation,
      certificates: filteredCertificates,
      socialLinks: filteredSocials,
      resume: resumeRows[0],
      settings: settingsRows[0],
      customSections: filteredCustom,
    };
  } catch (error) {
    console.error('Failed to load portfolio from database:', error);
    throw new Error('Unable to load portfolio data. Please try again shortly.', { cause: error });
  }
}

export async function updateProfileRecord(data: Partial<typeof profile.$inferInsert>) {
  try {
    await ensureSeeded();
    const existing = await db.select({ id: profile.id }).from(profile).orderBy(asc(profile.id)).limit(1);
    const updated = await db
      .update(profile)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profile.id, existing[0].id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw new Error('Unable to save profile changes.', { cause: error });
  }
}

export async function updateAboutRecord(data: Partial<typeof aboutMe.$inferInsert>) {
  try {
    await ensureSeeded();
    const existing = await db.select({ id: aboutMe.id }).from(aboutMe).orderBy(asc(aboutMe.id)).limit(1);
    const updated = await db
      .update(aboutMe)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aboutMe.id, existing[0].id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Failed to update about section:', error);
    throw new Error('Unable to save About Me changes.', { cause: error });
  }
}

export async function createAboutBlockRecord(data: typeof aboutBlocks.$inferInsert) {
  try {
    const existing = await db.select({ id: aboutBlocks.id }).from(aboutBlocks);
    const inserted = await db
      .insert(aboutBlocks)
      .values({ ...data, sortOrder: data.sortOrder ?? existing.length })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Failed to create about block:', error);
    throw new Error('Unable to add About Me block.', { cause: error });
  }
}

export async function updateAboutBlockRecord(id: number, data: Partial<typeof aboutBlocks.$inferInsert>) {
  try {
    const updated = await db.update(aboutBlocks).set(data).where(eq(aboutBlocks.id, id)).returning();
    return updated[0] ?? null;
  } catch (error) {
    console.error('Failed to update about block:', error);
    throw new Error('Unable to update About Me block.', { cause: error });
  }
}

export async function deleteAboutBlockRecord(id: number) {
  try {
    await db.delete(aboutBlocks).where(eq(aboutBlocks.id, id));
  } catch (error) {
    console.error('Failed to delete about block:', error);
    throw new Error('Unable to delete About Me block.', { cause: error });
  }
}

export async function reorderRecords(
  table:
    | typeof aboutBlocks
    | typeof skillCategories
    | typeof skills
    | typeof projects
    | typeof education
    | typeof certificates
    | typeof socialLinks,
  orderedIds: number[]
) {
  try {
    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.update(table).set({ sortOrder: i }).where(eq(table.id, orderedIds[i]));
      }
    });
  } catch (error) {
    console.error('Failed to reorder records:', error);
    throw new Error('Unable to save new ordering.', { cause: error });
  }
}

export async function createSkillCategoryRecord(data: typeof skillCategories.$inferInsert) {
  try {
    const existing = await db.select({ id: skillCategories.id }).from(skillCategories);
    const inserted = await db
      .insert(skillCategories)
      .values({ ...data, sortOrder: data.sortOrder ?? existing.length })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Failed to create skill category:', error);
    throw new Error('Unable to create skill category.', { cause: error });
  }
}

export async function updateSkillCategoryRecord(
  id: number,
  data: Partial<typeof skillCategories.$inferInsert>
) {
  try {
    const updated = await db
      .update(skillCategories)
      .set(data)
      .where(eq(skillCategories.id, id))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    console.error('Failed to update skill category:', error);
    throw new Error('Unable to update skill category.', { cause: error });
  }
}

export async function deleteSkillCategoryRecord(id: number) {
  try {
    await db.delete(skillCategories).where(eq(skillCategories.id, id));
  } catch (error) {
    console.error('Failed to delete skill category:', error);
    throw new Error('Unable to delete skill category.', { cause: error });
  }
}

export async function createSkillRecord(data: typeof skills.$inferInsert) {
  try {
    const existing = await db
      .select({ id: skills.id })
      .from(skills)
      .where(eq(skills.categoryId, data.categoryId));
    const inserted = await db
      .insert(skills)
      .values({ ...data, sortOrder: data.sortOrder ?? existing.length })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Failed to create skill:', error);
    throw new Error('Unable to add skill.', { cause: error });
  }
}

export async function updateSkillRecord(id: number, data: Partial<typeof skills.$inferInsert>) {
  try {
    const updated = await db.update(skills).set(data).where(eq(skills.id, id)).returning();
    return updated[0] ?? null;
  } catch (error) {
    console.error('Failed to update skill:', error);
    throw new Error('Unable to update skill.', { cause: error });
  }
}

export async function deleteSkillRecord(id: number) {
  try {
    await db.delete(skills).where(eq(skills.id, id));
  } catch (error) {
    console.error('Failed to delete skill:', error);
    throw new Error('Unable to delete skill.', { cause: error });
  }
}

export async function createProjectRecord(data: typeof projects.$inferInsert) {
  try {
    const existing = await db.select({ id: projects.id }).from(projects);
    const inserted = await db
      .insert(projects)
      .values({ ...data, sortOrder: data.sortOrder ?? existing.length })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Failed to create project:', error);
    throw new Error('Unable to create project.', { cause: error });
  }
}

export async function updateProjectRecord(id: number, data: Partial<typeof projects.$inferInsert>) {
  try {
    const updated = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    console.error('Failed to update project:', error);
    throw new Error('Unable to update project.', { cause: error });
  }
}

export async function deleteProjectRecord(id: number) {
  try {
    await db.delete(projects).where(eq(projects.id, id));
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw new Error('Unable to delete project.', { cause: error });
  }
}

export async function createEducationRecord(data: typeof education.$inferInsert) {
  try {
    const existing = await db.select({ id: education.id }).from(education);
    const inserted = await db
      .insert(education)
      .values({ ...data, sortOrder: data.sortOrder ?? existing.length })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Failed to create education entry:', error);
    throw new Error('Unable to add education entry.', { cause: error });
  }
}

export async function updateEducationRecord(id: number, data: Partial<typeof education.$inferInsert>) {
  try {
    const updated = await db.update(education).set(data).where(eq(education.id, id)).returning();
    return updated[0] ?? null;
  } catch (error) {
    console.error('Failed to update education entry:', error);
    throw new Error('Unable to update education entry.', { cause: error });
  }
}

export async function deleteEducationRecord(id: number) {
  try {
    await db.delete(education).where(eq(education.id, id));
  } catch (error) {
    console.error('Failed to delete education entry:', error);
    throw new Error('Unable to delete education entry.', { cause: error });
  }
}

export async function createCertificateRecord(data: typeof certificates.$inferInsert) {
  try {
    const existing = await db.select({ id: certificates.id }).from(certificates);
    const inserted = await db
      .insert(certificates)
      .values({ ...data, sortOrder: data.sortOrder ?? existing.length })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Failed to create certificate:', error);
    throw new Error('Unable to add certificate.', { cause: error });
  }
}

export async function updateCertificateRecord(
  id: number,
  data: Partial<typeof certificates.$inferInsert>
) {
  try {
    const updated = await db
      .update(certificates)
      .set(data)
      .where(eq(certificates.id, id))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    console.error('Failed to update certificate:', error);
    throw new Error('Unable to update certificate.', { cause: error });
  }
}

export async function deleteCertificateRecord(id: number) {
  try {
    await db.delete(certificates).where(eq(certificates.id, id));
  } catch (error) {
    console.error('Failed to delete certificate:', error);
    throw new Error('Unable to delete certificate.', { cause: error });
  }
}

export async function createSocialLinkRecord(data: typeof socialLinks.$inferInsert) {
  try {
    const existing = await db.select({ id: socialLinks.id }).from(socialLinks);
    const inserted = await db
      .insert(socialLinks)
      .values({ ...data, sortOrder: data.sortOrder ?? existing.length })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Failed to create social link:', error);
    throw new Error('Unable to add social link.', { cause: error });
  }
}

export async function updateSocialLinkRecord(
  id: number,
  data: Partial<typeof socialLinks.$inferInsert>
) {
  try {
    const updated = await db
      .update(socialLinks)
      .set(data)
      .where(eq(socialLinks.id, id))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    console.error('Failed to update social link:', error);
    throw new Error('Unable to update social link.', { cause: error });
  }
}

export async function deleteSocialLinkRecord(id: number) {
  try {
    await db.delete(socialLinks).where(eq(socialLinks.id, id));
  } catch (error) {
    console.error('Failed to delete social link:', error);
    throw new Error('Unable to delete social link.', { cause: error });
  }
}

export async function updateResumeRecord(data: Partial<typeof resume.$inferInsert>) {
  try {
    await ensureSeeded();
    const existing = await db.select({ id: resume.id }).from(resume).orderBy(asc(resume.id)).limit(1);
    const updated = await db
      .update(resume)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(resume.id, existing[0].id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Failed to update resume:', error);
    throw new Error('Unable to update resume details.', { cause: error });
  }
}

export async function updateSettingsRecord(data: Partial<typeof websiteSettings.$inferInsert>) {
  try {
    await ensureSeeded();
    const existing = await db
      .select({ id: websiteSettings.id })
      .from(websiteSettings)
      .orderBy(asc(websiteSettings.id))
      .limit(1);
    const updated = await db
      .update(websiteSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(websiteSettings.id, existing[0].id))
      .returning();
    return updated[0];
  } catch (error) {
    console.error('Failed to update website settings:', error);
    throw new Error('Unable to save website settings.', { cause: error });
  }
}

export async function createContactMessageRecord(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    const inserted = await db.insert(contactMessages).values(data).returning();
    return inserted[0];
  } catch (error) {
    console.error('Failed to save contact message:', error);
    throw new Error('Unable to send message right now. Please try again later.', { cause: error });
  }
}

export async function getContactMessagesRecords() {
  try {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  } catch (error) {
    console.error('Failed to list contact messages:', error);
    throw new Error('Unable to fetch contact messages.', { cause: error });
  }
}

export async function markContactMessageReadRecord(id: number, isRead: boolean) {
  try {
    const updated = await db
      .update(contactMessages)
      .set({ isRead })
      .where(eq(contactMessages.id, id))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    console.error('Failed to update message status:', error);
    throw new Error('Unable to update message.', { cause: error });
  }
}

export async function deleteContactMessageRecord(id: number) {
  try {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  } catch (error) {
    console.error('Failed to delete contact message:', error);
    throw new Error('Unable to delete message.', { cause: error });
  }
}

export async function createCustomSectionRecord(data: {
  slug: string;
  title: string;
  subtitle?: string;
  sectionType?: string;
  items?: CustomSectionItem[];
  isVisible?: boolean;
}) {
  try {
    const existing = await db.select({ id: customSections.id }).from(customSections);
    const inserted = await db
      .insert(customSections)
      .values({
        slug: data.slug,
        title: data.title,
        subtitle: data.subtitle ?? '',
        sectionType: data.sectionType ?? 'cards',
        items: data.items ?? [],
        isVisible: data.isVisible ?? true,
        sortOrder: 100 + existing.length,
      })
      .returning();
    return inserted[0];
  } catch (error) {
    console.error('Failed to create custom section:', error);
    throw new Error('Unable to create custom section. Ensure the slug is unique.', { cause: error });
  }
}

export async function updateCustomSectionRecord(
  id: number,
  data: Partial<typeof customSections.$inferInsert>
) {
  try {
    const updated = await db
      .update(customSections)
      .set(data)
      .where(eq(customSections.id, id))
      .returning();
    return updated[0] ?? null;
  } catch (error) {
    console.error('Failed to update custom section:', error);
    throw new Error('Unable to update custom section.', { cause: error });
  }
}

export async function deleteCustomSectionRecord(id: number) {
  try {
    await db.delete(customSections).where(eq(customSections.id, id));
  } catch (error) {
    console.error('Failed to delete custom section:', error);
    throw new Error('Unable to delete custom section.', { cause: error });
  }
}

export async function saveUploadedFileRecord(data: {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  category: string;
  dataBase64: string;
}) {
  try {
    const inserted = await db.insert(uploadedFiles).values(data).returning({
      id: uploadedFiles.id,
      originalName: uploadedFiles.originalName,
      mimeType: uploadedFiles.mimeType,
      sizeBytes: uploadedFiles.sizeBytes,
      category: uploadedFiles.category,
      createdAt: uploadedFiles.createdAt,
    });
    return inserted[0];
  } catch (error) {
    console.error('Failed to persist uploaded file:', error);
    throw new Error('Unable to store uploaded file.', { cause: error });
  }
}

export async function getUploadedFileRecord(id: number) {
  try {
    const rows = await db
      .select()
      .from(uploadedFiles)
      .where(eq(uploadedFiles.id, id))
      .limit(1);
    return rows[0] ?? null;
  } catch (error) {
    console.error('Failed to load uploaded file:', error);
    throw new Error('Unable to retrieve file.', { cause: error });
  }
}
