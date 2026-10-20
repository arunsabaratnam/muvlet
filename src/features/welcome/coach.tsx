import { Fit, RiveView, useRiveFile, useViewModelInstance } from '@rive-app/react-native';
import { useImperativeHandle, type Ref } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import axel from '@/assets/coaches/axel.riv';
import luna from '@/assets/coaches/luna.riv';
import rex from '@/assets/coaches/rex.riv';
import sage from '@/assets/coaches/sage.riv';

const files = { rex, axel, sage, luna };

export type CoachName = keyof typeof files;

/** `play` fires one of the triggers on the coach's "coach" view model, e.g. "wave" or "hello". */
export type CoachHandle = { play: (move: string) => void };

type CoachProps = {
  name: CoachName;
  ref?: Ref<CoachHandle>;
  style?: StyleProp<ViewStyle>;
};

/** An animated coach from its Rive file. Idles on its own; `ref.play()` triggers a move. */
export function Coach({ name, ref, style }: CoachProps) {
  const { riveFile } = useRiveFile(files[name]);
  const { instance } = useViewModelInstance(riveFile, { async: true });

  useImperativeHandle(ref, () => ({ play: (move) => instance?.triggerProperty(move)?.trigger() }), [
    instance,
  ]);

  if (!riveFile || !instance) {
    return <View style={style} />;
  }

  return (
    <RiveView
      file={riveFile}
      stateMachineName="coach"
      fit={Fit.Contain}
      dataBind={instance}
      style={style}
    />
  );
}
