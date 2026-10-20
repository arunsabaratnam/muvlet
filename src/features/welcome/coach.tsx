import {
  Fit,
  RiveView,
  useRive,
  useRiveFile,
  useViewModelInstance,
  type RiveFile,
} from '@rive-app/react-native';
import { createContext, use, useEffect, useImperativeHandle, type Ref } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import axel from '@/assets/coaches/axel.riv';
import luna from '@/assets/coaches/luna.riv';
import rex from '@/assets/coaches/rex.riv';
import sage from '@/assets/coaches/sage.riv';

const files = { rex, axel, sage, luna };

export type CoachName = keyof typeof files;

type CoachFileMap = Record<CoachName, RiveFile | null | undefined>;

/** The loaded coach files, shared by every Coach. Provide it with `useLoadCoachFiles()`. */
export const CoachFiles = createContext<CoachFileMap | null>(null);

/** Starts loading all four coach files. Call it once, as early as possible. */
export function useLoadCoachFiles(): CoachFileMap {
  return {
    rex: useRiveFile(files.rex).riveFile,
    axel: useRiveFile(files.axel).riveFile,
    sage: useRiveFile(files.sage).riveFile,
    luna: useRiveFile(files.luna).riveFile,
  };
}

/** `play` fires one of the triggers on the coach's "coach" view model, e.g. "wave" or "hello". */
export type CoachHandle = { play: (move: string) => void };

type CoachProps = {
  name: CoachName;
  ref?: Ref<CoachHandle>;
  /** Called once the coach is on screen, or its view gave up loading. */
  onReady?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** An animated coach from its Rive file. Idles on its own; `ref.play()` triggers a move. */
export function Coach({ name, ref, onReady, style }: CoachProps) {
  const riveFile = use(CoachFiles)?.[name];
  const { instance } = useViewModelInstance(riveFile, { async: true });
  const { riveViewRef, setHybridRef } = useRive();

  useImperativeHandle(ref, () => ({ play: (move) => instance?.triggerProperty(move)?.trigger() }), [
    instance,
  ]);

  // `riveViewRef` is undefined until the view is ready, then the view (or null if it failed).
  useEffect(() => {
    if (riveViewRef !== undefined) onReady?.();
  }, [riveViewRef, onReady]);

  if (!riveFile || !instance) {
    return <View style={style} />;
  }

  return (
    <RiveView
      file={riveFile}
      stateMachineName="coach"
      fit={Fit.Contain}
      dataBind={instance}
      hybridRef={setHybridRef}
      style={style}
    />
  );
}
