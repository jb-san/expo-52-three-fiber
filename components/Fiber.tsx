import { Canvas } from "@react-three/fiber/native";
import React from "react";

export default function Fiber() {
  return (
    <Canvas style={{ flex: 1, backgroundColor: "black" }}>
      <ambientLight />
      <directionalLight position={[10, 10, 10]} />
      <mesh
        position={[1, 0, 0]}
        onPointerDown={() => {
          console.log("clicked");
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </Canvas>
  );
}
