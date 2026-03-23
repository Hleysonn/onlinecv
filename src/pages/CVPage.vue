<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { cvStore } from '../stores/cvStore'

const router = useRouter()
const photoOk = ref(true)
const photoSrc = '/profile.svg'

const person = computed(() => cvStore.person)
const about = computed(() => cvStore.about)
const experiences = computed(() => cvStore.experiences)
const educations = computed(() => cvStore.educations)
const skillGroups = computed(() => cvStore.skillGroups)
const softSkills = computed(() => cvStore.softSkills)
const languages = computed(() => cvStore.languages)
const projects = computed(() => cvStore.projects)

const headline = computed(() => `${person.value.firstName} ${person.value.lastName}`)
const initials = computed(() => `${person.value.firstName[0]}${person.value.lastName[0]}`)

// === Système de code secret pour accéder à l'admin ===
// Hash SHA-256 du code secret (le code en clair n'est pas stocké)
const SECRET_HASH = '8b55f4ebfbc9859067a18d3dd52e04e3d187f18fc96a943f2b1c9653ad5c8c17'
const adminUnlocked = ref(sessionStorage.getItem('adminUnlocked') === 'true')
const typedKeys = ref('')
let resetTimer: ReturnType<typeof setTimeout> | null = null

// Fonction de hachage SHA-256
const hashCode = async (text: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const handleKeyPress = async (e: KeyboardEvent) => {
  // Ignorer si on est dans un input/textarea
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  
  // Ajouter la touche
  typedKeys.value += e.key
  
  // Garder les 30 derniers caractères max
  if (typedKeys.value.length > 30) {
    typedKeys.value = typedKeys.value.slice(-30)
  }
  
  // Vérifier toutes les sous-chaînes possibles (du plus long au plus court)
  for (let i = 0; i < typedKeys.value.length; i++) {
    const substring = typedKeys.value.slice(i)
    const hash = await hashCode(substring)
    if (hash === SECRET_HASH) {
      adminUnlocked.value = true
      sessionStorage.setItem('adminUnlocked', 'true')
      typedKeys.value = ''
      return
    }
  }
  
  // Reset après 5 secondes d'inactivité
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => {
    typedKeys.value = ''
  }, 5000)
}

