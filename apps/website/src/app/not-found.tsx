import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-4xl font-bold">404</h1>
      <p className="mb-4 text-lg">Page not found</p>
      <Link href="/" className="text-blue-500 hover:underline">
        Go back home
      </Link>
    </div>
  )
}
