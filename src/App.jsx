/* eslint-disable react-hooks/immutability */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  ContactShadows,
  Text,
} from '@react-three/drei'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
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
  const [hasEntered, setHasEntered] = useState(() =>
    new URLSearchParams(window.location.search).has('preview'),
  )

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
        camera={{ position: [0, 1.7, 15], rotation: [-0.48, 0, 0], fov: 68, near: 0.1, far: 120 }}
        dpr={[1, 1.35]}
        gl={{ antialias: true, powerPreference: 'high-performance', stencil: false, alpha: false }}
        performance={{ min: 0.72 }}
        onCreated={({ gl }) => {
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.06
        }}
      >
        <MuseumScene
          setFocusedId={setFocusedId}
          openExhibit={setActiveId}
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
              <p className="eyebrow">Creator Garden Alley</p>
              <h1>Portfolio Prototype</h1>
              <div className="status-readout" aria-hidden="true">
                <span>STATUS</span>
                <strong>EXPLORATION</strong>
                <small>ALLEY BUILD 0.2</small>
              </div>
            </div>
            <nav aria-label="Museum shortcuts">
              <button type="button" onClick={() => setShowIndex(true)}>
                INDEX
              </button>
              <button type="button" onClick={enterMuseum}>
                FOCUS
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

          <aside className="inventory-panel" aria-label="Visual slots">
            <p>INVENTORY</p>
            <div>
              <span>1</span>
              <span>2</span>
              <span>3</span>
            </div>
          </aside>

          <div className="stamina-bar" aria-hidden="true">
            <span />
          </div>
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
      <color attach="background" args={['#efaa7f']} />
      <fog attach="fog" args={[palette.fog, 18, 74]} />

      <SunsetSky />

      <ambientLight intensity={0.28} color="#ffe6be" />
      <hemisphereLight args={['#ffd8ac', '#176048', 1.18]} />
      <directionalLight
        position={[-12, 8.5, -10]}
        intensity={4.7}
        color="#ffba74"
        castShadow
        shadow-mapSize={2048}
        shadow-bias={-0.00022}
        shadow-normalBias={0.035}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      <directionalLight position={[8, 6, 10]} intensity={0.9} color="#6fbaff" />
      <pointLight position={[0, 4.4, -13]} color="#ffe2a0" intensity={4.2} distance={16} />
      <pointLight position={[-5.8, 2.6, 2.6]} color="#e4ffc2" intensity={1.9} distance={8} />
      <pointLight position={[6.4, 2.6, 5.5]} color="#ffc7a8" intensity={1.8} distance={8} />

      <PlayerRig setFocusedId={setFocusedId} openExhibit={openExhibit} />

      <OutdoorAlley />
      <WelcomeStudio />

      {exhibits.map((exhibit) => (
        <Exhibit key={exhibit.id} exhibit={exhibit} openExhibit={openExhibit} />
      ))}

      <TimelineGate />
      <ContactShadows
        position={[0, 0.035, 0]}
        opacity={0.34}
        scale={52}
        blur={1.7}
        far={22}
        frames={1}
      />

      <EffectComposer multisampling={0} resolutionScale={0.72}>
        <Bloom intensity={0.28} luminanceThreshold={0.82} luminanceSmoothing={0.42} mipmapBlur />
        <Noise opacity={0.035} />
        <Vignette eskil={false} offset={0.18} darkness={0.42} />
      </EffectComposer>

    </>
  )
}

