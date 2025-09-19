import { useCallback, useEffect, useState } from 'react'
import { UI_CONSTANTS } from '../constants'

/**
 * Custom hook for persisting calculation history in localStorage
 */
export const useHistory = (
  key = 'loan_calc_history',
  maxItems = UI_CONSTANTS.MAX_HISTORY_ITEMS
) => {
  const [history, setHistory] = useState([])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch {
      // ignore
    }
  }, [key])

  // Save to localStorage when history changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(history))
    } catch {
      // ignore
    }
  }, [key, history])

  const addToHistory = useCallback(
    calculation => {
      setHistory(prev => [calculation, ...prev].slice(0, maxItems))
    },
    [maxItems]
  )

  const clearHistory = useCallback(() => setHistory([]), [])

  return { history, addToHistory, clearHistory, setHistory }
}
