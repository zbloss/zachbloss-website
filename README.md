# Personal Portfolio Website

This is a modern, responsive personal portfolio website built with Next.js, React, TypeScript, and Tailwind CSS. It showcases projects, certifications, and professional information in an elegant and user-friendly interface.

## Technologies Used

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)

## Features

- Responsive design with mobile-first approach
- Server-side rendering for optimal performance
- Dynamic project and certification showcase
- Optimized images and lazy loading
- SEO-friendly with dynamic metadata generation
- Automated build and deployment workflow

## Project Structure

- `app/`: Next.js app directory containing pages and components
- `public/`: Static assets and data files
- `components/`: Reusable React components
- `.github/workflows/`: GitHub Actions for CI/CD

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file and add necessary environment variables
4. Run the development server:
   ```
   npm run dev
   ```

## Building and Deployment

The project uses GitHub Actions for automated build and deployment. The workflow is defined in `.github/workflows/build_and_deploy.yaml`.

To manually build the project:
