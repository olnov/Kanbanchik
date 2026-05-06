# Kanban Board Prototype Specification

## Project Overview

Build a Trello-like Kanban Board prototype.

The application should support: - visual drag-and-drop movement of cards
between workflow stages; - configurable workflow stages per project; -
multiple projects; - multiple users; - teams; - AI-assisted project
specification import; - AI-generated backlog cards; - AI-assisted
assignment and planning.

## Tech Stack

Frontend: - Next.js - React - TypeScript - CSS Modules or plain CSS (no
Tailwind)

Desktop: - Electron

Backend: - NestJS - PostgreSQL

Principles: - KISS, DRY, SOLID - readability over cleverness

------------------------------------------------------------------------

## Core Features

### Kanban Board

-   Drag & drop cards between stages
-   Reorder cards
-   Configurable stages per project

### Projects

-   Multiple projects
-   Each project has stages and team

### Teams & Users

-   Users belong to teams
-   Teams linked to projects
-   Users have competencies and availability

### Cards

Fields: - Summary - Description - Assignee - Type - Priority - Project

System: - id, stageId, order, timestamps, dueDate

------------------------------------------------------------------------

## AI Features

### AI Import Flow

1.  User uploads spec
2.  Backend sends to AI
3.  AI returns structured cards
4.  User reviews
5.  Confirm → create cards

### AI Assignment

-   Based on skills, role, workload

### AI Planning

-   Extract deadlines
-   Assign due dates and priority

------------------------------------------------------------------------

## Data Model

### User

-   id
-   name
-   email
-   role
-   competencies\[\]
-   availability

### Team

-   id
-   name

### Project

-   id
-   name
-   teamId

### Stage

-   id
-   projectId
-   name
-   order

### Card

-   id
-   projectId
-   stageId
-   assigneeId
-   summary
-   description
-   type
-   priority
-   order
-   dueDate

------------------------------------------------------------------------

## API

Projects: - GET /projects - POST /projects

Board: - GET /projects/:id/board

Cards: - POST /cards - PATCH /cards/:id - POST /cards/:id/move

AI: - POST /ai/import - POST /ai/confirm

------------------------------------------------------------------------

## Frontend Pages

-   /projects
-   /projects/\[id\]/board
-   /teams

------------------------------------------------------------------------

## Electron

-   Wrap Next.js app
-   Load dev server in dev mode

------------------------------------------------------------------------

## Backend Modules

-   Users
-   Teams
-   Projects
-   Stages
-   Cards
-   AI

------------------------------------------------------------------------

## AI Interface

``` ts
interface AiProvider {
  generateCards(input: string): Promise<any[]>;
}
```

------------------------------------------------------------------------

## MVP Order

1.  DB
2.  Backend
3.  Board UI
4.  Drag & drop
5.  AI mock
6.  AI real
7.  Electron

------------------------------------------------------------------------

## Non-goals

-   real-time sync
-   comments
-   attachments
-   permissions
