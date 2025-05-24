"use client"

import { OrbitControls, Environment } from "@react-three/drei"
import { useRef, useState, useEffect } from "react"
import * as THREE from "three"

const isMobile = () => {
  if (typeof window === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

const BoxWithEdges = ({ position, color = "#374B52" }) => {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.1}
          metalness={0.8}
          transparent={true}
          opacity={0.9}
          transmission={0.5}
          clearcoat={1}
        />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.5, 0.5, 0.5)]} />
        <lineBasicMaterial color="#96AFB8" linewidth={2} />
      </lineSegments>
    </group>
  )
}

const MedicalSymbol = ({ position }) => {
  const group = useRef<THREE.Group>(null)

  // Create a plus symbol (medical cross)
  const plusShape = [
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ]

  return (
    <group ref={group} position={position}>
      {plusShape.map((row, i) =>
        row.map((cell, j) => {
          if (cell) {
            const xOffset = j * 0.6 - 1.2
            return <BoxWithEdges key={`${i}-${j}`} position={[xOffset, (4 - i) * 0.6 - 1.2, 0]} />
          }
          return null
        }),
      )}
    </group>
  )
}

const VideoCallSymbol = ({ position }) => {
  const group = useRef<THREE.Group>(null)

  // Create a camera-like symbol
  const cameraShape = [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 1, 1],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 1, 0],
  ]

  return (
    <group ref={group} position={position}>
      {cameraShape.map((row, i) =>
        row.map((cell, j) => {
          if (cell) {
            const xOffset = j * 0.6 - 1.2
            return <BoxWithEdges key={`${i}-${j}`} position={[xOffset, (4 - i) * 0.6 - 1.2, 0]} color="#96AFB8" />
          }
          return null
        }),
      )}
    </group>
  )
}

const MedicalScene = () => {
  const orbitControlsRef = useRef(null)
  const [isMobileDevice, setIsMobileDevice] = useState(false)

  useEffect(() => {
    setIsMobileDevice(isMobile())
  }, [])

  return (
    <>
      <group position={[0, 0, 0]} rotation={[0, Math.PI / 6, 0]}>
        <MedicalSymbol position={[-3, 0, 0]} />
        <VideoCallSymbol position={[3, 0, 0]} />
      </group>

      <OrbitControls
        ref={orbitControlsRef}
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={1}
        minPolarAngle={Math.PI / 2 - 0.5}
        maxPolarAngle={Math.PI / 2 + 0.5}
      />

      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} color="#ffffff" />

      <Environment
        files={
          isMobileDevice
            ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download3-7FArHVIJTFszlXm2045mQDPzsZqAyo.jpg"
            : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dither_it_M3_Drone_Shot_equirectangular-jpg_San_Francisco_Big_City_1287677938_12251179%20(1)-NY2qcmpjkyG6rDp1cPGIdX0bHk3hMR.jpg"
        }
        background
      />
    </>
  )
}

export default MedicalScene
