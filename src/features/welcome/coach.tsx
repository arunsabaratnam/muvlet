import { Fit, RiveView, useRive, useRiveFile } from '@rive-app/react-native';
import { useImperativeHandle, type Ref } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import axel from '@/assets/coaches/axel.riv';
import luna from '@/assets/coaches/luna.riv';
import rex from '@/assets/coaches/rex.riv';
import sage from '@/assets/coaches/sage.riv';

const files = { rex, axel, sage, luna };

export type CoachName = keyof typeof files;

/** `play` fires one of the trigger inputs on the coach's "coach" state machine, e.g. "wave" or "hello". */
export type CoachHandle = { play: (move: string) => void };

type CoachProps = {
  name: CoachName;
  ref?: Ref<CoachHandle>;
  style?: StyleProp<ViewStyle>;
};

/** An animated coach from its Rive file. Idles on its own; `ref.play()` triggers a move. */
export function Coach({ name, ref, style }: CoachProps) {
  const { riveFile } = useRiveFile(files[name]);
  const { riveRef, setHybridRef } = useRive();

  useImperativeHandle(ref, () => ({ play: (move) => riveRef.current?.triggerInput(move) }), [
    riveRef,
  ]);

  if (!riveFile) {
    return <View style={style} />;
  }

  return (
    <RiveView
      file={riveFile}
      stateMachineName="coach"
      fit={Fit.Contain}
      hybridRef={setHybridRef}
      style={style}
    />
  );
}
