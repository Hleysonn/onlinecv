import { reactive, watch } from 'vue'

export interface Person {
  firstName: string
  lastName: string
  title: string
  email: string
  phone: string
  address: string
}

export interface Experience {
  id: string
  role: string
  company: string
  period: string
  details: string[]
}

export interface Education {
  id: string
  title: string
  school: string
  period: string
  description?: string
}

export interface SkillGroup {
  id: string
  label: string
  color: string
  items: string[]
}

export interface Language {
  id: string
  label: string
  level: string
  value: number
}

export interface Project {
  id: string
  title: string
  desc: string
  link: string
}

export interface SoftSkill {
  id: string
  label: string
}

export interface CVData {
  person: Person
  about: string
  experiences: Experience[]
  educations: Education[]
  skillGroups: SkillGroup[]
  softSkills: SoftSkill[]
  languages: Language[]
  projects: Project[]
}

const defaultData: CVData = {
  person: {
    firstName: 'Franzy',
    lastName: 'Okagnanga',
    title: 'Développeur Full-Stack',
    email: 'franzy.music@gmail.com',
    phone: '+32 456 19 72 26',
    address: 'Quaregnon, Belgique',
  },
  about: `Développeur passionné avec une solide expérience en développement web et mobile. Maîtrise des technologies modernes comme Vue, React, Angular côté front-end et C#/.NET, Node.js côté back-end. Capacité à travailler en équipe et à m'adapter rapidement aux nouvelles technologies.`,
  experiences: [
    {
      id: '1',
      role: 'Développeur Full-Stack',
      company: 'Proximus – Contraste Europe',
      period: '02/2024 – 08/2024',
      details: [
        'Développement d\'applications internes en C# / .NET et Angular',
        'Conception et optimisation de bases de données SQL Server',
        'Collaboration avec les équipes métier pour l\'analyse des besoins',
      ],
    },
    {
      id: '2',
      role: 'Développeur Web Full-Stack',
      company: 'StudioKod',
      period: '05/2022 – 12/2022',
      details: [
        'Création d\'applications web sur mesure (Vue 3, Node.js, Express)',
        'Intégration de designs UI/UX modernes',
        'Mise en place de pipelines CI/CD',
      ],
    },
    {
      id: '3',
      role: 'Développeur Mobile',
      company: 'Personnal Project',
      period: '2021 – Présent',
      details: [
        'Développement d\'applications mobiles avec Flutter/Dart',
        'Publication sur Google Play Store',
      ],
    },
  ],
  educations: [
    {
      id: '1',
      title: 'Bachelier informatique de gestion',
      school: 'EAFC Colfontaine',
      period: '2019–2025 (TFE 06/2026)',
      description: 'Formation complète en développement logiciel, bases de données, analyse et gestion de projets IT.',
    },
    {
      id: '2',
      title: 'Certificat Développement Web',
      school: 'BeCode Charleroi',
      period: '2021–2022',
      description: 'Formation intensive de 7 mois en développement web full-stack (HTML, CSS, JS, PHP, Node.js).',
    },
  ],
  skillGroups: [
    { id: '1', label: 'Back-end', color: 'amber', items: ['C#', '.NET', 'Node.js', 'Express', 'REST API'] },
    { id: '2', label: 'Front-end', color: 'blue', items: ['React', 'Vue', 'Angular', 'Tailwind', 'Sass', 'HTML', 'CSS', 'JS'] },
    { id: '3', label: 'Mobile', color: 'emerald', items: ['Dart', 'Flutter'] },
    { id: '4', label: 'Data / DB', color: 'purple', items: ['MS SQL Server', 'T-SQL', 'PostgreSQL', 'MongoDB'] },
    { id: '5', label: 'Outils', color: 'slate', items: ['Visual Studio', 'VS Code', 'Android Studio', 'Git'] },
  ],
  softSkills: [
    { id: '1', label: 'Travail en équipe' },
    { id: '2', label: 'Communication' },
    { id: '3', label: 'Autonomie' },
    { id: '4', label: 'Résolution de problèmes' },
    { id: '5', label: 'Adaptabilité' },
    { id: '6', label: 'Rigueur' },
  ],
  languages: [
    { id: '1', label: 'Français', level: 'Langue maternelle', value: 100 },
    { id: '2', label: 'Anglais', level: 'Technique', value: 40 },
  ],
  projects: [
    {
      id: '1',
      title: 'Mon CV en ligne',
      desc: 'Site web interactif présentant mon parcours professionnel avec génération PDF.',
      link: 'github.com/franzy/cv',
    },
    {
      id: '2',
      title: 'App Mobile Flutter',
      desc: 'Application de gestion de tâches avec synchronisation cloud.',
      link: 'github.com/franzy/taskapp',
    },
  ],
}

// Charger depuis localStorage ou utiliser les données par défaut
// Fusionne avec defaultData pour gérer les nouveaux champs ajoutés
const loadData = (): CVData => {
  const saved = localStorage.getItem('cvData')
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      // Fusionner avec les valeurs par défaut pour les nouveaux champs
      return {
        ...defaultData,
        ...parsed,
        person: { ...defaultData.person, ...parsed.person },
        // S'assurer que les tableaux existent
        experiences: parsed.experiences || defaultData.experiences,
        educations: parsed.educations || defaultData.educations,
        skillGroups: parsed.skillGroups || defaultData.skillGroups,
        softSkills: parsed.softSkills || defaultData.softSkills,
        languages: parsed.languages || defaultData.languages,
        projects: parsed.projects || defaultData.projects,
      }
    } catch {
      return defaultData
    }
  }
  return defaultData
}

// Store réactif
export const cvStore = reactive<CVData>(loadData())

// Sauvegarder automatiquement dans localStorage
watch(
  () => cvStore,
  (newData) => {
    localStorage.setItem('cvData', JSON.stringify(newData))
  },
  { deep: true }
)

// Reset aux données par défaut
export const resetToDefault = () => {
  Object.assign(cvStore, defaultData)
}

// Générer un ID unique
export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

