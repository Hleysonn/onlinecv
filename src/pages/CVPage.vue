<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { cvStore, PROFILES, type Profile } from '../stores/cvStore'

const router = useRouter()
const photoOk = ref(true)
const photoSrc = '/profile.svg'

const person = computed(() => cvStore.person)
const educations = computed(() => cvStore.educations)
const softSkills = computed(() => cvStore.softSkills)
const languages = computed(() => cvStore.languages)

const initials = computed(() => `${person.value.firstName[0]}${person.value.lastName[0]}`)

const selectedProfile = ref<Profile>('all')
const activeTitle = computed(() => cvStore.profileTitles[selectedProfile.value])
const activeAbout = computed(() => cvStore.profileAbouts[selectedProfile.value])

const getFilteredExperiences = (profile: Profile) =>
  cvStore.experiences.filter(e => !e.profiles || e.profiles.includes(profile))
const getFilteredSkillGroups = (profile: Profile) =>
  cvStore.skillGroups.filter(g => !g.profiles || g.profiles.includes(profile))
const getFilteredProjects = (profile: Profile) =>
  cvStore.projects.filter(p => !p.profiles || p.profiles.includes(profile))

const navItems = [
  { id: 'about', label: 'À propos', num: '01' },
  { id: 'experience', label: 'Expériences', num: '02' },
  { id: 'education', label: 'Formations', num: '03' },
  { id: 'skills', label: 'Compétences', num: '04' },
  { id: 'projects', label: 'Projets', num: '05' },
]

const activeSection = ref('about')

const skillColors: Record<string, string> = {
  amber: '#f59e0b',
  blue: '#3b82f6',
  emerald: '#10b981',
  purple: '#a855f7',
  slate: '#64748b',
  red: '#ef4444',
}

const scrollTo = (id: string) => {
  activeSection.value = id
}

// Admin secret
const SECRET_HASH = '8b55f4ebfbc9859067a18d3dd52e04e3d187f18fc96a943f2b1c9653ad5c8c17'
const adminUnlocked = ref(sessionStorage.getItem('adminUnlocked') === 'true')
const typedKeys = ref('')
let resetTimer: ReturnType<typeof setTimeout> | null = null

const hashCode = async (text: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

const handleKeyPress = async (e: KeyboardEvent) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
  typedKeys.value += e.key
  if (typedKeys.value.length > 30) typedKeys.value = typedKeys.value.slice(-30)
  for (let i = 0; i < typedKeys.value.length; i++) {
    const hash = await hashCode(typedKeys.value.slice(i))
    if (hash === SECRET_HASH) {
      adminUnlocked.value = true
      sessionStorage.setItem('adminUnlocked', 'true')
      typedKeys.value = ''
      return
    }
  }
  if (resetTimer) clearTimeout(resetTimer)
  resetTimer = setTimeout(() => { typedKeys.value = '' }, 5000)
}

