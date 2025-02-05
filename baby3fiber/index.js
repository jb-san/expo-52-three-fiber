import Reconciler from "react-reconciler";
import * as THREE from "three";
import React from "react";
import {
  DiscreteEventPriority,
  ContinuousEventPriority,
  DefaultEventPriority,
} from "react-reconciler/constants";
/**
 * Converts camelCase primitives to PascalCase.
 */
const pascalCase = (str) => str.charAt(0).toUpperCase() + str.substring(1);

function createInstance(type, { object, args, ...props }) {
  // Convert lowercase primitive to PascalCase
  const name = pascalCase(type);

  // Get class from THREE namespace
  const target = THREE[name];

  // Validate THREE elements
  if (type !== "primitive" && !target)
    throw `${type} is not a part of the THREE namespace.`;

  // Validate primitives
  if (type === "primitive" && !object)
    throw `"object" must be set when using primitives.`;

  // Create instance
  const instance =
    object || (Array.isArray(args) ? new target(...args) : new target(args));

  // Auto-attach geometry and materials to meshes
  if (name.endsWith("Geometry")) {
    props = { attach: "geometry", ...props };
  } else if (name.endsWith("Material")) {
    props = { attach: "material", ...props };
  }

  // Set initial props
  applyProps(instance, props, {});

  return instance;
}
/**
 * Prunes keys from an object.
 */
const pruneKeys = (obj, ...keys) => {
  const keysToRemove = new Set(keys.flat());

  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keysToRemove.has(key))
  );
};

/**
 * Safely mutates a three.js element and collects listeners.
 */
const applyProps = (instance, newProps, oldProps = {}) => {
  // Filter identical props, event handlers, and reserved keys
  const identical = Object.keys(newProps).filter(
    (key) => newProps[key] === oldProps[key]
  );
  const handlers = Object.keys(newProps).filter(
    (key) => typeof newProps[key] === "function" && key.startsWith("on")
  );
  const props = pruneKeys(newProps, [
    ...identical,
    ...handlers,
    "children",
    "key",
    "ref",
  ]);

  // Mutate our three.js element
  if (Object.keys(props).length) {
    Object.entries(props).forEach(([key, value]) => {
      const target = instance[key];
      const isColor = target instanceof THREE.Color;

      // Prefer to use properties' copy and set methods
      // otherwise, mutate the property directly
      if (target?.set) {
        if (target.constructor.name === value.constructor.name) {
          target.copy(value);
        } else if (Array.isArray(value)) {
          target.set(...value);
        } else if (!isColor && target?.setScalar) {
          // Allow shorthand like scale={1}
          target.setScalar(value);
        } else {
          target.set(value);
        }

        // Auto-convert sRGB colors
        if (isColor) target.convertSRGBToLinear();
      } else {
        instance[key] = value;
      }
    });
  }

  // Collect event handlers.
  // We put this on an invalid prop so three.js doesn't serialize handlers
  // if you do ref.current.clone() or ref.current.toJSON()
  if (handlers.length) {
    instance.__handlers = handlers.reduce(
      (acc, key) => ({ ...acc, [key]: newProps[key] }),
      {}
    );
  }
};
// This will centralize updates and mutations for us.
const reconciler = Reconciler({
  getCurrentEventPriority() {
    return DefaultEventPriority;
  },
  // three.js objects can be updated, so we inform the renderer
  supportsMutation: true,
  // We set this to false because this can work on top of react-dom
  isPrimaryRenderer: false,
  // We can modify the ref here, but we return it instead (no-op)
  getPublicInstance: (instance) => instance,
  // This object that's passed into the reconciler is the host context.
  // We don't need to expose it though
  getRootHostContext: () => ({}),
  getChildHostContext: () => ({}),
  // Text isn't supported in three (r133), so we skip it
  createTextInstance: () => {},
  // This is used to calculate updates in the render phase or commitUpdate.
  // Although this improves performance, it's not needed for a PoC
  prepareUpdate: () => ({}),
  // This lets us store stuff before React mutates our three.js objects.
  // We don't do anything here but return an empty object
  prepareForCommit: () => ({}),
  resetAfterCommit: () => ({}),
  // three.js elements don't have textContent, so we skip this
  shouldSetTextContent: () => false,
  // We can mutate objects once they're assembled into the scene graph here.
  // applyProps removes the need for this though
  finalizeInitialChildren: () => false,
  // This can modify the container and clear children.
  // Might be useful for disposing on demand later
  clearContainer: () => false,
  // This is where we'll create a three.js element from a React element
  createInstance,
  // These methods add elements to the scene
  appendChild(parentInstance, child) {
    if (!child) return;

    // Attach material, geometry, fog, etc.
    if (child.attach && parentInstance[child.attach] !== undefined) {
      parentInstance[child.attach] = child;
    } else {
      parentInstance.add(child);
    }
  },
  appendInitialChild(parentInstance, child) {
    if (!child) return;

    // Attach material, geometry, fog, etc.
    if (child.attach && parentInstance[child.attach] !== undefined) {
      parentInstance[child.attach] = child;
    } else {
      parentInstance.add(child);
    }
  },
  appendChildToContainer(parentInstance, child) {
    if (!child) return;

    // Attach material, geometry, fog, etc.
    if (child.attach && parentInstance[child.attach] !== undefined) {
      parentInstance[child.attach] = child;
    } else {
      parentInstance.add(child);
    }
  },
  // These methods remove elements from the scene
  removeChild(parentInstance, child) {
    if (!child) return;

    // Remove material, geometry, fog, etc.
    if (child.attach && parentInstance[child.attach] !== undefined) {
      parentInstance[child.attach] = null;
    } else {
      parentInstance.remove(child);
    }

    // Safely dispose of element
    if (child.type !== "Scene") {
      if (child.dispose) child.dispose();

      // Dispose of its properties as well
      for (const property in child) {
        if (property.dispose) property.dispose();
        delete child[property];
      }
    }
  },
  removeChildFromContainer(parentInstance, child) {
    if (!child) return;

    // Remove material, geometry, fog, etc.
    if (child.attach && parentInstance[child.attach] !== undefined) {
      parentInstance[child.attach] = null;
    } else {
      parentInstance.remove(child);
    }

    // Safely dispose of element
    if (child.type !== "Scene") {
      if (child.dispose) child.dispose();

      // Dispose of its properties as well
      for (const property in child) {
        if (property.dispose) property.dispose();
        delete child[property];
      }
    }
  },
  // We can specify an order for children to be specified here.
  // This is useful if you want to override stuff like materials
  insertBefore(parentInstance, child, beforeChild) {
    if (!child) return;

    child.parent = parentInstance;

    const index = parentInstance.children.indexOf(beforeChild);
    parentInstance.children = [
      ...parentInstance.children.slice(0, index),
      child,
      ...parentInstance.children.slice(index),
    ];

    // Emit an event that tells three.js the element is added
    child.dispatchEvent({ type: "added" });
  },
  // This is where we mutate three.js objects in the render phase
  commitUpdate(instance, updatePayload, type, oldProps, newProps) {
    instance.busy = true;
    applyProps(instance, newProps, oldProps);
    instance.busy = false;
  },
});

