Job Portal - Full Project (Frontend + Backend)

What you get:
- Frontend: HTML + CSS + Bootstrap (open index.html)
- Backend: Node.js + Express + MongoDB (Mongoose)
- Auth: Register / Login (JWT)
- Apply: Upload PDF resume (Multer) stored in backend/uploads and path saved to MongoDB
- View: Resumes can be opened in a new browser tab via /uploads/<filename>
- Delete: Users can delete their own applications
- Seed: 15 sample jobs are created automatically when backend starts (if DB empty)

Quick start (backend):
1. Install Node.js (v18+)
2. Open a terminal, go to backend folder
   cd backend
3. Copy .env.example to .env and set MONGO_URI if needed (default is local mongodb)
4. npm install
5. npm run dev
   (This starts the backend on port 5000, seeds sample jobs if needed)

Frontend:
- Open frontend/index.html in your browser. It talks to backend at http://localhost:5000
- Register a user, login, then apply to jobs (upload PDF). View and delete applications in My Applications.

Notes:
- Resumes are stored in backend/uploads. For production use S3 or similar.
- The view link is public (served statically). Filenames are randomized so guessing is hard, but not fully private.
