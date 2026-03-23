import rawData from '../data/portfolio.json';

type RawRecord = Record<string, unknown>;

export interface PortfolioLink {
  label: string;
  url: string;
  icon?: string;
  type?: string;
  text?: string;
}

export interface PortfolioStat {
  value: number;
  suffix: string;
  label: string;
}

export interface PortfolioSkillGroup {
  category: string;
  items: string[];
}

export interface PortfolioExperience {
  id: string;
  company: string;
  url: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string[];
  skills: string[];
  projectIds: string[];
}

export interface PortfolioEducation {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear?: number;
  endYear?: number;
  grade: string;
  project?: string;
  details: string;
  projectIds: string[];
}

export interface PortfolioProject {
  id: string;
  name: string;
  category: string;
  image: string;
  featured: boolean;
  tags: string[];
  filterTags: string[];
  shortDescription: string;
  description: string;
  links: PortfolioLink[];
  features: string[];
  videos: string[];
  screenshots: string[];
  stats?: { stars?: number; forks?: number };
  platforms: string[];
  genre: string[];
  skills: string[];
}

export interface PortfolioData {
  personal: {
    name: string;
    firstName: string;
    lastName: string;
    title: string;
    subtitle: string;
    location: string;
    tagline: string;
    about: string;
    avatar: string;
    resume: string;
    email: string;
    phone: string;
    github: string;
    linkedin: string;
    twitter: string;
    youtube: string;
    facebook: string;
    contacts: {
      email: string;
      phone: string;
      links: PortfolioLink[];
    };
  };
  stats: PortfolioStat[];
  skills: PortfolioSkillGroup[];
  experience: PortfolioExperience[];
  education: PortfolioEducation[];
  projects: PortfolioProject[];
}

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const asNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

const asRecordArray = (value: unknown): RawRecord[] =>
  Array.isArray(value) ? value.filter(isRecord) : [];

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const uniqueStrings = (values: Array<string | undefined>): string[] =>
  Array.from(new Set(values.map((value) => value?.trim() ?? '').filter(Boolean)));

const slugify = (...parts: Array<string | number | undefined>): string => {
  const value = parts
    .filter((part): part is string | number => part !== undefined && part !== null)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return value || 'item';
};

const normalizeLabel = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '');

const root: RawRecord = isRecord(rawData) ? rawData : {};
const personalRaw: RawRecord = isRecord(root.personal) ? root.personal : {};
const contactsRaw: RawRecord = isRecord(personalRaw.contacts) ? personalRaw.contacts : {};

const socialLinks = asRecordArray(contactsRaw.links).map((link) => ({
  label: asString(link.label || link.text),
  url: asString(link.url),
  icon: asString(link.icon),
  type: asString(link.type),
  text: asString(link.text),
})).filter((link) => Boolean(link.url));

const findSocialUrl = (...labels: string[]): string => {
  const normalizedLabels = labels.map(normalizeLabel);
  const socialLink = socialLinks.find((link) => {
    const candidates = [link.label, link.icon, link.type, link.text]
      .filter(Boolean)
      .map(normalizeLabel);

    return candidates.some((candidate) => normalizedLabels.includes(candidate));
  });

  return socialLink?.url || '';
};

const fullName = asString(personalRaw.name, 'Portfolio');
const [firstName, ...remainingName] = fullName.trim().split(/\s+/).filter(Boolean);

const data: PortfolioData = {
  personal: {
    name: fullName,
    firstName: firstName || fullName,
    lastName: remainingName.join(' '),
    title: asString(personalRaw.title),
    subtitle: asString(personalRaw.subtitle),
    location: asString(personalRaw.location),
    tagline: asString(personalRaw.tagline),
    about: asString(personalRaw.about),
    avatar: asString(personalRaw.avatar),
    resume: asString(personalRaw.resume),
    email: asString(contactsRaw.email || personalRaw.email),
    phone: asString(contactsRaw.phone || personalRaw.phone),
    github: findSocialUrl('github') || asString(personalRaw.github),
    linkedin: findSocialUrl('linkedin') || asString(personalRaw.linkedin),
    twitter: findSocialUrl('twitter', 'x') || asString(personalRaw.twitter),
    youtube: findSocialUrl('youtube') || asString(personalRaw.youtube),
    facebook: findSocialUrl('facebook') || asString(personalRaw.facebook),
    contacts: {
      email: asString(contactsRaw.email || personalRaw.email),
      phone: asString(contactsRaw.phone || personalRaw.phone),
      links: socialLinks,
    },
  },
  stats: asRecordArray(root.stats).map((stat) => ({
    value: asNumber(stat.value) ?? 0,
    suffix: asString(stat.suffix),
    label: asString(stat.label),
  })),
  skills: asRecordArray(root.skills).map((skillGroup) => ({
    category: asString(skillGroup.category),
    items: asStringArray(skillGroup.items),
  })),
  experience: asRecordArray(root.experience).map((experience, index) => ({
    id: asString(experience.id) || slugify(asString(experience.company), asString(experience.position), asString(experience.startDate), index),
    company: asString(experience.company),
    url: asString(experience.url),
    position: asString(experience.position),
    startDate: asString(experience.startDate),
    endDate: asString(experience.endDate),
    description: asStringArray(experience.description),
    skills: asStringArray(experience.skills),
    projectIds: asStringArray(experience.projects_ids),
  })),
  education: asRecordArray(root.education).map((education, index) => ({
    id: asString(education.id) || slugify(asString(education.school || education.name), asString(education.degree), index),
    school: asString(education.school || education.name),
    degree: asString(education.degree),
    field: asString(education.field),
    startYear: asNumber(education.startYear),
    endYear: asNumber(education.endYear),
    grade: asString(education.grade),
    project: asString(education.project),
    details: asString(education.details),
    projectIds: asStringArray(education.projects_ids),
  })),
  projects: asRecordArray(root.projects).map((project, index) => {
    const platforms = asStringArray(project.platforms);
    const genre = asStringArray(project.genre);
    const skills = asStringArray(project.skills);
    const legacyTags = asStringArray(project.tags);
    const explicitFilterTags = asStringArray(project.filterTags);
    const filterTags = explicitFilterTags.length > 0
      ? uniqueStrings(explicitFilterTags)
      : uniqueStrings([...platforms, ...genre]);
    const screenshots = asStringArray(project.screenshots);
    const links = asRecordArray(project.links).map((link) => ({
      label: asString(link.label || link.text),
      text: asString(link.text || link.label),
      url: asString(link.url),
      icon: asString(link.icon),
      type: asString(link.type),
    })).filter((link) => Boolean(link.url));

    const stats = isRecord(project.stats)
      ? {
          stars: asNumber(project.stats.stars),
          forks: asNumber(project.stats.forks),
        }
      : undefined;

    return {
      id: asString(project.id) || slugify(asString(project.name), index),
      name: asString(project.name),
      category: asString(project.category) || platforms[0] || genre[0] || 'Project',
      image: asString(project.image || project['cover-image']) || screenshots[0] || '',
      featured: project.featured === true,
      tags: uniqueStrings([...legacyTags, ...platforms, ...genre, ...skills]),
      filterTags,
      shortDescription: asString(project.shortDescription),
      description: asString(project.description || project.shortDescription),
      links,
      features: asStringArray(project.features),
      videos: asStringArray(project.videos),
      screenshots,
      stats,
      platforms,
      genre,
      skills,
    } satisfies PortfolioProject;
  }),
};

export default data;