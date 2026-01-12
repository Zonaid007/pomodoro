# Pomodoro Focus Trainer

A mindful Pomodoro timer designed to help you practice deep focus, notice distractions without shame, and build better focus habits through gentle feedback loops.

![Focus Trainer](https://via.placeholder.com/800x400/0F172A/F59E0B?text=Focus+Trainer)

## Features

### 🎯 Pomodoro Engine
- **Default schedule**: 25 min focus, 5 min short break, 15 min long break after 4 sessions
- **Customizable**: Focus (15-60 min), short break (3-15 min), long break (10-30 min)
- **Controls**: Start/Pause, Reset, Skip phase, Add +1 minute
- **Auto-advance**: Optional automatic transition between phases
- **Sound notifications**: Optional gentle chime (Web Audio API)

### 📝 Focus Intention
- Set a clear intention before each focus session
- Displayed during the session to keep you on track
- Stored with session history for review

### 💭 Distraction Logger
- Lightweight "Log distraction" button during focus
- Quick type selection: Thought, Phone, Notification, Noise, Urge, Other
- Optional note (max 120 chars)
- Timer continues running—no interruption to your flow

### 🪞 End-of-Session Reflection
- Rate your focus: Great / Okay / Struggled
- Identify biggest distraction
- Optional improvement note for next session
- Skippable but gently encouraged

### 📊 Stats & Progress
- **Today**: Sessions completed, total focus minutes, distraction count
- **Weekly chart**: CSS-based 7-day bar chart
- **Streak**: Consecutive days with at least 1 focus session
- **Insights**: Top distraction type from last 7 days

### ✨ UX Features
- Calm, minimal dark theme
- Focus Mode: Hides UI chrome during focus
- Circular progress ring with phase-specific colors
- Keyboard accessible with visible focus states
- Mobile-responsive design

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

The app runs at `http://localhost:5173` by default.

## Tech Stack

- **React 18** with hooks
- **TypeScript** for type safety
- **Vite** for fast development
- **Vitest** for testing
- **Vanilla CSS** with custom properties

No external UI libraries—lightweight and fast.

## Data Storage

All data is stored in `localStorage` under the key `pomodoro_data`.

### Schema (v1)

```typescript
{
  schemaVersion: 1,
  settings: {
    focusDuration: number,      // 15-60 minutes
    shortBreakDuration: number, // 3-15 minutes
    longBreakDuration: number,  // 10-30 minutes
    longBreakInterval: number,  // 2-6 sessions
    autoAdvance: boolean,
    soundEnabled: boolean,
    focusModeEnabled: boolean
  },
  sessions: [{
    id: string,
    date: string,               // YYYY-MM-DD
    startTime: number,          // Unix timestamp
    endTime: number,
    intention: string,
    distractions: [{
      type: string,
      note: string,
      tOffsetSec: number        // Seconds from session start
    }],
    reflection: {
      quality: 'great' | 'okay' | 'struggled',
      biggestDistraction: string | null,
      note: string
    },
    completed: boolean
  }],
  currentSession: {...} | null  // For refresh recovery
}
```

### Refresh Recovery

The app saves the current timer state to localStorage, including:
- Start timestamp (not elapsed time)
- Paused remaining time (if paused)
- Session intention and logged distractions

On page reload, the timer calculates the correct remaining time using real timestamps, handling browser throttling and system sleep correctly.

## Project Structure

```
src/
├── components/
│   ├── Timer/          # Main timer display + controls
│   ├── Intention/      # Pre-session intention input
│   ├── Distraction/    # Distraction logging modal
│   ├── Reflection/     # End-of-session reflection
│   ├── Settings/       # Settings panel
│   ├── Stats/          # Statistics view + chart
│   └── common/         # Shared components (Modal)
├── hooks/              # React hooks (useTimer, useSettings, etc.)
├── utils/              # Utilities (time, storage, audio)
├── types/              # TypeScript interfaces
├── constants/          # Default values + labels
└── App.tsx             # Main app component
```

## Accessibility

- **Keyboard navigation**: All controls accessible via Tab
- **Focus states**: Visible focus indicators
- **ARIA labels**: Screen reader support
- **High contrast**: Good color contrast ratios
- **Semantic HTML**: Proper heading hierarchy

## Browser Support

Modern browsers with ES2020 support:
- Chrome/Edge 80+
- Firefox 78+
- Safari 14+

## License

MIT
