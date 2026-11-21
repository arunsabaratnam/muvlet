# Meal photo tracking

## Scope

This branch integrates Mena's standalone Meal_photo prototype into Muvlet's **Food** tab. It keeps the team's Expo SDK 57, Expo Router, TypeScript, shared buttons/cards, fonts and light theme.

Implemented:

- Take a photo or select one from the image library.
- Send the photo to a local Python server for multiple-food suggestions.
- Display numbered detection regions; group repeated regions for the same food.
- Correct names, add missed foods, and remove incorrect suggestions.
- Select one of 45 USDA nutrition profiles or enter label values per 100 g.
- Enter edible weight in grams or choose an indicative USDA reference portion.
- Review compact food rows and save the whole meal once; no per-food checkboxes.
- Calculate estimated calories, protein, carbohydrates and fat.
- Save up to 100 meals locally and refresh the Food history on return.
- Add meals manually without running the recognition server.

The app does **not** measure weight from photos. Model scores are not guarantees of correctness. Hidden ingredients, oils and sauces may be missed. Add these separately only when they are not already included in the selected preparation.

## Phone setup

The main Muvlet app uses Rive and a **development build**, not Expo Go. Adding image-picker and AsyncStorage requires a **new development build**; an older installed build will not include these native modules.

From the repository root, with Node.js 22 or newer:

```sh
npm ci
npx eas-cli@latest build --profile development --platform ios
# Or use --platform android.
npx expo start --dev-client
```

Building requires the team's Expo/EAS access and iPhone registration. Install the new build on the phone before opening the JavaScript bundle. No cloud build was submitted as part of preparing this branch.

`app.config.ts` enables local HTTP only for the EAS `development` profile, or when `MUVLET_LOCAL_RECOGNITION=1` is explicitly set for a local native build. The development exception enables Android cleartext and iOS ATS/local-network access for the prototype's changing private IP address. Production builds keep these exceptions disabled. An authenticated HTTPS service and a production endpoint configuration are future work.

## Recognition server (Windows)

Install Python 3.11, then run these commands from the repository root:

```bat
py -3.11 -m venv services\meal-recognition\.venv
services\meal-recognition\.venv\Scripts\python -m pip install -r services\meal-recognition\requirements.txt
services\meal-recognition\.venv\Scripts\python services\meal-recognition\server.py
```

The first start downloads the Grounding DINO tiny model and can take several minutes. Keep the server window open. It prints `SERVEUR PRÊT`, a pairing code, and a probable local address. Use `ipconfig` to verify the current Wi-Fi IPv4 address if needed.

For macOS/Linux, create the same environment with `python3.11 -m venv services/meal-recognition/.venv`, then use `services/meal-recognition/.venv/bin/python` for the install and server commands above.

1. Connect phone and computer to the same trusted personal network or hotspot.
2. Open **Food → Scan meal**. The system camera opens; after canceling, you can choose an image from the library.
3. Open **Setup** and enter the server address, e.g. `http://192.168.1.10:8765`, and the current pairing code. Tap **Done**.
4. Tap **Analyze foods**, then review every suggestion.
5. Tap a suggested food, select its preparation, enter grams or choose a reference portion, then save changes. Tap **Save meal** when all foods are ready.
6. Return to Food to see the saved meal.

The example IP is a placeholder. Pairing codes change when the server restarts. Allow local-network access when iOS asks and, if Windows prompts, allow Python on your trusted private network. Do not expose port 8765 publicly. An Expo tunnel only transports the app bundle; it does not make this Python server reachable.

## Architecture

| Location | Responsibility |
| --- | --- |
| `src/app/(tabs)/food.tsx` | Existing Food tab route |
| `src/app/meal-photo.tsx` | Meal entry route |
| `src/features/nutrition/food-screen.tsx` | Entry buttons and saved meal history |
| `src/features/nutrition/meal-photo-screen.tsx` | Camera/library, recognition, editing and save flow |
| `src/features/nutrition/food-editor.tsx` | Search-first modal and separate quantity stage with cancelable draft edits |
| `src/features/nutrition/food-nutrition.tsx` | Quantity, reference portions and custom label input |
| `src/features/nutrition/nutrition.ts` | Validated quantities, nutrient calculations and saved snapshots |
| `src/features/nutrition/recognition.ts` | API validation, local address validation and grouping |
| `src/features/nutrition/storage.ts` | Validated local history storage |
| `src/features/nutrition/data/foods.json` | USDA values, original descriptions and reference portions |
| `services/meal-recognition/` | Python detector, HTTP server and unit tests |

### API

`GET /health` returns readiness, model ID and `apiVersion: 2`.

`POST /recognize` accepts JSON `{ "image": "<base64 image>" }` with the header `X-Muvlet-Token: <pairing code>`. It returns `apiVersion`, `imageWidth`, `imageHeight` and `detections`. Each detection contains a label, model score and normalized `[left, top, right, bottom]` box. It returns no grams or nutrients.

