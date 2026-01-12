# QA Checklist - Pomodoro Focus Trainer

## Timer Transitions

### Basic Flow
- [ ] Start Focus session → timer counts down
- [ ] Focus completes → reflection modal appears
- [ ] Submit reflection → transitions to Short Break
- [ ] Short Break completes → returns to Focus
- [ ] After 4 Focus sessions → Long Break appears
- [ ] Long Break completes → returns to Focus, cycle resets

### Controls
- [ ] **Pause**: Timer stops, shows paused state
- [ ] **Resume**: Timer continues from paused time
- [ ] **Reset**: Timer resets to full duration, becomes idle
- [ ] **Skip**: Moves to next phase (Focus→Break, Break→Focus)
- [ ] **+1 minute**: Adds 60 seconds to running timer

## Edge Cases

### Page Refresh
- [ ] Refresh while timer running → timer resumes with correct remaining time
- [ ] Refresh while paused → timer shows paused state with correct remaining time
- [ ] Refresh after phase complete → no stale session restored
- [ ] Intention persists after refresh
- [ ] Logged distractions persist after refresh

### System Sleep / Tab Inactive
- [ ] Leave tab for 30 seconds, return → time is accurate (not 30s behind)
- [ ] Close laptop for 1 minute, open → timer shows correct remaining time
- [ ] If timer would have completed during sleep → handles completion on return

### Settings Changes Mid-Session
- [ ] Change focus duration while timer running → current session NOT affected
- [ ] Change settings → next session uses new values
- [ ] Toggle sound → takes effect immediately
- [ ] Toggle focus mode → takes effect immediately

### Negative Time Prevention
- [ ] Timer never shows negative values
- [ ] Skip when 0 seconds remaining → clean transition
- [ ] Reset when 0 seconds remaining → works correctly

## Feature-Specific Tests

### Intention Input
- [ ] Shown before starting Focus (not breaks)
- [ ] Can submit with intention text
- [ ] Can skip (empty intention)
- [ ] Intention displayed during focus session
- [ ] Intention saved with session record

### Distraction Logger
- [ ] Button only visible during running Focus phase
- [ ] Modal opens without stopping timer
- [ ] All 6 distraction types selectable
- [ ] Note field limited to 120 characters
- [ ] "Log & Return" saves distraction with timestamp
- [ ] Cancel closes without logging
- [ ] Multiple distractions can be logged per session

### Reflection Modal
- [ ] Appears after Focus phase completes
- [ ] Quality rating required to submit
- [ ] Biggest distraction optional
- [ ] Improvement note optional
- [ ] Skip closes modal without saving reflection
- [ ] Logged distraction types highlighted in selector
- [ ] Reflection saved with session record

### Settings Panel
- [ ] Opens from header button
- [ ] Duration sliders respect min/max limits
- [ ] Toggle switches work (auto-advance, sound, focus mode)
- [ ] Changes persist after closing panel
- [ ] Overlay click closes panel
- [ ] Escape key closes panel (if implemented)

### Stats View
- [ ] Opens from header button
- [ ] Today's stats reflect completed sessions
- [ ] Weekly chart shows 7 days with correct labels
- [ ] Streak calculation is accurate
- [ ] Top distraction shows most common type
- [ ] Stats update after completing a session

## Accessibility Checks

### Keyboard Navigation
- [ ] Tab through all controls in logical order
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Focus visible on all interactive elements

### Screen Reader
- [ ] Timer has appropriate ARIA labels
- [ ] Phase announced via aria-live
- [ ] Modals have dialog role and labels
- [ ] Buttons have accessible names

### Visual
- [ ] Text readable in dark theme
- [ ] Focus indicators visible
- [ ] Color not sole indicator of state (icons/text support)

## Responsive Design

- [ ] Mobile (320px - 480px): Layout adapts, controls accessible
- [ ] Tablet (768px): Good use of space
- [ ] Desktop (1024px+): Centered, comfortable reading

## Audio

- [ ] Sound plays on phase complete (when enabled)
- [ ] Sound does NOT play when disabled
- [ ] No audio errors in console
- [ ] Works after user interaction (audio context unlocked)

## localStorage

- [ ] Data persists after browser close/reopen
- [ ] Corrupted data doesn't crash app (graceful fallback)
- [ ] Schema version stored for future migrations
