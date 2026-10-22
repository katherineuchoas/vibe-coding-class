# Vibe Coding Class

A small learning platform that guides beginners through the Vibe Coding lessons, activities, and prompts.

## Preview

Open `index.html` in a browser. The page uses plain HTML, CSS, and JavaScript, so it does not need an installation step.

## Course path

1. **The facade:** plan the idea and build the first screen.
2. **The notebook:** store project data with a database.
3. **The renovation:** add one improvement at a time or investigate a bug.
4. **The lock:** protect editing with login.

The learning page covers the provided materials for Lessons 1–3. Lesson 4 is shown as the next step from the project plan; its detailed lesson material has not yet been provided.

## Supabase lesson

The learning page does not ask visitors for a Supabase URL or key and does not connect to databases they provide. The Supabase exercise is explained in Lesson 2 so each learner can connect their own project using their chosen AI tool.

The example migration creates the public course phases table. It enables RLS, grants browser roles read-only access, and adds a read policy for this public content. Never put a secret or service_role key in the browser or repository.

## Contribution flow

Create a focused branch, use an English Conventional Commit message, and open a pull request for review before merging into `main`.
