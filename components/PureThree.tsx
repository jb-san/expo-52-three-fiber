// src/components/PureThree.tsx

import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import React from "react";
import { View } from "react-native";
import * as THREE from "three";
const onContextCreate = async (gl: ExpoWebGLRenderingContext) => {
  // Create a WebGLRenderer without using expo-three
  // const renderer = new THREE.WebGLRenderer({ context: gl, antialias: false });
  const renderer = new THREE.WebGLRenderer({
    canvas: {
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
      style: {},
      addEventListener: (() => {}) as any,
      removeEventListener: (() => {}) as any,
      clientHeight: gl.drawingBufferHeight,
    },
    context: gl,
  });
  renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
  renderer.setPixelRatio(1);

  // Create a new Three.js scene
  const scene = new THREE.Scene();

  // Set up a camera with perspective projection
  const camera = new THREE.PerspectiveCamera(
    75,
    gl.drawingBufferWidth / gl.drawingBufferHeight,
    0.1,
    1000
  );
  camera.position.z = 3;

  // Create a 1x1x1 cube geometry
  const geometry = new THREE.BoxGeometry(1, 1, 1);

  // Use a basic material with a simple color
  const material = new THREE.MeshNormalMaterial();

  // Combine geometry and material into a mesh
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Animation loop
  const animate = () => {
    requestAnimationFrame(animate);

    // Rotate the cube for some basic animation
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Render the scene from the perspective of the camera
    renderer.render(scene, camera);

    // Indicate the frame is done
    gl.endFrameEXP();
  };

  // Start the animation loop
  animate();
};

export const PureThree: React.FC = () => {
  return (
    <View style={{ flex: 1 }}>
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />
    </View>
  );
};

export default PureThree;
