# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Frontend (React + Vite)
- **Start development server**: `npm run dev` (runs on port 5173)
- **Build for production**: `npm run build`
- **Lint code**: `npm run lint`
- **Preview production build**: `npm run preview`

### Backend (FastAPI + Python)
- **Start backend server**: `cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000`
- **Install Python dependencies**: `pip install -r backend/requirements.txt`

### Full Stack Development
- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:8000` 
- The frontend automatically detects the backend URL based on the current host

## Architecture Overview

### Project Structure
This is a full-stack teacher utility application with a React frontend and FastAPI backend:

```
app-docente/
├── src/                    # React frontend
│   ├── pages/             # Route components (Subida, Grilla, etc.)
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   └── helpers/           # Utility functions (API client)
├── backend/               # FastAPI backend
│   ├── main.py           # Main FastAPI application
│   └── utils/            # Backend utilities (PDF generation)
└── public/               # Static assets (PWA manifest, icons)
```

### Frontend Architecture
- **Framework**: React 19 with Vite
- **Routing**: React Router DOM with client-side routing
- **Styling**: Tailwind CSS
- **PWA**: Configured with `vite-plugin-pwa` and service workers
- **PDF Handling**: Uses `pdfjs-dist` for PDF preview functionality

### Backend Architecture  
- **Framework**: FastAPI with async support
- **PDF Generation**: ReportLab for creating grids and communication documents
- **File Handling**: Temporary file storage with automatic cleanup (30 min retention)
- **CORS**: Configured for cross-origin requests from frontend

### Key Features
1. **Image Grid Generation**: Upload images to create printable grids with customizable layouts
2. **Communication Documents**: Quick generation of teacher communication templates
3. **PDF Processing**: Full pipeline from image upload to PDF generation and preview
4. **Mobile-Optimized**: PWA with native share API support for mobile devices

### API Endpoints
- `POST /generar-pdf` - Generate image grids from uploaded files
- `POST /generar-comunicado` - Create communication documents from text
- `GET /download/{filename}` - Force download PDFs (bypasses browser viewers)
- `GET /health` - Health check endpoint

### State Management
- Uses React's built-in state and custom hooks
- `useImagenTemporal` hook manages image data in localStorage
- Navigation state passed through React Router's location state

### Development Notes
- Backend serves static files from `/uploads` directory for PDF previews
- Frontend uses dynamic API URL detection for different environments
- PWA configuration includes runtime caching for images and API responses
- File cleanup runs every 5 minutes to remove old generated PDFs