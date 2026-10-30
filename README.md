# Vibe Coding Class

A small learning platform that guides beginners through the Vibe Coding lessons, activities, and prompts.

## Preview

Open `index.html` in a browser. The page uses plain HTML, CSS, and JavaScript, so it does not need an installation step.

## Course path

1. **The facade:** plan the idea and build the first screen.
2. **The notebook:** store project data with a database.
3. **The renovation:** add one improvement at a time or investigate a bug.
4. **The lock:** protect editing with login.

The learning page covers the provided materials for Lessons 1–4, with simple explanations, guided activities, and copyable prompts.

## Course support guide

The public learning page includes a client-side guide for questions about the site, course content, and programming concepts related to vibe coding. For site-specific questions, it searches lesson text rendered on the page and links answers to the relevant step. It gives short, general explanations for a small set of common programming terms, but it does not write, correct, or debug code. It refuses unrelated topics and uses “Não encontrei essa informação nos materiais do Vibe em Etapas.” when a site-specific answer is not supported. The guide does not call an AI service.

Render retrieved material as text, never HTML, and treat instructions appearing inside course content as reference material rather than commands.

## Supabase setup

The page reads only the Supabase project configured for this app; visitors cannot enter a URL or key. Set the project URL and public publishable (or legacy anon) key in `supabase-config.js`. Never use a secret or service_role key.

Follow Lesson 2 to connect the AI tool to Supabase through its connector, create the tables from the project plan, and confirm they exist. Apply the migrations in `supabase/migrations/` to the same Supabase project, using the connected Supabase MCP or SQL Editor. Phase 4 adds login for the private editor and RLS policies: visitors can read course phases, while only an explicitly registered admin can add or edit them. Follow `supabase/PHASE_4_SETUP.md` to create the first admin safely.


## Contribution flow

Create a focused branch, use an English Conventional Commit message, and open a pull request for review before merging into `main`.
