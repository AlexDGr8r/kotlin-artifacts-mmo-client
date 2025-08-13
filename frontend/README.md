Artifacts MMO Frontend

Quick start

1. Ensure the backend is running on http://localhost:8080
   - In the project root, run the Spring Boot app (ArtifactsMmoClientApplication)
2. Start the frontend dev server:
   - Open a terminal in the `frontend` directory
   - Run: `npm install`
   - Run: `npm run dev`
3. Open the URL printed by Vite (default: http://localhost:5173)

Notes
- Dev server proxies API calls matching `/character/**` to http://localhost:8080, so no extra CORS config is needed during development.
- The UI has a responsive, dark theme inspired by Artifacts MMO. It stacks panels on small screens and uses a two-column layout on larger screens.
- UI allows you to:
  - Load a character by name (GET /character/{name})
  - Refresh from the external API (GET /character/{name}/refresh) then reload from DB
  - Fight (GET /character/{name}/fight) and Rest (GET /character/{name}/rest)
  - Move with a PUT to /character/{name}/move with a JSON body `{ x, y }`