function SunsetSky() {
  const skyMaterial = useMemo(
    () => ({
      uniforms: {
        topColor: { value: new THREE.Color(palette.skyTop) },
        midColor: { value: new THREE.Color(palette.skyMid) },
        horizonColor: { value: new THREE.Color(palette.skyHorizon) },
        groundColor: { value: new THREE.Color('#d98568') },
        sunDirection: { value: new THREE.Vector3(-0.55, 0.16, -0.82).normalize() },
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
        varying vec3 vWorldPosition;

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

          gl_FragColor = vec4(sky, 1.0);
        }
      `,
    }),
    [],
  )

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

      <mesh position={[-30, 12.8, -50]} renderOrder={-900}>
        <circleGeometry args={[5.2, 64]} />
        <meshBasicMaterial color="#ffd18a" transparent opacity={0.92} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={[-30, 12.8, -50]} renderOrder={-901}>
        <circleGeometry args={[13, 64]} />
        <meshBasicMaterial color="#ff8f5e" transparent opacity={0.16} depthWrite={false} toneMapped={false} />
      </mesh>

      <Cloud position={[-18, 9.5, -42]} scale={2.2} color="#ffe0c7" shadowColor="#d98d7a" />
      <Cloud position={[8, 11.2, -46]} scale={1.8} color="#ffd9bf" shadowColor="#d98776" />
      <Cloud position={[22, 7.2, -34]} scale={1.35} color="#f3c7b0" shadowColor="#c97872" />
    </group>
  )
}

function PlayerRig({ setFocusedId, openExhibit }) {
  const { camera } = useThree()
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

  useEffect(() => {
    camera.rotation.order = 'YXZ'
    camera.lookAt(0, 0.65, -4.5)
    pitch.current = camera.rotation.x
    yaw.current = camera.rotation.y

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

  useFrame(({ clock }, delta) => {
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
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -14.8, 14.8)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -19.2, 17.8)

    const moveAmount = THREE.MathUtils.clamp(velocity.current.length() / speed, 0, 1)
    const t = clock.elapsedTime
    const bob = Math.sin(t * 9.2) * 0.038 * moveAmount
    const sway = Math.sin(t * 4.6) * 0.009 * moveAmount
    camera.position.y = 1.7 + bob
    camera.rotation.set(pitch.current + bob * 0.018, yaw.current, sway)

    let focused = null
    let score = 0.78

    exhibits.forEach((exhibit) => {
      const toTarget = targetVector.current.set(...exhibit.position).sub(camera.position)
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
        <meshToonMaterial color={palette.grass} />
      </mesh>

      <GroundPaint />

      <mesh position={[0, 0.035, -1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4.8, 39]} />
        <meshToonMaterial color={palette.path} />
      </mesh>
      <mesh position={[-2.65, 0.055, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 38]} />
        <meshToonMaterial color={palette.pathLight} />
      </mesh>
      <mesh position={[2.65, 0.055, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 38]} />
        <meshToonMaterial color={palette.pathLight} />
      </mesh>

      <mesh position={[0, 0.06, -13.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[4.3, 48]} />
        <meshToonMaterial color="#b99355" />
      </mesh>
      <mesh position={[0, 0.07, 7.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 36]} />
        <meshToonMaterial color={palette.water} transparent opacity={0.78} />
      </mesh>
      <mesh position={[0, 0.09, 7.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.92, 2.24, 38]} />
        <meshBasicMaterial color="#e5f0bc" transparent opacity={0.46} />
      </mesh>

      <PathBrushStrokes />
      <GrassField />
      <PathPebbles />
      <LeafScatter />
      <FloatingMotes />
      <FenceLine side={-1} />
      <FenceLine side={1} />
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
      <LampPost position={[-3.1, 0, -10.6]} />
      <LampPost position={[3.1, 0, -6]} />
      <LampPost position={[-3.1, 0, 1.1]} />
      <LampPost position={[3.1, 0, 11.7]} />
      <StringLights />
      <DirectionBoard position={[-2.9, 0, -15.4]} rotation={[0, 0.12, 0]} />
      <PaperTrail />
      <Rocks />
    </group>
  )
}

function GroundPaint() {
  const ref = useRef()
  const patches = useMemo(
    () =>
      Array.from({ length: 170 }, (_, index) => {
        const side = randomAt(index + 500) > 0.5 ? 1 : -1
        const x = side * (3.6 + randomAt(index + 501) * 16.6)
        const z = -22.5 + randomAt(index + 502) * 45
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
  const ref = useRef()
  const blades = useMemo(
    () =>
      Array.from({ length: 1350 }, (_, index) => {
        const side = randomAt(index) > 0.5 ? 1 : -1
        const x = side * (2.68 + randomAt(index + 1) * 15.5)
        const z = -20.5 + randomAt(index + 2) * 41.2
        const height = 0.2 + randomAt(index + 3) * 0.72
        return {
          height,
          rotation: randomAt(index + 4) * Math.PI,
          lean: THREE.MathUtils.degToRad(-10 + randomAt(index + 6) * 20),
          color: randomAt(index + 5) > 0.62 ? palette.grassLight : randomAt(index + 8) > 0.45 ? palette.grassWarm : palette.grassDark,
          width: 0.045 + randomAt(index + 7) * 0.055,
          position: [x, height * 0.5 + 0.035, z],
        }
      }),
    [],
  )

  useInstancedTransforms(ref, blades, ({ position, rotation, lean, width, height, color }, dummy, colorTarget) => {
    dummy.position.set(...position)
    dummy.rotation.set(0, rotation, lean)
    dummy.scale.set(width, height, 0.035)
    colorTarget.set(color)
  })

  return (
    <instancedMesh ref={ref} args={[null, null, blades.length]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#226f50" />
    </instancedMesh>
  )
}

function PathPebbles() {
  const ref = useRef()
  const pebbles = useMemo(
    () =>
      Array.from({ length: 220 }, (_, index) => ({
        position: [
          -2.12 + randomAt(index + 101) * 4.24,
          0.085,
          -19.4 + randomAt(index + 102) * 38.5,
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
      Array.from({ length: 58 }, (_, index) => ({
        position: [-2.1 + randomAt(index + 700) * 4.2, 0.074, -19.2 + index * 0.66],
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
      Array.from({ length: 240 }, (_, index) => {
        const x = -15 + randomAt(index + 800) * 30
        const z = -20.5 + randomAt(index + 801) * 41
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

function useInstancedTransforms(ref, items, applyTransform) {
  useLayoutEffect(() => {
    if (!ref.current) return

    const dummy = new THREE.Object3D()
    const color = new THREE.Color()

    items.forEach((item, index) => {
      dummy.position.set(0, 0, 0)
      dummy.rotation.set(0, 0, 0)
      dummy.scale.set(1, 1, 1)
      applyTransform(item, dummy, color, index)
      dummy.updateMatrix()
      ref.current.setMatrixAt(index, dummy.matrix)
    })

    ref.current.instanceMatrix.needsUpdate = true
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

function FenceLine({ side }) {
  return (
    <group position={[side * 3.38, 0, -0.8]}>
      {Array.from({ length: 10 }, (_, index) => {
        const z = -17 + index * 3.8
        return (
          <group key={index} position={[0, 0, z]}>
            <mesh position={[0, 0.38, 0]} castShadow>
              <boxGeometry args={[0.14, 0.76, 0.14]} />
              <meshToonMaterial color={palette.darkWood} />
            </mesh>
            {index < 9 && (
              <mesh position={[0, 0.54, 1.9]} rotation={[0, 0, side * 0.04]} castShadow>
                <boxGeometry args={[0.12, 0.16, 3.42]} />
                <meshToonMaterial color={palette.wood} />
              </mesh>
            )}
          </group>
        )
      })}
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
      <sphereGeometry args={[1, 36, 18]} />
      <meshToonMaterial color={color} />
    </mesh>
  )
}

function Cloud({ position, scale = 1, color = '#ffe7d2', shadowColor = '#d99a82' }) {
  return (
    <group position={position} scale={scale}>
      {[
        [-1.18, -0.08, 0, 0.9, shadowColor],
        [-0.62, 0.05, 0, 1.1, color],
        [0.12, 0.2, 0, 1.38, color],
        [0.94, 0.04, 0, 1.02, color],
        [0.18, -0.2, 0, 1.22, shadowColor],
      ].map(([x, y, z, size, cloudColor]) => (
        <mesh key={`${x}-${y}`} position={[x, y, z]} scale={[size * 1.35, size * 0.62, 0.32]}>
          <sphereGeometry args={[1, 16, 8]} />
          <meshBasicMaterial color={cloudColor} />
        </mesh>
      ))}
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

function LampPost({ position }) {
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
        <meshBasicMaterial color="#fff2a2" toneMapped={false} />
      </mesh>
      <mesh position={[0.55, 1.95, 0]} scale={0.56}>
        <sphereGeometry args={[1, 16, 8]} />
        <meshBasicMaterial color="#ffc980" transparent opacity={0.15} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight position={[0.55, 1.95, 0]} color="#ffe892" intensity={1.45} distance={4.8} />
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
                <mesh>
                  <sphereGeometry args={[0.09, 12, 8]} />
                  <meshBasicMaterial color={index % 2 === 0 ? '#ffe294' : '#ffb27e'} toneMapped={false} />
                </mesh>
              </group>
            )
          })}
        </group>
      ))}
    </group>
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
        music
      </Text>
      <Text position={[1.05, 1.62, 0.12]} fontSize={0.105} color="#fff4d5" anchorX="center">
        builds
      </Text>
    </group>
  )
}

function PaperTrail() {
  return (
    <group>
      {[
        [-2.9, 0.12, -4.2, 0.15],
        [2.75, 0.12, -8.8, -0.22],
        [-2.6, 0.12, 4.9, -0.05],
        [2.9, 0.12, 13.6, 0.19],
      ].map(([x, y, z, rot]) => (
        <mesh key={`${x}-${z}`} position={[x, y, z]} rotation={[-Math.PI / 2, 0, rot]}>
          <planeGeometry args={[0.54, 0.38]} />
          <meshToonMaterial color="#fff7df" />
        </mesh>
      ))}
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
