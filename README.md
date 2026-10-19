# Muvlet

Muvlet is a fitness companion that helps beginners feel confident in the gym. It combines personalized workout planning, progress tracking, nutrition support, and friendly AI guidance in a simple, encouraging mobile experience.

## Team

| Student | Student ID |
| --- | --- |
| Arun Sabaratnam | 300297854|
| Seif Al Qutob | 300321304 |
| Mena Girgis | 300293273 |


## Main Objectives

- Help users build healthier, sustainable lifestyle habits.
- Give beginners clear workout guidance and help them learn proper exercise form.
- Let users set goals, log workouts, track personal growth, and monitor nutrition.
- Offer personalized AI responses for training, nutrition, and recovery questions.
- Provide an intuitive, accessible interface that encourages users instead of intimidating them.

## Benefits to Customers

- Build confidence in the gym through clear workout guidance and form education.
- Keep workouts, nutrition, and personal progress in one place.
- Receive goal-oriented support that adapts to the user's experience and needs.
- Start with an approachable, motivating experience rather than an overwhelming fitness app.

## Project Outline

### Planned user experience

1. **Onboarding and account access**: Users create an account, describe their goals, and provide relevant profile information.
2. **Home dashboard**: A motivating, gamified home screen surfaces the user's current workout, nutrition, and progress.
3. **Workouts**: Users can browse workout plans and templates, start a workout, use a rest timer, view form demonstrations, and log sets, repetitions, and weights.
4. **Nutrition**: Users can journal meals, review calorie and macronutrient information, account for dietary restrictions, and receive meal suggestions.
5. **Progress**: Users can review workout and weight history, see improvements over time, and earn progress points.

### Key things to accomplish

- User profiles and onboarding
- AI character helpers
- Personalized workout plans and exercise instruction
- Camera-based form analysis for supported exercises
- Workout logging and progress tracking
- Nutrition support
- A simple, accessible interface

## Criteria for Success

- Users can reliably create an account, sign in, and access their information.
- Users can log workouts and nutrition, then review their progress over time.
- AI assistance gives helpful, personalized answers within its supported scope.
- The interface is clean, accessible, and encouraging for new gym users.
- User information is protected appropriately.

## Anticipated Risks

| Risk | Why it matters | Initial mitigation |
| --- | --- | --- |
| AI accuracy | Incorrect responses could mislead users. | Clearly scope AI guidance, provide safe fallbacks, and test responses before release. |
| Backend scaling | More users increase load on services and data storage. | Design APIs and infrastructure to scale gradually; monitor performance. |
| App performance | Slow or unreliable experiences discourage users. | Test on supported devices and keep early-release features focused. |
| Form analysis | Reliable feedback requires robust computer-vision implementation. | Limit analysis to supported exercises and indicate when a recording cannot be assessed reliably. |

## Legal and Social Issues

- **Privacy and authentication:** Protect personal fitness data and ensure users can access only their own information.
- **Nutrition guidance:** Provide general educational information, not medical advice, and avoid promoting extreme diets or unhealthy restrictions.
- **Inclusivity:** Support people with different fitness levels and abilities through adaptable workouts and accessible guidance.

## Run the app on your phone

Muvlet runs in its own **development build**, not Expo Go. You need [Node.js 22](https://nodejs.org/) on your computer and the Muvlet development build on your phone.

### Install the development build (once per phone)

- **iPhone:** ask for a registration link, open it on your iPhone and follow the steps. Then install from the build link you're sent.
- **Android:** open the build link you're sent on your phone and install the app.

Install the new build whenever one is shared (only needed when a library with native code is added).

### Start the app

```sh
npm install
npx expo start
```

Open the Muvlet app on your phone and scan the QR code in the terminal. Your phone and computer must be on the same Wi-Fi. If that doesn't work (for example on campus Wi-Fi), run `npx expo start --tunnel` instead.

### Making a new build

This needs access to the project's Expo account.

```sh
npx eas-cli@latest device:create   # makes an iPhone registration link
npx eas-cli@latest build --profile development --platform all
```

The first build asks you to log in to Expo and set the app's iOS and Android IDs. Share the install links with the team.

Other scripts:

| Command | What it does |
| --- | --- |
| `npm test` | Run the tests (Jest) |
| `npm run lint` | Lint with ESLint (`expo lint`) |
| `npm run typecheck` | Type-check with TypeScript |

## Project structure

- `src/app/` holds routes only (Expo Router). Each file is a one-line re-export of a feature screen.
- `src/features/<area>/` holds the code for each feature (`today`, `workouts`, `form-check`, `nutrition`, `progress`).
- `src/components/ui/` holds shared UI (`Button`, `Card`). Colours, fonts, spacing and radii live in `src/constants/theme.ts`.

## Contributing

1. Open an issue for the work (use the bug or feature template).
2. Create a branch and open a pull request. Never push to `main`.
3. The **PR title** must follow [Conventional Commits](https://www.conventionalcommits.org/): `type: summary`, where `type` is `feat`, `fix`, `chore`, `docs`, `refactor` or `test`. Example: `feat: add rest timer`.
4. The **PR description** must link the issue with `Closes #N`. `docs:` PRs don't need an issue.
5. Two checks must pass: `ci` (typecheck, lint, tests) and `pr-title`. `ci` is skipped for PRs that only change `docs/`. No approvals are required.
6. PRs are **squash merged only**, so the PR title becomes the single commit on `main`.

Meeting notes go in `docs/meetings/YYYY-MM-DD.md`, one file per meeting. Copy `docs/meetings/TEMPLATE.md` to start one.

## Documentation

- [Meeting notes](docs/meetings/): team discussions and decisions, one file per meeting.
- [Decisions](docs/decisions/): what we decided and why, one file per decision.
