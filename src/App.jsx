/* eslint-disable react-hooks/immutability */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  ContactShadows,
  Text,
} from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import {
  Box,
  Braces,
  Cpu,
  Film,
  FolderKanban,
  GitBranch,
  Headphones,
  Info,
  MousePointer2,
  X,
} from 'lucide-react'
import * as THREE from 'three'
import './App.css'

const exhibits = [
  {
    id: 'integro',
    title: 'Integro Core',
    type: 'главный проект',
    room: 'главный павильон аллеи',
    accent: '#2dd4bf',
    position: [0, 1.25, -13.5],
    icon: Braces,
    summary:
      'Центральный павильон для Integro: идея, путь разработки, интерфейсы, архитектура, демо и ссылки.',
    skills: ['Product thinking', 'Frontend', 'AI workflows', 'System design'],
    todo: ['добавить историю проекта', 'подставить скриншоты', 'прикрепить демо/репозиторий'],
  },
  {
    id: 'code',
    title: 'Code Terminal',
    type: 'код, сайты, моды, GitHub',
    room: 'стенд у левой тропинки',
    accent: '#60a5fa',
    position: [-5.8, 1.15, -7.2],
    icon: GitBranch,
    summary:
      'Стенд для технических проектов: сайты, эксперименты, моды, репозитории и заметки о том, как они собирались.',
    skills: ['React', 'JavaScript', 'GitHub', 'Game modding'],
    todo: ['список репозиториев', 'короткие кейсы', 'ссылки на живые версии'],
  },
  {
    id: 'hardware',
    title: 'Build Bench',
    type: 'сборка ПК и железо',
    room: 'верстак у мастерской',
    accent: '#f59e0b',
    position: [5.9, 1.15, -3.8],
    icon: Cpu,
    summary:
      'Верстак для истории сборки компьютера: комплектующие, почему выбрал именно их, процесс, фото и апгрейды.',
    skills: ['PC building', 'Troubleshooting', 'Hardware planning', 'Setup design'],
    todo: ['фото сборки', 'список комплектующих', 'что улучшал после запуска'],
  },
  {
    id: 'sound',
    title: 'Sound Lab',
    type: 'музыка и Suno',
    room: 'музыкальная поляна',
    accent: '#a3e635',
    position: [-6.2, 1.15, 2.6],
    icon: Headphones,
    summary:
      'Здесь будут треки, промпты, обложки, версии песен и то, как ты экспериментировал со звучанием.',
    skills: ['Prompting', 'Music direction', 'Iteration', 'Cover art'],
    todo: ['аудио-файлы', 'обложки', 'короткое описание каждого трека'],
  },
  {
    id: 'video',
    title: 'Edit Room',
    type: 'трейлеры и Adobe',
    room: 'экран под деревьями',
    accent: '#fb7185',
    position: [6.4, 1.15, 5.5],
    icon: Film,
    summary:
      'Уличный экран для трейлеров, монтажных экспериментов, шотов до/после, таймлайнов и финальных видео.',
    skills: ['Adobe Premiere', 'Trailer pacing', 'Visual rhythm', 'Story editing'],
    todo: ['видео', 'превью', 'описать задачу и финальный результат'],
  },
  {
    id: 'experiments',
    title: 'Notes Tree',
    type: 'мелкие эксперименты',
    room: 'дерево записок',
    accent: '#c084fc',
    position: [-5.7, 1.15, 10.6],
    icon: FolderKanban,
    summary:
      'Дерево для маленьких вещей, которые обычно теряются: тесты, идеи, странные прототипы, быстрые попытки и черновики.',
    skills: ['Prototyping', 'Creative direction', 'Learning logs', 'Rapid iteration'],
    todo: ['собрать мелкие факты', 'разделить по темам', 'добавить пасхалки'],
  },
]

const keys = {
  KeyW: 'forward',
  KeyS: 'backward',
  KeyA: 'left',
  KeyD: 'right',
  ShiftLeft: 'sprint',
}

