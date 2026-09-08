# Local demo

Restore point: 2409449d23ce9cf95382778f998b739e08819d98 (clean working tree before this demo).
The exact modified and newly added files are listed in demo-checkpoint.json.
No commit, push, database, authentication service or external AI service is created.

Run from this directory: npm run demo
Frontend: http://127.0.0.1:5173
Backend: http://127.0.0.1:3001

PDF uploads and profile, cards, favorites, chat history, quizzes and scores live only in server memory.
Restarting the server resets the session. Upload limit: 10 MB per PDF, 50 MB per session.
AI responses, flashcards and quizzes are explicitly simulated from the built-in machine learning lesson.
Uploaded PDFs are shown in the viewer but their text is not extracted or analyzed. No files leave this local server.
This open server is intended for local demonstration only.

When reverting, stop the demo process, restore only the listed tracked files from the checkpoint,
and remove only the listed demo-created files after checking for subsequent user edits.
Do not use a repository-wide clean or reset; preserve unrelated changes.
