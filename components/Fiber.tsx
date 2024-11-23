import { Canvas, useFrame } from "@react-three/fiber/native";
import React, { useRef } from "react";
import { Mesh } from "three";

export default function Fiber() {
  return (
    <Canvas style={{ flex: 1 }}>
      <ambientLight />
      <directionalLight position={[10, 10, 10]} />
      <Box />
    </Canvas>
  );
}
function Box() {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshNormalMaterial />
    </mesh>
  );
}