function App() {
  const [isLocked, setIsLocked] = useState(false)
  const [focusedId, setFocusedId] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [showIndex, setShowIndex] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)

  const focusedExhibit = exhibits.find((item) => item.id === focusedId)
  const activeExhibit = exhibits.find((item) => item.id === activeId)

  useEffect(() => {
    const onPointerLockChange = () => {
      setIsLocked(Boolean(document.pointerLockElement))
    }

    document.addEventListener('pointerlockchange', onPointerLockChange)
    return () => document.removeEventListener('pointerlockchange', onPointerLockChange)
  }, [])

  useEffect(() => {
    if (activeId || showIndex) {
      document.exitPointerLock?.()
    }
  }, [activeId, showIndex])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code === 'Escape') {
        setActiveId(null)
        setShowIndex(false)
      }

      if (event.code === 'KeyE' && focusedId && !activeId) {
        setActiveId(focusedId)
      }

      if (event.code === 'KeyI') {
        setShowIndex((value) => !value)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeId, focusedId])

  const enterMuseum = () => {
    setHasEntered(true)
    try {
      const pointerLockRequest = document.body.requestPointerLock?.()
      pointerLockRequest?.catch?.(() => {
        setIsLocked(false)
      })
    } catch {
      setIsLocked(false)
    }
  }

  return (
    <main className="museum-app">
      <Canvas
        shadows
        camera={{ position: [0, 1.7, 15], rotation: [-0.16, 0, 0], fov: 68, near: 0.1, far: 120 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <MuseumScene
          setFocusedId={setFocusedId}
          openExhibit={setActiveId}
        />
      </Canvas>

      {hasEntered && (
        <>
          <div className="crosshair" aria-hidden="true">
            <span />
          </div>

          <header className="topbar">
            <div>
              <p className="eyebrow">Creator Garden Alley</p>
              <h1>Portfolio Prototype</h1>
            </div>
            <nav aria-label="Museum shortcuts">
              <button type="button" onClick={() => setShowIndex(true)}>
                Index
              </button>
              <button type="button" onClick={enterMuseum}>
                Enter
              </button>
            </nav>
          </header>

          <aside className="controls-panel" aria-label="Controls">
            <div>
              <MousePointer2 size={16} />
              <span>WASD ходьба</span>
            </div>
            <div>
              <Info size={16} />
              <span>{isLocked ? 'мышь обзор' : 'drag мышью обзор'}</span>
            </div>
            <div>
              <Info size={16} />
              <span>E открыть экспонат</span>
            </div>
          </aside>
        </>
      )}

      {focusedExhibit && hasEntered && !activeExhibit && !showIndex && (
        <div className="focus-prompt">
          <span style={{ '--accent': focusedExhibit.accent }}>{focusedExhibit.title}</span>
          <kbd>E</kbd>
        </div>
      )}

      {!hasEntered && (
        <section className="entry-overlay" aria-label="Enter alley">
          <div>
            <p className="eyebrow">Desktop prototype</p>
            <h2>Аллея твоих проектов</h2>
            <p>
              Теперь это не тёмный музей, а мультяшная прогулочная аллея: стенды, записки,
              деревья, мастерская и точки, куда потом подставим реальные истории.
            </p>
            <button type="button" onClick={enterMuseum}>
              Войти в аллею
            </button>
          </div>
        </section>
      )}

      {(activeExhibit || showIndex) && (
        <ProjectPanel
          exhibit={activeExhibit}
          allExhibits={exhibits}
          showIndex={showIndex}
          close={() => {
            setActiveId(null)
            setShowIndex(false)
            try {
              const pointerLockRequest = document.body.requestPointerLock?.()
              pointerLockRequest?.catch?.(() => {
                setIsLocked(false)
              })
            } catch {
              setIsLocked(false)
            }
          }}
          open={(id) => {
            setShowIndex(false)
            setActiveId(id)
          }}
        />
      )}

      <div className="mobile-block">
        <div>
          <h2>Desktop only prototype</h2>
          <p>Открой на компьютере: эта версия сделана под мышь, клавиатуру и широкий экран.</p>
        </div>
      </div>
    </main>
  )
}

function MuseumScene({ setFocusedId, openExhibit }) {
  return (
    <>
      <color attach="background" args={['#58c7ff']} />
      <fog attach="fog" args={['#8fe4ff', 28, 86]} />

      <ambientLight intensity={1.05} />
      <hemisphereLight args={['#dbf7ff', '#57b84d', 1.8]} />
      <directionalLight
        position={[-9, 14, 8]}
        intensity={3}
        castShadow
        shadow-mapSize={2048}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
      />
      <pointLight position={[0, 3, -13]} color="#fff4a3" intensity={2.5} distance={12} />

      <PlayerRig setFocusedId={setFocusedId} openExhibit={openExhibit} />

      <OutdoorAlley />
      <WelcomeStudio />

      {exhibits.map((exhibit) => (
        <Exhibit key={exhibit.id} exhibit={exhibit} openExhibit={openExhibit} />
      ))}

      <TimelineGate />
      <ContactShadows position={[0, 0.035, 0]} opacity={0.22} scale={44} blur={2.2} far={18} />

      <EffectComposer>
        <Bloom intensity={0.18} luminanceThreshold={0.72} luminanceSmoothing={0.45} />
        <Vignette eskil={false} offset={0.1} darkness={0.22} />
      </EffectComposer>
    </>
  )
}

function PlayerRig({ setFocusedId, openExhibit }) {
  const { camera } = useThree()
  const pressed = useRef({})
  const velocity = useRef(new THREE.Vector3())
  const lastFocus = useRef(null)
  const isDragging = useRef(false)
  const yaw = useRef(0)
  const pitch = useRef(-0.16)

  useEffect(() => {
    camera.rotation.order = 'YXZ'
    camera.rotation.set(pitch.current, yaw.current, 0)

    const onKeyDown = (event) => {
      pressed.current[keys[event.code] || event.code] = true
      if (event.code === 'KeyE' && lastFocus.current) {
        openExhibit(lastFocus.current)
      }
    }

    const onKeyUp = (event) => {
      pressed.current[keys[event.code] || event.code] = false
    }

    const onPointerDown = (event) => {
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
  }, [camera, openExhibit])

  useFrame((_, delta) => {
    const speed = pressed.current.sprint ? 7.8 : 4.8
    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize()
    const move = new THREE.Vector3()

    if (pressed.current.forward) move.add(forward)
    if (pressed.current.backward) move.sub(forward)
    if (pressed.current.right) move.add(right)
    if (pressed.current.left) move.sub(right)

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed)
    }

    velocity.current.lerp(move, Math.min(delta * 12, 1))
    camera.position.addScaledVector(velocity.current, delta)
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -14.8, 14.8)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -19.2, 17.8)
    camera.position.y = 1.7

    let focused = null
    let score = 0.78

    exhibits.forEach((exhibit) => {
      const target = new THREE.Vector3(...exhibit.position)
      const toTarget = target.sub(camera.position)
      const distance = toTarget.length()
      const directionScore = forward.dot(toTarget.normalize())
      const candidateScore = directionScore - distance * 0.04

      if (distance < 5.1 && directionScore > 0.72 && candidateScore > score) {
        focused = exhibit.id
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
        <planeGeometry args={[46, 52]} />
        <meshToonMaterial color="#4fca42" />
      </mesh>

      <mesh position={[0, 0.035, -1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.8, 39]} />
        <meshToonMaterial color="#e0be6f" />
      </mesh>
      <mesh position={[-2.65, 0.055, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 38]} />
        <meshToonMaterial color="#f7dc8f" />
      </mesh>
      <mesh position={[2.65, 0.055, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 38]} />
        <meshToonMaterial color="#f7dc8f" />
      </mesh>

      <mesh position={[0, 0.06, -13.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.3, 48]} />
        <meshToonMaterial color="#d7b66a" />
      </mesh>
      <mesh position={[0, 0.07, 7.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 36]} />
        <meshToonMaterial color="#6dd7ec" transparent opacity={0.82} />
      </mesh>

      <GrassField />
      <Cloud position={[-9, 8.7, -20]} scale={1.25} />
      <Cloud position={[8, 7.7, -12]} scale={0.95} />
      <Cloud position={[3, 9.3, 9]} scale={1.05} />

      <Hill position={[-13, -0.2, -20]} scale={[10, 2.8, 5]} color="#1d9c64" />
      <Hill position={[13, -0.3, -18]} scale={[13, 3.2, 5]} color="#238c63" />
      <Hill position={[0, -0.4, -23]} scale={[16, 3.4, 5]} color="#2daf66" />

      {[
        [-12, 0, -15, 1.35],
        [-10.5, 0, -3, 1.1],
        [-11.5, 0, 8, 1.25],
        [11.5, 0, -8, 1.2],
        [12.2, 0, 2, 1],
        [10.5, 0, 12, 1.2],
      ].map(([x, y, z, scale]) => (
        <Tree key={`${x}-${z}`} position={[x, y, z]} scale={scale} />
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
    </group>
  )
}

function GrassField() {
  const blades = useMemo(
    () =>
      Array.from({ length: 260 }, (_, index) => {
        const side = randomAt(index) > 0.5 ? 1 : -1
        const x = side * (2.9 + randomAt(index + 1) * 11.2)
        const z = -18 + randomAt(index + 2) * 36.5
        return {
          height: 0.25 + randomAt(index + 3) * 0.52,
          rotation: randomAt(index + 4) * Math.PI,
          color: randomAt(index + 5) > 0.45 ? '#74d94a' : '#35b653',
          position: [x, 0.12, z],
        }
      }),
    [],
  )

  return (
    <group>
      {blades.map((blade, index) => (
        <mesh
          key={index}
          position={blade.position}
          rotation={[0, blade.rotation, THREE.MathUtils.degToRad(8)]}
        >
          <boxGeometry args={[0.08, blade.height, 0.04]} />
          <meshToonMaterial color={blade.color} />
        </mesh>
      ))}
    </group>
  )
}

function randomAt(seed) {
  const value = Math.sin(seed * 928.231) * 43758.5453
  return value - Math.floor(value)
}

function Hill({ color, ...props }) {
  return (
    <mesh {...props} receiveShadow>
      <sphereGeometry args={[1, 24, 12]} />
      <meshToonMaterial color={color} />
    </mesh>
  )
}

function Cloud({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {[
        [-0.9, 0, 0, 1.05],
        [0, 0.18, 0, 1.35],
        [0.9, 0, 0, 1],
        [0.25, -0.15, 0, 1.15],
      ].map(([x, y, z, size]) => (
        <mesh key={`${x}-${y}`} position={[x, y, z]} scale={[size * 1.35, size * 0.62, 0.32]}>
          <sphereGeometry args={[1, 16, 8]} />
          <meshBasicMaterial color="#f7fbff" />
        </mesh>
      ))}
    </group>
  )
}

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.1, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.38, 2.2, 7]} />
        <meshToonMaterial color="#9b6a3a" />
      </mesh>
      {[
        [0, 2.45, 0, 1.55],
        [-0.65, 2.12, 0.18, 1.08],
        [0.72, 2.1, -0.05, 1.12],
        [0.12, 2.9, -0.18, 1],
      ].map(([x, y, z, size]) => (
        <mesh key={`${x}-${y}`} position={[x, y, z]} scale={[size, size * 0.82, size]}>
          <sphereGeometry args={[1, 18, 10]} />
          <meshToonMaterial color="#149d67" />
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

function WelcomeStudio() {
  return (
    <group position={[8.9, 0, -13.2]} rotation={[0, -0.33, 0]}>
      <mesh position={[0, 1.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.6, 2.7, 3.6]} />
        <meshToonMaterial color="#d24b38" />
      </mesh>
      <mesh position={[0, 2.95, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[3.7, 3.7, 3.95]} />
        <meshToonMaterial color="#e85d35" />
      </mesh>
      <mesh position={[0, 1.1, 1.83]} castShadow>
        <boxGeometry args={[1.15, 1.75, 0.08]} />
        <meshToonMaterial color="#126d66" />
      </mesh>
      <mesh position={[-1.35, 1.55, 1.86]}>
        <boxGeometry args={[0.72, 0.7, 0.09]} />
        <meshToonMaterial color="#9fe8ff" />
      </mesh>
      <mesh position={[1.32, 2.0, 1.86]}>
        <boxGeometry args={[0.72, 0.7, 0.09]} />
        <meshToonMaterial color="#9fe8ff" />
      </mesh>
      {[-1.8, -0.9, 0, 0.9, 1.8].map((x) => (
        <mesh key={x} position={[x, 1.36, 1.88]}>
          <boxGeometry args={[0.08, 2.55, 0.1]} />
          <meshToonMaterial color="#b93935" />
        </mesh>
      ))}
      <Text position={[0, 3.55, 2.05]} fontSize={0.28} color="#fff4d5" anchorX="center">
        workshop
      </Text>
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

function ProjectPanel({ exhibit, allExhibits, showIndex, close, open }) {
  return (
    <section className="project-panel" aria-label={showIndex ? 'Project index' : exhibit?.title}>
      <button className="icon-button close-button" type="button" onClick={close} aria-label="Close panel">
        <X size={20} />
      </button>

      {showIndex ? (
        <>
          <p className="eyebrow">Alley index</p>
          <h2>Маршрут по аллее</h2>
          <div className="index-grid">
            {allExhibits.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  className="index-item"
                  style={{ '--accent': item.accent }}
                  onClick={() => open(item.id)}
                >
                  <Icon size={18} />
                  <span>{item.title}</span>
                  <small>{item.type}</small>
                </button>
              )
            })}
          </div>
        </>
      ) : (
        <>
          <p className="eyebrow" style={{ color: exhibit.accent }}>
            {exhibit.room}
          </p>
          <h2>{exhibit.title}</h2>
          <p className="panel-summary">{exhibit.summary}</p>

          <div className="panel-section">
            <h3>Что показать</h3>
            <ul>
              {exhibit.todo.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="skill-row">
            {exhibit.skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>

          <div className="media-placeholder" style={{ '--accent': exhibit.accent }}>
            <Box size={24} />
            <span>сюда добавим фото, видео, звук, ссылки или 3D-объект</span>
          </div>
        </>
      )}
    </section>
  )
}

export default App
