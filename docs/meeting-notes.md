# Muvlet Meeting Notes

Source: [Google Drive Meeting Notes](https://docs.google.com/document/d/144tr1v2bEQ0PcaYRaut9ha13b1rA_gSOA-CCcHQZxMw/edit?usp=drivesdk)

## Monday, September 21, 2026

### Client and user research

- Identify one potential user who has not been to the gym and one who has, to diversify early testing.
- Two possible target users were identified.
- Track how a first-time gym user enjoys and interacts with the app.

### Design direction

- The app should have a simple but premium look.
- Components may be sourced or built as needed.
- Gamification should take inspiration from Duolingo.

### Objectives and planned capabilities

- Support a better lifestyle, gym knowledge, correct exercise form, nutrition tracking, personal growth, and personal goals.
- Provide personalized AI responses through a simple, intuitive, interactive UI and UX.
- Include user profiles and onboarding, AI character helpers, personalized workout plans, exercise instruction, camera-based form analysis, workout logging, progress tracking, nutrition support, and an accessible interface.

### Success criteria

- Users can track nutrition and workouts.
- Users receive personalized AI answers and appropriate workout and nutrition guidance.
- Users can sign in reliably and access the app at all times.
- User data is secure.
- The experience is encouraging rather than intimidating, with a clean, uncluttered interface.

### Expected architecture

- React Native for iOS and Android.
- Python with FastAPI.

### Risks and considerations

- AI may produce poor or incorrect responses.
- Scaling to many users requires reliable backend infrastructure.
- The app must perform well across devices.
- Form analysis requires sound computer-vision implementation.
- Protect personal information such as age, weight, and fitness data.
- Authenticate users correctly and show each user only their own information.
- Give general nutrition information, not medical advice; avoid extreme diets and unhealthy calorie restrictions.
- Make workouts suitable for different fitness levels and abilities.

### First-release plan

1. Agree on core features.
2. Design the UI around those features.
3. Create a mock frontend.
4. Get stakeholder feedback.
5. Iterate.

## Wednesday, September 23, 2026

### Planning

- Decide the core features first.
- At the next meeting, each team member will bring an individual UI plan; combine the ideas into a final UI direction.

### Proposed screens and functionality

- **Splash screen:** Entry point to the app.
- **Sign-up/login:** Capture the user's goals and relevant information such as gender and weight.
- **Home screen:** Provide settings, profile, nutrition, workouts, and progress areas.
- **Nutrition:** Meal tracking from a meal photo, macro tracking, meal planning, suggestions, and dietary restrictions.
- **Workouts:** Current workout, rest timer, templates, form animations, workout completion tracking, personalized plans, suggested weights, and workout/weight history.
- **Progress:** A Duolingo-style point system, past results, clean animations, and optional progress photos.

## Monday, September 28, 2026

### Design decisions

- The team presented individual designs and aligned on the main pages.
- **Splash screen:** Must include a clear “Get Started” action.
- **Create account:** Vertical layout with full name, email address, password, Google sign-in, and Apple sign-in.
- **Sign in:** Include “Welcome back” and “Remember me.”
- **Home:** Use a Duolingo-inspired feel based on Arun's direction.
- **Workouts:** Include templates, history, plans, and a current-workout/start-workout flow; templates and history should be easy to access.
- **Food:** Replace the calorie circle with a pie-chart style display, make water optional, and add a separate “What to eat” page.
- **Progress:** Keep the Duolingo-style approach; place metrics in the profile area.

### Next step

- Discuss the architecture at the next meeting.


## Wednesday, September 30, 2026
- Decide on the architecture of the app
- Mobile framework
  - Discussed Flutter
    - Can't use because we want to support android as well and there's no ecosystem for things like cameras, rive.
  - Native (Swift + Kotlin)
    - Good camera performance, and access to new OS feature
    - Would have to build out the app twice with only a team of 3
  - **React Native + Expo**
    - Huge library + support base, works well for iOS and android with one TypeScript codebase. Easier development with expo with native features like with notifications, permission and device testing. 
    - Doesn't support animation well which is a core feature of the app, but can be solved by with other libraries 
  - Web app
    - Not the goal of the app
- Backend
  - **PostgresSQL**
    - Can build on Supabase which has things like login, file storage and per-user acess rules. 
    - Row-level security to keep the database secure
    - Flexible columns
    - Rows are easier to query
    - Open source
    - Doesn't include offline sync
    - Changing structure can be hard
      - Solved by SQLAlchemy and Alembic
  - NoSQL
    - Harder to query groupped data
    - Data is copied in various locations
  - MySQL
    - No database privacy
    - No supabase
    - Weaker for lossely shaped data
  - Custom Server
    - Can't build with 3 people 
  - Firebase
    - Would be harder to leave as we want to scale
    - Wouldn't be able to query specific things better
- AI Coaches
  - Open source model
    - Don't know if its possible
    - Can't guarantee sucess 
  - Make our own LLM
    - Would have to verify accuracy 
    - Don't know if we have the data to train the model
  - Claude API 
    - Costs money
    - Use a lightweight model 
- Form Checking
  - AI checking
    - Costs money
    - Slow
  - On-device pose tracking + rules per exisrcise
    - Free, works real time
    - Every peiece of feedback traces back to a measurement
    - If joints aren't visible it cannot work
  - Train our own model
    - Needs lots of training data that we don't have 
- Meal Photo Estimates
  - AI vision identifies the foods and the portions 
    - Costs money
    - Database need store the macros of the food
- Code Architecture
  - Modern Monolith
    - Easier to scale over time
    - Each feature is owned by a person
  
