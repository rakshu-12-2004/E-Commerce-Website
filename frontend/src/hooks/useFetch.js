import { useState, useEffect, useCallback, useRef } from 'react'

export function useFetch(fetchFn, params, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchFn(params)
      setData(res.data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, deps)

  useEffect(() => { fetch() }, [fetch])

  return { data, loading, error, refetch: fetch }
}

export function usePolling(fetchFn, params, intervalMs = 30000, deps = []) {
  const { data, loading, error, refetch } = useFetch(fetchFn, params, deps)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(refetch, intervalMs)
    return () => clearInterval(intervalRef.current)
  }, [refetch, intervalMs])

  return { data, loading, error, refetch }
}

export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
