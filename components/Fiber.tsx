import { Canvas, useFrame } from "@react-three/fiber/native";
import React, { useRef } from "react";
import { Mesh } from "three";

export default function Fiber() {
  return (
    <Canvas
      style={{
        flex: 1,
        borderWidth: 1,
        borderColor: "red",
      }}
    >
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
    <mesh
      ref={meshRef}
      onPointerDown={() => {
        console.log("pointer down");
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshNormalMaterial />
    </mesh>
  );
}
