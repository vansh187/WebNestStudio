import { useNavigate } from 'react-router-dom'
import VisitingCard from '../components/VisitingCard'
import { useSeo } from '../hooks/useSeo'

export default function DigitalCard() {
  const navigate = useNavigate()

  useSeo({
    title: 'Digital Card',
    description:
      'WebNest Studio digital business card - save our contact, message us on WhatsApp, or book a free consultation in one tap.',
    path: '/card',
  })

  const closeCard = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-x-clip bg-ink-950 px-5 py-10 text-white sm:px-6 sm:py-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(230,172,62,0.18),transparent_38%),radial-gradient(circle_at_85%_85%,rgba(230,172,62,0.12),transparent_40%),linear-gradient(160deg,rgba(5,6,9,0.96),rgba(18,21,30,0.9))]" />

      {/* m-auto (not just mx-auto) vertically centers the card on tall tablet /
          desktop screens, and stays scroll-safe on phones where the card is
          taller than the viewport - unlike flex justify-center, auto margins
          never clip the overflow. */}
      <div className="relative m-auto w-full max-w-md">
        <VisitingCard onClose={closeCard} />
      </div>
    </div>
  )
}