onMounted(() => {
  window.addEventListener('keypress', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keypress', handleKeyPress)
})

const goToAdmin = () => {
  router.push('/admin')
}

const logout = () => {
  adminUnlocked.value = false
  sessionStorage.removeItem('adminUnlocked')
}

const handlePrintAts = async () => {
  try {
    // @ts-ignore
    const { jsPDF } = await import('jspdf')
    
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = 210
    const pageHeight = 297
    const sidebarWidth = 70
    const mainX = 78
    const sideX = 8
    let yMain = 18
    let ySide = 18

    // === SIDEBAR GAUCHE ===
    doc.setFillColor(24, 36, 52)
    doc.rect(0, 0, sidebarWidth, pageHeight, 'F')

    // Cercle avec initiales
    doc.setFillColor(45, 60, 80)
    doc.circle(sidebarWidth / 2, 28, 16, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(initials.value, sidebarWidth / 2, 32, { align: 'center' })

    ySide = 52

    // --- CONTACT ---
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 180, 255)
    doc.text('CONTACT', sideX, ySide)
    ySide += 6

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(220, 230, 240)
    doc.text(person.value.phone, sideX, ySide)
    ySide += 5
    doc.text(person.value.email, sideX, ySide)
    ySide += 5
    const addrLines = doc.splitTextToSize(person.value.address, sidebarWidth - 14)
    doc.text(addrLines, sideX, ySide)
    ySide += addrLines.length * 4 + 8

    // --- COMPÉTENCES ---
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 180, 255)
    doc.text('COMPÉTENCES', sideX, ySide)
    ySide += 6

    skillGroups.value.forEach(group => {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 200, 100)
      doc.text(group.label, sideX, ySide)
      ySide += 4

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(200, 210, 220)
      doc.setFontSize(8)
      group.items.forEach(item => {
        doc.text('•  ' + item, sideX + 2, ySide)
        ySide += 4
      })
      ySide += 3
    })

    ySide += 5

    // --- LANGUES ---
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 180, 255)
    doc.text('LANGUES', sideX, ySide)
    ySide += 6

    languages.value.forEach(l => {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(220, 230, 240)
      doc.text(l.label, sideX, ySide)

      // Afficher le niveau en texte (sans barre de progression)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(160, 175, 190)
      doc.text(l.level, sideX + 30, ySide)

      ySide += 4
    })

    ySide += 5

    // --- SOFT SKILLS ---
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 180, 255)
    doc.text('SOFT SKILLS', sideX, ySide)
    ySide += 6

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(200, 210, 220)
    softSkills.value.forEach(skill => {
      doc.text('•  ' + skill.label, sideX + 2, ySide)
      ySide += 4
    })

    // === CONTENU PRINCIPAL (DROITE) ===
    const mainWidth = pageWidth - mainX - 12

    // Nom
    doc.setTextColor(24, 36, 52)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text(person.value.firstName, mainX, yMain)
    yMain += 10
    doc.text(person.value.lastName, mainX, yMain)
    yMain += 8

    // Titre
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(person.value.title, mainX, yMain)
    yMain += 6

    // Ligne décorative
    doc.setDrawColor(100, 180, 255)
    doc.setLineWidth(1)
    doc.line(mainX, yMain, mainX + 45, yMain)
    yMain += 10

    // --- PROFIL ---
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(24, 36, 52)
    doc.text('PROFIL', mainX, yMain)
    yMain += 5

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(70, 85, 100)
    const aboutLinesArr = doc.splitTextToSize(about.value, mainWidth)
    doc.text(aboutLinesArr, mainX, yMain)
    yMain += aboutLinesArr.length * 5 + 7

    // --- FORMATIONS ---
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(24, 36, 52)
    doc.text('FORMATIONS', mainX, yMain)
    yMain += 6

    educations.value.forEach(ed => {
      doc.setFillColor(80, 200, 120)
      doc.circle(mainX + 2, yMain - 1, 1.5, 'F')

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(24, 36, 52)
      doc.text(ed.title, mainX + 7, yMain)
      yMain += 4

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 200, 120)
      doc.text(ed.period, mainX + 7, yMain)
      doc.setTextColor(100, 116, 139)
      doc.text('  |  ' + ed.school, mainX + 7 + doc.getTextWidth(ed.period), yMain)
      yMain += 6
    })

    yMain += 5

    // --- EXPÉRIENCES ---
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(24, 36, 52)
    doc.text('EXPÉRIENCES', mainX, yMain)
    yMain += 8

    experiences.value.forEach(xp => {
      doc.setFillColor(100, 180, 255)
      doc.circle(mainX + 2, yMain - 1, 1.5, 'F')

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(24, 36, 52)
      doc.text(xp.role, mainX + 7, yMain)
      yMain += 5

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 180, 255)
      doc.text(xp.period, mainX + 7, yMain)
      doc.setTextColor(100, 116, 139)
      doc.text('  |  ' + xp.company, mainX + 7 + doc.getTextWidth(xp.period), yMain)
      yMain += 5

      doc.setFontSize(9)
      doc.setTextColor(70, 85, 100)
      xp.details.slice(0, 2).forEach(d => {
        const lines = doc.splitTextToSize('•  ' + d, mainWidth - 10)
        doc.text(lines, mainX + 7, yMain)
        yMain += lines.length * 4
      })
      yMain += 5
    })

    yMain += 5

    // --- PROJETS ---
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(24, 36, 52)
    doc.text('PROJETS', mainX, yMain)
    yMain += 8

    projects.value.forEach(p => {
      doc.setFillColor(160, 100, 220)
      doc.circle(mainX + 2, yMain - 1, 1.5, 'F')

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(24, 36, 52)
      doc.text(p.title, mainX + 7, yMain)
      yMain += 5

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(70, 85, 100)
      const descLines = doc.splitTextToSize(p.desc, mainWidth - 10)
      doc.text(descLines.slice(0, 1), mainX + 7, yMain)
      yMain += 4

      doc.setTextColor(100, 100, 220)
      doc.text(p.link, mainX + 7, yMain)
      yMain += 7
    })

    const fileName = `${person.value.firstName}_${person.value.lastName}_CV.pdf`
    doc.save(fileName)
    
  } catch (error) {
    console.error('Erreur PDF:', error)
    alert('Erreur: ' + (error as Error).message)
  }
}

