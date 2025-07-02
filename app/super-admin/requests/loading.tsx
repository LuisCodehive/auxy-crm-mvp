export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border animate-pulse">
            <div className="text-center">
              <div className="h-8 w-12 bg-gray-200 rounded mx-auto mb-2"></div>
              <div className="h-3 w-16 bg-gray-200 rounded mx-auto"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-96 bg-gray-200 rounded"></div>
        </div>
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="h-10 flex-1 bg-gray-200 rounded"></div>
            <div className="h-10 w-48 bg-gray-200 rounded"></div>
            <div className="h-10 w-48 bg-gray-200 rounded"></div>
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 w-48 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="h-4 w-16 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 w-20 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-20 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
