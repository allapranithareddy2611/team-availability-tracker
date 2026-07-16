# Team Availability Tracker

A simple React dashboard for tracking whether team members are currently available or away.

## Features

- Toggle each member's availability on/off
- Search by name
- Filter by All / Available / Unavailable
- Sort alphabetically
- Export the list as a CSV file
- Light / dark mode
- Add, edit, and delete team members

## Tech Stack

- React (Vite)
- JavaScript (JSX)
- CSS
- Browser `localStorage` for saving data (no backend required)

## Running Locally

```bash
npm install
npm run dev
```

Then open the local URL printed in the terminal (usually `http://localhost:5173`).

## Notes

Data is saved in the browser's `localStorage`, so it persists across refreshes but is local to each browser — it does not sync across different devices or browsers.
