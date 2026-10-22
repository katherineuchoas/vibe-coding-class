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

## Supabase setup

1. Run the SQL file in `supabase/migrations/` using the Supabase SQL Editor.
2. Open the page and expand **Conectar ao Supabase**.
3. Enter the project URL and the public publishable key (or legacy anon key). The values stay in that browser only.
4. The page reads the `fases` table. Browser access is read-only; use the Supabase dashboard to edit a phase.

The migration follows the course exercise by deferring RLS. It revokes browser write permissions and grants read access only to the public course phases. Configure and verify RLS before publishing a connected site. Never put a secret or service_role key in the browser or repository.

## Contribution flow

Create a focused branch, use an English Conventional Commit message, and open a pull request for review before merging into `main`.