// Version ATS-friendly
const handleDownloadAts = async () => {
  try {
    // @ts-ignore
    const { jsPDF } = await import('jspdf')
    
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const marginLeft = 12
    const marginRight = 12
    const pageWidth = 210
    const contentWidth = pageWidth - marginLeft - marginRight
    let y = 12

    // Helper pour les titres de section
    const sectionTitle = (title: string) => {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(50, 50, 50)
      doc.text(title, marginLeft, y)
      doc.setDrawColor(150, 150, 150)
      doc.setLineWidth(0.2)
      doc.line(marginLeft + doc.getTextWidth(title) + 2, y - 1, marginLeft + contentWidth, y - 1)
      y += 4
    }

    // === EN-TÊTE ===
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)
    doc.text(`${person.value.firstName} ${person.value.lastName}`, pageWidth / 2, y, { align: 'center' })
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(70, 70, 70)
    doc.text(person.value.title, pageWidth / 2, y, { align: 'center' })
    y += 5

    doc.setFontSize(8)
    doc.setTextColor(90, 90, 90)
    doc.text(`${person.value.phone}  |  ${person.value.email}  |  ${person.value.address}`, pageWidth / 2, y, { align: 'center' })
    y += 7

    // === PROFIL ===
    sectionTitle('PROFIL')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    const aboutLinesAts = doc.splitTextToSize(about.value, contentWidth)
    doc.text(aboutLinesAts.slice(0, 3), marginLeft, y)
    y += Math.min(aboutLinesAts.length, 3) * 3.5 + 4

    // === FORMATIONS ===
    sectionTitle('FORMATION')

    educations.value.forEach(ed => {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text(ed.title, marginLeft, y)
      
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text(ed.period, pageWidth - marginRight, y, { align: 'right' })
      y += 3.5

      doc.setFontSize(8)
      doc.setTextColor(70, 70, 70)
      doc.text(ed.school, marginLeft, y)
      y += 4
    })

    y += 2

    // === EXPÉRIENCES ===
    sectionTitle('EXPÉRIENCE PROFESSIONNELLE')

    experiences.value.slice(0, 3).forEach(xp => {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text(xp.role + ' | ' + xp.company, marginLeft, y)
      
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text(xp.period, pageWidth - marginRight, y, { align: 'right' })
      y += 4

      doc.setFontSize(8)
      doc.setTextColor(60, 60, 60)
      xp.details.slice(0, 2).forEach(d => {
        const lines = doc.splitTextToSize('• ' + d, contentWidth - 3)
        doc.text(lines[0], marginLeft + 2, y)
        y += 3
      })
      y += 2
    })

    y += 1

    // === COMPÉTENCES TECHNIQUES ===
    sectionTitle('COMPÉTENCES TECHNIQUES')

    doc.setFontSize(8)
    const allSkills = skillGroups.value.map(g => `${g.label}: ${g.items.join(', ')}`).join('  |  ')
    const skillLines = doc.splitTextToSize(allSkills, contentWidth)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    doc.text(skillLines.slice(0, 3), marginLeft, y)
    y += Math.min(skillLines.length, 3) * 3.5 + 3

    // === SOFT SKILLS & LANGUES ===
    sectionTitle('SOFT SKILLS & LANGUES')

    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    
    const softText = 'Soft Skills: ' + softSkills.value.map(s => s.label).join(', ')
    doc.text(softText, marginLeft, y)
    y += 3.5
    
    const langText = 'Langues: ' + languages.value.map(l => `${l.label} (${l.level})`).join(', ')
    doc.text(langText, marginLeft, y)
    y += 5

    // === PROJETS ===
    sectionTitle('PROJETS')

    projects.value.slice(0, 2).forEach(p => {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 30)
      doc.text(p.title + ': ', marginLeft, y)
      
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(50, 50, 50)
      const titleW = doc.getTextWidth(p.title + ': ')
      const descText = doc.splitTextToSize(p.desc, contentWidth - titleW)
      doc.text(descText[0] || '', marginLeft + titleW, y)
      y += 4
    })

    const fileName = `${person.value.firstName}_${person.value.lastName}_CV_ATS.pdf`
    doc.save(fileName)
    
  } catch (error) {
    console.error('Erreur PDF ATS:', error)
    alert('Erreur: ' + (error as Error).message)
  }
}
</script>

