# Muvlet

Muvlet is a fitness companion that helps beginners feel confident in the gym. It combines personalized workout planning, progress tracking, nutrition support, and friendly AI guidance in a simple, encouraging mobile experience.

## Team

| Student | Student ID |
| --- | --- |
| Arun Sabaratnam | 300297854|
| Seif Al Qutob | 300321304 |
| Mena Girgis | To be added |


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

### Anticipated architecture

- **Mobile application:** React Native for iOS and Android.
- **Backend services:** Python with FastAPI.
- **Future capability:** Computer-vision services for supported form-analysis workflows.

### First-release plan

1. Agree on the core feature set.
2. Design the user interface around those features.
3. Build a mock frontend.
4. Gather stakeholder feedback.
5. Iterate based on feedback.

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

## Documentation

- [Meeting notes](docs/meeting-notes.md) — team discussions and decisions from September 21, 23, and 28, 2026.
