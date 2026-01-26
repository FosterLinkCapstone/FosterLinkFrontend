import { Check } from "lucide-react"
import { useEffect, useState } from "react"

export const BackgroundLoadSpinner = ({loading} : {loading: boolean}) => {
  const [visible, setVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (loading) {
      setHasLoaded(true)
      setVisible(true)
    }
    if (!loading && hasLoaded) {
      setTimeout(() => {
        setVisible(false)
      }, 3000)
    }
  }, [loading, hasLoaded])

  if (visible) {
    if (loading) {
      return (
        <div className="size-8 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin"></div>
      )
    }
    if (!loading) {
      return (
        <Check className="size-8 stroke-green-600 stroke-[2.5]" />
      )
    }
  } else return null
}