<template>
  <div id="cv-content" class="min-h-screen bg-slate-50 text-slate-900">
    <header class="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div class="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,#ffffff44,transparent_40%),radial-gradient(circle_at_80%_0%,#38bdf866,transparent_35%)]" />
      <div class="max-w-7xl mx-auto px-6 py-16 md:py-20 relative">
        <div class="flex flex-col md:flex-row items-center md:items-end gap-8">
          <div class="flex flex-col items-center md:items-start">
            <div class="relative w-32 h-32 md:w-40 md:h-40 rounded-full ring-4 ring-white/30 shadow-2xl overflow-hidden bg-slate-800">
              <img
                v-if="photoOk"
                :src="photoSrc"
                alt="Photo"
                class="w-full h-full object-cover"
                @error="photoOk = false"
              />
              <div v-else class="w-full h-full bg-slate-800 grid place-items-center text-3xl font-bold text-white/80">
                {{ initials }}
              </div>
            </div>
          </div>
          <div class="flex-1 text-center md:text-left space-y-3">
            <p class="text-xs uppercase tracking-[0.25em] text-slate-200/80">Curriculum Vitae</p>
            <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-white">{{ headline }}</h1>
            <p class="text-lg md:text-xl text-slate-200 font-semibold">{{ person.title }}</p>
            <div class="flex flex-wrap justify-center md:justify-start gap-4 pt-3 text-sm text-slate-200/90">
              <span class="flex items-center gap-2">📞 {{ person.phone }}</span>
              <span class="flex items-center gap-2">✉️ {{ person.email }}</span>
              <span class="flex items-center gap-2">📍 {{ person.address }}</span>
            </div>
            <div class="flex flex-wrap justify-center md:justify-start gap-3 pt-4 print:hidden">
              <button
                type="button"
                class="px-4 py-2 rounded-full bg-white text-slate-900 font-semibold shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 transition"
                @click="handlePrintAts"
              >
                📄 CV Design (PDF)
              </button>
              <button
                v-if="adminUnlocked"
                type="button"
                class="px-4 py-2 rounded-full bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-900/20 hover:-translate-y-0.5 transition"
                @click="handleDownloadAts"
              >
                🤖 CV Format ATS
              </button>
              <button
                v-if="adminUnlocked"
                type="button"
                class="px-4 py-2 rounded-full bg-amber-500 text-white font-semibold shadow-lg shadow-amber-900/20 hover:-translate-y-0.5 transition animate-pulse"
                @click="goToAdmin"
              >
                ⚙️ Modifier
              </button>
              <button
                v-if="adminUnlocked"
                type="button"
                class="px-4 py-2 rounded-full bg-red-500/80 text-white font-semibold shadow-lg hover:-translate-y-0.5 transition"
                @click="logout"
                title="Cacher le bouton Modifier"
              >
                🔒 Verrouiller
              </button>
              <a
                href="#projects"
                class="px-4 py-2 rounded-full border border-white/50 text-white font-semibold hover:bg-white/10 transition"
              >
                Projets
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-12 md:py-16 space-y-16">
      <section id="about" class="bg-white rounded-3xl shadow-xl shadow-slate-200/60 p-8 md:p-10">
        <h2 class="section-title">À propos</h2>
        <p class="text-lg text-slate-600 leading-relaxed">
          {{ about }}
        </p>
      </section>

      <section id="experience" class="space-y-8">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 grid place-items-center font-bold">XP</div>
          <h2 class="text-3xl font-bold text-slate-900">Expériences</h2>
        </div>
        <div class="grid gap-6 md:grid-cols-2">
          <article
            v-for="xp in experiences"
            :key="xp.id"
            class="card"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-orange-600">{{ xp.period }}</p>
                <h3 class="text-xl font-bold text-slate-900">{{ xp.role }}</h3>
                <p class="text-slate-500 font-semibold">{{ xp.company }}</p>
              </div>
              <span class="text-orange-500 text-lg">⦿</span>
            </div>
            <ul class="mt-3 space-y-2 text-slate-600 text-sm leading-relaxed">
              <li v-for="(d, j) in xp.details" :key="j" class="flex gap-2">
                <span class="text-orange-400">•</span>
                <span>{{ d }}</span>
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section id="education" class="space-y-8">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center font-bold">EDU</div>
          <h2 class="text-3xl font-bold text-slate-900">Formations</h2>
        </div>
        <div class="grid gap-6 md:grid-cols-2">
          <article v-for="ed in educations" :key="ed.id" class="card">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-emerald-600">{{ ed.period }}</p>
                <h3 class="text-lg font-bold text-slate-900">{{ ed.title }}</h3>
                <p class="text-slate-500">{{ ed.school }}</p>
              </div>
              <span class="text-emerald-500 text-lg">⦿</span>
            </div>
            <p v-if="ed.description" class="mt-3 text-sm text-slate-600 leading-relaxed">
              {{ ed.description }}
            </p>
          </article>
        </div>
      </section>

      <section id="skills" class="space-y-10 bg-slate-900 text-white rounded-3xl shadow-xl shadow-slate-300/50 p-8 md:p-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-white/15 text-white grid place-items-center font-bold">SK</div>
          <h2 class="text-3xl font-bold">Compétences</h2>
        </div>
        <div class="grid gap-8 lg:grid-cols-2">
          <div class="space-y-6">
            <div
              v-for="group in skillGroups"
              :key="group.id"
              class="space-y-3"
            >
              <h3 class="text-lg font-semibold text-white flex items-center gap-2">
                <span
                  class="inline-block w-2.5 h-2.5 rounded-full"
                  :class="{
                    'bg-orange-400': group.color === 'orange' || group.color === 'amber',
                    'bg-sky-400': group.color === 'blue',
                    'bg-emerald-400': group.color === 'emerald',
                    'bg-purple-400': group.color === 'purple',
                    'bg-slate-200': group.color === 'slate',
                    'bg-red-400': group.color === 'red',
                  }"
                ></span>
                {{ group.label }}
              </h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="(it, j) in group.items"
                  :key="j"
                  class="chip chip-dark"
                  :class="{
                    'border-orange-300 text-orange-50 bg-orange-400/15': group.color === 'orange' || group.color === 'amber',
                    'border-sky-300 text-sky-50 bg-sky-400/15': group.color === 'blue',
                    'border-emerald-300 text-emerald-50 bg-emerald-400/15': group.color === 'emerald',
                    'border-purple-300 text-purple-50 bg-purple-400/15': group.color === 'purple',
                    'border-slate-400 text-slate-100 bg-white/10': group.color === 'slate',
                    'border-red-300 text-red-50 bg-red-400/15': group.color === 'red',
                  }"
                >
                  {{ it }}
                </span>
              </div>
            </div>
          </div>
          <div class="space-y-6">
            <div class="card bg-white text-slate-900 border border-slate-100">
              <h3 class="text-xl font-bold mb-4">Langues</h3>
              <div class="space-y-4">
                <div v-for="l in languages" :key="l.id" class="space-y-1">
                  <div class="flex justify-between text-sm text-slate-700">
                    <span class="font-semibold">{{ l.label }}</span>
                    <span class="text-slate-500">{{ l.level }}</span>
                  </div>
                  <div class="h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      class="h-full rounded-full bg-linear-to-r from-sky-400 via-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                      :style="{ width: `${l.value}%` }"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Soft Skills -->
            <div class="card bg-white text-slate-900 border border-slate-100">
              <h3 class="text-xl font-bold mb-4">Soft Skills</h3>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="skill in softSkills" 
                  :key="skill.id"
                  class="px-3 py-1.5 rounded-full bg-pink-100 text-pink-700 text-sm font-medium border border-pink-200"
                >
                  {{ skill.label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" class="space-y-8">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 grid place-items-center font-bold">PRJ</div>
          <h2 class="text-3xl font-bold text-slate-900">Projets</h2>
        </div>
        <div class="grid gap-6 md:grid-cols-2">
          <article v-for="p in projects" :key="p.id" class="card">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="text-xl font-bold text-slate-900">{{ p.title }}</h3>
                <p class="text-slate-600 mt-2">{{ p.desc }}</p>
                <p class="mt-3 text-sm font-semibold text-indigo-500">
                  <a :href="`https://${p.link}`" target="_blank">{{ p.link }}</a>
                </p>
              </div>
              <span class="text-purple-500 text-lg">⦿</span>
            </div>
          </article>
        </div>
      </section>

    </main>
  </div>
</template>

