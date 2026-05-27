# FreshLane Marketplace

A multi-platform food delivery and grocery marketplace.

## Project Structure

- **`Backend/`**: Supabase database migrations, configuration, and seed data.
- **`Web-site/`**: React + Vite + TypeScript web application for customers, sellers, drivers, and admins.
- **`mobile-app/`**: Expo React Native application for mobile users.

## Environment Requirements

We maintain two requirement files for different operating systems:
- `requirements-windows.txt`
- `requirements-linux.txt`

These files are ignored by Git by default to prevent environment-specific noise.

### Pushing Requirement Files

To share the requirements for the *other* platform from your current environment:

**On Linux (to push Windows requirements):**
```bash
git add -f requirements-windows.txt
git commit -m "docs: update windows requirements"
git push
```

**On Windows (to push Linux requirements):**
```bash
git add -f requirements-linux.txt
git commit -m "docs: update linux requirements"
git push
```

By following this pattern, the repository will contain the necessary information for team members on different operating systems without cluttering your local environment.

## Setup

1. **Backend**: Navigate to `Backend/` and use the Supabase CLI to start or migrate the database.
2. **Web**: Navigate to `Web-site/`, run `npm install`, and `npm run dev`.
3. **Mobile**: Navigate to `mobile-app/`, run `npm install`, and `npx expo start`.
