import React, { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Float,
  Environment,
  ContactShadows,
  MeshReflectorMaterial,
  Sparkles,
} from '@react-three/drei'
import * as THREE from 'three'

/* ============================================================
   Profil bidak (dipakai LatheGeometry -> hasil "turned" halus)
   Titik = Vector2(radius, tinggi), diputar mengelilingi sumbu Y
   ============================================================ */
const V = (x, y) => new THREE.Vector2(x, y)

const KING_PROFILE = [
  V(0.0, 0), V(0.58, 0), V(0.58, 0.09), V(0.44, 0.16), V(0.4, 0.24),
  V(0.31, 0.38), V(0.23, 0.62), V(0.2, 0.86), V(0.27, 1.0), V(0.35, 1.08),
  V(0.31, 1.16), V(0.18, 1.25), V(0.31, 1.36), V(0.41, 1.52), V(0.35, 1.63),
  V(0.13, 1.67), V(0.0, 1.67),
]

const PAWN_PROFILE = [
  V(0.0, 0), V(0.44, 0), V(0.44, 0.08), V(0.31, 0.13), V(0.27, 0.22),
  V(0.19, 0.44), V(0.17, 0.58), V(0.24, 0.64), V(0.31, 0.67), V(0.23, 0.74),
  V(0.16, 0.8), V(0.26, 0.9), V(0.29, 1.0), V(0.24, 1.12), V(0.13, 1.2),
  V(0.0, 1.24),
]

const BISHOP_PROFILE = [
  V(0.0, 0), V(0.46, 0), V(0.46, 0.08), V(0.32, 0.14), V(0.28, 0.24),
  V(0.2, 0.5), V(0.17, 0.7), V(0.24, 0.78), V(0.32, 0.82), V(0.24, 0.9),
  V(0.16, 0.98), V(0.23, 1.18), V(0.24, 1.34), V(0.17, 1.5), V(0.09, 1.62),
  V(0.11, 1.7), V(0.0, 1.76),
]

const QUEEN_PROFILE = [
  V(0.0, 0), V(0.52, 0), V(0.52, 0.09), V(0.4, 0.16), V(0.35, 0.26),
  V(0.24, 0.56), V(0.2, 0.82), V(0.28, 0.94), V(0.36, 1.0), V(0.29, 1.1),
  V(0.19, 1.2), V(0.3, 1.34), V(0.42, 1.5), V(0.34, 1.6), V(0.42, 1.66),
  V(0.32, 1.72), V(0.4, 1.78), V(0.28, 1.84), V(0.0, 1.9),
]

const GOLD = { color: '#e9b94e', metalness: 1, roughness: 0.16, envMapIntensity: 1.4 }
const ONYX = { color: '#1a1d27', metalness: 0.9, roughness: 0.28, envMapIntensity: 1.1 }

function LathePiece({ profile, mat, scale = 1, crown = false, ...rest }) {
  const geo = useMemo(
    () => new THREE.LatheGeometry(profile, 96),
    [profile]
  )
  return (
    <group scale={scale} {...rest}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial {...mat} />
      </mesh>
      {crown && (
        <>
          <mesh position={[0, 1.86, 0]} castShadow>
            <boxGeometry args={[0.1, 0.42, 0.1]} />
            <meshStandardMaterial {...mat} />
          </mesh>
          <mesh position={[0, 1.9, 0]} castShadow>
            <boxGeometry args={[0.32, 0.1, 0.1]} />
            <meshStandardMaterial {...mat} />
          </mesh>
        </>
      )}
    </group>
  )
}

/* ============================================================
   Bidak KUDA (knight) — gaya Staunton:
   - Kepala kuda: siluet 2D detail (surai bertingkat, telinga
     bercelah, moncong, mata) yang di-extrude.
   - Alas: LatheGeometry bercincin (turned base) seperti bidak asli.
   ============================================================ */

// --- Kepala kuda (extrude), gaya Staunton menghadap kiri ---
function buildKnightHead() {
  const s = new THREE.Shape()
  s.moveTo(0.3, 0) // dasar-belakang
  s.lineTo(-0.3, 0) // dasar-depan
  // leher depan / tenggorokan naik
  s.quadraticCurveTo(-0.34, 0.3, -0.34, 0.52)
  s.quadraticCurveTo(-0.34, 0.66, -0.46, 0.72) // bawah rahang
  s.quadraticCurveTo(-0.6, 0.74, -0.72, 0.82) // rahang -> moncong bawah
  s.quadraticCurveTo(-0.84, 0.86, -0.82, 0.94) // ujung hidung (paling kiri)
  s.quadraticCurveTo(-0.8, 1.02, -0.66, 1.0) // punggung hidung
  s.quadraticCurveTo(-0.5, 0.99, -0.4, 1.06) // batang hidung
  s.quadraticCurveTo(-0.26, 1.14, -0.16, 1.24) // wajah naik ke dahi
  s.quadraticCurveTo(-0.08, 1.3, -0.02, 1.4) // dahi ke telinga
  s.lineTo(0.06, 1.54) // ujung telinga depan
  s.lineTo(0.14, 1.36) // celah telinga
  s.lineTo(0.24, 1.5) // ujung telinga belakang
  s.quadraticCurveTo(0.3, 1.4, 0.34, 1.3) // tengkuk turun ke surai
  // surai — lengkungan kecil halus di punggung leher
  s.quadraticCurveTo(0.44, 1.24, 0.42, 1.16)
  s.quadraticCurveTo(0.5, 1.12, 0.46, 1.04)
  s.quadraticCurveTo(0.52, 1.0, 0.48, 0.9)
  s.quadraticCurveTo(0.5, 0.72, 0.44, 0.5) // punggung leher melengkung
  s.quadraticCurveTo(0.4, 0.28, 0.36, 0.12)
  s.closePath()

  // mata (lubang tembus -> tampak gelap)
  const eye = new THREE.Path()
  eye.absarc(-0.16, 1.04, 0.05, 0, Math.PI * 2, true)
  s.holes.push(eye)

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.38,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 6,
    curveSegments: 44,
  })
  geo.computeBoundingBox()
  const bb = geo.boundingBox
  geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2)
  geo.computeVertexNormals()
  return geo
}

