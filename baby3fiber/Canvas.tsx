import { ExpoWebGLRenderingContext, GLView } from "expo-gl";
import React, { useRef } from "react";
import { View } from "react-native";
import { createRoot } from "./index";
type Props = {
  children: React.ReactNode;
};
export default function Canvas({ children }: Props) {
  const rootRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);

  console.log("canvas");
  const onContextCreate = async (context: ExpoWebGLRenderingContext) => {
    console.log("onContextCreate", context);
    const listeners = new Map<string, EventListener[]>();

    const canvas = {
      style: {},
      width: context.drawingBufferWidth,
      height: context.drawingBufferHeight,
      clientWidth: context.drawingBufferWidth,
      clientHeight: context.drawingBufferHeight,
      getContext: () => {
        // setAntialias(antialias)
        // console.log("context", context);
        return context;
        return null;
      },
      addEventListener(type: string, listener: EventListener) {
        let callbacks = listeners.get(type);
        if (!callbacks) {
          callbacks = [];
          listeners.set(type, callbacks);
        }

        callbacks.push(listener);
      },
      removeEventListener(type: string, listener: EventListener) {
        const callbacks = listeners.get(type);
        if (callbacks) {
          const index = callbacks.indexOf(listener);
          if (index !== -1) callbacks.splice(index, 1);
        }
      },
      dispatchEvent(event: Event) {
        Object.assign(event, { target: this });

        const callbacks = listeners.get(event.type);
        if (callbacks) {
          for (const callback of callbacks) {
            callback(event);
          }
        }
      },
      setPointerCapture() {
        // TODO
      },
      releasePointerCapture() {
        // TODO
      },
    } as unknown as HTMLCanvasElement;
    canvasRef.current = canvas;
    // TODO: this is wrong but necessary to trick controls
    // @ts-ignore
    canvas.ownerDocument = canvas;
    canvas.parentElement = canvas;
    canvas.getRootNode = () => canvas;
    rootRef.current = createRoot(canvas);

    rootRef.current.render(children, canvas);
    console.log("rootref", rootRef);
  };

  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: "red" }}>
      <GLView
        msaaSamples={4}
        style={{ flex: 1, borderWidth: 1, borderColor: "blue" }}
        onContextCreate={onContextCreate}
      />
    </View>
  );
}