onMounted(() => {
  window.addEventListener('keypress', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keypress', handleKeyPress)
})


const goToAdmin = () => router.push('/admin')
const logout = () => {
  adminUnlocked.value = false
  sessionStorage.removeItem('adminUnlocked')
}

const handlePrintAts = async () => {
  try {
    const _experiences = getFilteredExperiences(selectedProfile.value)
    const _skillGroups = getFilteredSkillGroups(selectedProfile.value)
    const _projects = getFilteredProjects(selectedProfile.value)
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

    doc.setFillColor(24, 36, 52)
    doc.rect(0, 0, sidebarWidth, pageHeight, 'F')

    doc.setFillColor(45, 60, 80)
    doc.circle(sidebarWidth / 2, 28, 16, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(initials.value, sidebarWidth / 2, 32, { align: 'center' })

    ySide = 52

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

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(100, 180, 255)
    doc.text('COMPÉTENCES', sideX, ySide)
    ySide += 6

    _skillGroups.forEach(group => {
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
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(160, 175, 190)
      doc.text(l.level, sideX + 30, ySide)
      ySide += 4
    })

    ySide += 5

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

    const mainWidth = pageWidth - mainX - 12

    doc.setTextColor(24, 36, 52)
    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text(person.value.firstName, mainX, yMain)
    yMain += 10
    doc.text(person.value.lastName, mainX, yMain)
    yMain += 8

    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 116, 139)
    doc.text(activeTitle.value, mainX, yMain)
    yMain += 6

    doc.setDrawColor(100, 180, 255)
    doc.setLineWidth(1)
    doc.line(mainX, yMain, mainX + 45, yMain)
    yMain += 10

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(24, 36, 52)
    doc.text('PROFIL', mainX, yMain)
    yMain += 5

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(70, 85, 100)
    const aboutLinesArr = doc.splitTextToSize(activeAbout.value, mainWidth)
    doc.text(aboutLinesArr, mainX, yMain)
    yMain += aboutLinesArr.length * 5 + 7

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

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(24, 36, 52)
    doc.text('EXPÉRIENCES', mainX, yMain)
    yMain += 8

    _experiences.forEach(xp => {
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

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(24, 36, 52)
    doc.text('PROJETS', mainX, yMain)
    yMain += 8

    _projects.forEach(p => {
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
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

  } catch (error) {
    console.error('Erreur PDF:', error)
    alert('Erreur: ' + (error as Error).message)
  }
}

const handleDownloadAts = async () => {
  try {
    const _experiences = getFilteredExperiences(selectedProfile.value)
    const _skillGroups = getFilteredSkillGroups(selectedProfile.value)
    const _projects = getFilteredProjects(selectedProfile.value)
    // @ts-ignore
    const { jsPDF } = await import('jspdf')

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const marginLeft = 12
    const marginRight = 12
    const pageWidth = 210
    const contentWidth = pageWidth - marginLeft - marginRight
    let y = 12

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

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)
    doc.text(`${person.value.firstName} ${person.value.lastName}`, pageWidth / 2, y, { align: 'center' })
    y += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(70, 70, 70)
    doc.text(activeTitle.value, pageWidth / 2, y, { align: 'center' })
    y += 5

    doc.setFontSize(8)
    doc.setTextColor(90, 90, 90)
    doc.text(`${person.value.phone}  |  ${person.value.email}  |  ${person.value.address}`, pageWidth / 2, y, { align: 'center' })
    y += 7

    sectionTitle('PROFIL')
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    const aboutLinesAts = doc.splitTextToSize(activeAbout.value, contentWidth)
    doc.text(aboutLinesAts.slice(0, 3), marginLeft, y)
    y += Math.min(aboutLinesAts.length, 3) * 3.5 + 4

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

    sectionTitle('EXPÉRIENCE PROFESSIONNELLE')
    _experiences.slice(0, 3).forEach(xp => {
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

    sectionTitle('COMPÉTENCES TECHNIQUES')
    doc.setFontSize(8)
    const allSkills = _skillGroups.map(g => `${g.label}: ${g.items.join(', ')}`).join('  |  ')
    const skillLines = doc.splitTextToSize(allSkills, contentWidth)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    doc.text(skillLines.slice(0, 3), marginLeft, y)
    y += Math.min(skillLines.length, 3) * 3.5 + 3

    sectionTitle('SOFT SKILLS & LANGUES')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(50, 50, 50)
    doc.text('Soft Skills: ' + softSkills.value.map(s => s.label).join(', '), marginLeft, y)
    y += 3.5
    doc.text('Langues: ' + languages.value.map(l => `${l.label} (${l.level})`).join(', '), marginLeft, y)
    y += 5

    sectionTitle('PROJETS')
    _projects.slice(0, 2).forEach(p => {
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
    const blob = doc.output('blob')
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

  } catch (error) {
    console.error('Erreur PDF ATS:', error)
    alert('Erreur: ' + (error as Error).message)
  }
}
</script>

<template>
  <div id="cv-content" class="root">

    <div class="ambient print-hide" aria-hidden="true">
      <div class="orb orb--1"></div>
      <div class="orb orb--2"></div>
      <div class="grain"></div>
    </div>

    <!-- SIDEBAR -->
    <aside class="sidebar print-hide">
      <div class="sb-glow" aria-hidden="true"></div>

      <div class="sb-top hi hi--0">
        <div class="sb-avatar-ring">
          <div class="sb-avatar">
            <img v-if="photoOk" :src="photoSrc" alt="" @error="photoOk = false" />
            <span v-else>{{ initials }}</span>
          </div>
        </div>
      </div>

      <div class="sb-identity hi hi--1">
        <p class="sb-firstname">{{ person.firstName }}</p>
        <p class="sb-lastname">{{ person.lastName }}</p>
        <p class="sb-jobtitle">{{ activeTitle }}</p>
      </div>

      <nav class="sb-nav hi hi--2">
        <button
          v-for="item in navItems"
          :key="item.id"
          class="sb-link"
          :class="{ 'sb-link--on': activeSection === item.id }"
          @click="scrollTo(item.id)"
        >
          <span class="sb-link-num">{{ item.num }}</span>
          {{ item.label }}
        </button>
      </nav>

      <div class="sb-contacts hi hi--2">
        <a :href="`tel:${person.phone.replace(/\s/g, '')}`" class="sb-contact">{{ person.phone }}</a>
        <a :href="`mailto:${person.email}`" class="sb-contact">{{ person.email }}</a>
        <span class="sb-contact">{{ person.address }}</span>
      </div>

      <div class="sb-profiles hi hi--3">
        <span class="sb-label">Profil CV</span>
        <div class="sb-tabs">
          <button
            v-for="p in PROFILES"
            :key="p.key"
            :class="['sb-tab', selectedProfile === p.key && 'sb-tab--on']"
            @click="selectedProfile = p.key"
          >{{ p.label }}</button>
        </div>
      </div>

      <div class="sb-actions hi hi--3">
        <button type="button" @click="handlePrintAts" class="sb-btn">
          <span class="sb-btn-icon">↓</span> CV Design
        </button>
        <template v-if="adminUnlocked">
          <button type="button" @click="handleDownloadAts" class="sb-btn sb-btn--ghost">↓ ATS</button>
          <button type="button" @click="goToAdmin" class="sb-btn sb-btn--ghost">⚙ Éditer</button>
          <button type="button" @click="logout" class="sb-btn sb-btn--ghost sb-btn--danger">🔒</button>
        </template>
      </div>
    </aside>

    <!-- MOBILE HEADER -->
    <header class="mob-head print-hide">
      <div class="mob-head-inner">
        <div class="mob-identity">
          <div class="mob-avatar">{{ initials }}</div>
          <div>
            <div class="mob-name">{{ person.firstName }} <em>{{ person.lastName }}</em></div>
            <p class="mob-title">{{ activeTitle }}</p>
          </div>
          <button @click="handlePrintAts" class="mob-cv-btn">↓ CV</button>
        </div>
        <div class="mob-tabs">
          <button
            v-for="p in PROFILES"
            :key="p.key"
            :class="['mtab', selectedProfile === p.key && 'mtab--on']"
            @click="selectedProfile = p.key"
          >{{ p.label }}</button>
        </div>
      </div>
    </header>

    <!-- MOBILE BOTTOM NAV -->
    <nav class="mob-bottom-nav print-hide">
      <button
        v-for="item in navItems"
        :key="item.id"
        :class="['mbnav-item', activeSection === item.id && 'mbnav-item--on']"
        @click="scrollTo(item.id)"
      >
        <span class="mbnav-num">{{ item.num }}</span>
        <span class="mbnav-label">{{ item.label }}</span>
      </button>
    </nav>

    <!-- CONTENT -->
    <main class="content">
      <Transition name="section-fade" mode="out-in">

        <section v-if="activeSection === 'about'" key="about" class="section">
          <div class="section-head">
            <span class="snum">01</span>
            <div class="stitle-wrap">
              <span class="stitle-tag">Introduction</span>
              <h2 class="stitle">À propos</h2>
            </div>
          </div>
          <Transition name="profile-swap" mode="out-in">
            <p :key="selectedProfile" class="about">{{ activeAbout }}</p>
          </Transition>
          <div class="about-meta">
            <span class="about-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ person.address }}
            </span>
            <span class="about-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {{ person.email }}
            </span>
            <span class="about-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.4 19.79 19.79 0 0 1 1.61 4.84 2 2 0 0 1 3.58 2.69h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.18a16 16 0 0 0 6 6l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.46 17.5z"/></svg>
              {{ person.phone }}
            </span>
          </div>
        </section>

        <section v-else-if="activeSection === 'experience'" key="experience" class="section">
          <div class="section-head">
            <span class="snum">02</span>
            <div class="stitle-wrap">
              <span class="stitle-tag">Parcours</span>
              <h2 class="stitle">Expériences</h2>
            </div>
          </div>
          <div class="timeline">
            <div
              v-for="(xp, i) in getFilteredExperiences(selectedProfile)"
              :key="xp.id"
              class="timeline-item entry"
              :style="`--d:${i * 0.08}s`"
            >
              <div class="timeline-rail">
                <div class="timeline-dot"></div>
              </div>
              <div class="timeline-card">
                <span class="edate">{{ xp.period }}</span>
                <h3 class="erole">{{ xp.role }}</h3>
                <p class="eorg">{{ xp.company }}</p>
                <ul class="elist">
                  <li v-for="(d, j) in xp.details" :key="j">{{ d }}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section v-else-if="activeSection === 'education'" key="education" class="section">
          <div class="section-head">
            <span class="snum">03</span>
            <div class="stitle-wrap">
              <span class="stitle-tag">Formation</span>
              <h2 class="stitle">Formations</h2>
            </div>
          </div>
          <div class="timeline">
            <div
              v-for="(ed, i) in educations"
              :key="ed.id"
              class="timeline-item entry"
              :style="`--d:${i * 0.08}s`"
            >
              <div class="timeline-rail">
                <div class="timeline-dot timeline-dot--edu"></div>
              </div>
              <div class="timeline-card">
                <span class="edate">{{ ed.period }}</span>
                <h3 class="erole">{{ ed.title }}</h3>
                <p class="eorg">{{ ed.school }}</p>
                <p v-if="ed.description" class="edesc">{{ ed.description }}</p>
              </div>
            </div>
          </div>
        </section>

        <section v-else-if="activeSection === 'skills'" key="skills" class="section">
          <div class="section-head">
            <span class="snum">04</span>
            <div class="stitle-wrap">
              <span class="stitle-tag">Expertise</span>
              <h2 class="stitle">Compétences</h2>
            </div>
          </div>
          <div class="skills-grid">
            <div
              v-for="(group, i) in getFilteredSkillGroups(selectedProfile)"
              :key="group.id"
              class="sg"
              :style="`--d:${i * 0.06}s; --sg-accent: ${skillColors[group.color] || skillColors.slate}`"
            >
              <h3 class="sgn">{{ group.label }}</h3>
              <div class="chips">
                <span v-for="item in group.items" :key="item" class="chip">{{ item }}</span>
              </div>
            </div>
          </div>
          <div class="skills2">
            <div class="sg-card">
              <h3 class="sgn">Langues</h3>
              <div class="langs">
                <div v-for="l in languages" :key="l.id" class="lang">
                  <div class="lang-top">
                    <span class="lname">{{ l.label }}</span>
                    <span class="llvl">{{ l.level }}</span>
                  </div>
                  <div class="lbar">
                    <div class="lfill" :style="`--w:${l.value}%`"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="sg-card" style="--d:.1s">
              <h3 class="sgn">Soft Skills</h3>
              <div class="chips">
                <span v-for="s in softSkills" :key="s.id" class="chip chip--soft">{{ s.label }}</span>
              </div>
            </div>
          </div>
        </section>

        <section v-else-if="activeSection === 'projects'" key="projects" class="section">
          <div class="section-head">
            <span class="snum">05</span>
            <div class="stitle-wrap">
              <span class="stitle-tag">Portfolio</span>
              <h2 class="stitle">Projets</h2>
            </div>
          </div>
          <div class="projects">
            <article
              v-for="(p, i) in getFilteredProjects(selectedProfile)"
              :key="p.id"
              class="project"
              :style="`--d:${i * 0.08}s`"
            >
              <div class="project-inner">
                <h3 class="pname">{{ p.title }}</h3>
                <p class="pdesc">{{ p.desc }}</p>
                <a :href="`https://${p.link}`" target="_blank" rel="noopener" class="plink">
                  <span>{{ p.link }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
                </a>
              </div>
            </article>
          </div>
        </section>

      </Transition>
    </main>
  </div>
</template>

<style scoped>
/* ── Tokens ── */
.root {
  --accent: #0d9488;
  --accent-light: #14b8a6;
  --accent-glow: rgba(13, 148, 136, 0.35);
  --warm: #f97316;
  --text: #0f172a;
  --muted: #64748b;
  --faint: #94a3b8;
  --rule: rgba(15, 23, 42, 0.08);
  --surface: #ffffff;
  --surface-2: #f8fafc;
  --sb-w: 280px;
  --font-display: 'Bricolage Grotesque', system-ui, sans-serif;
  --font-body: 'IBM Plex Sans', system-ui, sans-serif;

  display: grid;
  grid-template-columns: var(--sb-w) 1fr;
  min-height: 100vh;
  background: var(--surface-2);
  color: var(--text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  position: relative;
  overflow-x: hidden;
}

/* ── Ambient ── */
.ambient {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.45;
  animation: float 12s ease-in-out infinite;
}

.orb--1 {
  width: 480px; height: 480px;
  background: radial-gradient(circle, rgba(13,148,136,0.25) 0%, transparent 70%);
  top: -120px; right: 5%;
}

.orb--2 {
  width: 360px; height: 360px;
  background: radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%);
  bottom: 10%; right: 20%;
  animation-delay: -6s;
}

.grain {
  position: absolute;
  inset: 0;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, -30px) scale(1.05); }
  66% { transform: translate(-15px, 20px) scale(0.95); }
}

/* ── SIDEBAR ── */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sb-w);
  height: 100vh;
  overflow-y: auto;
  padding: 2.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  scrollbar-width: none;
  z-index: 10;
  background: linear-gradient(165deg, #0c1222 0%, #131c31 40%, #0f172a 100%);
  border-right: 1px solid rgba(255,255,255,0.06);
  color: #e2e8f0;
}

.sidebar::-webkit-scrollbar { display: none; }

.sb-glow {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 200px;
  background: radial-gradient(ellipse at 50% 0%, rgba(13,148,136,0.18) 0%, transparent 70%);
  pointer-events: none;
}

.sb-avatar-ring {
  position: relative;
  width: 96px; height: 96px;
  border-radius: 50%;
  padding: 3px;
  margin: 0 auto;
  background: conic-gradient(from var(--rgb-angle, 0deg), #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff, #ff0000);
  animation: rgbSpin 4s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

@keyframes rgbSpin { to { --rgb-angle: 360deg; } }

.sb-avatar {
  width: 100%; height: 100%;
  border-radius: 50%;
  overflow: hidden;
  background: #1e293b;
  border: 2px solid #0c1222;
  display: grid; place-items: center;
  font-family: var(--font-display);
  font-size: 1.1rem; font-weight: 800;
  color: var(--accent-light);
  animation: none;
}

.sb-avatar img { width: 100%; height: 100%; object-fit: cover; }

.sb-identity { line-height: 1.15; position: relative; text-align: center; }

.sb-firstname {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0;
  letter-spacing: -0.02em;
}

.sb-lastname {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent-light), #5eead4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.02em;
}

.sb-jobtitle {
  font-size: 0.72rem;
  color: #64748b;
  margin: 0.55rem 0 0;
  line-height: 1.5;
  font-weight: 500;
}

/* Nav */
.sb-nav { display: flex; flex-direction: column; gap: 0.2rem; }

.sb-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: #64748b;
  background: none;
  border: none;
  text-align: left;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.sb-link-num {
  font-size: 0.62rem;
  font-weight: 700;
  font-family: ui-monospace, monospace;
  color: #334155;
  transition: color 0.25s;
}

.sb-link:hover {
  background: rgba(255,255,255,0.05);
  color: #cbd5e1;
}

.sb-link--on {
  background: rgba(13,148,136,0.12);
  color: #5eead4;
  box-shadow: inset 3px 0 0 var(--accent-light);
}

.sb-link--on .sb-link-num { color: var(--accent-light); }

/* Contacts */
.sb-contacts {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 1.25rem;
}

.sb-contact {
  font-size: 0.72rem;
  color: #475569;
  text-decoration: none;
  transition: color 0.2s;
  line-height: 1.4;
}

a.sb-contact:hover { color: var(--accent-light); }

/* Profiles */
.sb-label {
  display: block;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #334155;
  margin-bottom: 0.5rem;
}

.sb-tabs { display: flex; flex-direction: column; gap: 0.25rem; }

.sb-tab {
  font-size: 0.76rem;
  font-weight: 500;
  color: #64748b;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
  padding: 0.45rem 0.7rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s;
}

.sb-tab:hover {
  background: rgba(255,255,255,0.06);
  color: #94a3b8;
  border-color: rgba(255,255,255,0.1);
}

.sb-tab--on {
  background: rgba(13,148,136,0.15);
  color: #5eead4;
  border-color: rgba(13,148,136,0.35);
  font-weight: 600;
}

/* Actions */
.sb-actions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: auto;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 1.25rem;
}

.sb-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  font-size: 0.76rem;
  font-weight: 600;
  font-family: var(--font-body);
  border-radius: 10px;
  cursor: pointer;
  background: linear-gradient(135deg, var(--accent), #0f766e);
  color: #fff;
  border: none;
  transition: all 0.25s;
  box-shadow: 0 4px 16px var(--accent-glow);
}

.sb-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px var(--accent-glow);
}

.sb-btn-icon { font-size: 0.9rem; }

.sb-btn--ghost {
  background: rgba(255,255,255,0.04);
  color: #94a3b8;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: none;
}

.sb-btn--ghost:hover {
  background: rgba(255,255,255,0.08);
  color: #e2e8f0;
  box-shadow: none;
}

.sb-btn--danger:hover { color: #fca5a5; border-color: rgba(239,68,68,0.3); }

/* ── MOBILE HEADER ── */
.mob-head { display: none; }

/* ── CONTENT ── */
.content {
  grid-column: 2;
  padding: 4rem 4.5rem 6rem;
  position: relative;
  z-index: 1;
  max-width: 920px;
  width: 100%;
  margin: 0 auto;
  background-image:
    linear-gradient(rgba(100, 116, 139, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 116, 139, 0.08) 1px, transparent 1px),
    linear-gradient(rgba(100, 116, 139, 0.18) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 116, 139, 0.18) 1px, transparent 1px);
  background-size: 8px 8px, 8px 8px, 40px 40px, 40px 40px;
}

/* ── Sections ── */
.section { margin-bottom: 5rem; }

.section-head {
  position: relative;
  margin-bottom: 2.5rem;
}

.snum {
  position: absolute;
  right: 0; top: -1.5rem;
  font-family: var(--font-display);
  font-size: 7rem;
  font-weight: 800;
  background: linear-gradient(180deg, rgba(15,23,42,0.06) 0%, transparent 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  letter-spacing: -0.04em;
  user-select: none;
  pointer-events: none;
}

.stitle-wrap { position: relative; z-index: 1; }

.stitle-tag {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--accent);
  margin-bottom: 0.35rem;
}

.stitle {
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 3vw, 2rem);
  font-weight: 800;
  color: var(--text);
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

/* About */
.about {
  font-size: 1.02rem;
  line-height: 1.85;
  color: var(--muted);
  max-width: 640px;
  margin: 0;
  padding: 1.75rem 2rem;
  background: var(--surface);
  border-radius: 16px;
  border: 1px solid var(--rule);
  box-shadow: 0 4px 24px rgba(15,23,42,0.04);
}

/* About meta */
.about-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1.25rem;
}

.about-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.76rem;
  font-weight: 500;
  color: var(--muted);
  background: var(--surface);
  border: 1px solid var(--rule);
  border-radius: 99px;
  padding: 0.35rem 0.9rem;
  box-shadow: 0 2px 8px rgba(15,23,42,0.04);
}

.about-badge svg { flex-shrink: 0; color: var(--accent); }

/* ── Timeline ── */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

.timeline-item {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 1.25rem;
  position: relative;
}

.timeline-item:not(:last-child) .timeline-rail::after {
  content: '';
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: calc(100% + 1rem);
  background: linear-gradient(180deg, var(--accent-light) 0%, var(--rule) 100%);
}

.timeline-rail {
  position: relative;
  display: flex;
  justify-content: center;
  padding-top: 1.5rem;
}

.timeline-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px rgba(13,148,136,0.15), 0 0 12px var(--accent-glow);
  flex-shrink: 0;
  z-index: 1;
  transition: transform 0.3s;
}

.timeline-item:hover .timeline-dot { transform: scale(1.3); }

.timeline-dot--edu { background: var(--warm); box-shadow: 0 0 0 4px rgba(249,115,22,0.15); }

.timeline-card {
  padding: 1.25rem 1.5rem 1.75rem;
  margin-bottom: 0.5rem;
  background: var(--surface);
  border: 1px solid var(--rule);
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-item:hover .timeline-card {
  border-color: rgba(13,148,136,0.2);
  box-shadow: 0 8px 32px rgba(15,23,42,0.06);
  transform: translateX(4px);
}

.edate {
  display: inline-block;
  font-size: 0.68rem;
  font-family: ui-monospace, 'SF Mono', monospace;
  font-weight: 600;
  color: var(--accent);
  background: rgba(13,148,136,0.08);
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  margin-bottom: 0.65rem;
}

.erole {
  font-family: var(--font-display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  letter-spacing: -0.01em;
}

.eorg {
  font-size: 0.82rem;
  color: var(--muted);
  margin: 0.2rem 0 0.75rem;
  font-weight: 500;
}

.elist {
  margin: 0; padding: 0; list-style: none;
  display: flex; flex-direction: column; gap: 0.35rem;
}

.elist li {
  font-size: 0.84rem;
  color: #475569;
  line-height: 1.65;
  padding-left: 1.1rem;
  position: relative;
}

.elist li::before {
  content: '';
  position: absolute;
  left: 0; top: 0.55em;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--accent-light);
}

.edesc { font-size: 0.84rem; color: var(--muted); line-height: 1.7; margin: 0.5rem 0 0; }

/* ── Skills ── */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.sg {
  padding: 1.25rem;
  background: var(--surface);
  border: 1px solid var(--rule);
  border-radius: 14px;
  border-top: 3px solid var(--sg-accent, var(--accent));
  transition: all 0.3s;
}

.sg:hover {
  box-shadow: 0 8px 28px rgba(15,23,42,0.07);
  transform: translateY(-3px);
}

.sgn {
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text);
  margin: 0 0 0.75rem;
}

.chips { display: flex; flex-wrap: wrap; gap: 0.35rem; }

.chip {
  font-size: 0.72rem;
  font-weight: 500;
  color: #475569;
  background: var(--surface-2);
  border: 1px solid var(--rule);
  border-radius: 8px;
  padding: 0.25rem 0.55rem;
  cursor: default;
  transition: all 0.2s;
}

.chip:hover {
  background: rgba(13,148,136,0.08);
  color: var(--accent);
  border-color: rgba(13,148,136,0.2);
}

.chip--soft {
  background: transparent;
  border-style: dashed;
  color: var(--muted);
}

.skills2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.sg-card {
  padding: 1.5rem;
  background: var(--surface);
  border: 1px solid var(--rule);
  border-radius: 14px;
}

/* Langs */
.langs { display: flex; flex-direction: column; gap: 1rem; }

.lang-top { display: flex; justify-content: space-between; margin-bottom: 0.45rem; }

.lname { font-size: 0.84rem; font-weight: 600; color: var(--text); }
.llvl { font-size: 0.68rem; color: var(--faint); font-weight: 500; }

.lbar {
  height: 6px;
  background: var(--surface-2);
  border-radius: 99px;
  overflow: hidden;
}

.lfill {
  height: 100%;
  width: var(--w);
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
  border-radius: 99px;
  animation: fillBar 1.1s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: 0.35s;
}

/* ── Projects ── */
.projects {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.project {
  position: relative;
  border-radius: 16px;
  padding: 2px;
  background: linear-gradient(135deg, transparent, transparent);
  transition: background 0.4s;
}

.project:hover {
  background: linear-gradient(135deg, var(--accent-light), var(--warm));
}

.project-inner {
  background: var(--surface);
  border-radius: 14px;
  padding: 1.75rem;
  height: 100%;
  border: 1px solid var(--rule);
  transition: all 0.3s;
}

.project:hover .project-inner {
  border-color: transparent;
  box-shadow: 0 12px 40px rgba(15,23,42,0.08);
}

.pname {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
  letter-spacing: -0.01em;
  transition: color 0.2s;
}

.project:hover .pname { color: var(--accent); }

.pdesc {
  font-size: 0.82rem;
  color: var(--muted);
  line-height: 1.65;
  margin: 0.5rem 0 1.25rem;
}

.plink {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-family: ui-monospace, monospace;
  font-weight: 600;
  color: var(--accent);
  text-decoration: none;
  transition: gap 0.2s;
  max-width: 100%;
  overflow: hidden;
}

.plink span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.plink:hover { gap: 0.55rem; }

.plink svg { transition: transform 0.2s; }
.plink:hover svg { transform: translate(2px, -2px); }

/* ── Transitions ── */
.section-fade-enter-active,
.section-fade-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.section-fade-enter-from { opacity: 0; transform: translateY(14px); }
.section-fade-leave-to { opacity: 0; transform: translateY(-8px); }

.profile-swap-enter-active,
.profile-swap-leave-active { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.profile-swap-enter-from { opacity: 0; transform: translateY(12px); }
.profile-swap-leave-to { opacity: 0; transform: translateY(-8px); }

.list-fade-enter-active { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.list-fade-enter-from { opacity: 0; transform: translateY(12px); }
.list-fade-leave-active { display: none; }

/* ── Animations ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: none; }
}

.hi {
  opacity: 0;
  animation: fadeUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.hi--0 { animation-delay: 0.05s; }
.hi--1 { animation-delay: 0.15s; }
.hi--2 { animation-delay: 0.25s; }
.hi--3 { animation-delay: 0.35s; }

@keyframes fillBar {
  from { width: 0; }
  to   { width: var(--w); }
}

.section-head,
.about,
.timeline-item,
.sg,
.sg-card,
.project {
  animation: fadeUp 0.55s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: var(--d, 0s);
}

/* ── Print ── */
@media print {
  .print-hide { display: none !important; }
  .root { display: block; background: #fff; }
  .content { padding: 2rem; max-width: none; }
  .reveal, .hi { opacity: 1 !important; transform: none !important; }
  .timeline-card, .about, .sg, .sg-card, .project-inner {
    box-shadow: none !important;
    break-inside: avoid;
  }
  .lfill { width: var(--w) !important; }
}

/* ── Responsive ── */
.mob-bottom-nav { display: none; }

@media (max-width: 900px) {
  .root { display: block; overflow-x: hidden; }
  .sidebar { display: none; }

  .mob-head {
    display: block;
    position: sticky;
    top: 0;
    z-index: 50;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    background: rgba(248,250,252,0.92);
    border-bottom: 1px solid var(--rule);
  }

  .mob-head-inner { padding: 0.85rem 1.25rem 0.75rem; }

  .mob-identity {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.65rem;
  }

  .mob-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0c1222, #1e293b);
    color: var(--accent-light);
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 0.8rem;
    display: grid; place-items: center;
    flex-shrink: 0;
    box-shadow: 0 0 0 2px rgba(13,148,136,0.3);
  }

  .mob-name {
    font-family: var(--font-display);
    font-size: 1.05rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.15;
    color: var(--text);
  }

  .mob-name em {
    font-style: normal;
    background: linear-gradient(135deg, var(--accent), var(--accent-light));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .mob-title { font-size: 0.68rem; color: var(--muted); margin: 0.1rem 0 0; font-weight: 500; }

  .mob-cv-btn {
    margin-left: auto;
    flex-shrink: 0;
    padding: 0.4rem 0.9rem;
    font-size: 0.72rem;
    font-weight: 600;
    border-radius: 10px;
    cursor: pointer;
    background: linear-gradient(135deg, var(--accent), #0f766e);
    color: #fff;
    border: none;
    box-shadow: 0 4px 12px var(--accent-glow);
  }

  .mob-tabs {
    display: flex;
    gap: 0.35rem;
  }

  .mtab {
    flex: 1;
    padding: 0.35rem 0.5rem;
    font-size: 0.68rem;
    font-weight: 600;
    color: var(--muted);
    background: var(--surface);
    border: 1px solid var(--rule);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.25s;
    text-align: center;
  }

  .mtab--on {
    background: var(--accent);
    color: #fff;
    border-color: var(--accent);
    box-shadow: 0 4px 12px var(--accent-glow);
  }

  /* Bottom nav */
  .mob-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 50;
    background: rgba(248,250,252,0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid var(--rule);
    padding: 0.4rem 0 calc(0.4rem + env(safe-area-inset-bottom));
  }

  .mbnav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    padding: 0.3rem 0;
    background: none;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .mbnav-num {
    font-size: 0.5rem;
    font-family: ui-monospace, monospace;
    font-weight: 700;
    color: var(--faint);
  }

  .mbnav-label {
    font-size: 0.6rem;
    font-weight: 600;
    color: var(--muted);
    white-space: nowrap;
  }

  .mbnav-item--on .mbnav-num,
  .mbnav-item--on .mbnav-label { color: var(--accent); }

  .mbnav-item--on { background: rgba(13,148,136,0.06); border-radius: 8px; }

  .content { padding: 2rem 1rem 6rem; max-width: 100%; overflow-x: hidden; box-sizing: border-box; margin: 0; }

  .timeline-item { grid-template-columns: 24px 1fr; gap: 0.85rem; }
  .timeline-card { padding: 1rem 1.15rem 1.25rem; }
  .skills2 { grid-template-columns: 1fr; }
  .snum { font-size: 4.5rem; top: -0.5rem; }
  .projects { grid-template-columns: 1fr; }
  .project, .project-inner { min-width: 0; width: 100%; box-sizing: border-box; }
  .pdesc { overflow-wrap: break-word; word-break: break-word; }
  .section { min-width: 0; max-width: 100%; }
}

@media (max-width: 480px) {
  .content { padding: 1.5rem 1rem 3rem; }
  .about { padding: 1.25rem; }
  .stitle { font-size: 1.4rem; }
}
</style>
