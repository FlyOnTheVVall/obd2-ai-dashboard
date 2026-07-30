import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, OrbitControls, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function WireframePart({
  position,
  scale,
  rotation = [0, 0, 0]
}: {
  position: [number, number, number];
  scale: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} scale={scale} rotation={rotation}>
      <boxGeometry />
      <meshBasicMaterial
        color="#4aa9ff"
        wireframe
        transparent
        opacity={0.82}
      />
    </mesh>
  );
}

function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.57, 0.57, 0.34, 24, 1, true]} />
        <meshBasicMaterial
          color="#62b7ff"
          wireframe
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.23, 0.23, 0.37, 12]} />
        <meshBasicMaterial color="#1d5f9a" wireframe />
      </mesh>
    </group>
  );
}

function PickupModel() {
  const vehicle = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!vehicle.current) return;
    vehicle.current.rotation.y += delta * 0.065;
    vehicle.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.04;
  });

  return (
    <group ref={vehicle} rotation={[0.02, -0.48, 0]} scale={0.9}>
      <WireframePart position={[0, 0.44, 0]} scale={[4.75, 0.34, 1.85]} />
      <WireframePart position={[-1.48, 0.98, 0]} scale={[1.62, 0.62, 1.74]} />
      <WireframePart position={[-0.28, 1.4, 0]} scale={[1.62, 0.78, 1.7]} />
      <WireframePart
        position={[-1.05, 1.31, 0]}
        scale={[0.72, 0.78, 1.68]}
        rotation={[0, 0, -0.25]}
      />
      <WireframePart position={[1.58, 0.94, 0]} scale={[1.62, 0.62, 1.72]} />
      <WireframePart position={[2.42, 0.82, 0]} scale={[0.12, 0.7, 1.77]} />
      <WireframePart position={[-2.45, 0.64, 0]} scale={[0.14, 0.55, 1.72]} />

      <Wheel position={[-1.55, 0.12, 1.03]} />
      <Wheel position={[-1.55, 0.12, -1.03]} />
      <Wheel position={[1.66, 0.12, 1.03]} />
      <Wheel position={[1.66, 0.12, -1.03]} />

      <mesh position={[-2.54, 0.72, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[0.18, 0.3, 20]} />
        <meshBasicMaterial color="#85c9ff" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function PulseRing({ radius, speed, opacity }: { radius: number; speed: number; opacity: number }) {
  const ring = useRef<THREE.Group>(null);
  const points = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius * 0.39, 0, Math.PI * 2);
    return curve.getPoints(160).map((point) => new THREE.Vector3(point.x, 0, point.y));
  }, [radius]);

  useFrame((state) => {
    if (!ring.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * speed) * 0.018;
    ring.current.scale.setScalar(pulse);
    ring.current.rotation.y = state.clock.elapsedTime * 0.025;
  });

  return (
    <group ref={ring} rotation={[0, 0, 0]} position={[0, -0.48, 0]}>
      <Line points={points} color="#278fef" lineWidth={0.75} transparent opacity={opacity} />
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#020710"]} />
      <fog attach="fog" args={["#020710", 9, 22]} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 8, 4]} color="#6bbaff" intensity={1.4} />
      <pointLight position={[-4, 1, 4]} color="#006dff" intensity={32} distance={12} />
      <Stars radius={40} depth={16} count={500} factor={1.5} saturation={0} fade speed={0.15} />

      <group position={[0, -0.2, 0]}>
        <Float speed={1.1} rotationIntensity={0.06} floatIntensity={0.08}>
          <PickupModel />
        </Float>
        <PulseRing radius={4.3} speed={1.15} opacity={0.75} />
        <PulseRing radius={5.4} speed={0.82} opacity={0.35} />
      </group>

      <gridHelper
        args={[24, 48, new THREE.Color("#164c7d"), new THREE.Color("#0a1a2b")]}
        position={[0, -1.05, 0]}
      />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3.3}
        maxPolarAngle={Math.PI / 2.05}
        minAzimuthAngle={-0.85}
        maxAzimuthAngle={0.85}
        target={[0, 0.45, 0]}
      />
    </>
  );
}

export default function VehicleScene() {
  return (
    <Canvas
      camera={{ position: [6.8, 4.5, 8.2], fov: 38 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
    >
      <Scene />
    </Canvas>
  );
}
