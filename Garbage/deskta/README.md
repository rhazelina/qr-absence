# QR Absence Desktop Client (`deskta`)

A dedicated desktop-oriented version of the QR Attendance System, built with **React**, **TypeScript**, and **Vite**. This version is specifically optimized for fixed-station use in classrooms or administrative offices.

## 🛠 Tech Stack
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (CSS-first approach)
- **UI Components**: Framer Motion for smooth transitions, Lucide React for consistent iconography.

## 🚀 Key Differences from Web
- **Fixed Workflow**: Optimized for high-frequency scanning at classroom entry points.
- **Port Isolation**: Runs on port **5174** to avoid conflicts with the standard web portal (5173).
- **TypeScript Core**: Strict type-checking for critical data operations.

## ⚙️ Setup

### Prerequisites
- Node.js (v20+)
- Bun (recommended for performance)

### Installation
1.  **Direct Setup**:
    ```bash
    cd deskta
    ./setup.sh
    ```
2.  **Part of Ecosystem**:
    Run the root `./setup-all.sh` to configure environment variables and install dependencies for all platforms.

### Running Development
```bash
bun run dev
```
Access at `http://localhost:5174`.

## 📦 Distribution
This project is prepared for packaging into a native executable using Electron or Tauri.

- Build: `bun run build`
- Preview: `bun run preview`

## 📁 Structure
- `src/services`: TypeScript-typed API services.
- `src/component`: UI building blocks.
- `src/Pages`: Role-specific views.
- `src/utils`: Type-safe constants and helpers.