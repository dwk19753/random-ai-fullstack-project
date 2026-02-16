# Simple TypeScript Database Project

A minimal example of a TypeScript program that calls a database using Prisma and SQLite.

## Why TypeScript + Prisma + SQLite?

- **All TypeScript**: Both the code and database interactions are fully typed
- **No Server Setup**: SQLite is file-based, no need for Docker or running a database service
- **Type Safety**: Prisma generates types automatically from your schema
- **Simple**: Minimal configuration, perfect for learning

## How to Run

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npm run prisma:migrate
```

3. Run the program:
```bash
npm run dev
```

## What the Program Does

- Creates a user in the database
- Creates a post associated with that user
- Queries all users with their posts
- Prints the results to the console

## Project Structure

- `src/index.ts` - Main TypeScript file with database operations
- `prisma/schema.prisma` - Database schema definition
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration

## Modifying the Database Schema

1. Edit `prisma/schema.prisma`
2. Run `npm run prisma:migrate` to create a migration
3. The Prisma client types will automatically update

All in TypeScript, no need to switch languages!
