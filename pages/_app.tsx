import '../styles/globals.css'
import type { AppProps, NextWebVitalsMetric } from 'next/app'
import {useRouter} from 'next/router'
import {useEffect,useState} from 'react'
import {supabase} from '../utils/supabase'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

export function reportWebVitals(metric: NextWebVitalsMetric) {
  switch (metric.name) {
    case 'FCP':
      console.log(`FCP: ${Math.round(metric.value * 10) / 10}`)
      break
    case 'LCP':
      console.log(`LCP: ${Math.round(metric.value * 10) / 10}`)
      break
    case 'TTFB':
      console.log(`TTFB: ${Math.round(metric.value * 10) / 10}`)
      break
    case 'Next.js-hydration':
      console.log(
        `Hydration: ${Math.round(metric.startTime * 10) / 10} -> ${
          Math.round((metric.startTime + metric.value) * 10) / 10
        }`
      )
      break
    default:
      break
  }
}
// React Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    }
  }
})
function MyApp({ Component, pageProps }: AppProps) {
  const {push, pathname} = useRouter()
  // ユーザ遷移を自動で行ってくれる
  const validateSession = async () => {
    // const user = supabase.auth.user() --> satou
    const user = await supabase.auth.getUser()
    if (user && pathname === '/') {
      push('/dashboard')
    } else if (!user && pathname !== '/') {
      // await push('/')    satou
      push('/')
    }
  }
  // supabaseが自動検出する
  supabase.auth.onAuthStateChange((event, _) => {
    if (event === 'SIGNED_IN' && pathname === '/') {
      push('/dashboard')
    }
    if (event === 'SIGNED_OUT') {
      push('/')
    }
  })
  useEffect(() => {
    validateSession()
  }, [])

  return　( 
    <QueryClientProvider client = {queryClient}>
      <Component {...pageProps} />
      {/* DevToolを有効にする */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default MyApp