The client waits at most 180 seconds and supports cancellation. Cancellation stops the client waiting; a CPU inference already running on the server may continue. Requests above 12 MiB are rejected. The client rejects base64 images above 11 MiB before sending.

### Recognition coverage

The detector now prompts for 125 candidate food labels, grouped in `detection.py`:
proteins, grains/starches, vegetables/legumes, fruit, dairy/nuts, prepared foods and desserts.
Examples include falafel, hummus, shawarma, dumplings, sushi, lentils and mango.
This is expanded prompt coverage, **not a measured accuracy claim**. Dish labels
cannot establish a recipe or hidden ingredients.

Captions are packed using the model tokenizer and its configured text limit,
then processed sequentially. Results are merged before overlapping detections
are suppressed. Multiple passes can increase CPU latency and may exceed the
existing 180-second client timeout on slower laptops. Benchmark representative
meal photos on the target laptop before release; do not infer accuracy from
unit tests. The expanded vocabulary has not yet been evaluated on real photos.

Recognition labels and nutrition profiles are separate: the nutrition catalog
still has 45 USDA profiles. A newly recognized dish may require custom nutrition
values or a suitable profile selected by the user; no nutrition data is invented.

### Nutrition data

Source: [USDA FoodData Central SR Legacy, April 2018](https://fdc.nal.usda.gov/download-datasets/). The catalog retains the official archive URL and SHA-256, USDA food IDs, source links and original English descriptions. French labels from the standalone prototype remain as search aliases; the integrated interface uses short English food/preparation labels. Full USDA descriptions remain in nutrition details and saved provenance.

For each nutrient:

```text
meal contribution = value per 100 g × edible grams / 100
```

Calories come from the USDA energy value, not a reconstructed 4/4/9 formula. Intermediate calculations are not rounded. Display rounds energy to whole kcal and macros to one decimal. Missing profiles or quantities produce an incomplete subtotal, not zero. Custom labels require all four per-100-g values. Reference portions preserve their provenance in saved entries.

### Data and privacy

- Photos stay in memory during the flow and are sent only after tapping Analyze.
- The server processes images in memory and does not save request photos or log requests.
- The model is downloaded from Hugging Face at setup; inference runs on the computer.
- Pairing codes stay in screen state and are not persisted.
- The last server address and meal history use AsyncStorage. History contains reviewed food names, grams, nutrition and source snapshots, not photos.
- This is local device storage, not encrypted account storage or cloud synchronization.
- Muvlet uses its own history key, `muvlet.meal-photo.history.v1`. History from the separate Expo Go prototype is not automatically migrated.

## Validation and remaining work

Run the repository checks:

```sh
npm run typecheck
npm run lint
npm test -- --runInBand
python -m unittest discover -s services/meal-recognition -v
```

Python protocol tests use a fake predictor and Pillow, so they do not require downloading the model. Detector postprocessing is tested separately. The earlier standalone prototype was exercised with the real model; recognition remained imperfect. That does not replace testing this integrated app on a physical phone.

Before merging/releasing, test on the new iPhone and Android development builds:

- Camera permission allowed/denied, library selection and cancellation.
- Correct code, wrong code, unreachable server, timeout/cancellation and no detections.
- Raw vs cooked profile selection, invalid quantities, manual additions and reference portions.
- Canceling an edit preserves the previous values; partial meals cannot be saved.
- Scan opens the system camera; manual entry opens search without camera or connection setup.
- Check keyboard dismissal, modal back, small-screen layout and system back gestures.
- Saved history after leaving and reopening the app.
- Local HTTP access on the intended Wi-Fi/hotspot.

Not implemented: automatic portion measurement, reliable recipe/hidden-ingredient recognition, a hosted recognition service, account synchronization, saved photo history, meal planning, dietary restrictions or daily macro goals. Existing Today dashboard numbers are not connected to this local meal history.

## November 2026 usability update

- Food opens with a quiet empty state, a primary Scan meal action and a text link for manual entry.
- Photo entry launches the existing native camera. It does not add a custom camera/viewfinder dependency.
- Manual entry opens food search directly. Picking a food opens quantity editing as a separate step.
- Short preparation-specific display labels leave the original USDA descriptions and nutrition unchanged.
- A modal-local draft prevents canceled edits from changing the meal. Reference portions remain optional.
- Review uses compact editable rows and a fixed nutrition/save footer. Save is the single final confirmation.
- Missing profiles and quantities remain visibly incomplete and block saving. No weights are inferred.
- Connection instructions live under Setup and are also opened when required credentials are missing.
- Recognition vocabulary expands from 30 to 125 candidate labels; real-photo accuracy and CPU timing
  remain unvalidated for the expanded set. The nutrition catalog still contains 45 profiles.

The original design board is a proposal, not a screenshot of a device build. Browser preview tooling
was blocked in the editing environment; physical device layout/gesture checks are still required.
