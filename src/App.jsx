/* eslint-disable react-hooks/immutability */
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber'
import {
  ContactShadows,
  Text,
} from '@react-three/drei'
import { Bloom, ChromaticAberration, DepthOfField, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import {
  Box,
  Braces,
  Cpu,
  FolderKanban,
  GitBranch,
  Info,
  MousePointer2,
  X,
} from 'lucide-react'
import * as THREE from 'three'
import './App.css'

const palette = {
  sky: '#6cb7d7',
  skyTop: '#4f91c5',
  skyMid: '#f2a463',
  skyHorizon: '#ffd997',
  fog: '#efaa7f',
  grass: '#3f9d5d',
  grassDark: '#176f56',
  grassLight: '#88bd55',
  grassWarm: '#5aa45b',
  path: '#c59b56',
  pathDark: '#9c7444',
  pathLight: '#f1cd84',
  wood: '#9b6644',
  darkWood: '#624235',
  sign: '#f4e7c5',
  ink: '#17233c',
  water: '#4daeb6',
  barn: '#b84e3d',
  barnShadow: '#873a3b',
  roof: '#cf6741',
  leaf: '#15865b',
  leafDark: '#0f604e',
  leafLight: '#3fa668',
  sunset: '#ffb46f',
  glow: '#ffe1a6',
}

const WorldPauseContext = createContext({ isPaused: false, timeRef: { current: 0 } })

function useWorldRuntime() {
  return useContext(WorldPauseContext)
}

function useWorldPaused() {
  return useWorldRuntime().isPaused
}

function useSceneTime() {
  return useWorldRuntime().timeRef
}

const exhibits = [
  {
    id: 'profile',
    kind: 'exhibit',
    title: 'Bohdan Ihnatenko',
    type: 'profile, goals, languages',
    room: 'main profile stand',
    accent: '#facc15',
    position: [-5.8, 1.15, -13.2],
    icon: Info,
    summary:
      'IT student in Trondelag focused on web development, IT operations, universal design, backend work, and system administration.',
    sectionTitle: 'Profile details',
    skills: ['Born Jan 1, 2006', 'Verdal, Norway', 'Driver license B / AM', 'NO / EN / RU / UA / PL beginner'],
    todo: [
      'Goal: become a system administrator or backend developer.',
      'Interested in clean solutions, accessible interfaces, Linux servers, and reliable technical setups.',
      'Portfolio identity: bohdan.lol, GitHub @wiIkwq, based in Verdal, Norway.',
    ],
    mediaNote: 'real profile photos are placed as paper prints on the path',
  },
  {
    id: 'skills',
    kind: 'exhibit',
    title: 'Skills Matrix',
    type: 'technical skill levels',
    room: 'skills pavilion',
    accent: '#2dd4bf',
    position: [0, 1.25, -13.5],
    icon: Braces,
    summary:
      'A compact version of the old portfolio skill chart: strong Python, solid Linux/Git, and active frontend practice.',
    sectionTitle: 'Skill chart from the old portfolio',
    skills: ['HTML 70%', 'CSS 60%', 'JavaScript 60%', 'Python 99%', 'Java 50%', 'Linux / Git 80%'],
    todo: [
      'Frontend: HTML, CSS, JavaScript, layout, responsive thinking, and accessibility basics.',
      'Programming: Python as the strongest language, Java as additional school/project experience.',
      'Operations: Linux, Git, server practice, PC troubleshooting, and workstation setup.',
    ],
    mediaNote: 'future slot for GitHub cards, demos, and before/after technical screenshots',
  },
  {
    id: 'education',
    title: 'Education Timeline',
    kind: 'exhibit',
    type: 'schools and IT path',
    room: 'education stand',
    accent: '#60a5fa',
    position: [-5.8, 1.15, -5.8],
    icon: FolderKanban,
    summary:
      'The old portfolio education block rebuilt as a readable timeline, from Ukrainian IT studies to Norwegian IT education.',
    sectionTitle: 'Education',
    skills: ['Levanger VGS', 'Verdal VGS', 'Mykolaiv Polytechnic', 'IT and media production'],
    todo: [
      '2025-now: Information Technology VG2-VG3 at Levanger videregaende skole.',
      '2024-2025: IM, IT and media production at Levanger VGS.',
      '2021-2025: Information Technology, junior bachelor path, Mykolaiv polytekniske fagskole.',
      '2023-2024: Grunnskole for minoritetsspraklige at Verdal VGS.',
    ],
    mediaNote: 'future slot for certificates, school projects, and timeline screenshots',
  },
  {
    id: 'experience',
    title: 'Experience Log',
    kind: 'exhibit',
    type: 'work and technical support',
    room: 'experience stand',
    accent: '#f59e0b',
    position: [5.9, 1.15, -4.2],
    icon: Cpu,
    summary:
      'Work history from the old portfolio: store work, amusement park shifts, hotel work, and freelance technical help.',
    sectionTitle: 'Experience',
    skills: ['Customer service', 'Shift lead substitute', 'Kitchen / reception', 'Freelance technician'],
    todo: [
      '2025-now: Butikkmedarbeider at Kiwi Moan, Levanger: customer service and daily store tasks.',
      'Summer 2024: Fornoyelsesparkarbeider, shift leader substitute, Namsskogan Familiepark AS.',
      'Summer 2023: Hotel worker in kitchen and reception, Namsskogan Familiepark AS.',
      '2023-now: Freelance technician for PC builds, setup help, and technical problem solving.',
    ],
    mediaNote: 'future slot for work photos, hardware builds, and repair notes',
  },
  {
    id: 'contact',
    title: 'Contact Beacon',
    kind: 'exhibit',
    type: 'email, phone, links',
    room: 'contact stand',
    accent: '#a3e635',
    position: [-5.7, 1.15, 8.5],
    icon: GitBranch,
    summary:
      'Direct contact information from the old portfolio, kept as a clean in-world sign instead of a static web section.',
    sectionTitle: 'Contact',
    skills: ['bohdan@bohdan.lol', '+47 900 97 565', 'github.com/wiIkwq', 'bohdan.lol'],
    todo: [
      'Email: bohdan@bohdan.lol',
      'Phone: +47 900 97 565',
      'Website: https://bohdan.lol/',
      'Address: Jernbanegata 14C, 7650 Verdal',
    ],
    mediaNote: 'future slot for social cards, QR codes, and downloadable CV',
  },
]

const practiceLogs = [
  {
    id: 'practice-2025-09-05',
    kind: 'practice',
    title: 'Dill Doe',
    type: 'practice log',
    room: 'Practice Log cemetery',
    accent: '#7dd3fc',
    position: [13.8, 0.92, 2.2],
    date: 'Sep 5, 2025',
    born: 'Sep 5, 2025 08:30',
    died: 'Sep 5, 2025 14:10',
    duration: '5h 40m',
    place: 'Fylkets hus, Steinkjer - ICT department',
    address: 'Strandvegen 19, 7713 Steinkjer',
    summary: 'Intro day at the ICT department with building tour, tool overview, loaner PC reinstall work, and time for personal projects.',
    todo: [
      'Met the people working that day.',
      'Got a building tour and an overview of tools such as Azure, Apple School Manager, Teams, and RDP.',
      'Reinstalled three loaner PCs from scratch.',
      'Used quiet periods for personal projects.',
    ],
    skills: ['Azure', 'Apple School Manager', 'RDP', 'Windows reinstall'],
  },
  {
    id: 'practice-2025-09-12',
    kind: 'practice',
    title: 'Dill Doe',
    type: 'practice log',
    room: 'Practice Log cemetery',
    accent: '#f0abfc',
    position: [17.0, 0.92, 2.2],
    date: 'Sep 12, 2025',
    born: 'Sep 12, 2025 08:30',
    died: 'Sep 12, 2025 14:10',
    duration: '5h 40m',
    place: 'Fylkets hus, Steinkjer - ICT department',
    address: 'Strandvegen 19, 7713 Steinkjer',
    summary: 'Hardware day with RAM upgrade, docking station software, and a full dual-monitor workspace setup.',
    todo: [
      'Replaced and upgraded RAM in a laptop.',
      'Installed new software on a docking station.',
      'Used some free time for personal tasks.',
      'Set up a new workspace with mounts, two monitors, docking station, and required equipment.',
    ],
    skills: ['RAM upgrade', 'Docking station', 'Monitor setup', 'Cable work'],
  },
  {
    id: 'practice-2025-09-19',
    kind: 'practice',
    title: 'Dill Doe',
    type: 'practice log',
    room: 'Practice Log cemetery',
    accent: '#86efac',
    position: [20.2, 0.92, 2.2],
    date: 'Sep 19, 2025',
    born: 'Sep 19, 2025 08:30',
    died: 'Sep 19, 2025 14:10',
    duration: '5h 40m',
    place: 'Fylkets hus, Steinkjer - ICT department',
    address: 'Strandvegen 19, 7713 Steinkjer',
    summary: 'A calmer day with cable cleanup, desk setup, and docking station driver testing.',
    todo: [
      'Worked mostly on the PC and personal tasks because there was little activity.',
      'Helped clean up cables and set up a new desk.',
      'Updated docking station drivers and tested that everything worked.',
    ],
    skills: ['Driver updates', 'Desk setup', 'Testing'],
  },
  {
    id: 'practice-2025-09-26',
    kind: 'practice',
    title: 'Dill Doe',
    type: 'practice log',
    room: 'Practice Log cemetery',
    accent: '#fde68a',
    position: [13.8, 0.92, 6.0],
    date: 'Sep 26, 2025',
    born: 'Sep 26, 2025 08:30',
    died: 'Sep 26, 2025 14:10',
    duration: '5h 40m',
    place: 'Fylkets hus, Steinkjer - ICT department',
    address: 'Strandvegen 19, 7713 Steinkjer',
    summary: 'Quiet practice day with laptop cleaning and small office cable work.',
    todo: [
      'Worked mostly on personal projects and watched some YouTube during low activity.',
      'Cleaned a laptop and removed dust from the fan.',
      'Moved cables and tidied part of an office area.',
    ],
    skills: ['Laptop cleaning', 'Fan dust removal', 'Office setup'],
  },
  {
    id: 'practice-2025-10-03',
    kind: 'practice',
    title: 'Dill Doe',
    type: 'practice log',
    room: 'Practice Log cemetery',
    accent: '#c4b5fd',
    position: [17.0, 0.92, 6.0],
    date: 'Oct 3, 2025',
    born: 'Oct 3, 2025 08:30',
    died: 'Oct 3, 2025 14:10',
    duration: '5h 40m',
    place: 'Fylkets hus, Steinkjer - ICT department',
    address: 'Strandvegen 19, 7713 Steinkjer',
    summary: 'Driver update and monitor troubleshooting, plus keyboard and cable assistance.',
    todo: [
      'Mostly worked at the PC on personal things.',
      'Updated drivers and tested a monitor that was not working correctly.',
      'Helped connect a keyboard and organize cables under a desk.',
    ],
    skills: ['Monitor testing', 'Driver updates', 'Keyboard setup'],
  },
  {
    id: 'practice-2025-10-10',
    kind: 'practice',
    title: 'Dill Doe',
    type: 'practice log',
    room: 'Practice Log cemetery',
    accent: '#fdba74',
    position: [20.2, 0.92, 6.0],
    date: 'Oct 10, 2025',
    born: 'Oct 10, 2025 08:30',
    died: 'Oct 10, 2025 14:10',
    duration: '5h 40m',
    place: 'Fylkets hus, Steinkjer - ICT department',
    address: 'Strandvegen 19, 7713 Steinkjer',
    summary: 'A calm day with docking station setup, monitors, and desk cleanup.',
    todo: [
      'Spent most of the day at the PC doing personal tasks.',
      'Helped connect a new docking station and monitors.',
      'Moved cables and cleaned up the desk afterward.',
    ],
    skills: ['Docking station', 'Monitor setup', 'Cable cleanup'],
  },
  {
    id: 'practice-2025-10-17',
    kind: 'practice',
    title: 'Dill Doe',
    type: 'practice log',
    room: 'Practice Log cemetery',
    accent: '#93c5fd',
    position: [13.8, 0.92, 9.8],
    date: 'Oct 17, 2025',
    born: 'Oct 17, 2025 08:30',
    died: 'Oct 17, 2025 14:10',
    duration: '5h 40m',
    place: 'Fylkets hus, Steinkjer - ICT department',
    address: 'Strandvegen 19, 7713 Steinkjer',
    summary: 'Laptop fan cleaning, monitor relocation, and cable setup at a new workstation.',
    todo: [
      'Mostly worked on personal projects because there was not much activity.',
      'Opened a laptop and cleaned dust from the fan.',
      'Moved a monitor and helped organize cables at a new workstation.',
    ],
    skills: ['Laptop maintenance', 'Monitor relocation', 'Cable setup'],
  },
  {
    id: 'practice-2025-10-24',
    kind: 'practice',
    title: 'Dill Doe',
    type: 'practice log',
    room: 'Practice Log cemetery',
    accent: '#f9a8d4',
    position: [17.0, 0.92, 9.8],
    date: 'Oct 24, 2025',
    born: 'Oct 24, 2025 08:30',
    died: 'Oct 24, 2025 14:10',
    duration: '5h 40m',
    place: 'Fylkets hus, Steinkjer - ICT department',
    address: 'Strandvegen 19, 7713 Steinkjer',
    summary: 'Quiet practice day with docking station driver updates and cable cleanup.',
    todo: [
      'Mostly stayed at the PC, watched videos, and worked on personal projects.',
      'Updated drivers on a docking station.',
      'Helped clean up cables around a workstation.',
    ],
    skills: ['Driver updates', 'Cable cleanup', 'Workstation support'],
  },
  {
    id: 'practice-2025-10-31',
    kind: 'practice',
    title: 'Dill Doe',
    type: 'practice log',
    room: 'Practice Log cemetery',
    accent: '#a7f3d0',
    position: [20.2, 0.92, 9.8],
    date: 'Oct 31, 2025',
    born: 'Oct 31, 2025 08:30',
    died: 'Oct 31, 2025 14:10',
    duration: '5h 40m',
    place: 'Fylkets hus, Steinkjer - ICT department',
    address: 'Strandvegen 19, 7713 Steinkjer',
    summary: 'Low-activity day with monitor connection help, desk cleanup, and a short mentor check-in.',
    todo: [
      'Mostly stayed at the PC, watched YouTube, and worked on personal tasks.',
      'Helped connect a monitor and clean up a desk.',
      'Had a short conversation with the mentor before leaving.',
    ],
    skills: ['Monitor connection', 'Desk cleanup', 'Mentor sync'],
  },
  {
    id: 'practice-2025-11-07',
    kind: 'practice',
    title: 'Dill Doe',
    type: 'practice log',
    room: 'Practice Log cemetery',
    accent: '#d1d5db',
    position: [13.8, 0.92, 13.6],
    date: 'Nov 7, 2025',
    born: 'Nov 7, 2025',
    died: 'Absent',
    duration: 'away',
    place: 'Fylkets hus, Steinkjer - ICT department',
    address: 'Strandvegen 19, 7713 Steinkjer',
    summary: 'Marked absent on the old practice log.',
    todo: ['Away from practice.'],
    skills: ['Absent'],
  },
  {
    id: 'practice-2025-11-14',
    kind: 'practice',
    title: 'Dill Doe',
    type: 'practice log',
    room: 'Practice Log cemetery',
    accent: '#67e8f9',
    position: [17.0, 0.92, 13.6],
    date: 'Nov 14, 2025',
    born: 'Nov 14, 2025 08:30',
    died: 'Nov 14, 2025 14:10',
    duration: '5h 40m',
    place: 'Fylkets hus, Steinkjer - ICT department',
    address: 'Strandvegen 19, 7713 Steinkjer',
    summary: 'Three-monitor workstation setup plus a county operations Teams meeting.',
    todo: [
      'Mounted and set up three new monitors at a workstation.',
      'Joined a Teams meeting dedicated to operations, arranged by the county.',
      'Used the remaining time for some personal work.',
    ],
    skills: ['Triple monitor setup', 'Operations meeting', 'Workspace setup'],
  },
  {
    id: 'practice-2025-11-21',
    kind: 'practice',
    title: 'Dill Doe',
    type: 'practice log',
    room: 'Practice Log cemetery',
    accent: '#fca5a5',
    position: [20.2, 0.92, 13.6],
    date: 'Nov 21, 2025',
    born: 'Nov 21, 2025 10:30',
    died: 'Nov 21, 2025 14:10',
    duration: '3h 40m',
    place: 'Fylkets hus, Steinkjer - ICT department',
    address: 'Strandvegen 19, 7713 Steinkjer',
    summary: 'Late arrival due to bus issues, then MAC address lookup and PXE installation for a dental health PC.',
    todo: [
      'Arrived later because the bus did not come and the next one had to be used.',
      'Checked the MAC address of a PC that needed preparation.',
      'Installed the system via PXE on a dental health PC.',
    ],
    skills: ['MAC address lookup', 'PXE install', 'Tannhelse PC'],
  },
]

const allInteractiveItems = [...exhibits, ...practiceLogs]

const GARDEN_PORTAL = {
  position: [6.35, 0, 8.65],
  radius: 1.35,
  spawn: [16.85, 1.7, 15.6],
}

const PRACTICE_EXIT_PORTAL = {
  position: [16.85, 0, 18.45],
  radius: 1.35,
  spawn: [4.8, 1.7, 10.9],
}

const keys = {
  KeyW: 'forward',
  KeyS: 'backward',
  KeyA: 'left',
  KeyD: 'right',
  ShiftLeft: 'sprint',
}

const DAY_LENGTH_SECONDS = 300
const START_PHASE = 0.68
const PLAYER_RADIUS = 0.48
const WORLD_LIMITS = {
  garden: {
    minX: -23.4,
    maxX: 23.4,
    minZ: -35.5,
    maxZ: 29.5,
  },
  practice: {
    minX: 9.6,
    maxX: 24.2,
    minZ: -2.4,
    maxZ: 24.6,
  },
}

const GARDEN_COLLISION_CIRCLES = [
  { x: 8.9, z: -13.2, radius: 3.2 },
  { x: 0, z: -17.2, radius: 2.1 },
  { x: GARDEN_PORTAL.position[0], z: GARDEN_PORTAL.position[2], radius: 0.85 },
  { x: -13, z: -20, radius: 5.4 },
  { x: 13, z: -18, radius: 6.1 },
  { x: -18, z: 14, radius: 5.8 },
  { x: 18, z: 13, radius: 5.8 },
  ...[
    [-12, -15, 1.15],
    [-10.5, -3, 1],
    [-11.5, 8, 1.1],
    [11.5, -8, 1.1],
    [12.2, 2, 1],
    [10.5, 12, 1.1],
    [-15, -8, 1.2],
    [15, -14, 1.15],
    [14.5, 9.5, 1.2],
    [-14, 13.5, 1.15],
  ].map(([x, z, radius]) => ({ x, z, radius })),
  ...exhibits.map((exhibit) => ({
    x: exhibit.position[0],
    z: exhibit.position[2],
    radius: exhibit.id === 'skills' ? 1.75 : 1.35,
  })),
]

const PRACTICE_COLLISION_CIRCLES = [
  { x: PRACTICE_EXIT_PORTAL.position[0], z: PRACTICE_EXIT_PORTAL.position[2], radius: 0.82 },
  { x: 10.6, z: 2.2, radius: 1.2 },
  { x: 23.2, z: 5.6, radius: 1.24 },
  { x: 10.8, z: 16.2, radius: 1.1 },
  { x: 22.9, z: 18.4, radius: 1.05 },
  { x: 12.2, z: -0.8, radius: 1.3 },
  { x: 22.1, z: -0.6, radius: 1.25 },
  ...practiceLogs.map((log) => ({
    x: log.position[0],
    z: log.position[2],
    radius: 0.58,
  })),
]

function getInteractiveItemsForWorld(worldId) {
  return worldId === 'practice' ? practiceLogs : exhibits
}

function getCollisionCircles(worldId) {
  return worldId === 'practice' ? PRACTICE_COLLISION_CIRCLES : GARDEN_COLLISION_CIRCLES
}

const cycleColors = {
  dayTop: new THREE.Color('#63b7e5'),
  dayMid: new THREE.Color('#8bd8ee'),
  dayHorizon: new THREE.Color('#ffe0a1'),
  sunsetTop: new THREE.Color('#5c76bd'),
  sunsetMid: new THREE.Color('#ef8e62'),
  sunsetHorizon: new THREE.Color('#ffe2a0'),
  nightTop: new THREE.Color('#071326'),
  nightMid: new THREE.Color('#172447'),
  nightHorizon: new THREE.Color('#49324a'),
  fogDay: new THREE.Color('#8ed1b6'),
  fogSunset: new THREE.Color('#e99a74'),
  fogNight: new THREE.Color('#16223b'),
  warmLight: new THREE.Color('#ffb46f'),
  daySun: new THREE.Color('#fff3c0'),
  moonLight: new THREE.Color('#98b9ff'),
}

const starMap = [
  { name: 'Polaris', az: 8, alt: 58, size: 0.16 },
  { name: 'Dubhe', az: -22, alt: 54, size: 0.13 },
  { name: 'Merak', az: -17, alt: 48, size: 0.12 },
  { name: 'Phecda', az: -8, alt: 46, size: 0.11 },
  { name: 'Megrez', az: -2, alt: 50, size: 0.09 },
  { name: 'Alioth', az: 6, alt: 53, size: 0.12 },
  { name: 'Mizar', az: 14, alt: 56, size: 0.12 },
  { name: 'Alkaid', az: 23, alt: 57, size: 0.11 },
  { name: 'Betelgeuse', az: -48, alt: 33, size: 0.14 },
  { name: 'Bellatrix', az: -35, alt: 36, size: 0.11 },
  { name: 'Alnilam', az: -42, alt: 26, size: 0.13 },
  { name: 'Alnitak', az: -47, alt: 24, size: 0.11 },
  { name: 'Mintaka', az: -37, alt: 28, size: 0.11 },
  { name: 'Rigel', az: -33, alt: 16, size: 0.15 },
  { name: 'Saiph', az: -51, alt: 17, size: 0.1 },
  { name: 'Sirius', az: -62, alt: 12, size: 0.18 },
  { name: 'Deneb', az: 42, alt: 48, size: 0.15 },
  { name: 'Sadr', az: 36, alt: 42, size: 0.1 },
  { name: 'Albireo', az: 31, alt: 31, size: 0.1 },
  { name: 'Vega', az: 57, alt: 50, size: 0.17 },
  { name: 'Altair', az: 49, alt: 26, size: 0.14 },
  { name: 'Schedar', az: 0, alt: 36, size: 0.12 },
  { name: 'Caph', az: 10, alt: 34, size: 0.1 },
  { name: 'Ruchbah', az: -7, alt: 41, size: 0.1 },
  { name: 'Segin', az: -16, alt: 43, size: 0.09 },
  { name: 'Achird', az: 5, alt: 46, size: 0.09 },
]

const constellationLines = [
  ['Dubhe', 'Merak'], ['Merak', 'Phecda'], ['Phecda', 'Megrez'], ['Megrez', 'Alioth'], ['Alioth', 'Mizar'], ['Mizar', 'Alkaid'],
  ['Betelgeuse', 'Bellatrix'], ['Betelgeuse', 'Alnitak'], ['Bellatrix', 'Mintaka'], ['Alnitak', 'Alnilam'], ['Alnilam', 'Mintaka'], ['Alnitak', 'Saiph'], ['Mintaka', 'Rigel'], ['Saiph', 'Rigel'],
  ['Deneb', 'Sadr'], ['Sadr', 'Albireo'], ['Sadr', 'Vega'], ['Sadr', 'Altair'],
  ['Caph', 'Schedar'], ['Schedar', 'Achird'], ['Achird', 'Ruchbah'], ['Ruchbah', 'Segin'],
]

function clamp01(value) {
  return THREE.MathUtils.clamp(value, 0, 1)
}

function smoothstep(edge0, edge1, value) {
  const t = clamp01((value - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

function getCycleState(elapsedTime) {
  const totalDays = elapsedTime / DAY_LENGTH_SECONDS + START_PHASE
  const dayIndex = Math.floor(totalDays)
  const phase = totalDays % 1
  const hour = phase * 24
  const sunAngle = phase * Math.PI * 2 - Math.PI / 2
  const sunX = Math.cos(sunAngle)
  const sunY = Math.sin(sunAngle)
  const sunZ = -0.72 + Math.sin(sunAngle * 0.72) * 0.28
  const dayAmount = smoothstep(-0.08, 0.18, sunY)
  const nightAmount = 1 - smoothstep(-0.16, 0.18, sunY)
  const eclipseWindow = smoothstep(0.43, 0.49, phase) * (1 - smoothstep(0.52, 0.58, phase))
  const eclipseAmount = dayIndex % 3 === 2 ? eclipseWindow * dayAmount : 0
  const goldenAmount = clamp01(1 - Math.abs(sunY - 0.04) / 0.28) * (1 - nightAmount * 0.45)
  const lampAmount = Math.max(1 - smoothstep(-0.12, 0.24, sunY), eclipseAmount * 0.88)

  return {
    dayIndex,
    phase,
    hour,
    sunX,
    sunY,
    sunZ,
    moonX: -sunX,
    moonY: -sunY,
    moonZ: -sunZ,
    dayAmount,
    nightAmount,
    goldenAmount,
    eclipseAmount,
    lampAmount,
    exposure: (0.74 + dayAmount * 0.36 + goldenAmount * 0.08) * (1 - eclipseAmount * 0.42),
  }
}

function resolvePlayerCollision(position, worldId) {
  const limits = WORLD_LIMITS[worldId] ?? WORLD_LIMITS.garden
  position.x = THREE.MathUtils.clamp(position.x, limits.minX, limits.maxX)
  position.z = THREE.MathUtils.clamp(position.z, limits.minZ, limits.maxZ)

  getCollisionCircles(worldId).forEach(({ x, z, radius }) => {
    const dx = position.x - x
    const dz = position.z - z
    const distance = Math.hypot(dx, dz)
    const minDistance = radius + PLAYER_RADIUS

    if (distance > 0.001 && distance < minDistance) {
      const push = minDistance - distance
      position.x += (dx / distance) * push
      position.z += (dz / distance) * push
    }
  })

  position.x = THREE.MathUtils.clamp(position.x, limits.minX, limits.maxX)
  position.z = THREE.MathUtils.clamp(position.z, limits.minZ, limits.maxZ)
}

function horizontalDistance(position, target) {
  return Math.hypot(position.x - target[0], position.z - target[2])
}

function App() {
  const [isLocked, setIsLocked] = useState(false)
  const [focusedId, setFocusedId] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const [worldId, setWorldId] = useState('garden')
  const [hasEntered, setHasEntered] = useState(() =>
    new URLSearchParams(window.location.search).has('preview'),
  )
  const activeIdRef = useRef(activeId)
  const hasEnteredRef = useRef(hasEntered)
  const isPausedRef = useRef(isPaused)
  const resumeLockRef = useRef(false)
  const resumeLockTimerRef = useRef(null)

  const focusedItem = allInteractiveItems.find((item) => item.id === focusedId)
  const activeItem = allInteractiveItems.find((item) => item.id === activeId)

  useEffect(() => {
    activeIdRef.current = activeId
    hasEnteredRef.current = hasEntered
    isPausedRef.current = isPaused
  }, [activeId, hasEntered, isPaused])

  useEffect(() => {
    return () => {
      if (resumeLockTimerRef.current) {
        window.clearTimeout(resumeLockTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const onPointerLockChange = () => {
      const locked = Boolean(document.pointerLockElement)
      setIsLocked(locked)

      if (locked) {
        resumeLockRef.current = false
        if (resumeLockTimerRef.current) {
          window.clearTimeout(resumeLockTimerRef.current)
          resumeLockTimerRef.current = null
        }
      }

      if (!locked && resumeLockRef.current) {
        return
      }

      if (!locked && hasEnteredRef.current && !activeIdRef.current && !isPausedRef.current) {
        setIsPaused(true)
      }
    }

    document.addEventListener('pointerlockchange', onPointerLockChange)
    return () => document.removeEventListener('pointerlockchange', onPointerLockChange)
  }, [])

  useEffect(() => {
    if (activeId || isPaused) {
      document.exitPointerLock?.()
    }
  }, [activeId, isPaused])

  const requestGameFocus = useCallback(() => {
    resumeLockRef.current = true
    if (resumeLockTimerRef.current) {
      window.clearTimeout(resumeLockTimerRef.current)
    }
    resumeLockTimerRef.current = window.setTimeout(() => {
      resumeLockRef.current = false
    }, 700)

    setIsPaused(false)
    try {
      const pointerLockRequest = document.body.requestPointerLock?.()
      pointerLockRequest?.catch?.(() => {
        resumeLockRef.current = false
        setIsLocked(false)
      })
    } catch {
      resumeLockRef.current = false
      setIsLocked(false)
    }
  }, [])

  const enterMuseum = useCallback(() => {
    setHasEntered(true)
    requestGameFocus()
  }, [requestGameFocus])

  const resumeGame = useCallback(() => {
    requestGameFocus()
  }, [requestGameFocus])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === 'Escape') {
        event.preventDefault()

        if (activeIdRef.current) {
          setActiveId(null)
          resumeGame()
          return
        }

        if (!hasEnteredRef.current) return

        if (isPausedRef.current) {
          resumeGame()
          return
        }

        setIsPaused(true)
      }

      if (event.code === 'KeyE' && focusedId && !activeId && !isPausedRef.current) {
        setActiveId(focusedId)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeId, focusedId, resumeGame])

  return (
    <main className="museum-app">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{ position: [0, 1.7, 15], rotation: [-0.48, 0, 0], fov: 68, near: 0.1, far: 120 }}
        dpr={[1, 1.35]}
        frameloop={isPaused ? 'demand' : 'always'}
        gl={{ antialias: true, powerPreference: 'high-performance', stencil: false, alpha: false }}
        performance={{ min: 0.72 }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFShadowMap
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.06
        }}
      >
        <MuseumScene
          setFocusedId={setFocusedId}
          openExhibit={setActiveId}
          isPaused={isPaused}
          worldId={worldId}
          setWorldId={setWorldId}
        />
      </Canvas>

      {hasEntered && (
        <>
          <div className="lens-overlay" aria-hidden="true">
            <span className="lens-line lens-line-top" />
            <span className="lens-line lens-line-bottom" />
            <span className="lens-corner lens-corner-left" />
            <span className="lens-corner lens-corner-right" />
          </div>

          <div className="crosshair" aria-hidden="true">
            <span />
          </div>

          <header className="topbar">
            <div>
              <p className="eyebrow">{worldId === 'practice' ? 'Practice Realm' : 'Creator Garden Alley'}</p>
              <h1>{worldId === 'practice' ? 'Practice Log' : 'Bohdan Portfolio'}</h1>
            </div>
          </header>

          <aside className="controls-panel" aria-label="Controls">
            <div>
              <MousePointer2 size={16} />
              <span>WASD move</span>
            </div>
            <div>
              <Info size={16} />
              <span>{isLocked ? 'mouse look' : 'drag to look'}</span>
            </div>
            <div>
              <Info size={16} />
              <span>E open focused item</span>
            </div>
          </aside>

        </>
      )}

      {focusedItem && hasEntered && !activeItem && !isPaused && (
        <div className="focus-prompt">
          <span style={{ '--accent': focusedItem.accent }}>{focusedItem.title}</span>
          <kbd>E</kbd>
        </div>
      )}

      {focusedItem?.kind === 'practice' && hasEntered && !activeItem && !isPaused && (
        <PracticePreview log={focusedItem} />
      )}

      {!hasEntered && (
        <section className="entry-overlay" aria-label="Enter alley">
          <div>
            <span className="entry-glow" aria-hidden="true" />
            <p className="eyebrow">Desktop playable portfolio</p>
            <h2>Bohdan Portfolio Garden</h2>
            <p>
              Walk through a stylized garden built from the real old portfolio data, then step
              through the neon portal into a separate Practice Log realm.
            </p>
            <div className="entry-chips" aria-hidden="true">
              <span>real CV stands</span>
              <span>dynamic sky</span>
              <span>separate practice realm</span>
            </div>
            <button type="button" onClick={enterMuseum}>
              Enter the garden
            </button>
          </div>
        </section>
      )}

      {isPaused && hasEntered && !activeItem && (
        <PauseMenu resume={resumeGame} />
      )}

      {activeItem && (
        <ProjectPanel
          item={activeItem}
          close={() => {
            setActiveId(null)
            requestGameFocus()
          }}
        />
      )}

      <div className="mobile-block">
        <div>
          <h2>Desktop only prototype</h2>
          <p>Open it on a computer: this build is made for keyboard, mouse, and a wide screen.</p>
        </div>
      </div>
    </main>
  )
}

function MuseumScene({ setFocusedId, openExhibit, isPaused, worldId, setWorldId }) {
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    if (!isPaused) {
      timeRef.current += Math.min(delta, 0.05)
    }
  })

  return (
    <WorldPauseContext.Provider value={{ isPaused, timeRef }}>
      <color attach="background" args={['#efaa7f']} />
      <fog attach="fog" args={[palette.fog, 18, 74]} />

      <SunsetSky />
      <WorldLighting />

      <PlayerRig
        setFocusedId={setFocusedId}
        openExhibit={openExhibit}
        isPaused={isPaused}
        worldId={worldId}
        setWorldId={setWorldId}
      />

      {worldId === 'garden' ? (
        <>
          <OutdoorAlley />
          <WelcomeStudio />

          {exhibits.map((exhibit) => (
            <Exhibit key={exhibit.id} exhibit={exhibit} openExhibit={openExhibit} />
          ))}

          <TimelineGate />
        </>
      ) : (
        <PracticeLogArea openExhibit={openExhibit} />
      )}

      <ContactShadows
        position={[0, 0.035, 0]}
        opacity={0.34}
        scale={52}
        blur={1.7}
        far={22}
        frames={1}
      />

      <EffectComposer multisampling={0} resolutionScale={0.78}>
        <DepthOfField focusDistance={0.055} focalLength={0.018} bokehScale={0.32} height={320} />
        <Bloom intensity={0.36} luminanceThreshold={0.78} luminanceSmoothing={0.48} mipmapBlur />
        <ChromaticAberration offset={[0.00028, 0.00018]} radialModulation modulationOffset={0.14} />
        <Noise opacity={0.014} />
        <Vignette eskil={false} offset={0.14} darkness={0.36} />
      </EffectComposer>

    </WorldPauseContext.Provider>
  )
}

function WorldLighting() {
  const { gl, scene } = useThree()
  const isPaused = useWorldPaused()
  const sceneTime = useSceneTime()
  const ambientRef = useRef()
  const hemiRef = useRef()
  const sunRef = useRef()
  const moonRef = useRef()
  const fillRef = useRef()
  const hubRef = useRef()
  const portalRef = useRef()
  const pathRef = useRef()
  const lastCssUpdate = useRef(0)
  const fogColor = useMemo(() => new THREE.Color(), [])
  const sunColor = useMemo(() => new THREE.Color(), [])

  useFrame(() => {
    if (isPaused) return

    if (
      !sunRef.current ||
      !moonRef.current ||
      !ambientRef.current ||
      !hemiRef.current ||
      !fillRef.current ||
      !hubRef.current ||
      !portalRef.current ||
      !pathRef.current
    ) return

    const t = sceneTime.current
    const cycle = getCycleState(t)
    const sunHeight = Math.max(cycle.sunY, -0.18)
    const sunIntensity = (cycle.dayAmount * 3.25 + cycle.goldenAmount * 2.2) * (1 - cycle.eclipseAmount * 0.86)
    const moonIntensity = cycle.nightAmount * 1.15 + cycle.eclipseAmount * 0.45

    sunRef.current.position.set(cycle.sunX * 34, sunHeight * 34 + 3, cycle.sunZ * 34)
    sunRef.current.intensity = sunIntensity
    sunColor.copy(cycleColors.warmLight).lerp(cycleColors.daySun, cycle.dayAmount * 0.45)
    sunRef.current.color.copy(sunColor)

    moonRef.current.position.set(cycle.moonX * 25, Math.max(cycle.moonY, 0.12) * 25 + 5, cycle.moonZ * 25)
    moonRef.current.intensity = moonIntensity

    ambientRef.current.intensity = (0.14 + cycle.dayAmount * 0.34 + cycle.goldenAmount * 0.08) * (1 - cycle.eclipseAmount * 0.48)
    hemiRef.current.intensity = (0.28 + cycle.dayAmount * 0.92 + cycle.nightAmount * 0.28) * (1 - cycle.eclipseAmount * 0.58)
    fillRef.current.intensity = 0.22 + cycle.nightAmount * 0.42 + cycle.eclipseAmount * 0.3

    hubRef.current.intensity = 1.1 + cycle.lampAmount * 2.4 + cycle.goldenAmount * 0.7
    portalRef.current.intensity = 0.65 + cycle.lampAmount * 2.4 + cycle.eclipseAmount * 1.8
    pathRef.current.intensity = 0.18 + cycle.lampAmount * 1.25

    fogColor.copy(cycleColors.fogNight).lerp(cycleColors.fogDay, cycle.dayAmount)
    fogColor.lerp(cycleColors.fogSunset, cycle.goldenAmount * 0.62)
    fogColor.lerp(new THREE.Color('#171a2f'), cycle.eclipseAmount * 0.68)
    scene.fog.color.copy(fogColor)
    scene.fog.near = 17 - cycle.nightAmount * 4
    scene.fog.far = 78 - cycle.nightAmount * 10 - cycle.eclipseAmount * 16
    gl.toneMappingExposure = cycle.exposure

    if (t - lastCssUpdate.current > 0.18) {
      document.documentElement.style.setProperty('--world-night', cycle.nightAmount.toFixed(3))
      document.documentElement.style.setProperty('--world-sunset', cycle.goldenAmount.toFixed(3))
      document.documentElement.style.setProperty('--world-eclipse', cycle.eclipseAmount.toFixed(3))
      lastCssUpdate.current = t
    }
  })

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.28} color="#ffe6be" />
      <hemisphereLight ref={hemiRef} args={['#ffd8ac', '#176048', 1.18]} />
      <directionalLight
        ref={sunRef}
        position={[-12, 8.5, -10]}
        intensity={4.7}
        color="#ffba74"
        castShadow
        shadow-mapSize={4096}
        shadow-bias={-0.00008}
        shadow-normalBias={0.045}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-camera-near={0.5}
        shadow-camera-far={72}
      />
      <directionalLight ref={moonRef} position={[10, 12, 8]} intensity={0.35} color={cycleColors.moonLight} />
      <directionalLight ref={fillRef} position={[8, 6, 10]} intensity={0.9} color="#6fbaff" />
      <pointLight ref={hubRef} position={[0, 4.4, -13]} color="#ffe2a0" intensity={4.2} distance={17} />
      <pointLight ref={portalRef} position={[GARDEN_PORTAL.position[0], 2.2, GARDEN_PORTAL.position[2]]} color="#7defff" intensity={1.9} distance={12} />
      <pointLight ref={pathRef} position={[0, 2.8, 3.2]} color="#ffd58b" intensity={1.15} distance={18} />
    </>
  )
}