/**
 * Internal three.js state.
 */
const context = React.createContext(null);

// We store roots here since we can render to multiple canvases
const roots = new Map();

/**
 * This renders an element to a canvas, creating a renderer, scene, etc.
 */
const render = (element, canvas, { size, camera, ...props } = {}) => {
  console.log("canvas2", canvas);
  let gl = null;
  try {
    gl = canvas.getContext();
  } catch (error) {
    console.log("error", error);
  }
  // If size isn't explicitly defined, we can assume it from the canvas
  if (!size) {
    size = {
      width: canvas.parentElement?.clientWidth || 0,
      height: canvas.parentElement?.clientHeight || 0,
    };
  }

  // Get store and init/update three.js state
  const store = roots.get(canvas);
  let root = store?.root;
  const state = Object.assign(store?.state || {}, { ...props, size });

  // Initiate root
  if (!root) {
    console.log("creating root");
    console.log("canvas", canvas);
    console.log("gl2", gl);
    // Create renderer
    state.gl = new THREE.WebGLRenderer({
      canvas,
      powerPreference: "high-performance",
      antialias: true,
      alpha: true,
      ...gl,
    });
    // state.gl.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    // state.gl.setPixelRatio(1);
    console.log("state.gl", state.gl);
    if (gl) applyProps(state.gl, gl, {});
    console.log("gl2", gl);
    // Set artist-friendly color management defaults
    state.gl.outputEncoding = THREE.sRGBEncoding;
    state.gl.toneMapping = THREE.ACESFilmicToneMapping;

    // Create camera
    state.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    state.camera.position.z = 5;
    if (camera) applyProps(state.camera, camera, {});

    // Look at center by default
    if (!camera?.rotation) state.camera.lookAt(0, 0, 0);

    // Create scene
    state.scene = new THREE.Scene();

    // Create root
    root = reconciler.createContainer(state.scene, 1, false, null);
    console.log("root", root);
    // If an event manager is specified, connect it.
    // This lets us specify different events between platforms
    if (state.events) state.events.connect(canvas, state);

    // Keep track of elements subscribed to the render loop with useFrame
    state.subscribed = [];
    state.subscribe = (ref) => {
      if (state.subscribed.includes(ref)) {
        state.subscribed = state.subscribed.filter(
          (callback) => callback !== ref
        );
      } else {
        state.subscribed.push(ref);
      }
    };

    // Start our render loop (we use this instead of RaF for WebXR support)
    // Animation loop
    console.log("stateaaaaa", state);
    const animate = () => {
      requestAnimationFrame(animate);
      // Render the scene from the perspective of the camera
      state.gl.render(state.scene, state.camera);
      // Indicate the frame is done
      canvas.getContext().endFrameEXP();
    };
    animate();
  }

  // Handle resize
  state.gl.setSize(size.width, size.height);
  state.camera.aspect = size.width / size.height;
  state.camera.updateProjectionMatrix();

  // Update root
  roots.set(canvas, { root, state });

  // Update fiber and expose three.js state to children
  reconciler.updateContainer(
    <context.Provider value={state}>{element}</context.Provider>,
    root,
    null,
    () => undefined
  );

  return state;
};
/**
 * This is used to remove and clean up internals on unmount.
 */
const unmountComponentAtNode = (canvas) => {
  const store = roots.get(canvas);
  if (!store) return;

  const { root, state } = store;

  reconciler.updateContainer(null, root, null, () => {
    // Disconnect events
    if (state.events) state.events.disconnect(canvas);

    // Clean up renderer
    // state.renderer.setAnimationLoop(null);
    // state.renderer.forceContextLoss();
    // state.renderer.dispose();

    // Delete store
    roots.delete(canvas);
  });
};
/**
 * The react-dom 18 API changes how you create roots, letting you specify
 * a container once and safely render/unmount later, so we mirror that.
 */
export const createRoot = (canvas) => ({
  render: (element) => render(element, canvas),
  unmount: () => unmountComponentAtNode(canvas),
});
