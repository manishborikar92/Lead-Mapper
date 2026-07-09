# GrowEasy CRM CSV Importer — Documentation Index

This directory contains the complete technical design, architecture specifications, and implementation guidelines for the GrowEasy CRM CSV Importer (**Lead-Mapper**).

### Architecture Status: **ARCHITECTURE FROZEN**

---

## Documentation Registry

The system documentation is organized into modular chapters to ensure maintainability, scalability, and ease of review.

### [01-ARCHITECTURE.md](file:///c:/Users/manis/Projects/Lead-Mapper/docs/01-ARCHITECTURE.md)
* **Core Technology Stack**: Explains the Node.js/Express and Next.js setup.
* **Language Selection**: Justification for utilizing TypeScript exclusively.
* **Architectural Style**: Clean Feature-Based Modular Architecture mapping.
* **Component Model**: Server vs. Client component boundaries.

### [02-FOLDER-STRUCTURE.md](file:///c:/Users/manis/Projects/Lead-Mapper/docs/02-FOLDER-STRUCTURE.md)
* **Directory Trees**: Complete repository map.
* **Feature Boundaries**: Outlines modular co-location principles for backend/frontend features.

### [03-API.md](file:///c:/Users/manis/Projects/Lead-Mapper/docs/03-API.md)
* **Endpoint Specifications**: Definitions for healthchecks and batch ingestion routes.
* **Payload Validation**: Strict Zod and JSON schemas.

### [04-AI.md](file:///c:/Users/manis/Projects/Lead-Mapper/docs/04-AI.md)
* **LLM Engine**: Direct Gemini API integration.
* **Prompts**: Isolation of extraction templates.
* **Data Mapping Rules**: Status enums, source validations, dates, and multiple contact rules.

### [05-TESTING.md](file:///c:/Users/manis/Projects/Lead-Mapper/docs/05-TESTING.md)
* **Test Suites**: Unit, integration, and E2E structures.
* **Test Runner**: High speed, zero-config Node.js test runner using `tsx`.

### [06-DEPLOYMENT.md](file:///c:/Users/manis/Projects/Lead-Mapper/docs/06-DEPLOYMENT.md)
* **Free Services**: Vercel Hobby + Render Free Web Service configuration.
* **CORS & Environment Variables**: Security bindings and environment variables.

### [07-CODING-STANDARDS.md](file:///c:/Users/manis/Projects/Lead-Mapper/docs/07-CODING-STANDARDS.md)
* **Style Guide**: Naming, commenting, logging conventions.
* **Git Conventions**: Conventional Commits standard.

### [08-IMPLEMENTATION-PLAN.md](file:///c:/Users/manis/Projects/Lead-Mapper/docs/08-IMPLEMENTATION-PLAN.md)
* **Milestones**: Breakdown of the development sequence and initialization CLI commands.
