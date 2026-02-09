# LoveStory backend

Node + Express + **Prisma** + PostgreSQL. You define the data model in one file (`prisma/schema.prisma`); Prisma generates the DB tables and the client—**no SQL required**.

## You don’t need to know SQL

- **Data model** → Edit `prisma/schema.prisma` (tables and relations).
- **Create/update tables** → `npm run db:push` (or `npm run db:migrate` for versioned migrations).
- **Query or insert data** → Use `prisma.memory.create()`, `prisma.journal.findFirst()`, etc. in TypeScript. Prisma turns that into SQL for you.
- **Inspect data** → `npm run db:studio` opens a simple UI in the browser.

## Quick start

### 1. Get a PostgreSQL database

Use any Postgres host. Free options:

- [Neon](https://neon.tech) – sign up, create a project, copy the connection string.
- [Supabase](https://supabase.com) – create a project → Settings → Database → connection string (URI).
- [Railway](https://railway.app) – new project → PostgreSQL → connect → copy `DATABASE_URL`.

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
PORT=3001
```

### 3. Install and set up the database

```bash
npm install
npm run db:generate   # generate Prisma client
npm run db:push       # create tables in your Postgres DB (no SQL)
npm run db:seed       # insert demo data (Carla & Edgardo, memories, etc.)
```

### 4. Run the API

```bash
npm run dev
```

API base: **http://localhost:3001**

- `GET /api/health` – health check
- `GET /api/journal` – full journal (memories, milestones, cute texts, chat stats)
- `GET /api/memories` – list memories
- `POST /api/memories` – create memory (body: `title`, `date`, `image`, `type`, `description`)
- `PATCH /api/memories/:id` – update a memory
- `DELETE /api/memories/:id` – delete a memory

## Changing the data model

1. Edit `prisma/schema.prisma` (add a field, add a model, etc.).
2. Run `npm run db:push` again. Prisma will alter the database to match.
3. Use the new fields in `src/` via `prisma.yourModel.create()` or `findMany()`, etc.

No SQL to write; Prisma handles it.

## Optional: Prisma Studio

```bash
npm run db:studio
```

Opens a UI at http://localhost:5555 where you can view and edit rows in the database.

## Auth (later)

Right now the API assumes a single journal (the first one in the DB). To add real auth later:

- Add sessions or JWT; resolve the current user from the request.
- Use `journal.userId === currentUser.id` (or a similar relation) so each user only sees their own journal.

The schema already has `User` and `Journal`; you’d just wire them to your auth middleware.
