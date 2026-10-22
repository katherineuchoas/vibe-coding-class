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

The page reads only the Supabase project configured for this app; visitors cannot enter a URL or key. Set the project URL and public publishable (or legacy anon) key in `supabase-config.js`. Never use a secret or service_role key.

Follow Lesson 2 to connect the AI tool to Supabase through its connector, create the tables from the project plan, and confirm they exist. Run the example migration in `supabase/migrations/` using the Supabase SQL Editor. Login and RLS are left for the lessons that cover those topics.


## Contribution flow

Create a focused branch, use an English Conventional Commit message, and open a pull request for review before merging into `main`.
