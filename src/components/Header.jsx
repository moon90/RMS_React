export default function Header({ onToggle }) {
  return (
    <header className="bg-white h-16 flex items-center justify-between px-6 shadow sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={onToggle} className="text-gray-600 text-xl">☰</button>
        <input
          type="text"
          placeholder="Search..."
          className="px-4 py-2 rounded-full border border-gray-300 text-sm w-64"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="bg-indigo-700 text-white px-4 py-1 rounded-full">Recipe Guide</button>
        <img src="https://i.pravatar.cc/40" alt="avatar" className="rounded-full w-8 h-8" />
      </div>
    </header>
  );
}