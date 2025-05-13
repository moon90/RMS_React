// src/components/CustomerMap.jsx
export default function CustomerMap() {
  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Customer Map</h2>
        <div className="bg-orange-100 text-orange-600 text-sm rounded-full px-4 py-1 flex gap-2">
          <button className="font-bold">Year</button>
          <span className="text-gray-400">Monthly</span>
          <span className="text-gray-400">Week</span>
        </div>
      </div>
      <div className="h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
        [ Map Placeholder ]
      </div>
    </div>
  );
}
