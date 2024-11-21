import { Canvas } from "@react-three/fiber/native";
import { StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <Canvas style={{ flex: 1, backgroundColor: "black" }}>
      <ambientLight />
      <directionalLight position={[10, 10, 10]} />
      <mesh
        position={[0, 0, 0]}
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

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
