# Student Attendance Tracker

A React application for tracking student attendance with Firebase integration.

## Features

- Track attendance for multiple subjects
- View attendance statistics and forecasts
- Mark holidays and manage your schedule
- Responsive design for mobile and desktop
- User authentication with Firebase
- Real-time data synchronization

## Live Demo

The application is deployed at: [https://admirable-cassata-108b81.netlify.app/](https://admirable-cassata-108b81.netlify.app/)

## Tech Stack

- React with TypeScript
- Firebase Authentication and Firestore
- Tailwind CSS for styling
- date-fns for date manipulation
- Lucide React for icons
- Vite for build tooling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/student-attendance-tracker.git
cd student-attendance-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project and update the configuration in `src/firebase/config.ts`

4. Start the development server:
```bash
npm run dev
```

## Deployment

This project is set up for continuous deployment to Netlify.

### Manual Deployment

To deploy manually:

```bash
npm run build
netlify deploy --prod
```

### Continuous Deployment

For continuous deployment:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Connect your Netlify site to the repository
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

## Project Structure

```
src/
├── components/       # React components
├── context/          # Context API for state management
├── data/             # Initial data and constants
├── firebase/         # Firebase configuration
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## License

MIT