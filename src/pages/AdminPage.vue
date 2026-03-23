<script setup lang="ts">
import { ref } from 'vue'
import { cvStore, resetToDefault, generateId, type Experience, type SkillGroup } from '../stores/cvStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref<'person' | 'experiences' | 'educations' | 'skills' | 'softSkills' | 'languages' | 'projects'>('person')

// Drag & drop (hard skills / skillGroups)
const draggingSkillGroupId = ref<string | null>(null)
const dragOverSkillGroupId = ref<string | null>(null)

const onSkillGroupDragStart = (e: DragEvent, id: string) => {
  draggingSkillGroupId.value = id
  e.dataTransfer?.setData('text/plain', id)
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

const onSkillGroupDragEnd = () => {
  draggingSkillGroupId.value = null
  dragOverSkillGroupId.value = null
}

const onSkillGroupDrop = (e: DragEvent, targetId: string) => {
  e.preventDefault()

  const draggedId = e.dataTransfer?.getData('text/plain') || draggingSkillGroupId.value
  draggingSkillGroupId.value = null
  dragOverSkillGroupId.value = null

  if (!draggedId || draggedId === targetId) return

  const fromIdx = cvStore.skillGroups.findIndex(g => g.id === draggedId)
  const toIdx = cvStore.skillGroups.findIndex(g => g.id === targetId)
  if (fromIdx === -1 || toIdx === -1) return

  // Déplacer l'élément en conservant l'ordre des autres.
  const movedArr = cvStore.skillGroups.splice(fromIdx, 1)
  const moved = movedArr[0]
  if (!moved) return
  // Si on retire depuis une position avant la cible, la cible décale d'une place.
  const insertIdx = fromIdx < toIdx ? toIdx - 1 : toIdx
  cvStore.skillGroups.splice(insertIdx, 0, moved)
}

// Drag & drop (formations / educations)
const draggingEducationId = ref<string | null>(null)
const dragOverEducationId = ref<string | null>(null)

const onEducationDragStart = (e: DragEvent, id: string) => {
  draggingEducationId.value = id
  e.dataTransfer?.setData('text/plain', id)
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}

const onEducationDragEnd = () => {
  draggingEducationId.value = null
  dragOverEducationId.value = null
}

const onEducationDrop = (e: DragEvent, targetId: string) => {
  e.preventDefault()

  const draggedId = e.dataTransfer?.getData('text/plain') || draggingEducationId.value
  draggingEducationId.value = null
  dragOverEducationId.value = null

  if (!draggedId || draggedId === targetId) return

  const fromIdx = cvStore.educations.findIndex(ed => ed.id === draggedId)
  const toIdx = cvStore.educations.findIndex(ed => ed.id === targetId)
  if (fromIdx === -1 || toIdx === -1) return

  const movedArr = cvStore.educations.splice(fromIdx, 1)
  const moved = movedArr[0]
  if (!moved) return

  // Si on retire depuis une position avant la cible, la cible décale d'une place.
  const insertIdx = fromIdx < toIdx ? toIdx - 1 : toIdx
  cvStore.educations.splice(insertIdx, 0, moved)
}

// Tabs
const tabs = [
  { key: 'person', label: 'Profil', icon: '👤' },
  { key: 'experiences', label: 'Expériences', icon: '💼' },
  { key: 'educations', label: 'Formations', icon: '🎓' },
  { key: 'skills', label: 'Hard Skills', icon: '⚡' },
  { key: 'softSkills', label: 'Soft Skills', icon: '💡' },
  { key: 'languages', label: 'Langues', icon: '🌍' },
  { key: 'projects', label: 'Projets', icon: '🚀' },
] as const

// Fonctions pour ajouter des éléments
const addExperience = () => {
  cvStore.experiences.push({
    id: generateId(),
    role: 'Nouveau poste',
    company: 'Entreprise',
    period: '2024',
    details: ['Description'],
  })
}

const removeExperience = (id: string) => {
  const idx = cvStore.experiences.findIndex(e => e.id === id)
  if (idx > -1) cvStore.experiences.splice(idx, 1)
}

const addExperienceDetail = (exp: Experience) => {
  exp.details.push('')
}

const removeExperienceDetail = (exp: Experience, idx: number) => {
  exp.details.splice(idx, 1)
}

const addEducation = () => {
  cvStore.educations.push({
    id: generateId(),
    title: 'Nouveau diplôme',
    school: 'École',
    period: '2024',
    description: '',
  })
}

const removeEducation = (id: string) => {
  const idx = cvStore.educations.findIndex(e => e.id === id)
  if (idx > -1) cvStore.educations.splice(idx, 1)
}

const addSkillGroup = () => {
  cvStore.skillGroups.push({
    id: generateId(),
    label: 'Nouveau groupe',
    color: 'slate',
    items: ['Compétence'],
  })
}

const removeSkillGroup = (id: string) => {
  const idx = cvStore.skillGroups.findIndex(s => s.id === id)
  if (idx > -1) cvStore.skillGroups.splice(idx, 1)
}

const addSkillItem = (group: SkillGroup) => {
  group.items.push('')
}

const removeSkillItem = (group: SkillGroup, idx: number) => {
  group.items.splice(idx, 1)
}

const addSoftSkill = () => {
  cvStore.softSkills.push({
    id: generateId(),
    label: 'Nouvelle compétence',
  })
}

const removeSoftSkill = (id: string) => {
  const idx = cvStore.softSkills.findIndex(s => s.id === id)
  if (idx > -1) cvStore.softSkills.splice(idx, 1)
}

const addLanguage = () => {
  cvStore.languages.push({
    id: generateId(),
    label: 'Nouvelle langue',
    level: 'Débutant',
    value: 25,
  })
}

const removeLanguage = (id: string) => {
  const idx = cvStore.languages.findIndex(l => l.id === id)
  if (idx > -1) cvStore.languages.splice(idx, 1)
}

const addProject = () => {
  cvStore.projects.push({
    id: generateId(),
    title: 'Nouveau projet',
    desc: 'Description du projet',
    link: 'github.com/...',
  })
}

const removeProject = (id: string) => {
  const idx = cvStore.projects.findIndex(p => p.id === id)
  if (idx > -1) cvStore.projects.splice(idx, 1)
}

const handleReset = () => {
  if (confirm('Réinitialiser toutes les données aux valeurs par défaut ?')) {
    resetToDefault()
  }
}

const goToCV = () => {
  router.push('/')
}

const exitAdminToHome = () => {
  // "adminUnlocked" est utilisé côté CV pour déverrouiller certaines actions.
  // En quittant l'admin, on remet le flag à zéro.
  sessionStorage.removeItem('adminUnlocked')
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <!-- Header -->
    <header class="bg-slate-800 text-white sticky top-0 z-50 shadow-lg">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">⚙️</span>
          <h1 class="text-xl font-bold">Administration CV</h1>
        </div>
        <div class="flex gap-3">
          <button 
            @click="handleReset"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition"
          >
            🔄 Réinitialiser
          </button>
          <button 
            @click="goToCV"
            class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition"
          >
            👁️ Voir le CV
          </button>
          <button
            @click="exitAdminToHome"
            class="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg text-sm font-medium transition"
          >
            ⬅️ Quitter
          </button>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-4 py-6">
      <!-- Tabs -->
      <nav class="flex flex-wrap gap-2 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'px-4 py-2 rounded-lg font-medium transition flex items-center gap-2',
            activeTab === tab.key 
              ? 'bg-slate-800 text-white shadow-lg' 
              : 'bg-white text-slate-700 hover:bg-slate-200'
          ]"
        >
          <span>{{ tab.icon }}</span>
          {{ tab.label }}
        </button>
      </nav>

      <!-- Content -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        
        <!-- PROFIL -->
        <div v-if="activeTab === 'person'" class="space-y-6">
          <h2 class="text-xl font-bold text-slate-800 border-b pb-2">Informations personnelles</h2>
          
          <div class="grid md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
              <input v-model="cvStore.person.firstName" type="text" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Nom</label>
              <input v-model="cvStore.person.lastName" type="text" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 mb-1">Titre / Poste</label>
              <input v-model="cvStore.person.title" type="text" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input v-model="cvStore.person.email" type="email" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
              <input v-model="cvStore.person.phone" type="tel" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
              <input v-model="cvStore.person.address" type="text" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">À propos / Profil</label>
            <textarea v-model="cvStore.about" rows="4" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></textarea>
          </div>
        </div>

        <!-- EXPÉRIENCES -->
        <div v-if="activeTab === 'experiences'" class="space-y-6">
          <div class="flex items-center justify-between border-b pb-2">
            <h2 class="text-xl font-bold text-slate-800">Expériences professionnelles</h2>
            <button @click="addExperience" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              + Ajouter
            </button>
          </div>

          <div v-for="exp in cvStore.experiences" :key="exp.id" class="border rounded-lg p-4 bg-slate-50">
            <div class="flex justify-between items-start mb-4">
              <span class="text-lg font-semibold text-slate-700">{{ exp.role }}</span>
              <button @click="removeExperience(exp.id)" class="text-red-500 hover:text-red-700 text-sm">🗑️ Supprimer</button>
            </div>
            
            <div class="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Poste</label>
                <input v-model="exp.role" type="text" class="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Entreprise</label>
                <input v-model="exp.company" type="text" class="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-600 mb-1">Période</label>
                <input v-model="exp.period" type="text" class="w-full px-3 py-2 border rounded-lg" placeholder="Ex: 01/2023 – 12/2023" />
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-medium text-slate-600">Détails / Réalisations</label>
                <button @click="addExperienceDetail(exp)" class="text-blue-600 hover:text-blue-800 text-sm">+ Ajouter</button>
              </div>
              <div v-for="(_, idx) in exp.details" :key="idx" class="flex gap-2 mb-2">
                <input v-model="exp.details[idx]" type="text" class="flex-1 px-3 py-2 border rounded-lg text-sm" />
                <button @click="removeExperienceDetail(exp, idx)" class="text-red-500 hover:text-red-700 px-2">×</button>
              </div>
            </div>
          </div>
        </div>

        <!-- FORMATIONS -->
        <div v-if="activeTab === 'educations'" class="space-y-6">
          <div class="flex items-center justify-between border-b pb-2">
            <h2 class="text-xl font-bold text-slate-800">Formations</h2>
            <button @click="addEducation" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              + Ajouter
            </button>
          </div>

          <p class="text-sm text-slate-500 -mt-3">
            Glissez-déposez les formations pour changer leur ordre.
          </p>

          <div
            v-for="edu in cvStore.educations"
            :key="edu.id"
            class="border rounded-lg p-4 bg-slate-50"
            :class="dragOverEducationId === edu.id ? 'ring-2 ring-blue-400' : ''"
            @dragover.prevent="dragOverEducationId = edu.id"
            @drop="onEducationDrop($event, edu.id)"
          >
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-2">
                <span
                  class="cursor-move text-slate-400 hover:text-slate-600 select-none"
                  draggable="true"
                  @dragstart="onEducationDragStart($event, edu.id)"
                  @dragend="onEducationDragEnd"
                  title="Glisser pour réordonner"
                >
                  ⠿
                </span>
                <span class="text-lg font-semibold text-slate-700">{{ edu.title }}</span>
              </div>
              <button @click="removeEducation(edu.id)" class="text-red-500 hover:text-red-700 text-sm">🗑️ Supprimer</button>
            </div>
            
            <div class="grid md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-600 mb-1">Diplôme / Formation</label>
                <input v-model="edu.title" type="text" class="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">École / Institution</label>
                <input v-model="edu.school" type="text" class="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Période</label>
                <input v-model="edu.period" type="text" class="w-full px-3 py-2 border rounded-lg" placeholder="Ex: 2020–2023" />
              </div>
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-slate-600 mb-1">Description</label>
                <textarea v-model="edu.description" rows="2" class="w-full px-3 py-2 border rounded-lg" placeholder="Décrivez brièvement la formation..."></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- COMPÉTENCES TECHNIQUES (HARD SKILLS) -->
        <div v-if="activeTab === 'skills'" class="space-y-6">
          <div class="flex items-center justify-between border-b pb-2">
            <h2 class="text-xl font-bold text-slate-800">Compétences techniques (Hard Skills)</h2>
            <button @click="addSkillGroup" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              + Ajouter un groupe
            </button>
          </div>

          <p class="text-sm text-slate-500 -mt-3">
            Glissez-déposez les groupes pour changer leur ordre.
          </p>

          <div
            v-for="group in cvStore.skillGroups"
            :key="group.id"
            class="border rounded-lg p-4 bg-slate-50"
            :class="dragOverSkillGroupId === group.id ? 'ring-2 ring-blue-400' : ''"
            @dragover.prevent="dragOverSkillGroupId = group.id"
            @drop="onSkillGroupDrop($event, group.id)"
          >
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center gap-2">
                <!-- Poignée de drag (pour ne pas gêner les inputs) -->
                <span
                  class="cursor-move text-slate-400 hover:text-slate-600 select-none"
                  draggable="true"
                  @dragstart="onSkillGroupDragStart($event, group.id)"
                  @dragend="onSkillGroupDragEnd"
                  title="Glisser pour réordonner"
                >
                  ⠿
                </span>
                <span class="text-lg font-semibold text-slate-700">{{ group.label }}</span>
              </div>
              <button @click="removeSkillGroup(group.id)" class="text-red-500 hover:text-red-700 text-sm">🗑️ Supprimer</button>
            </div>
            
            <div class="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Nom du groupe</label>
                <input v-model="group.label" type="text" class="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Couleur</label>
                <select v-model="group.color" class="w-full px-3 py-2 border rounded-lg">
                  <option value="amber">Amber</option>
                  <option value="blue">Bleu</option>
                  <option value="emerald">Vert</option>
                  <option value="purple">Violet</option>
                  <option value="slate">Gris</option>
                  <option value="red">Rouge</option>
                </select>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-medium text-slate-600">Compétences</label>
                <button @click="addSkillItem(group)" class="text-blue-600 hover:text-blue-800 text-sm">+ Ajouter</button>
              </div>
              <div class="flex flex-wrap gap-2">
                <div v-for="(_, idx) in group.items" :key="idx" class="flex items-center gap-1 bg-white border rounded-full px-3 py-1">
                  <input v-model="group.items[idx]" type="text" class="border-none bg-transparent w-24 text-sm focus:outline-none" />
                  <button @click="removeSkillItem(group, idx)" class="text-red-400 hover:text-red-600">×</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SOFT SKILLS -->
        <div v-if="activeTab === 'softSkills'" class="space-y-6">
          <div class="flex items-center justify-between border-b pb-2">
            <h2 class="text-xl font-bold text-slate-800">Soft Skills (Compétences transversales)</h2>
            <button @click="addSoftSkill" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              + Ajouter
            </button>
          </div>

          <div class="flex flex-wrap gap-3">
            <div 
              v-for="skill in cvStore.softSkills" 
              :key="skill.id" 
              class="flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200 rounded-full px-4 py-2"
            >
              <input 
                v-model="skill.label" 
                type="text" 
                class="border-none bg-transparent text-slate-700 font-medium focus:outline-none w-32"
              />
              <button @click="removeSoftSkill(skill.id)" class="text-pink-400 hover:text-pink-600 text-lg">×</button>
            </div>
          </div>

          <p class="text-sm text-slate-500 mt-4">
            💡 Les soft skills sont des compétences comportementales : communication, travail d'équipe, adaptabilité, etc.
          </p>
        </div>

        <!-- LANGUES -->
        <div v-if="activeTab === 'languages'" class="space-y-6">
          <div class="flex items-center justify-between border-b pb-2">
            <h2 class="text-xl font-bold text-slate-800">Langues</h2>
            <button @click="addLanguage" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              + Ajouter
            </button>
          </div>

          <div v-for="lang in cvStore.languages" :key="lang.id" class="border rounded-lg p-4 bg-slate-50">
            <div class="flex justify-between items-start mb-4">
              <span class="text-lg font-semibold text-slate-700">{{ lang.label }}</span>
              <button @click="removeLanguage(lang.id)" class="text-red-500 hover:text-red-700 text-sm">🗑️ Supprimer</button>
            </div>
            
            <div class="grid md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Langue</label>
                <input v-model="lang.label" type="text" class="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Niveau</label>
                <input v-model="lang.level" type="text" class="w-full px-3 py-2 border rounded-lg" placeholder="Ex: Courant (B2)" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Pourcentage ({{ lang.value }}%)</label>
                <input v-model.number="lang.value" type="range" min="0" max="100" class="w-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- PROJETS -->
        <div v-if="activeTab === 'projects'" class="space-y-6">
          <div class="flex items-center justify-between border-b pb-2">
            <h2 class="text-xl font-bold text-slate-800">Projets</h2>
            <button @click="addProject" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
              + Ajouter
            </button>
          </div>

          <div v-for="proj in cvStore.projects" :key="proj.id" class="border rounded-lg p-4 bg-slate-50">
            <div class="flex justify-between items-start mb-4">
              <span class="text-lg font-semibold text-slate-700">{{ proj.title }}</span>
              <button @click="removeProject(proj.id)" class="text-red-500 hover:text-red-700 text-sm">🗑️ Supprimer</button>
            </div>
            
            <div class="grid gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Titre du projet</label>
                <input v-model="proj.title" type="text" class="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Description</label>
                <textarea v-model="proj.desc" rows="2" class="w-full px-3 py-2 border rounded-lg"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">Lien</label>
                <input v-model="proj.link" type="text" class="w-full px-3 py-2 border rounded-lg" placeholder="github.com/..." />
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer info -->
      <p class="text-center text-slate-500 text-sm mt-6">
        💾 Les modifications sont sauvegardées automatiquement dans le navigateur
      </p>
    </div>
  </div>
</template>

