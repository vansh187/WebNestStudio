import { useCallback, useEffect, useState } from 'react'
import { readLearningProgress, subscribeProgressChanges } from '../lib/learningProgress'

// This user's lesson progress from the local store, re-read whenever it changes: a write on this
// page or another, the server pull after login (useServerProgressSync), or another tab. Pages
// show new ticks without a refresh.
export function useLearningProgress(userKey) {
  const [state, setState] = useState(() => ({ userKey, progress: readLearningProgress(userKey) }))
  let current = state
  if (state.userKey !== userKey) {
    // Another account (or a login): read that user's store straight away.
    current = { userKey, progress: readLearningProgress(userKey) }
    setState(current)
  }
  const reload = useCallback(() => setState({ userKey, progress: readLearningProgress(userKey) }), [userKey])
  useEffect(() => subscribeProgressChanges(userKey, reload), [userKey, reload])
  return current.progress
}
