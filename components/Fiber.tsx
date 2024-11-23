import React from "react";
import { FiberCanvas } from "./FiberCanvas";

export default function Fiber() {
  return (
    <FiberCanvas style={{ flex: 1, backgroundColor: "black" }}>
      <ambientLight />
      <directionalLight position={[10, 10, 10]} />
      <Box />
      <mesh
        position={[1, 0, 0]}
        onPointerDown={() => {
          console.log("clicked");
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    </FiberCanvas>
  );
}
function Box() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}