// --- Alas bubut bercincin (lathe) ---
const KNIGHT_BASE_PROFILE = [
  V(0.0, 0), V(0.62, 0), V(0.62, 0.055), V(0.5, 0.1), V(0.45, 0.14),
  V(0.54, 0.2), V(0.56, 0.27), V(0.49, 0.33), V(0.43, 0.37),
  V(0.5, 0.42), V(0.51, 0.48), V(0.44, 0.52), V(0.38, 0.56),
  V(0.35, 0.6), V(0.0, 0.6),
]
function buildKnightBase() {
  return new THREE.LatheGeometry(KNIGHT_BASE_PROFILE, 96)
}

function KnightPiece({ mat, scale = 1, ...props }) {
  const headGeo = useMemo(buildKnightHead, [])
  const baseGeo = useMemo(buildKnightBase, [])
  return (
    <group scale={scale} {...props}>
      <mesh geometry={baseGeo} castShadow receiveShadow>
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh geometry={headGeo} position={[0, 0.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial {...mat} />
      </mesh>
    </group>
  )
}

/* ====== Bidak utama: Kuda emas berdiri di lantai, mengayun anggun ====== */
function HeroKnight() {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime
      // mengayun halus supaya profil kuda selalu terlihat cantik
      ref.current.rotation.y = Math.sin(t * 0.5) * 0.6
    }
  })
  return (
    <group ref={ref} position={[0, -0.15, 0]}>
      <KnightPiece mat={GOLD} scale={1.15} />
    </group>
  )
}

// Bidak melayang disebar di kiri & kanan untuk membingkai kartu form
// yang berada di tengah.
const ORBIT_PIECES = [
  { knight: true, mat: ONYX, pos: [-3.9, 1.8, -0.7], s: 0.5, spd: 1.1 },
  { profile: BISHOP_PROFILE, mat: GOLD, pos: [-3.5, 0.1, -1.1], s: 0.52, spd: 0.8 },
  { profile: QUEEN_PROFILE, mat: ONYX, pos: [-4.5, 1.0, -2.1], s: 0.5, spd: 0.7 },
  { knight: true, mat: GOLD, pos: [3.7, 2.0, -1.0], s: 0.46, spd: 1.3 },
  { profile: BISHOP_PROFILE, mat: ONYX, pos: [4.0, 0.4, -1.4], s: 0.5, spd: 0.9 },
  { profile: PAWN_PROFILE, mat: GOLD, pos: [3.0, -0.2, 0.2], s: 0.42, spd: 1.2 },
  { profile: PAWN_PROFILE, mat: ONYX, pos: [0.3, 3.1, -2.7], s: 0.32, spd: 1.0 },
]

function OrbitingPieces() {
  return ORBIT_PIECES.map((p, i) => (
    <Float key={i} speed={p.spd} rotationIntensity={1.4} floatIntensity={1.8}>
      {p.knight ? (
        <KnightPiece mat={p.mat} scale={p.s} position={p.pos} />
      ) : (
        <LathePiece profile={p.profile} mat={p.mat} scale={p.s} position={p.pos} />
      )}
    </Float>
  ))
}

/* ====== Lantai reflektif premium ====== */
function ReflectiveFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.16, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <MeshReflectorMaterial
        blur={[400, 120]}
        resolution={1024}
        mixBlur={1}
        mixStrength={45}
        roughness={0.85}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#0a0c12"
        metalness={0.7}
        mirror={0.4}
      />
    </mesh>
  )
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#080a10']} />
      <fog attach="fog" args={['#080a10', 9, 24]} />

      <ambientLight intensity={0.25} />
      <spotLight
        position={[4, 9, 5]}
        angle={0.5}
        penumbra={0.8}
        intensity={140}
        color="#fff2d6"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />
      <pointLight position={[-6, 3, -4]} intensity={60} color="#c98a2a" />
      <pointLight position={[5, 1, 4]} intensity={25} color="#5b7cff" />
      <Environment preset="warehouse" />

      {/* Raja utama digeser sedikit ke kiri; bidak lain membingkai dari
          kedua sisi kartu form yang berada di tengah. */}
      <group position={[-2.2, 0, 0]}>
        <HeroKnight />
        <ContactShadows
          position={[0, -0.15, 0]}
          opacity={0.55}
          scale={9}
          blur={2.4}
          far={5}
          color="#000000"
        />
      </group>
      <OrbitingPieces />
      <ReflectiveFloor />
      <Sparkles count={70} scale={12} size={2} speed={0.3} color="#e9b94e" opacity={0.5} />
    </>
  )
}

export default function ChessScene() {
  return (
    <div className="chess-bg">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0.3, 1.4, 6.4], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