function SunsetSky() {
  const { camera } = useThree()
  const isPaused = useWorldPaused()
  const sceneTime = useSceneTime()
  const sunRef = useRef()
  const sunGlowRef = useRef()
  const moonRef = useRef()
  const eclipseRef = useRef()
  const sunMaterialRef = useRef()
  const sunGlowMaterialRef = useRef()
  const moonMaterialRef = useRef()
  const eclipseMaterialRef = useRef()
  const topColor = useMemo(() => new THREE.Color(), [])
  const midColor = useMemo(() => new THREE.Color(), [])
  const horizonColor = useMemo(() => new THREE.Color(), [])
  const skyMaterial = useMemo(
    () => ({
      uniforms: {
        topColor: { value: new THREE.Color(palette.skyTop) },
        midColor: { value: new THREE.Color(palette.skyMid) },
        horizonColor: { value: new THREE.Color(palette.skyHorizon) },
        groundColor: { value: new THREE.Color('#2f6d58') },
        sunDirection: { value: new THREE.Vector3(-0.55, 0.16, -0.82).normalize() },
        moonAmount: { value: 0 },
        cloudAmount: { value: 0.5 },
        eclipseAmount: { value: 0 },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;

        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 horizonColor;
        uniform vec3 groundColor;
        uniform vec3 sunDirection;
        uniform float moonAmount;
        uniform float cloudAmount;
        uniform float eclipseAmount;
        uniform float time;
        varying vec3 vWorldPosition;

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
          );
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 4; i++) {
            value += noise(p) * amplitude;
            p *= 2.02;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          vec3 direction = normalize(vWorldPosition);
          float height = clamp(direction.y * 0.5 + 0.5, 0.0, 1.0);
          float horizon = smoothstep(0.18, 0.54, height);
          vec3 sky = mix(horizonColor, midColor, horizon);
          sky = mix(sky, topColor, smoothstep(0.55, 1.0, height));
          sky = mix(groundColor, sky, smoothstep(0.18, 0.34, height));

          float sun = pow(max(dot(direction, sunDirection), 0.0), 190.0);
          float halo = pow(max(dot(direction, sunDirection), 0.0), 18.0);
          sky += vec3(1.0, 0.48, 0.18) * halo * 0.34;
          sky += vec3(1.0, 0.82, 0.48) * sun * 1.2;

          vec2 cloudUv = direction.xz * 2.15 + vec2(time * 0.006, -time * 0.003);
          float highCloud = fbm(cloudUv * 2.4 + direction.y * 0.8);
          float cloudMask = smoothstep(0.46, 0.76, highCloud) * smoothstep(0.22, 0.54, height) * (1.0 - smoothstep(0.88, 1.0, height));
          vec3 cloudColor = mix(vec3(0.94, 0.98, 1.0), vec3(1.0, 0.66, 0.42), clamp(halo * 1.7, 0.0, 1.0));
          cloudColor = mix(cloudColor, vec3(0.28, 0.34, 0.56), moonAmount * 0.55 + eclipseAmount * 0.52);
          sky = mix(sky, cloudColor, cloudMask * cloudAmount * 0.42);
          sky *= 1.0 - eclipseAmount * 0.48;

          gl_FragColor = vec4(sky, 1.0);
        }
      `,
    }),
    [],
  )

  useFrame(() => {
    if (isPaused) return
    if (!sunRef.current || !sunMaterialRef.current || !sunGlowRef.current || !moonRef.current || !eclipseRef.current) return

    const t = sceneTime.current
    const cycle = getCycleState(t)
    const material = sunMaterialRef.current
    const glowMaterial = sunGlowMaterialRef.current
    const moonMaterial = moonMaterialRef.current
    const eclipseMaterial = eclipseMaterialRef.current
    const uniforms = skyMaterial.uniforms

    topColor.copy(cycleColors.nightTop).lerp(cycleColors.dayTop, cycle.dayAmount)
    topColor.lerp(cycleColors.sunsetTop, cycle.goldenAmount * 0.8)
    topColor.lerp(new THREE.Color('#090d1d'), cycle.eclipseAmount * 0.72)
    midColor.copy(cycleColors.nightMid).lerp(cycleColors.dayMid, cycle.dayAmount)
    midColor.lerp(cycleColors.sunsetMid, cycle.goldenAmount * 0.88)
    midColor.lerp(new THREE.Color('#20224a'), cycle.eclipseAmount * 0.62)
    horizonColor.copy(cycleColors.nightHorizon).lerp(cycleColors.dayHorizon, cycle.dayAmount)
    horizonColor.lerp(cycleColors.sunsetHorizon, cycle.goldenAmount * 0.9)
    horizonColor.lerp(new THREE.Color('#46314e'), cycle.eclipseAmount * 0.52)

    uniforms.topColor.value.copy(topColor)
    uniforms.midColor.value.copy(midColor)
    uniforms.horizonColor.value.copy(horizonColor)
    uniforms.sunDirection.value.set(cycle.sunX, cycle.sunY, cycle.sunZ).normalize()
    uniforms.moonAmount.value = cycle.nightAmount
    uniforms.cloudAmount.value = 0.5 + cycle.goldenAmount * 0.28 + cycle.eclipseAmount * 0.18
    uniforms.eclipseAmount.value = cycle.eclipseAmount
    uniforms.time.value = t

    sunRef.current.position.set(cycle.sunX * 70, cycle.sunY * 70, cycle.sunZ * 70)
    sunGlowRef.current.position.copy(sunRef.current.position)
    moonRef.current.position.set(cycle.moonX * 68, cycle.moonY * 68, cycle.moonZ * 68)
    eclipseRef.current.position.copy(sunRef.current.position).add(new THREE.Vector3(0, 0, 0.8))
    sunRef.current.lookAt(camera.position)
    sunGlowRef.current.lookAt(camera.position)
    moonRef.current.lookAt(camera.position)
    eclipseRef.current.lookAt(camera.position)

    material.opacity = clamp01(cycle.dayAmount + cycle.goldenAmount * 0.65) * (1 - cycle.eclipseAmount * 0.38)
    glowMaterial.opacity = clamp01(0.1 + cycle.goldenAmount * 0.28 + cycle.dayAmount * 0.08) * (1 - cycle.eclipseAmount * 0.72)
    moonMaterial.opacity = cycle.nightAmount * 0.85
    eclipseMaterial.opacity = cycle.eclipseAmount * 0.96
  })

  return (
    <group renderOrder={-1000}>
      <mesh frustumCulled={false}>
        <sphereGeometry args={[90, 48, 24]} />
        <shaderMaterial
          attach="material"
          args={[skyMaterial]}
          side={THREE.BackSide}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      <mesh ref={sunRef} position={[-30, 12.8, -50]} renderOrder={-900}>
        <circleGeometry args={[5.2, 64]} />
        <meshBasicMaterial ref={sunMaterialRef} color="#ffd18a" transparent opacity={0.92} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={sunGlowRef} position={[-30, 12.8, -50]} renderOrder={-901}>
        <circleGeometry args={[13, 64]} />
        <meshBasicMaterial ref={sunGlowMaterialRef} color="#ff8f5e" transparent opacity={0.16} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={moonRef} position={[28, 20, 50]} renderOrder={-902}>
        <circleGeometry args={[3.4, 48]} />
        <meshBasicMaterial ref={moonMaterialRef} color="#d9e6ff" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={eclipseRef} position={[-30, 12.8, -49]} renderOrder={-899}>
        <circleGeometry args={[5.45, 64]} />
        <meshBasicMaterial ref={eclipseMaterialRef} color="#090a15" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <RealStarMap />

      <Cloud position={[-18, 9.5, -42]} scale={2.2} color="#ffe0c7" shadowColor="#d98d7a" />
      <Cloud position={[8, 11.2, -46]} scale={1.8} color="#ffd9bf" shadowColor="#d98776" />
      <Cloud position={[22, 7.2, -34]} scale={1.35} color="#f3c7b0" shadowColor="#c97872" />
      <Cloud position={[-34, 13.6, -58]} scale={2.8} color="#ffd7bd" shadowColor="#b86f72" />
      <Cloud position={[36, 12.4, -54]} scale={2.35} color="#ffe7ca" shadowColor="#c78379" />
      <Cloud position={[2, 15.2, -64]} scale={3.05} color="#fff1d3" shadowColor="#d99082" />
    </group>
  )
}

function starToPosition({ az, alt }, radius = 82) {
  const azimuth = THREE.MathUtils.degToRad(az)
  const altitude = THREE.MathUtils.degToRad(alt)
  const y = Math.sin(altitude) * radius
  const flat = Math.cos(altitude) * radius
  return [Math.sin(azimuth) * flat, y, -Math.cos(azimuth) * flat]
}

function RealStarMap() {
  const isPaused = useWorldPaused()
  const sceneTime = useSceneTime()
  const groupRef = useRef()
  const starMaterialRefs = useRef([])
  const lineMaterialRefs = useRef([])
  const starPositions = useMemo(() => {
    const map = new Map()
    starMap.forEach((star) => {
      map.set(star.name, starToPosition(star))
    })
    return map
  }, [])

  useFrame(() => {
    if (isPaused) return
    if (!groupRef.current) return

    const cycle = getCycleState(sceneTime.current)
    const starOpacity = Math.max(cycle.nightAmount, cycle.eclipseAmount * 0.55)
    starMaterialRefs.current.forEach((material) => {
      if (material) material.opacity = starOpacity
    })
    lineMaterialRefs.current.forEach((material) => {
      if (material) material.opacity = starOpacity * 0.34
    })
  })

  return (
    <group ref={groupRef} renderOrder={-850}>
      {starMap.map((star, index) => (
        <mesh key={star.name} position={starPositions.get(star.name)} scale={star.size * 2.15}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial
            ref={(node) => {
              starMaterialRefs.current[index] = node
            }}
            color="#e7f0ff"
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
      {constellationLines.map(([from, to], index) => {
        const fromPosition = new THREE.Vector3(...starPositions.get(from))
        const toPosition = new THREE.Vector3(...starPositions.get(to))
        const mid = fromPosition.clone().lerp(toPosition, 0.5)
        const length = fromPosition.distanceTo(toPosition)
        const direction = toPosition.clone().sub(fromPosition).normalize()
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)

        return (
          <mesh key={`${from}-${to}`} position={mid} quaternion={quaternion}>
            <cylinderGeometry args={[0.038, 0.038, length, 6]} />
            <meshBasicMaterial
              ref={(node) => {
                lineMaterialRefs.current[index] = node
              }}
              color="#94b9ff"
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function PlayerRig({ setFocusedId, openExhibit, isPaused, worldId, setWorldId }) {
  const { camera } = useThree()
  const sceneTime = useSceneTime()
  const pressed = useRef({})
  const velocity = useRef(new THREE.Vector3())
  const forwardVector = useRef(new THREE.Vector3())
  const rightVector = useRef(new THREE.Vector3())
  const moveVector = useRef(new THREE.Vector3())
  const targetVector = useRef(new THREE.Vector3())
  const lastFocus = useRef(null)
  const isDragging = useRef(false)
  const yaw = useRef(0)
  const pitch = useRef(-0.48)
  const portalCooldown = useRef(0)

  useEffect(() => {
    camera.rotation.order = 'YXZ'
    camera.lookAt(0, 0.65, -4.5)
    pitch.current = camera.rotation.x
    yaw.current = camera.rotation.y

    const onKeyDown = (event) => {
      if (isPaused) return

      pressed.current[keys[event.code] || event.code] = true
      if (event.code === 'KeyE' && lastFocus.current) {
        openExhibit(lastFocus.current)
      }
    }

    const onKeyUp = (event) => {
      pressed.current[keys[event.code] || event.code] = false
    }

    const onPointerDown = (event) => {
      if (isPaused) return

      if (
        event.target instanceof HTMLElement &&
        event.target.closest('button, .project-panel, .entry-overlay')
      ) {
        return
      }
      isDragging.current = true
    }

    const onPointerUp = () => {
      isDragging.current = false
    }

    const onPointerMove = (event) => {
      if (isPaused) return

      const pointerLocked = Boolean(document.pointerLockElement)
      if (!pointerLocked && !isDragging.current) {
        return
      }

      yaw.current -= event.movementX * 0.002
      pitch.current -= event.movementY * 0.002
      pitch.current = THREE.MathUtils.clamp(pitch.current, -1.25, 1.25)
      camera.rotation.set(pitch.current, yaw.current, 0)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointermove', onPointerMove)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointermove', onPointerMove)
    }
  }, [camera, isPaused, openExhibit])

  useFrame((_, delta) => {
    if (isPaused) {
      velocity.current.set(0, 0, 0)
      return
    }

    const speed = pressed.current.sprint ? 7.8 : 4.8
    const forward = forwardVector.current
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = rightVector.current.crossVectors(forward, camera.up).normalize()
    const move = moveVector.current.set(0, 0, 0)

    if (pressed.current.forward) move.add(forward)
    if (pressed.current.backward) move.sub(forward)
    if (pressed.current.right) move.add(right)
    if (pressed.current.left) move.sub(right)

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed)
    }

    velocity.current.lerp(move, Math.min(delta * 12, 1))
    camera.position.addScaledVector(velocity.current, delta)
    resolvePlayerCollision(camera.position, worldId)

    portalCooldown.current = Math.max(0, portalCooldown.current - delta)

    if (portalCooldown.current <= 0 && worldId === 'garden' && horizontalDistance(camera.position, GARDEN_PORTAL.position) < GARDEN_PORTAL.radius) {
      setWorldId('practice')
      camera.position.set(...GARDEN_PORTAL.spawn)
      yaw.current = Math.PI
      pitch.current = -0.28
      camera.rotation.set(pitch.current, yaw.current, 0)
      velocity.current.set(0, 0, 0)
      pressed.current = {}
      lastFocus.current = null
      setFocusedId(null)
      portalCooldown.current = 1.2
      return
    }

    if (portalCooldown.current <= 0 && worldId === 'practice' && horizontalDistance(camera.position, PRACTICE_EXIT_PORTAL.position) < PRACTICE_EXIT_PORTAL.radius) {
      setWorldId('garden')
      camera.position.set(...PRACTICE_EXIT_PORTAL.spawn)
      yaw.current = -0.48
      pitch.current = -0.36
      camera.rotation.set(pitch.current, yaw.current, 0)
      velocity.current.set(0, 0, 0)
      pressed.current = {}
      lastFocus.current = null
      setFocusedId(null)
      portalCooldown.current = 1.2
      return
    }

    const moveAmount = THREE.MathUtils.clamp(velocity.current.length() / speed, 0, 1)
    const t = sceneTime.current
    const bob = Math.sin(t * 9.2) * 0.038 * moveAmount
    const sway = Math.sin(t * 4.6) * 0.009 * moveAmount
    camera.position.y = 1.7 + bob
    camera.rotation.set(pitch.current + bob * 0.018, yaw.current, sway)

    let focused = null
    let score = 0.78

    getInteractiveItemsForWorld(worldId).forEach((item) => {
      if (item.kind === 'practice') {
        const toTarget = targetVector.current.set(...item.position).sub(camera.position)
        const distance = toTarget.length()
        const candidateScore = 1.18 - distance * 0.08

        if (distance < 4.4 && candidateScore > score) {
          focused = item.id
          score = candidateScore
        }
        return
      }

      const toTarget = targetVector.current.set(...item.position).sub(camera.position)
      const distance = toTarget.length()
      const directionScore = forward.dot(toTarget.normalize())
      const candidateScore = directionScore - distance * 0.04

      if (distance < 5.1 && directionScore > 0.72 && candidateScore > score) {
        focused = item.id
        score = candidateScore
      }
    })

    if (focused !== lastFocus.current) {
      lastFocus.current = focused
      setFocusedId(focused)
    }
  })

  return null
}

function OutdoorAlley() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[138, 146, 18, 20]} />
        <meshToonMaterial color={palette.grass} />
      </mesh>

      <DistantWorld />
      <GroundPaint />

      <mesh position={[0, 0.035, -3.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5.1, 58]} />
        <meshToonMaterial color={palette.path} />
      </mesh>
      <mesh position={[-2.78, 0.055, -3.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 57.5]} />
        <meshToonMaterial color={palette.pathLight} />
      </mesh>
      <mesh position={[2.78, 0.055, -3.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 57.5]} />
        <meshToonMaterial color={palette.pathLight} />
      </mesh>

      <mesh position={[0, 0.06, -13.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.3, 48]} />
        <meshToonMaterial color="#b99355" />
      </mesh>
      <CentralGlade position={[0, 0, 7.8]} />

      <PathNetwork />
      <PathBlendEdges />
      <PathBrushStrokes />
      <GrassField />
      <PathPebbles />
      <LeafScatter />
      <FloatingMotes />
      <Fireflies />
      <FireflyLightPool />
      <Cloud position={[-9, 8.7, -20]} scale={1.25} color="#ffe6cf" shadowColor="#dca082" />
      <Cloud position={[8, 7.7, -12]} scale={0.95} color="#f7d8c1" shadowColor="#c98e77" />
      <Cloud position={[3, 9.3, -26]} scale={0.9} color="#ffebd5" shadowColor="#d9a384" />
      <Cloud position={[-13, 7.8, -29]} scale={0.72} color="#f3d0bb" shadowColor="#bf8176" />

      <Hill position={[-13, -0.2, -20]} scale={[10, 2.8, 5]} color="#177d59" />
      <Hill position={[13, -0.3, -18]} scale={[13, 3.2, 5]} color="#207f5f" />
      <Hill position={[0, -0.4, -23]} scale={[16, 3.4, 5]} color="#25965f" />
      <Hill position={[-18, -0.6, 14]} scale={[12, 2.4, 4.5]} color="#14714f" />
      <Hill position={[18, -0.6, 13]} scale={[12, 2.5, 4.5]} color="#1c8755" />

      {[
        [-12, 0, -15, 1.35],
        [-10.5, 0, -3, 1.1],
        [-11.5, 0, 8, 1.25],
        [11.5, 0, -8, 1.2],
        [12.2, 0, 2, 1],
        [10.5, 0, 12, 1.2],
        [-15, 0, -8, 1.45],
        [15, 0, -14, 1.3],
        [14.5, 0, 9.5, 1.42],
        [-14, 0, 13.5, 1.3],
      ].map(([x, y, z, scale]) => (
        <Tree key={`${x}-${z}`} position={[x, y, z]} scale={scale} />
      ))}

      {[
        [-8.9, 0.02, -12.5, 1.1],
        [-8.4, 0.02, -5.6, 0.9],
        [-9.6, 0.02, 1.4, 1.05],
        [-8.7, 0.02, 9.2, 0.88],
        [8.8, 0.02, -10.2, 1.15],
        [9.6, 0.02, -1.1, 0.88],
        [8.6, 0.02, 4.5, 1.04],
        [9.4, 0.02, 12.4, 1.05],
      ].map(([x, y, z, scale]) => (
        <Bush key={`${x}-${z}`} position={[x, y, z]} scale={scale} />
      ))}

      {[
        [-9, 0.05, -10],
        [-8.2, 0.05, 4.2],
        [8.2, 0.05, -1.4],
        [9.4, 0.05, 8.5],
        [-3.2, 0.05, 14],
        [3.5, 0.05, 13.3],
      ].map((position) => (
        <Sunflower key={position.join('-')} position={position} />
      ))}

      <Bench position={[-3.8, 0, 6.8]} rotation={[0, -0.3, 0]} />
      <Bench position={[3.9, 0, 8.7]} rotation={[0, 0.32, 0]} />
      <Campfire position={[-7.7, 0, 15.6]} />
      <PicnicSpot position={[7.4, 0, 16.4]} rotation={[0, -0.55, 0]} />
      <ToolCart position={[-8.5, 0, -17.2]} rotation={[0, 0.32, 0]} />
      <Mailbox position={[3.8, 0, -20.7]} rotation={[0, -0.18, 0]} />
      <LampPost position={[-3.1, 0, -10.6]} />
      <LampPost position={[3.1, 0, -6]} />
      <LampPost position={[-3.1, 0, 1.1]} />
      <LampPost position={[3.1, 0, 11.7]} />
      <StringLights />
      <LightArchways />
      <DirectionBoard position={[-2.9, 0, -15.4]} rotation={[0, 0.12, 0]} />
      <PracticePortal position={GARDEN_PORTAL.position} title="Practice Log" subtitle="step inside" />
      <PortalGardenDetails />
      <PaperTrail />
      <Rocks />
    </group>
  )
}

function PathNetwork() {
  const pathSegments = [
    [-3.3, 0.064, -13.1, 3.4, 1.55, 0.04],
    [-4.9, 0.064, -9.5, 2.25, 7.2, -0.08],
    [-4.7, 0.064, -5.7, 2.1, 4.6, 0.24],
    [4.7, 0.064, -5.9, 2.15, 6.7, -0.2],
    [-4.6, 0.064, 8.4, 2.15, 7.1, 0.1],
    [4.6, 0.064, 8.75, 2.4, 5.9, -0.44],
    [6.0, 0.064, 8.58, 2.8, 2.2, Math.PI / 2],
  ]

  return (
    <group>
      {pathSegments.map(([x, y, z, width, length, rot]) => (
        <mesh key={`${x}-${z}-${rot}`} position={[x, y, z]} rotation={[-Math.PI / 2, 0, rot]} receiveShadow>
          <planeGeometry args={[width, length, 3, 8]} />
          <meshToonMaterial color="#c79d5a" />
        </mesh>
      ))}
      {[
        [-5.8, 0.071, -13.2, 1.65],
        [-5.8, 0.071, -5.8, 1.45],
        [5.9, 0.071, -4.2, 1.55],
        [-5.7, 0.071, 8.5, 1.45],
        [6.35, 0.071, 8.65, 1.9],
      ].map(([x, y, z, radius]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[radius, 44]} />
          <meshToonMaterial color="#bf9252" />
        </mesh>
      ))}
    </group>
  )
}

function PathBlendEdges() {
  const ref = useRef()
  const edgePatches = useMemo(
    () =>
      Array.from({ length: 130 }, (_, index) => {
        const row = index % 2 === 0 ? -1 : 1
        const onBranch = index > 82
        const baseZ = onBranch ? -14 + randomAt(index + 3200) * 28 : -31 + randomAt(index + 3201) * 58
        const branchSide = randomAt(index + 3202) > 0.5 ? -1 : 1
        const x = onBranch
          ? branchSide * (3.2 + randomAt(index + 3203) * 3.4)
          : row * (2.65 + randomAt(index + 3204) * 0.8)

        return {
          position: [x, 0.082, baseZ],
          rotation: randomAt(index + 3205) * Math.PI,
          scale: [0.42 + randomAt(index + 3206) * 0.95, 0.028, 0.12 + randomAt(index + 3207) * 0.24],
          color: randomAt(index + 3208) > 0.45 ? '#85b85b' : '#5c9b52',
        }
      }),
    [],
  )

  useInstancedTransforms(ref, edgePatches, ({ position, rotation, scale, color }, dummy, colorTarget) => {
    dummy.position.set(...position)
    dummy.rotation.set(0, rotation, 0)
    dummy.scale.set(...scale)
    colorTarget.set(color)
  })

  return (
    <instancedMesh ref={ref} args={[null, null, edgePatches.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#75a957" transparent opacity={0.78} />
    </instancedMesh>
  )
}

function PortalGardenDetails() {
  return (
    <group position={GARDEN_PORTAL.position}>
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[1.35, 2.25, 64]} />
        <meshBasicMaterial color="#6ee7f7" transparent opacity={0.18} depthWrite={false} toneMapped={false} />
      </mesh>
      {[
        [-1.9, 0.24, -1.05, 0.3, '#6b7065'],
        [1.75, 0.2, 1.1, 0.24, '#545f5c'],
        [-1.4, 0.18, 1.55, 0.22, '#76806f'],
        [1.35, 0.16, -1.55, 0.2, '#677768'],
      ].map(([x, y, z, scale, color]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} scale={[scale * 1.35, scale * 0.55, scale]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshToonMaterial color={color} />
        </mesh>
      ))}
      {[
        [-2.15, 0, 0.15, 0.68],
        [2.05, 0, -0.05, 0.62],
        [0.3, 0, 2.2, 0.56],
      ].map(([x, y, z, scale]) => (
        <Bush key={`${x}-${z}`} position={[x, y, z]} scale={scale} />
      ))}
    </group>
  )
}

function DistantWorld() {
  return (
    <group>
      <mesh position={[0, -0.11, -62]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[132, 64, 12, 6]} />
        <meshToonMaterial color="#2b7c59" />
      </mesh>
      <mesh position={[0, -0.12, 56]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[132, 58, 12, 6]} />
        <meshToonMaterial color="#2f865a" />
      </mesh>
      <mesh position={[-58, -0.13, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[56, 122, 6, 12]} />
        <meshToonMaterial color="#267a55" />
      </mesh>
      <mesh position={[58, -0.13, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[56, 122, 6, 12]} />
        <meshToonMaterial color="#34885b" />
      </mesh>

      <MountainRange />
      <DistantTreeLine />
      <FarForestBands />
      <BoundaryHedges />

      {[
        [-28, -0.4, -35, 12, 2.8, 5.8, '#1e694f'],
        [28, -0.5, -34, 14, 3.2, 5.4, '#207552'],
        [-30, -0.5, 25, 14, 2.7, 5.5, '#236f50'],
        [30, -0.5, 25, 13, 2.9, 5.8, '#2b8157'],
        [0, -0.6, 34, 22, 3.3, 7.8, '#287d55'],
        [-48, -0.8, -4, 22, 4.2, 9.2, '#1f7650'],
        [48, -0.75, 2, 23, 4.4, 9.5, '#2a8957'],
        [-36, -0.7, 48, 19, 3.6, 8.4, '#2a8056'],
        [38, -0.72, -52, 20, 3.9, 8.8, '#216f52'],
      ].map(([x, y, z, sx, sy, sz, color]) => (
        <Hill key={`${x}-${z}`} position={[x, y, z]} scale={[sx, sy, sz]} color={color} />
      ))}
    </group>
  )
}

function CentralGlade({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.4, 64]} />
        <meshToonMaterial color="#d7b66f" />
      </mesh>
      <mesh position={[0, 0.11, 0]} rotation={[-Math.PI / 2, 0, 0.4]} receiveShadow>
        <ringGeometry args={[1.35, 2.05, 64]} />
        <meshToonMaterial color="#f2d78f" />
      </mesh>
      <mesh position={[0, 0.18, 0]} scale={[0.82, 0.22, 0.82]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 1]} />
        <meshToonMaterial color="#6b7d69" />
      </mesh>
      {Array.from({ length: 14 }, (_, index) => {
        const angle = (index / 14) * Math.PI * 2
        const radius = 1.5 + randomAt(index + 2300) * 0.34
        const color = index % 3 === 0 ? '#ffdf6f' : index % 3 === 1 ? '#9edb75' : '#f4a261'

        return (
          <group key={index} position={[Math.cos(angle) * radius, 0.08, Math.sin(angle) * radius]}>
            <mesh position={[0, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.018, 0.026, 0.4, 6]} />
              <meshToonMaterial color="#2f8a4f" />
            </mesh>
            <mesh position={[0, 0.43, 0]} scale={0.12}>
              <sphereGeometry args={[1, 10, 6]} />
              <meshToonMaterial color={color} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function PracticeLogArea({ openExhibit }) {
  return (
    <group>
      <mesh position={[16.9, 0.03, 11.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[39, 46, 12, 14]} />
        <meshToonMaterial color="#1f5644" />
      </mesh>
      <mesh position={[16.9, 0.052, 10.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12.8, 23.8, 6, 10]} />
        <meshToonMaterial color="#233f36" />
      </mesh>
      <mesh position={[16.9, 0.065, 10.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.0, 25.0, 2, 12]} />
        <meshToonMaterial color="#7f755f" />
      </mesh>
      <mesh position={[16.9, 0.071, 8.2]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} receiveShadow>
        <planeGeometry args={[3.2, 10.8, 2, 4]} />
        <meshToonMaterial color="#776b58" />
      </mesh>

      <PracticeRealmDetails />
      <PracticePortal position={PRACTICE_EXIT_PORTAL.position} title="Return" subtitle="back to garden" />

      {practiceLogs.map((log) => (
        <Tombstone key={log.id} log={log} openExhibit={openExhibit} />
      ))}

      <FutureGraves />
      <CemeteryDetails />
    </group>
  )
}

function PracticePortal({ position, title = 'Practice Log', subtitle = 'walk close' }) {
  const isPaused = useWorldPaused()
  const sceneTime = useSceneTime()
  const ringRef = useRef()
  const innerRef = useRef()
  const lightRef = useRef()

  useFrame(() => {
    if (isPaused) return

    const t = sceneTime.current
    const cycle = getCycleState(t)
    const pulse = 0.82 + Math.sin(t * 2.8) * 0.18

    if (ringRef.current) {
      ringRef.current.rotation.z = Math.sin(t * 0.55) * 0.08
    }
    if (innerRef.current) {
      innerRef.current.opacity = 0.18 + pulse * 0.14
    }
    if (lightRef.current) {
      lightRef.current.intensity = 1.1 + cycle.lampAmount * 3.6 + pulse * 0.8
    }
  })

  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[-1.45, 1.65, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.18, 3.3, 14]} />
        <meshToonMaterial color="#2d3147" />
      </mesh>
      <mesh position={[1.45, 1.65, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.18, 3.3, 14]} />
        <meshToonMaterial color="#2d3147" />
      </mesh>
      <mesh position={[0, 3.18, 0]} castShadow>
        <boxGeometry args={[3.55, 0.28, 0.28]} />
        <meshToonMaterial color="#202638" />
      </mesh>
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[1.05, 1.48, 64]} />
        <meshBasicMaterial color="#84f6ff" transparent opacity={0.2} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef} position={[0, 1.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.16, 0.055, 16, 96]} />
        <meshBasicMaterial color="#76f7ff" transparent opacity={0.86} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.02, 64]} />
        <meshBasicMaterial ref={innerRef} color="#955dff" transparent opacity={0.25} depthWrite={false} toneMapped={false} />
      </mesh>
      <Text position={[0, 3.24, 0.18]} fontSize={0.29} color="#bdfcff" anchorX="center" outlineWidth={0.018} outlineColor="#7c3aed">
        {title}
      </Text>
      <Text position={[0, 2.83, 0.18]} fontSize={0.105} color="#fff7c2" anchorX="center">
        {subtitle}
      </Text>
      <pointLight ref={lightRef} position={[0, 1.9, 0.6]} color="#8aeaff" intensity={2.4} distance={9.5} decay={2.1} />
    </group>
  )
}

function PracticeRealmDetails() {
  return (
    <group>
      {[
        [10.7, -0.08, 1.1, 6.5, 2.1, 3.6, '#174637'],
        [23.0, -0.08, 3.0, 6.8, 2.2, 3.8, '#1b4c3d'],
        [10.9, -0.1, 19.5, 6.4, 2.0, 3.5, '#173d36'],
        [22.9, -0.1, 20.8, 6.8, 2.1, 3.5, '#1f5140'],
      ].map(([x, y, z, sx, sy, sz, color]) => (
        <Hill key={`${x}-${z}`} position={[x, y, z]} scale={[sx, sy, sz]} color={color} />
      ))}
      {[
        [11.8, 0, 2.2, 0.92],
        [22.2, 0, 5.4, 0.98],
        [11.6, 0, 15.6, 0.82],
        [22.0, 0, 17.7, 0.78],
      ].map(([x, y, z, scale]) => (
        <TwistedTree key={`${x}-${z}`} position={[x, y, z]} scale={scale} />
      ))}
      {[
        [13.1, 0.13, 0.4, 0.28],
        [20.9, 0.13, 0.9, 0.24],
        [12.4, 0.13, 18.1, 0.22],
        [21.7, 0.13, 20.8, 0.28],
        [16.6, 0.13, 22.5, 0.2],
      ].map(([x, y, z, scale]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} scale={[scale * 1.35, scale * 0.55, scale]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshToonMaterial color="#67706a" />
        </mesh>
      ))}
      {[
        [12.4, 0, 3.6, 0.82],
        [22.1, 0, 8.2, 0.94],
        [12.4, 0, 16.4, 0.78],
        [21.6, 0, 20.0, 0.72],
        [18.8, 0, -0.8, 0.64],
      ].map(([x, y, z, scale]) => (
        <Bush key={`${x}-${z}`} position={[x, y, z]} scale={scale} />
      ))}
      <LampPost position={[12.35, 0, 0.35]} />
      <LampPost position={[21.5, 0, 0.95]} />
      <Campfire position={[10.9, 0, 12.2]} />
      <Fireflies />
      <FireflyLightPool />
      <CemeteryPebbles />
    </group>
  )
}

function CemeteryPebbles() {
  const ref = useRef()
  const pebbles = useMemo(
    () =>
      Array.from({ length: 180 }, (_, index) => ({
        position: [
          11.4 + randomAt(index + 5200) * 11,
          0.09,
          0.4 + randomAt(index + 5201) * 22.2,
        ],
        scale: [
          0.045 + randomAt(index + 5202) * 0.13,
          0.016,
          0.035 + randomAt(index + 5203) * 0.12,
        ],
        rotation: randomAt(index + 5204) * Math.PI,
        color: randomAt(index + 5205) > 0.5 ? '#8f876e' : '#5f6f63',
      })),
    [],
  )

  useInstancedTransforms(ref, pebbles, ({ position, rotation, scale, color }, dummy, colorTarget) => {
    dummy.position.set(...position)
    dummy.rotation.set(0, rotation, 0)
    dummy.scale.set(...scale)
    colorTarget.set(color)
  })

  return (
    <instancedMesh ref={ref} args={[null, null, pebbles.length]} receiveShadow frustumCulled={false}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#7d7464" />
    </instancedMesh>
  )
}

function TwistedTree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.92, 0]} rotation={[0.08, 0, -0.16]} castShadow>
        <cylinderGeometry args={[0.18, 0.38, 1.85, 7]} />
        <meshToonMaterial color="#5c4038" />
      </mesh>
      {[
        [-0.42, 1.62, 0, 0.95, -0.85],
        [0.48, 1.8, 0.12, 0.92, 0.78],
        [0.02, 2.04, -0.18, 0.76, 0.18],
      ].map(([x, y, z, length, rot]) => (
        <mesh key={`${x}-${y}`} position={[x, y, z]} rotation={[0.28, 0, rot]} castShadow>
          <cylinderGeometry args={[0.055, 0.12, length, 7]} />
          <meshToonMaterial color="#4a3532" />
        </mesh>
      ))}
      {[
        [0, 2.44, 0, 1.0, '#12483d'],
        [-0.62, 2.08, 0.2, 0.68, '#19533f'],
        [0.66, 2.12, -0.1, 0.72, '#123e38'],
      ].map(([x, y, z, size, color]) => (
        <mesh key={`${x}-${y}`} position={[x, y, z]} scale={[size, size * 0.68, size]} castShadow receiveShadow>
          <sphereGeometry args={[1, 18, 10]} />
          <meshToonMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

function Tombstone({ log, openExhibit }) {
  const shape = useMemo(() => {
    const tombstone = new THREE.Shape()
    tombstone.moveTo(-0.64, -0.76)
    tombstone.lineTo(-0.64, 0.2)
    tombstone.absarc(0, 0.2, 0.64, Math.PI, 0, true)
    tombstone.lineTo(0.64, -0.76)
    tombstone.lineTo(-0.64, -0.76)
    return tombstone
  }, [])

  return (
    <group position={log.position} rotation={[0, -Math.PI / 2, 0]}>
      <mesh position={[0, -0.85, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.02, 24]} />
        <meshBasicMaterial color="#0f2d2a" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <mesh castShadow receiveShadow onClick={() => openExhibit(log.id)}>
        <extrudeGeometry args={[shape, { depth: 0.22, bevelEnabled: true, bevelSize: 0.045, bevelThickness: 0.035, bevelSegments: 4 }]} />
        <meshToonMaterial color="#a7aaa1" />
      </mesh>
      <mesh position={[0, -0.05, 0.245]}>
        <boxGeometry args={[0.94, 0.04, 0.035]} />
        <meshBasicMaterial color={log.accent} toneMapped={false} />
      </mesh>
      <Text position={[0, 0.12, 0.265]} fontSize={0.15} color="#182136" anchorX="center" anchorY="middle" maxWidth={1.05} textAlign="center">
        {log.title}
      </Text>
      <Text position={[0, -0.17, 0.265]} fontSize={0.056} color="#2c3448" anchorX="center" anchorY="middle" maxWidth={1.0} textAlign="center">
        BORN {log.born}
      </Text>
      <Text position={[0, -0.33, 0.265]} fontSize={0.056} color="#2c3448" anchorX="center" anchorY="middle" maxWidth={1.0} textAlign="center">
        DIED {log.died}
      </Text>
      <Text position={[0, -0.55, 0.265]} fontSize={0.05} color="#516070" anchorX="center" anchorY="middle" maxWidth={0.96} textAlign="center">
        {log.duration}
      </Text>
    </group>
  )
}

function FutureGraves() {
  const slots = [
    [13.8, 0.06, 17.4],
    [17.0, 0.06, 17.4],
    [20.2, 0.06, 17.4],
    [13.8, 0.06, 21.2],
    [17.0, 0.06, 21.2],
    [20.2, 0.06, 21.2],
  ]

  return (
    <group>
      {slots.map(([x, y, z], index) => (
        <group key={`${x}-${z}`} position={[x, y, z]} rotation={[0, -Math.PI / 2, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[1.65, 0.92]} />
            <meshToonMaterial color={index % 2 === 0 ? '#284d3d' : '#203f37'} />
          </mesh>
          <mesh position={[0, 0.18, -0.35]} castShadow>
            <boxGeometry args={[1.15, 0.18, 0.16]} />
            <meshToonMaterial color="#4c514f" />
          </mesh>
          <Text position={[0, 0.36, -0.47]} fontSize={0.072} color="#a9b8a9" anchorX="center">
            reserved
          </Text>
        </group>
      ))}
    </group>
  )
}

function CemeteryDetails() {
  return (
    <group>
      {[
        [12.0, 0.16, 1.0, 0.34],
        [21.8, 0.16, 4.5, 0.28],
        [12.2, 0.16, 12.8, 0.3],
        [21.5, 0.16, 15.8, 0.26],
        [15.2, 0.14, 19.4, 0.22],
      ].map(([x, y, z, scale]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} scale={[scale * 1.35, scale * 0.52, scale]} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshToonMaterial color="#5a625e" />
        </mesh>
      ))}
      {[
        [12.2, 0, 3.6, 0.82],
        [22.1, 0, 8.2, 0.94],
        [12.4, 0, 16.4, 0.78],
        [21.6, 0, 20.0, 0.72],
      ].map(([x, y, z, scale]) => (
        <Bush key={`${x}-${z}`} position={[x, y, z]} scale={scale} />
      ))}
    </group>
  )
}

function MountainRange() {
  return (
    <group>
      {[
        [-26, -0.35, -47, 6.8, 8.2, 5.8, '#315b6f'],
        [-16, -0.5, -50, 8.2, 9.5, 6.4, '#426c7a'],
        [-5, -0.6, -49, 7.2, 7.4, 5.8, '#385f74'],
        [8, -0.45, -51, 8.6, 8.8, 6.2, '#4c7480'],
        [21, -0.5, -48, 7.4, 7.9, 5.8, '#345d70'],
      ].map(([x, y, z, sx, sy, sz, color]) => (
        <mesh key={`${x}-${z}`} position={[x, y + sy * 0.5, z]} scale={[sx, sy, sz]} castShadow receiveShadow>
          <coneGeometry args={[1, 1, 5]} />
          <meshToonMaterial color={color} />
        </mesh>
      ))}
      {[
        [-16, 8.3, -50, 2.6],
        [8, 7.6, -51, 2.2],
      ].map(([x, y, z, scale]) => (
        <mesh key={`${x}-${y}`} position={[x, y, z]} scale={[scale, scale * 0.48, scale]}>
          <coneGeometry args={[1, 1, 5]} />
          <meshToonMaterial color="#f2dcb8" />
        </mesh>
      ))}
    </group>
  )
}

function DistantTreeLine() {
  const trunkRef = useRef()
  const crownRef = useRef()
  const trees = useMemo(
    () =>
      Array.from({ length: 86 }, (_, index) => {
        const back = index < 44
        const x = back ? -32 + randomAt(index + 1000) * 64 : (index % 2 === 0 ? -28 : 28) + randomAt(index + 1001) * 2.6
        const z = back ? -35.5 + randomAt(index + 1002) * 5.2 : -28 + randomAt(index + 1003) * 58
        const scale = 0.55 + randomAt(index + 1004) * 0.72
        return { position: [x, 0, z], scale, rotation: randomAt(index + 1005) * Math.PI }
      }),
    [],
  )

  useInstancedTransforms(trunkRef, trees, ({ position, scale }, dummy) => {
    dummy.position.set(position[0], 0.62 * scale, position[2])
    dummy.scale.set(0.16 * scale, 1.25 * scale, 0.16 * scale)
  })

  useInstancedTransforms(crownRef, trees, ({ position, scale, rotation }, dummy) => {
    dummy.position.set(position[0], 1.58 * scale, position[2])
    dummy.rotation.set(0, rotation, 0)
    dummy.scale.set(0.95 * scale, 1.35 * scale, 0.95 * scale)
  })

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[null, null, trees.length]} frustumCulled={false}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshToonMaterial color="#694734" />
      </instancedMesh>
      <instancedMesh ref={crownRef} args={[null, null, trees.length]} frustumCulled={false}>
        <coneGeometry args={[1, 1, 7]} />
        <meshToonMaterial color="#1b6d52" />
      </instancedMesh>
    </group>
  )
}

function FarForestBands() {
  const ref = useRef()
  const trees = useMemo(
    () =>
      Array.from({ length: 120 }, (_, index) => {
        const band = index % 4
        const along = randomAt(index + 2100)
        const offset = -52 + randomAt(index + 2101) * 104
        const position =
          band === 0
            ? [offset, 0.05, -58 - along * 10]
            : band === 1
              ? [offset, 0.05, 48 + along * 18]
              : band === 2
                ? [-54 - along * 10, 0.05, offset * 0.88]
                : [54 + along * 10, 0.05, offset * 0.88]
        return {
          position,
          scale: 0.85 + randomAt(index + 2102) * 1.55,
          rotation: randomAt(index + 2103) * Math.PI,
          color: randomAt(index + 2104) > 0.5 ? '#185f49' : '#247251',
        }
      }),
    [],
  )

  useInstancedTransforms(ref, trees, ({ position, scale, rotation, color }, dummy, colorTarget) => {
    dummy.position.set(position[0], 0.78 * scale, position[2])
    dummy.rotation.set(0, rotation, 0)
    dummy.scale.set(0.62 * scale, 1.55 * scale, 0.62 * scale)
    colorTarget.set(color)
  })

  return (
    <instancedMesh ref={ref} args={[null, null, trees.length]} frustumCulled={false} receiveShadow>
      <coneGeometry args={[1, 1, 7]} />
      <meshToonMaterial color="#1d6d4f" />
    </instancedMesh>
  )
}

function BoundaryHedges() {
  const ref = useRef()
  const hedges = useMemo(
    () => {
      const items = []
      const limits = WORLD_LIMITS.garden

      for (let index = 0; index < 42; index += 1) {
        const z = limits.minZ + index * ((limits.maxZ - limits.minZ) / 41)
        items.push({ position: [limits.minX - 0.9 + randomAt(index + 1200) * 0.4, 0.62, z], scale: 0.74 + randomAt(index + 1201) * 0.45 })
        items.push({ position: [limits.maxX + 0.9 - randomAt(index + 1300) * 0.4, 0.62, z], scale: 0.74 + randomAt(index + 1301) * 0.45 })
      }

      for (let index = 0; index < 34; index += 1) {
        const x = limits.minX + index * ((limits.maxX - limits.minX) / 33)
        items.push({ position: [x, 0.62, limits.minZ - 0.75 + randomAt(index + 1400) * 0.35], scale: 0.78 + randomAt(index + 1401) * 0.5 })
        items.push({ position: [x, 0.62, limits.maxZ + 0.9 - randomAt(index + 1500) * 0.35], scale: 0.78 + randomAt(index + 1501) * 0.5 })
      }

      return items
    },
    [],
  )

  useInstancedTransforms(ref, hedges, ({ position, scale }, dummy) => {
    dummy.position.set(...position)
    dummy.scale.set(scale * 1.2, scale * 0.75, scale)
  })

  return (
    <instancedMesh ref={ref} args={[null, null, hedges.length]} frustumCulled={false} receiveShadow>
      <sphereGeometry args={[1, 12, 8]} />
      <meshToonMaterial color="#1d7251" />
    </instancedMesh>
  )
}

function GroundPaint() {
  const ref = useRef()
  const patches = useMemo(
    () =>
      Array.from({ length: 250 }, (_, index) => {
        const side = randomAt(index + 500) > 0.5 ? 1 : -1
        const x = side * (3.6 + randomAt(index + 501) * 25)
        const z = -37 + randomAt(index + 502) * 70
        const wide = 0.7 + randomAt(index + 503) * 2.2
        return {
          position: [x, 0.041, z],
          rotation: randomAt(index + 504) * Math.PI,
          scale: [wide, 0.28 + randomAt(index + 505) * 0.95, 1],
          color:
            randomAt(index + 506) > 0.62
              ? '#6fa957'
              : randomAt(index + 507) > 0.46
                ? '#2e8957'
                : '#2d7652',
        }
      }),
    [],
  )

  useInstancedTransforms(ref, patches, ({ position, rotation, scale, color }, dummy, colorTarget) => {
    dummy.position.set(...position)
    dummy.rotation.set(-Math.PI / 2, 0, rotation)
    dummy.scale.set(...scale)
    colorTarget.set(color)
  })

  return (
    <instancedMesh ref={ref} args={[null, null, patches.length]} frustumCulled={false}>
      <circleGeometry args={[1, 14]} />
      <meshBasicMaterial color="#4f9857" transparent opacity={0.28} depthWrite={false} />
    </instancedMesh>
  )
}

function GrassField() {
  const isPaused = useWorldPaused()
  const sceneTime = useSceneTime()
  const ref = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const blades = useMemo(
    () =>
      Array.from({ length: 1650 }, (_, index) => {
        const side = randomAt(index) > 0.5 ? 1 : -1
        const x = side * (2.8 + randomAt(index + 1) * 22.5)
        const z = -34.5 + randomAt(index + 2) * 66
        const height = 0.2 + randomAt(index + 3) * 0.72
        return {
          height,
          rotation: randomAt(index + 4) * Math.PI,
          lean: THREE.MathUtils.degToRad(-10 + randomAt(index + 6) * 20),
          wind: 0.65 + randomAt(index + 5) * 1.4,
          phase: randomAt(index + 6) * Math.PI * 2,
          width: 0.08 + randomAt(index + 7) * 0.11,
          position: [x, height * 0.5 + 0.035, z],
        }
      }),
    [],
  )

  useFrame(() => {
    if (isPaused) return
    if (!ref.current) return

    const t = sceneTime.current
    blades.forEach((blade, index) => {
      const gust = Math.sin(t * blade.wind + blade.phase) * 0.18 + Math.sin(t * 0.42 + blade.position[0]) * 0.08
      dummy.position.set(...blade.position)
      dummy.rotation.set(gust * 0.28, blade.rotation, blade.lean + gust)
      dummy.scale.set(blade.width, blade.height, blade.width)
      dummy.updateMatrix()
      ref.current.setMatrixAt(index, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, blades.length]} frustumCulled={false}>
      <GrassBladeGeometry />
      <meshLambertMaterial color="#31935a" side={THREE.DoubleSide} />
    </instancedMesh>
  )
}

function GrassBladeGeometry() {
  const geometry = useMemo(() => {
    const blade = new THREE.BufferGeometry()
    blade.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([
        -0.5, -0.5, 0,
        0.5, -0.5, 0,
        -0.34, 0.05, 0.04,
        0.34, 0.05, 0.04,
        -0.13, 0.5, 0.1,
        0.13, 0.5, 0.1,
        0, 0.74, 0.18,
      ], 3),
    )
    blade.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 4, 5, 6])
    blade.computeVertexNormals()
    return blade
  }, [])

  return <primitive object={geometry} attach="geometry" />
}

function PathPebbles() {
  const ref = useRef()
  const pebbles = useMemo(
    () =>
      Array.from({ length: 290 }, (_, index) => ({
        position: [
          -2.12 + randomAt(index + 101) * 4.24,
          0.085,
          -31.5 + randomAt(index + 102) * 56,
        ],
        scale: [
          0.055 + randomAt(index + 103) * 0.17,
          0.018,
          0.035 + randomAt(index + 104) * 0.12,
        ],
        rotation: randomAt(index + 105) * Math.PI,
        color: randomAt(index + 106) > 0.56 ? '#e1bb72' : randomAt(index + 107) > 0.5 ? '#a7774a' : '#f0cf89',
      })),
    [],
  )

  useInstancedTransforms(ref, pebbles, ({ position, rotation, scale, color }, dummy, colorTarget) => {
    dummy.position.set(...position)
    dummy.rotation.set(0, rotation, 0)
    dummy.scale.set(...scale)
    colorTarget.set(color)
  })

  return (
    <instancedMesh ref={ref} args={[null, null, pebbles.length]} receiveShadow frustumCulled={false}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color="#b98554" />
    </instancedMesh>
  )
}

function PathBrushStrokes() {
  const ref = useRef()
  const strokes = useMemo(
    () =>
      Array.from({ length: 86 }, (_, index) => ({
        position: [-2.25 + randomAt(index + 700) * 4.5, 0.074, -31.4 + index * 0.66],
        rotation: -0.25 + randomAt(index + 701) * 0.5,
        scale: [0.28 + randomAt(index + 702) * 0.72, 0.035, 0.035 + randomAt(index + 703) * 0.05],
        color: randomAt(index + 704) > 0.5 ? palette.pathLight : palette.pathDark,
      })),
    [],
  )

  useInstancedTransforms(ref, strokes, ({ position, rotation, scale, color }, dummy, colorTarget) => {
    dummy.position.set(...position)
    dummy.rotation.set(0, rotation, 0)
    dummy.scale.set(...scale)
    colorTarget.set(color)
  })

  return (
    <instancedMesh ref={ref} args={[null, null, strokes.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#e4b76c" />
    </instancedMesh>
  )
}

function LeafScatter() {
  const ref = useRef()
  const leaves = useMemo(
    () =>
      Array.from({ length: 340 }, (_, index) => {
        const x = -24 + randomAt(index + 800) * 48
        const z = -34 + randomAt(index + 801) * 64
        const onPath = Math.abs(x) < 2.55
        return {
          position: [x, 0.105, z],
          rotation: randomAt(index + 802) * Math.PI,
          scale: [0.08 + randomAt(index + 803) * 0.17, 0.012, 0.025 + randomAt(index + 804) * 0.055],
          color: onPath ? '#b07343' : randomAt(index + 805) > 0.52 ? '#e09a48' : '#9c6a3d',
        }
      }),
    [],
  )

  useInstancedTransforms(ref, leaves, ({ position, rotation, scale, color }, dummy, colorTarget) => {
    dummy.position.set(...position)
    dummy.rotation.set(0, rotation, 0)
    dummy.scale.set(...scale)
    colorTarget.set(color)
  })

  return (
    <instancedMesh ref={ref} args={[null, null, leaves.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#b77642" />
    </instancedMesh>
  )
}

function FloatingMotes() {
  const ref = useRef()
  const motes = useMemo(
    () =>
      Array.from({ length: 80 }, (_, index) => ({
        position: [
          -11 + randomAt(index + 900) * 22,
          1.1 + randomAt(index + 901) * 3.6,
          -17 + randomAt(index + 902) * 32,
        ],
        scale: [0.018 + randomAt(index + 903) * 0.045, 0.018 + randomAt(index + 903) * 0.045, 0.018 + randomAt(index + 903) * 0.045],
        rotation: 0,
        color: randomAt(index + 904) > 0.5 ? '#ffe29f' : '#ffd2a1',
      })),
    [],
  )

  useInstancedTransforms(ref, motes, ({ position, scale, color }, dummy, colorTarget) => {
    dummy.position.set(...position)
    dummy.scale.set(...scale)
    colorTarget.set(color)
  })

  return (
    <instancedMesh ref={ref} args={[null, null, motes.length]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial color="#ffe0a1" transparent opacity={0.58} toneMapped={false} />
    </instancedMesh>
  )
}

function Fireflies() {
  const isPaused = useWorldPaused()
  const sceneTime = useSceneTime()
  const ref = useRef()
  const materialRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const fireflies = useMemo(
    () =>
      Array.from({ length: 70 }, (_, index) => ({
        x: -16 + randomAt(index + 1600) * 32,
        y: 0.8 + randomAt(index + 1601) * 2.4,
        z: -18 + randomAt(index + 1602) * 38,
        phase: randomAt(index + 1603) * Math.PI * 2,
        speed: 0.55 + randomAt(index + 1604) * 1.4,
        drift: 0.24 + randomAt(index + 1605) * 0.62,
        size: 0.035 + randomAt(index + 1606) * 0.055,
      })),
    [],
  )

  useFrame(() => {
    if (isPaused) return
    if (!ref.current || !materialRef.current) return

    const t = sceneTime.current
    const cycle = getCycleState(t)

    fireflies.forEach((fly, index) => {
      const pulse = 0.72 + Math.sin(t * 5.2 + fly.phase) * 0.28
      dummy.position.set(
        fly.x + Math.sin(t * fly.speed + fly.phase) * fly.drift,
        fly.y + Math.sin(t * 1.6 + fly.phase * 0.7) * 0.22,
        fly.z + Math.cos(t * fly.speed * 0.72 + fly.phase) * fly.drift,
      )
      dummy.scale.setScalar(fly.size * pulse)
      dummy.updateMatrix()
      ref.current.setMatrixAt(index, dummy.matrix)
    })

    materialRef.current.opacity = cycle.nightAmount * (0.28 + Math.sin(t * 2.4) * 0.06)
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, fireflies.length]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 8]} />
      <meshBasicMaterial ref={materialRef} color="#fff2a0" transparent opacity={0} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  )
}

function FireflyLightPool() {
  const isPaused = useWorldPaused()
  const sceneTime = useSceneTime()
  const lights = useRef([])
  const anchors = useMemo(
    () => [
      [-9, 1.8, -3, 0.4],
      [8, 1.6, 4.5, 1.7],
      [-7.5, 1.7, 12.5, 2.6],
      [9.5, 1.5, -12.5, 3.4],
      [0, 2.0, 16.5, 4.2],
    ],
    [],
  )

  useFrame(() => {
    if (isPaused) return

    const t = sceneTime.current
    const cycle = getCycleState(t)

    lights.current.forEach((light, index) => {
      if (!light) return

      const [x, y, z, phase] = anchors[index]
      light.position.set(
        x + Math.sin(t * 0.6 + phase) * 1.2,
        y + Math.sin(t * 1.4 + phase) * 0.32,
        z + Math.cos(t * 0.55 + phase) * 1.2,
      )
      light.intensity = cycle.nightAmount * (0.28 + Math.sin(t * 2.6 + phase) * 0.08)
    })
  })

  return (
    <group>
      {anchors.map((anchor, index) => (
        <pointLight
          key={anchor.join('-')}
          ref={(node) => {
            lights.current[index] = node
          }}
          color="#fff0a4"
          intensity={0}
          distance={4.8}
          decay={2.4}
        />
      ))}
    </group>
  )
}

function useInstancedTransforms(ref, items, applyTransform) {
  useLayoutEffect(() => {
    if (!ref.current) return

    const dummy = new THREE.Object3D()
    const color = new THREE.Color()

    items.forEach((item, index) => {
      color.set('#ffffff')
      dummy.position.set(0, 0, 0)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, 1, 1)
      applyTransform(item, dummy, color, index)
      dummy.updateMatrix()
      ref.current.setMatrixAt(index, dummy.matrix)
      ref.current.setColorAt(index, color)
    })

    ref.current.instanceMatrix.needsUpdate = true
    ref.current.instanceColor.needsUpdate = true
    if (Array.isArray(ref.current.material)) {
      ref.current.material.forEach((material) => {
        material.needsUpdate = true
      })
    } else {
      ref.current.material.needsUpdate = true
    }
    ref.current.computeBoundingSphere()
  }, [applyTransform, items, ref])
}

function randomAt(seed) {
  const value = Math.sin(seed * 928.231) * 43758.5453
  return value - Math.floor(value)
}

function Hill({ color, ...props }) {
  return (
    <mesh {...props} receiveShadow>
      <sphereGeometry args={[1, 36, 18]} />
      <meshToonMaterial color={color} />
    </mesh>
  )
}

function Cloud({ position, scale = 1, color = '#ffe7d2', shadowColor = '#d99a82' }) {
  const isPaused = useWorldPaused()
  const sceneTime = useSceneTime()
  const ref = useRef()

  useFrame(() => {
    if (isPaused) return
    if (!ref.current) return
    ref.current.position.x = position[0] + Math.sin(sceneTime.current * 0.035 + position[2]) * 0.32
  })

  return (
    <group ref={ref} position={position} scale={scale}>
      {[
        [-1.35, -0.18, -0.04, 0.88, shadowColor],
        [-0.86, 0.02, 0.02, 1.08, color],
        [-0.25, 0.22, 0, 1.36, color],
        [0.45, 0.14, -0.02, 1.2, color],
        [1.1, -0.02, 0.04, 0.98, color],
        [0.12, -0.26, 0.02, 1.4, shadowColor],
        [0.78, -0.24, -0.04, 0.82, shadowColor],
      ].map(([x, y, z, size, cloudColor], index) => (
        <mesh key={`${x}-${y}`} position={[x, y, z]} scale={[size * 1.42, size * (0.42 + index * 0.015), 0.34]}>
          <sphereGeometry args={[1, 24, 12]} />
          <meshToonMaterial color={cloudColor} />
        </mesh>
      ))}
      <mesh position={[0, -0.36, 0]} scale={[2.8, 0.12, 0.22]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshToonMaterial color={shadowColor} />
      </mesh>
    </group>
  )
}

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.42, 2.2, 9]} />
        <meshToonMaterial color={palette.wood} />
      </mesh>
      {[0.42, 0.92, 1.42].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.31 - y * 0.025, 0.018, 6, 16]} />
          <meshToonMaterial color={palette.darkWood} />
        </mesh>
      ))}
      {[
        [-0.28, 0.22, 0.1, 0.42, 0.13, -0.42],
        [0.28, 0.2, -0.02, 0.36, 0.12, 0.52],
      ].map(([x, y, z, length, radius, rot]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} rotation={[0, 0, rot]} castShadow>
          <cylinderGeometry args={[radius * 0.52, radius, length, 7]} />
          <meshToonMaterial color={palette.darkWood} />
        </mesh>
      ))}
      <mesh position={[-0.25, 1.65, 0.08]} rotation={[0.1, 0.2, -0.7]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 1.05, 7]} />
        <meshToonMaterial color={palette.wood} />
      </mesh>
      <mesh position={[0.3, 1.85, -0.05]} rotation={[0.15, -0.2, 0.62]} castShadow>
        <cylinderGeometry args={[0.07, 0.13, 1.05, 7]} />
        <meshToonMaterial color={palette.wood} />
      </mesh>
      {[
        [0, 2.45, 0, 1.58, palette.leaf],
        [-0.65, 2.12, 0.18, 1.12, palette.leafLight],
        [0.72, 2.1, -0.05, 1.14, palette.leafDark],
        [0.12, 2.9, -0.18, 1.03, '#4ba86b'],
        [-0.1, 2.25, -0.7, 0.84, '#25755a'],
        [-0.86, 2.65, -0.3, 0.72, '#77b85a'],
        [0.86, 2.55, 0.3, 0.78, '#2f9861'],
      ].map(([x, y, z, size, color]) => (
        <mesh key={`${x}-${y}`} position={[x, y, z]} scale={[size, size * 0.82, size]} castShadow receiveShadow>
          <sphereGeometry args={[1, 24, 14]} />
          <meshToonMaterial color={color} />
        </mesh>
      ))}
      {[
        [-0.62, 2.78, 0.24, 0.18],
        [0.25, 3.05, 0.34, 0.14],
        [0.78, 2.42, 0.58, 0.17],
        [-0.1, 2.18, 0.86, 0.12],
      ].map(([x, y, z, size]) => (
        <mesh key={`${x}-${y}-${z}`} position={[x, y, z]} scale={[size, size * 0.45, size]}>
          <sphereGeometry args={[1, 12, 6]} />
          <meshToonMaterial color="#a6cb5b" />
        </mesh>
      ))}
      {[
        [-0.55, 2.45, 0.88],
        [0.48, 2.7, 0.72],
        [0.95, 2.18, 0.3],
      ].map((apple) => (
        <mesh key={apple.join('-')} position={apple} scale={0.13}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshToonMaterial color="#f05b2f" />
        </mesh>
      ))}
    </group>
  )
}

function Sunflower({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.035, 1.1, 6]} />
        <meshToonMaterial color="#2e9f45" />
      </mesh>
      <mesh position={[0, 1.16, 0]}>
        <sphereGeometry args={[0.16, 12, 8]} />
        <meshToonMaterial color="#5c361d" />
      </mesh>
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.2, 1.16 + Math.sin(angle) * 0.2, 0]}>
            <sphereGeometry args={[0.09, 10, 6]} />
            <meshToonMaterial color="#f9d94c" />
          </mesh>
        )
      })}
    </group>
  )
}

function Bush({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {[
        [-0.35, 0.42, 0, 0.62],
        [0.16, 0.5, 0.08, 0.78],
        [0.58, 0.38, -0.05, 0.55],
      ].map(([x, y, z, size]) => (
        <mesh key={`${x}-${size}`} position={[x, y, z]} scale={[size, size * 0.72, size]}>
          <sphereGeometry args={[1, 18, 10]} />
          <meshToonMaterial color={size > 0.7 ? '#0c8060' : '#11784f'} />
        </mesh>
      ))}
    </group>
  )
}

function Bench({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[2.2, 0.18, 0.55]} />
        <meshToonMaterial color="#b87945" />
      </mesh>
      <mesh position={[0, 0.86, -0.26]} rotation={[0.18, 0, 0]} castShadow>
        <boxGeometry args={[2.2, 0.18, 0.5]} />
        <meshToonMaterial color="#c98a52" />
      </mesh>
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, 0.2, 0]} castShadow>
          <boxGeometry args={[0.16, 0.4, 0.5]} />
          <meshToonMaterial color="#7c4a33" />
        </mesh>
      ))}
    </group>
  )
}

function Campfire({ position }) {
  const isPaused = useWorldPaused()
  const sceneTime = useSceneTime()
  const lightRef = useRef()
  const emberRef = useRef()

  useFrame(() => {
    if (isPaused) return
    if (!lightRef.current || !emberRef.current) return

    const t = sceneTime.current
    const cycle = getCycleState(t)
    const flicker = 0.75 + Math.sin(t * 12.6) * 0.16 + Math.sin(t * 23.2) * 0.08
    lightRef.current.intensity = (1.2 + cycle.nightAmount * 5.2 + cycle.goldenAmount * 1.6) * flicker
    emberRef.current.scale.setScalar(0.86 + flicker * 0.2)
  })

  return (
    <group position={position}>
      {[0, 1, 2, 3, 4].map((index) => {
        const angle = (index / 5) * Math.PI * 2
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.58, 0.12, Math.sin(angle) * 0.58]} scale={[0.34, 0.16, 0.28]} castShadow receiveShadow>
            <dodecahedronGeometry args={[1, 0]} />
            <meshToonMaterial color={index % 2 === 0 ? '#5f6658' : '#78806d'} />
          </mesh>
        )
      })}
      {[0, 1, 2].map((index) => (
        <mesh key={index} position={[0, 0.24 + index * 0.04, 0]} rotation={[0, (index / 3) * Math.PI, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.1, 0.14, 1.1, 8]} />
          <meshToonMaterial color={index === 1 ? '#73442c' : '#8f5634'} />
        </mesh>
      ))}
      <mesh ref={emberRef} position={[0, 0.34, 0]}>
        <sphereGeometry args={[0.32, 12, 8]} />
        <meshBasicMaterial color="#ff8d3a" transparent opacity={0.62} depthWrite={false} toneMapped={false} />
      </mesh>
      {[
        [0, 0.72, 0, 0.42, '#ffd05f'],
        [-0.12, 0.56, 0.08, 0.32, '#ff7a38'],
        [0.16, 0.62, -0.05, 0.36, '#fff0a4'],
      ].map(([x, y, z, scale, color]) => (
        <FireFlame key={`${x}-${z}`} position={[x, y, z]} scale={scale} color={color} />
      ))}
      <pointLight ref={lightRef} position={[0, 1.18, 0]} color="#ff9c48" intensity={2.5} distance={8.5} />
    </group>
  )
}

function FireFlame({ position, scale, color }) {
  const isPaused = useWorldPaused()
  const sceneTime = useSceneTime()
  const ref = useRef()
  const materialRef = useRef()

  useFrame(() => {
    if (isPaused) return
    if (!ref.current || !materialRef.current) return

    const t = sceneTime.current
    const cycle = getCycleState(t)
    const flicker = 0.88 + Math.sin(t * 10.4 + position[0] * 8) * 0.12
    ref.current.scale.set(scale * flicker, scale * 1.75 * flicker, scale * flicker)
    materialRef.current.opacity = 0.68 + cycle.nightAmount * 0.22
  })

  return (
    <mesh ref={ref} position={position}>
      <coneGeometry args={[1, 1.7, 7]} />
      <meshBasicMaterial ref={materialRef} color={color} transparent opacity={0.78} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function PicnicSpot({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.065, 0]} rotation={[-Math.PI / 2, 0, 0.2]} receiveShadow>
        <planeGeometry args={[2.4, 1.55]} />
        <meshToonMaterial color="#d76558" />
      </mesh>
      <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, -0.6]}>
        <planeGeometry args={[2.15, 0.16]} />
        <meshBasicMaterial color="#f4d59a" transparent opacity={0.72} />
      </mesh>
      <mesh position={[-0.52, 0.28, 0.18]} castShadow>
        <boxGeometry args={[0.58, 0.38, 0.42]} />
        <meshToonMaterial color="#c18955" />
      </mesh>
      <mesh position={[-0.52, 0.5, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.025, 8, 14]} />
        <meshToonMaterial color="#845832" />
      </mesh>
      {[
        [0.42, 0.2, -0.18, '#f2d37a'],
        [0.7, 0.2, 0.16, '#f06f44'],
        [0.18, 0.18, 0.26, '#78b95f'],
      ].map(([x, y, z, color]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} castShadow>
          <sphereGeometry args={[0.14, 12, 8]} />
          <meshToonMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

function ToolCart({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[1.4, 0.46, 0.78]} />
        <meshToonMaterial color="#a66a43" />
      </mesh>
      <mesh position={[0, 0.74, -0.3]} castShadow>
        <boxGeometry args={[1.55, 0.12, 0.18]} />
        <meshToonMaterial color="#d19454" />
      </mesh>
      {[-0.5, 0.5].map((x) => (
        <mesh key={x} position={[x, 0.15, 0.44]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.18, 0.035, 8, 18]} />
          <meshToonMaterial color="#293447" />
        </mesh>
      ))}
      <mesh position={[0.12, 0.98, 0.04]} rotation={[0.45, 0, -0.22]} castShadow>
        <boxGeometry args={[0.18, 0.88, 0.12]} />
        <meshToonMaterial color="#51616b" />
      </mesh>
      <mesh position={[-0.25, 0.97, 0.0]} rotation={[0.25, 0, 0.32]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.98, 8]} />
        <meshToonMaterial color="#6c4a34" />
      </mesh>
    </group>
  )
}

function Mailbox({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.58, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.92, 16, 1, false, 0, Math.PI]} />
        <meshToonMaterial color="#557e8b" />
      </mesh>
      <mesh position={[0, 0.38, 0]} castShadow>
        <boxGeometry args={[0.72, 0.38, 0.92]} />
        <meshToonMaterial color="#557e8b" />
      </mesh>
      <mesh position={[0, 0.92, 0.48]} castShadow>
        <boxGeometry args={[0.58, 0.16, 0.06]} />
        <meshToonMaterial color="#f4e5c3" />
      </mesh>
      <mesh position={[0, -0.16, 0]} castShadow>
        <boxGeometry args={[0.13, 0.9, 0.13]} />
        <meshToonMaterial color={palette.darkWood} />
      </mesh>
    </group>
  )
}

function LampPost({ position }) {
  const isPaused = useWorldPaused()
  const sceneTime = useSceneTime()
  const lightRef = useRef()
  const bulbRef = useRef()
  const glowRef = useRef()

  useFrame(() => {
    if (isPaused) return
    if (!lightRef.current || !bulbRef.current || !glowRef.current) return

    const t = sceneTime.current
    const cycle = getCycleState(t)
    const flicker = 0.92 + Math.sin(t * 7.4 + position[0]) * 0.05
    const glow = cycle.lampAmount * flicker
    lightRef.current.intensity = 0.22 + glow * 2.25
    bulbRef.current.opacity = 0.48 + glow * 0.52
    glowRef.current.opacity = 0.05 + glow * 0.22
  })

  return (
    <group position={position}>
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.085, 2.1, 10]} />
        <meshToonMaterial color="#344057" />
      </mesh>
      <mesh position={[0.26, 2.08, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.55, 10]} />
        <meshToonMaterial color="#344057" />
      </mesh>
      <mesh position={[0.55, 1.95, 0]} castShadow>
        <sphereGeometry args={[0.19, 18, 10]} />
        <meshBasicMaterial ref={bulbRef} color="#fff2a2" transparent opacity={0.64} toneMapped={false} />
      </mesh>
      <mesh position={[0.55, 1.95, 0]} scale={0.56}>
        <sphereGeometry args={[1, 16, 8]} />
        <meshBasicMaterial ref={glowRef} color="#ffc980" transparent opacity={0.15} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight ref={lightRef} position={[0.55, 1.95, 0]} color="#ffe892" intensity={1.45} distance={5.2} />
    </group>
  )
}

function StringLights() {
  return (
    <group>
      {[-12.4, -5.6, 1.5, 8.8].map((z, runIndex) => (
        <group key={z} position={[0, 3.05 + (runIndex % 2) * 0.22, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 6.55, 8]} />
            <meshToonMaterial color="#4b4653" />
          </mesh>
          {Array.from({ length: 7 }, (_, index) => {
            const x = -3 + index
            return (
              <group key={x} position={[x, -0.18 - Math.sin(index * 0.9) * 0.08, 0]}>
                <mesh position={[0, 0.09, 0]} castShadow>
                  <cylinderGeometry args={[0.018, 0.018, 0.18, 6]} />
                  <meshToonMaterial color="#4b4653" />
                </mesh>
                <StringLightBulb color={index % 2 === 0 ? '#ffe294' : '#ffb27e'} offset={index + runIndex * 3} />
              </group>
            )
          })}
        </group>
      ))}
    </group>
  )
}

function LightArchways() {
  return (
    <group>
      {[-12.4, -5.6, 1.5, 8.8].map((z, index) => (
        <LightArch key={z} z={z} offset={index} />
      ))}
    </group>
  )
}

function LightArch({ z, offset }) {
  const isPaused = useWorldPaused()
  const sceneTime = useSceneTime()
  const lightRef = useRef()

  useFrame(() => {
    if (isPaused) return
    if (!lightRef.current) return

    const t = sceneTime.current
    const cycle = getCycleState(t)
    lightRef.current.intensity = cycle.lampAmount * (0.8 + Math.sin(t * 3.8 + offset) * 0.06)
  })

  return (
    <group position={[0, 0, z]}>
      {[-3.45, 3.45].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.08, 0.12, 3.1, 10]} />
            <meshToonMaterial color="#3c4253" />
          </mesh>
          <mesh position={[0, 0.09, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.28, 0.34, 0.18, 12]} />
            <meshToonMaterial color="#70604b" />
          </mesh>
          <mesh position={[x > 0 ? -0.22 : 0.22, 2.82, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.46, 10]} />
            <meshToonMaterial color="#3c4253" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 2.95, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 6.95, 10]} />
        <meshToonMaterial color="#4b4653" />
      </mesh>
      <pointLight ref={lightRef} position={[0, 2.5, 0]} color="#ffd58b" intensity={0} distance={7.5} decay={2.2} />
    </group>
  )
}

function StringLightBulb({ color, offset }) {
  const isPaused = useWorldPaused()
  const sceneTime = useSceneTime()
  const materialRef = useRef()
  const glowRef = useRef()

  useFrame(() => {
    if (isPaused) return
    if (!materialRef.current || !glowRef.current) return

    const t = sceneTime.current
    const cycle = getCycleState(t)
    const pulse = 0.9 + Math.sin(t * 4.4 + offset) * 0.1
    materialRef.current.opacity = 0.38 + cycle.lampAmount * 0.58 * pulse
    glowRef.current.opacity = cycle.lampAmount * 0.08 * pulse
  })

  return (
    <>
      <mesh>
        <sphereGeometry args={[0.09, 12, 8]} />
        <meshBasicMaterial ref={materialRef} color={color} transparent opacity={0.7} toneMapped={false} />
      </mesh>
      <mesh scale={1.65}>
        <sphereGeometry args={[0.09, 12, 8]} />
        <meshBasicMaterial ref={glowRef} color={color} transparent opacity={0.04} depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  )
}

function DirectionBoard({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[-1.62, 1.15, 0]} castShadow>
        <boxGeometry args={[0.14, 2.3, 0.14]} />
        <meshToonMaterial color={palette.darkWood} />
      </mesh>
      <mesh position={[1.62, 1.15, 0]} castShadow>
        <boxGeometry args={[0.14, 2.3, 0.14]} />
        <meshToonMaterial color={palette.darkWood} />
      </mesh>
      <mesh position={[0, 2.08, 0]} castShadow>
        <boxGeometry args={[3.7, 0.62, 0.18]} />
        <meshToonMaterial color="#c8894d" />
      </mesh>
      <Text position={[0, 2.1, 0.12]} fontSize={0.17} color={palette.ink} anchorX="center">
        choose a path
      </Text>
      <Text position={[-1.05, 1.62, 0.12]} fontSize={0.105} color="#fff4d5" anchorX="center">
        CV stands
      </Text>
      <Text position={[1.05, 1.62, 0.12]} fontSize={0.105} color="#fff4d5" anchorX="center">
        practice
      </Text>
    </group>
  )
}

function PaperTrail() {
  const papers = [
    [-2.9, 0.126, -4.2, 0.15, '/photos/profile-neon.jpeg', 'late shift photo'],
    [2.75, 0.126, -8.8, -0.22, '/photos/profile-mask.jpeg', 'travel photo'],
    [-2.6, 0.126, 4.9, -0.05, '/photos/profile-couch.jpeg', 'home photo'],
    [2.9, 0.126, 13.6, 0.19, null, 'future print'],
  ]

  return (
    <group>
      {papers.map(([x, y, z, rot, url, label]) => (
        <PhotoPaper key={`${x}-${z}`} position={[x, y, z]} rotation={rot} url={url} label={label} />
      ))}
    </group>
  )
}

function PhotoPaper({ position, rotation, url, label }) {
  if (url) {
    return <LoadedPhotoPaper position={position} rotation={rotation} url={url} label={label} />
  }

  return <BlankPhotoPaper position={position} rotation={rotation} label={label} />
}

function LoadedPhotoPaper({ position, rotation, url, label }) {
  const texture = useLoader(THREE.TextureLoader, url)

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    texture.needsUpdate = true
  }, [texture])

  return (
    <group position={position} rotation={[-Math.PI / 2, 0, rotation]}>
      <mesh position={[0.018, -0.018, -0.006]}>
        <planeGeometry args={[0.68, 0.98]} />
        <meshBasicMaterial color="#152333" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[0.72, 1.02]} />
        <meshToonMaterial color="#fff4da" />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[0.58, 0.84]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.47, 0.016]}>
        <planeGeometry args={[0.58, 0.06]} />
        <meshBasicMaterial color="#d4b06d" transparent opacity={0.7} depthWrite={false} />
      </mesh>
      <Text
        position={[0, -0.47, 0.021]}
        rotation={[0, 0, 0]}
        fontSize={0.033}
        color="#26364d"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.52}
      >
        {label}
      </Text>
    </group>
  )
}

function BlankPhotoPaper({ position, rotation, label }) {
  return (
    <group position={position} rotation={[-Math.PI / 2, 0, rotation]}>
      <mesh position={[0.018, -0.018, -0.006]}>
        <planeGeometry args={[0.68, 0.98]} />
        <meshBasicMaterial color="#152333" transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[0.72, 1.02]} />
        <meshToonMaterial color="#fff4da" />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[0.58, 0.84]} />
        <meshBasicMaterial color="#e9dcc2" />
      </mesh>
      <Text position={[0, 0, 0.021]} fontSize={0.045} color="#7c6c56" anchorX="center" anchorY="middle" maxWidth={0.48} textAlign="center">
        {label}
      </Text>
    </group>
  )
}

function Rocks() {
  return (
    <group>
      {[
        [-7.8, 0.18, -13.4, 0.34],
        [7.2, 0.2, -11.6, 0.42],
        [-8.5, 0.18, 13.2, 0.3],
        [8.2, 0.18, 14.6, 0.28],
        [5.2, 0.14, 9.2, 0.2],
      ].map(([x, y, z, scale]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} scale={[scale * 1.4, scale * 0.62, scale]} castShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshToonMaterial color="#5f7f73" />
        </mesh>
      ))}
    </group>
  )
}

function WelcomeStudio() {
  return (
    <group position={[8.9, 0, -13.2]} rotation={[0, -0.33, 0]}>
      <mesh position={[0, 1.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.6, 2.7, 3.6]} />
        <meshToonMaterial color={palette.barn} />
      </mesh>
      <mesh position={[0, 2.95, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[3.7, 3.7, 3.95]} />
        <meshToonMaterial color={palette.roof} />
      </mesh>
      <mesh position={[0, 1.1, 1.83]} castShadow>
        <boxGeometry args={[1.15, 1.75, 0.08]} />
        <meshToonMaterial color="#126d66" />
      </mesh>
      <mesh position={[0.38, 1.08, 1.89]}>
        <sphereGeometry args={[0.045, 10, 6]} />
        <meshBasicMaterial color="#ffe294" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.16, 2.08]} castShadow receiveShadow>
        <boxGeometry args={[2.15, 0.22, 0.92]} />
        <meshToonMaterial color="#a46b45" />
      </mesh>
      {[-0.72, 0, 0.72].map((x) => (
        <mesh key={x} position={[x, 0.32, 2.58]} castShadow>
          <boxGeometry args={[0.58, 0.12, 0.3]} />
          <meshToonMaterial color="#c58a58" />
        </mesh>
      ))}
      <mesh position={[-1.35, 1.55, 1.86]}>
        <boxGeometry args={[0.72, 0.7, 0.09]} />
        <meshToonMaterial color="#9fe8ff" />
      </mesh>
      <mesh position={[-1.35, 1.55, 1.92]}>
        <boxGeometry args={[0.08, 0.74, 0.04]} />
        <meshToonMaterial color="#24435d" />
      </mesh>
      <mesh position={[-1.35, 1.55, 1.925]}>
        <boxGeometry args={[0.76, 0.07, 0.04]} />
        <meshToonMaterial color="#24435d" />
      </mesh>
      <mesh position={[1.32, 2.0, 1.86]}>
        <boxGeometry args={[0.72, 0.7, 0.09]} />
        <meshToonMaterial color="#9fe8ff" />
      </mesh>
      <mesh position={[1.32, 2.0, 1.92]}>
        <boxGeometry args={[0.08, 0.74, 0.04]} />
        <meshToonMaterial color="#24435d" />
      </mesh>
      <mesh position={[1.32, 2.0, 1.925]}>
        <boxGeometry args={[0.76, 0.07, 0.04]} />
        <meshToonMaterial color="#24435d" />
      </mesh>
      {[-1.8, -0.9, 0, 0.9, 1.8].map((x) => (
        <mesh key={x} position={[x, 1.36, 1.88]}>
          <boxGeometry args={[0.08, 2.55, 0.1]} />
          <meshToonMaterial color={palette.barnShadow} />
        </mesh>
      ))}
      {[-1.25, -0.42, 0.42, 1.25].map((x) => (
        <mesh key={x} position={[x, 3.82, 0.92]} rotation={[0.72, 0, 0]}>
          <boxGeometry args={[0.62, 0.08, 1.12]} />
          <meshToonMaterial color="#23355e" />
        </mesh>
      ))}
      <mesh position={[-2.2, 0.54, 2.05]} castShadow>
        <boxGeometry args={[0.22, 1.08, 0.22]} />
        <meshToonMaterial color="#f7e8d0" />
      </mesh>
      <mesh position={[2.2, 0.54, 2.05]} castShadow>
        <boxGeometry args={[0.22, 1.08, 0.22]} />
        <meshToonMaterial color="#f7e8d0" />
      </mesh>
      <Text position={[0, 3.55, 2.05]} fontSize={0.28} color="#fff4d5" anchorX="center">
        workshop
      </Text>
      <group position={[-2.65, 0.42, 2.35]}>
        <mesh castShadow>
          <boxGeometry args={[0.55, 0.55, 0.55]} />
          <meshToonMaterial color="#b97a4e" />
        </mesh>
        <mesh position={[0, 0.31, 0]}>
          <boxGeometry args={[0.6, 0.045, 0.6]} />
          <meshToonMaterial color="#e0b06c" />
        </mesh>
      </group>
      <group position={[2.75, 0.34, 2.25]}>
        {[-0.18, 0.08, 0.28].map((x, index) => (
          <mesh key={x} position={[x, index * 0.04, 0]} rotation={[0, 0, index * 0.12]} castShadow>
            <cylinderGeometry args={[0.11, 0.14, 0.58, 12]} />
            <meshToonMaterial color={index === 1 ? '#f0c36a' : '#5f765f'} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function Exhibit({ exhibit, openExhibit }) {
  const facing = exhibit.position[0] > 0.5 ? -0.28 : exhibit.position[0] < -0.5 ? 0.28 : 0

  return (
    <group position={exhibit.position} rotation={[0, facing, 0]}>
      <mesh position={[-1.05, -0.98, -0.02]} castShadow>
        <boxGeometry args={[0.12, 1.8, 0.12]} />
        <meshToonMaterial color="#7a4c31" />
      </mesh>
      <mesh position={[1.05, -0.98, -0.02]} castShadow>
        <boxGeometry args={[0.12, 1.8, 0.12]} />
        <meshToonMaterial color="#7a4c31" />
      </mesh>

      <mesh position={[0, 0, -0.04]} scale={[1.05, 1.08, 1]} castShadow>
        <boxGeometry args={[2.82, 1.48, 0.12]} />
        <meshToonMaterial color="#fff7df" />
      </mesh>
      <mesh castShadow onClick={() => openExhibit(exhibit.id)}>
        <boxGeometry args={[2.7, 1.35, 0.16]} />
        <meshToonMaterial color="#f5dfb8" />
      </mesh>
      <mesh position={[0, -0.49, 0.09]}>
        <boxGeometry args={[2.45, 0.14, 0.05]} />
        <meshBasicMaterial color={exhibit.accent} toneMapped={false} />
      </mesh>

      <Text
        position={[0, 0.18, 0.12]}
        fontSize={0.22}
        color="#1b2440"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.35}
        textAlign="center"
        onClick={() => openExhibit(exhibit.id)}
      >
        {exhibit.title}
      </Text>
      <Text
        position={[0, -0.21, 0.12]}
        fontSize={0.105}
        color="#38515e"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.25}
        textAlign="center"
      >
        {exhibit.type}
      </Text>

      <SpecialObject id={exhibit.id} accent={exhibit.accent} />
    </group>
  )
}

function SpecialObject({ id, accent }) {
  if (id === 'code') {
    return (
      <group position={[0, -1.08, -0.85]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[1.35, 0.12, 0.55]} />
          <meshToonMaterial color="#b9895d" />
        </mesh>
        <mesh position={[0, 0.68, -0.08]} castShadow>
          <boxGeometry args={[0.92, 0.56, 0.08]} />
          <meshToonMaterial color="#26364d" />
        </mesh>
        <mesh position={[0, 0.68, -0.025]}>
          <boxGeometry args={[0.72, 0.38, 0.04]} />
          <meshBasicMaterial color="#9ee8ff" toneMapped={false} />
        </mesh>
      </group>
    )
  }

  if (id === 'hardware') {
    return (
      <group position={[0, -1.02, -0.85]}>
        <mesh castShadow>
          <boxGeometry args={[0.62, 0.92, 0.42]} />
          <meshToonMaterial color="#2d3c55" />
        </mesh>
        <mesh position={[0.03, 0.12, 0.21]}>
          <boxGeometry args={[0.38, 0.44, 0.035]} />
          <meshBasicMaterial color={accent} toneMapped={false} />
        </mesh>
        <mesh position={[0.48, -0.22, 0]} rotation={[0.2, 0, 0.35]} castShadow>
          <boxGeometry args={[0.5, 0.16, 0.14]} />
          <meshToonMaterial color="#8f5f3c" />
        </mesh>
      </group>
    )
  }

  if (id === 'sound') {
    return (
      <group position={[0, -1.08, -0.86]}>
        <mesh position={[0, 0.36, 0]} castShadow>
          <boxGeometry args={[1.1, 0.54, 0.28]} />
          <meshToonMaterial color="#293d35" />
        </mesh>
        {[-0.32, 0.32].map((x) => (
          <mesh key={x} position={[x, 0.36, 0.16]}>
            <cylinderGeometry args={[0.16, 0.16, 0.05, 18]} />
            <meshBasicMaterial color={accent} toneMapped={false} />
          </mesh>
        ))}
        <mesh position={[0, 0.72, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.38, 0.035, 8, 24]} />
          <meshToonMaterial color="#26364d" />
        </mesh>
      </group>
    )
  }

  if (id === 'video') {
    return (
      <group position={[0, -1.08, -0.9]}>
        <mesh position={[0, 0.58, 0]} castShadow>
          <boxGeometry args={[1.25, 0.72, 0.08]} />
          <meshToonMaterial color="#273047" />
        </mesh>
        <mesh position={[0, 0.58, 0.05]}>
          <boxGeometry args={[1.02, 0.5, 0.04]} />
          <meshBasicMaterial color="#ffd0db" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.13, 0]} castShadow>
          <boxGeometry args={[0.14, 0.3, 0.1]} />
          <meshToonMaterial color="#273047" />
        </mesh>
      </group>
    )
  }

  if (id === 'experiments') {
    return (
      <group position={[0, -1.02, -0.88]}>
        {[-0.42, 0, 0.42].map((x, index) => (
          <mesh key={x} position={[x, 0.55 + index * 0.08, 0]} rotation={[0, 0, index * 0.12]}>
            <boxGeometry args={[0.38, 0.48, 0.04]} />
            <meshToonMaterial color={index === 1 ? '#f9d778' : '#f7edd2'} />
          </mesh>
        ))}
      </group>
    )
  }

  return (
    <mesh position={[0, -0.88, -0.92]} rotation={[0.4, 0.4, 0]}>
      <octahedronGeometry args={[0.38, 0]} />
      <meshToonMaterial color={accent} />
    </mesh>
  )
}

function TimelineGate() {
  return (
    <group position={[0, 0, -17.2]}>
      <mesh position={[-2.2, 1.65, 0]} castShadow>
        <boxGeometry args={[0.22, 3.3, 0.22]} />
        <meshToonMaterial color="#8f5f3c" />
      </mesh>
      <mesh position={[2.2, 1.65, 0]} castShadow>
        <boxGeometry args={[0.22, 3.3, 0.22]} />
        <meshToonMaterial color="#8f5f3c" />
      </mesh>
      <mesh position={[0, 3.1, 0]} castShadow>
        <boxGeometry args={[4.8, 0.52, 0.2]} />
        <meshToonMaterial color="#b87945" />
      </mesh>
      <Text position={[0, 3.12, 0.13]} fontSize={0.26} color="#1b2440" anchorX="center">
        Timeline path
      </Text>
      <Text position={[0, 2.58, 0.13]} fontSize={0.13} color="#fff4d5" anchorX="center">
        later: journey by years
      </Text>
    </group>
  )
}

function PauseMenu({ resume }) {
  return (
    <section className="pause-panel" aria-label="Pause menu">
      <p className="eyebrow">Paused</p>
      <h2>Paused</h2>
      <p>The world is paused for navigation. Press Escape again or use the button below to return.</p>
      <button type="button" onClick={resume}>
        Return to game
      </button>
    </section>
  )
}

function PracticePreview({ log }) {
  return (
    <aside className="practice-preview" aria-label="Practice preview" style={{ '--accent': log.accent }}>
      <p className="eyebrow">Practice Log</p>
      <h2>{log.date}</h2>
      <strong>{log.title}</strong>
      <p>{log.summary}</p>
      <small>{log.place}</small>
    </aside>
  )
}

function ProjectPanel({ item, close }) {
  const isPractice = item.kind === 'practice'

  return (
    <section className="project-panel" aria-label={item?.title}>
      <button className="icon-button close-button" type="button" onClick={close} aria-label="Close panel">
        <X size={20} />
      </button>

      <p className="eyebrow" style={{ color: item.accent }}>
        {item.room}
      </p>
      <h2>{isPractice ? `${item.title} - ${item.date}` : item.title}</h2>
      <p className="panel-summary">{item.summary}</p>

      {isPractice && (
        <div className="practice-epitaph">
          <span>Born: {item.born}</span>
          <span>Died: {item.died}</span>
          <span>{item.duration} at {item.place}</span>
          <small>{item.address}</small>
        </div>
      )}

      <div className="panel-section">
        <h3>{isPractice ? 'What happened' : item.sectionTitle || 'Details'}</h3>
        <ul>
          {item.todo.map((task) => (
            <li key={task}>{task}</li>
          ))}
        </ul>
      </div>

      <div className="skill-row">
        {item.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>

      <div className="media-placeholder" style={{ '--accent': item.accent }}>
        <Box size={24} />
        <span>{isPractice ? 'future slot for photos, files, or mentor notes' : item.mediaNote || 'future slot for photos, video, audio, links, or a 3D object'}</span>
      </div>
    </section>
  )
}

export default App
