// /hooks/use-logout.ts
import { useState } from "react"
import { useRouter } from "next/navigation"
import  { poster }  from '@/app/lib/fetcher';
// import { queryClient } from "@/lib/queryClient" // if you use React Query

export function useLogout() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const logout = async () => {
    if (loading) return
    setLoading(true)
    try {
        await poster("api/v1/admins/logout"); // same axios instance, cookies included
      }  catch {
      /* ignore — we’ll still nuke client state */
    } finally {
      // clean client state
      try {
        // remove only what you use (examples):
        localStorage.removeItem("institutionKey")
        localStorage.removeItem("auth")
        localStorage.removeItem("user")
        sessionStorage.clear()
        // if using React Query / SWR / Zustand, clear them too:
        // await queryClient.clear()
        // useStore.getState().reset?.()
      } finally {
        router.replace("/login")
      }
    }
  }

  return { logout, loading }
}
