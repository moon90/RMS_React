// src/components/FloatingButtons.jsx
export default function FloatingButtons() {
  return (
    <div className="fixed right-6 bottom-6 flex flex-col items-center gap-4 z-50">
      <button className="bg-white shadow-lg p-3 rounded-full text-xl hover:bg-orange-500 hover:text-white transition">
        ⚙️
      </button>
      <button className="bg-white shadow-lg p-3 rounded-full text-xl hover:bg-orange-500 hover:text-white transition">
        💧
      </button>
    </div>
  );
}
