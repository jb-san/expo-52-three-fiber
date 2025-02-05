import Canvas from "@/baby3fiber/Canvas";
import { useState } from "react";

export default function BabyScreen() {
  const [show, setShow] = useState(false);
  return (
    <>
      <Canvas>
        <ambientLight />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshNormalMaterial />
        </mesh>
      </Canvas>
    </>
  );
}
