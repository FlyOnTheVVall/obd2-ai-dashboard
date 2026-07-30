import { Canvas, useFrame } from "@react-three/fiber";
import {
  Html,
  Line,
  OrbitControls,
  Stars,
  useGLTF,
  useProgress
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const MODEL_URL = "/models/toyota_tundra_mk1_access_cab_sr5_1999.glb";

function LoadingModel() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div
        style={{
          color: "#78c5ff",
          fontFamily: "monospace",
          fontSize: "12px",
          letterSpacing: "0.12em",
          whiteSpace: "nowrap"
        }}
      >
        LOADING TUNDRA {Math.round(progress)}%
      </div>
    </Html>
  );
}

function TundraModel() {
  const vehicle = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);

  const prepared = useMemo(() => {
    // Clone the cached GLTF so changing its materials does not mutate the loader cache.
    const model = scene.clone(true);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#64baff"),
      wireframe: true,
      transparent: true,
      opacity: 0.72,
      depthTest: true,
      depthWrite: true,
      side: THREE.DoubleSide
    });

    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;

      object.material = wireMaterial;
      object.castShadow = false;
      object.receiveShadow = false;
      object.frustumCulled = true;
    });

    // Normalize the model automatically. The source GLB is hundreds of units
    // long, so this scales its largest dimension to fit the existing HUD scene.
    model.updateMatrixWorld(true);
    const sourceBounds = new THREE.Box3().setFromObject(model);
    const sourceSize = sourceBounds.getSize(new THREE.Vector3());
    const largestDimension = Math.max(sourceSize.x, sourceSize.y, sourceSize.z);
    const targetLength = 5.8;
    const scale = largestDimension > 0 ? targetLength / largestDimension : 1;

    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);

    // Center the truck on X/Z and place its lowest point on the ground plane.
    const scaledBounds = new THREE.Box3().setFromObject(model);
    const scaledCenter = scaledBounds.getCenter(new THREE.Vector3());

    model.position.x -= scaledCenter.x;
    model.position.z -= scaledCenter.z;
    model.position.y -= scaledBounds.min.y;
    model.updateMatrixWorld(true);

    return { model, wireMaterial };
  }, [scene]);

  useEffect(() => {
    return () => prepared.wireMaterial.dispose();
  }, [prepared]);

  useFrame((state) => {
    if (!vehicle.current) return;

    const elapsed = state.clock.elapsedTime;
    vehicle.current.rotation.y = -0.62 + Math.sin(elapsed * 0.18) * 0.055;
    vehicle.current.position.y = -0.98 + Math.sin(elapsed * 0.72) * 0.035;
  });

  return (
    <group ref={vehicle}>
      <primitive object={prepared.model} dispose={null} />
    </group>
  );
}

function PulseRing({
  radius,
  speed,
  opacity
}: {
  radius: number;
  speed: number;
  opacity: number;
}) {
  const ring = useRef<THREE.Group>(null);
  const points = useMemo(() => {
    const curve = new THREE.EllipseCurve(
      0,
      0,
      radius,
      radius * 0.39,
      0,
      Math.PI * 2
    );

    return curve
      .getPoints(160)
      .map((point) => new THREE.Vector3(point.x, 0, point.y));
  }, [radius]);

  useFrame((state) => {
    if (!ring.current) return;

    const pulse = 1 + Math.sin(state.clock.elapsedTime * speed) * 0.018;
    ring.current.scale.setScalar(pulse);
    ring.current.rotation.y = state.clock.elapsedTime * 0.025;
  });

  return (
    <group ref={ring} position={[0, -0.48, 0]}>
      <Line
        points={points}
        color="#278fef"
        lineWidth={0.75}
        transparent
        opacity={opacity}
      />
    </group>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={["#020710"]} />
      <fog attach="fog" args={["#020710", 9, 22]} />

      <Stars
        radius={40}
        depth={16}
        count={350}
        factor={1.4}
        saturation={0}
        fade
        speed={0.12}
      />

      <group position={[0, -0.08, 0]}>
        <Suspense fallback={<LoadingModel />}>
          <TundraModel />
        </Suspense>
        <PulseRing radius={4.3} speed={1.15} opacity={0.75} />
        <PulseRing radius={5.4} speed={0.82} opacity={0.35} />
      </group>

      <gridHelper
        args={[
          24,
          48,
          new THREE.Color("#164c7d"),
          new THREE.Color("#0a1a2b")
        ]}
        position={[0, -1.05, 0]}
      />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3.3}
        maxPolarAngle={Math.PI / 2.05}
        minAzimuthAngle={-0.9}
        maxAzimuthAngle={0.9}
        target={[0, 0.25, 0]}
      />
    </>
  );
}

export default function VehicleScene() {
  return (
    <Canvas
      camera={{ position: [6.8, 4.15, 8.2], fov: 38 }}
      dpr={[0.75, 1]}
      performance={{ min: 0.5 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance"
      }}
    >
      <Scene />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
