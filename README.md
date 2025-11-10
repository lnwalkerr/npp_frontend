# Frontend - Next.js Admin Panel

This is the frontend part of the application built with Next.js.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file with your backend API URL:
```bash
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. Run the development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Structure

- `app/` - Next.js App Router pages
- `components/` - Reusable React components
- `public/` - Static assets
- `styles/` - CSS styles