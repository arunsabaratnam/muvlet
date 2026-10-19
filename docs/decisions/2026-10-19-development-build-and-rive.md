# Use a development build instead of Expo Go, so the coaches can animate with Rive

**Date:** October 19, 2026
**Decided by:** Arun

## Decision

We stop testing in Expo Go and use a Muvlet development build on iPhone and Android. The coaches are animated with Rive (`@rive-app/react-native`), starting with the splash screen.

## Why

- The design uses animated Rive coaches (design spec, section 3). Rive needs native code, and Expo Go can only run the native code it ships with.
- A development build is the real Muvlet app with a developer menu. It runs on both iPhone and Android, and it is how the app will run in the App Store and Play Store anyway.
- The camera form check will most likely need a development build too, so switching now, while the app is still a template, is the cheapest time.
- The team already has an Apple Developer account, which iPhone builds need.

## What changes for the team

- Install the Muvlet development build once instead of Expo Go (see the README). Daily work stays the same: `npx expo start`, scan, and changes reload live.
- Each iPhone is registered once (`npx eas-cli@latest device:create`) before an iOS build.
- When someone adds a library with native code, whoever has access to the Expo account makes a new build and everyone installs it. A phone with an older build will crash on open until it updates.
- A classmate or prof can't just scan with Expo Go; they need the build installed.

## Alternatives we didn't pick

- **Rive inside a web view:** keeps Expo Go, but loads more slowly and is clunkier to control.
- **Still pictures:** keeps Expo Go, but the coaches can't wave or talk.

This can be undone: removing Rive and any other native libraries makes Expo Go work again.
