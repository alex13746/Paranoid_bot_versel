export default function TestPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-black mb-4">Test Page Works!</h1>
        <p className="text-gray-600">If you see this, Next.js is working correctly.</p>
        <p className="text-sm text-gray-500 mt-4">Time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}
