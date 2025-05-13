// src/components/MenuTrends.jsx
export default function MenuTrends() {
  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h2 className="text-lg font-semibold mb-1">Daily Trending Menus</h2>
      <p className="text-sm text-gray-400 mb-4">Lorem ipsum dolor sit amet, consectetur</p>
      
      <div className="flex items-center justify-between border-t pt-4 mt-2">
        <div className="text-sm font-medium text-gray-700">
          <p>#1 <span className="ml-2 font-semibold">Medium Spicy Spaghetti Italiano</span></p>
          <p className="text-sm text-gray-500">$5.60 · Order 89x</p>
        </div>
        <img
          src="https://source.unsplash.com/40x40/?spaghetti"
          alt="Spaghetti"
          className="rounded-full w-10 h-10 object-cover"
        />
      </div>
    </div>
  );
}
