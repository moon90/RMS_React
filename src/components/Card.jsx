// src/components/Card.jsx
// src/components/Card.jsx
import { CircularProgressbarWithChildren, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function Card({ title, value, percentage, icon }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4 min-h-[110px]">
      <div className="w-16 h-16">
        <CircularProgressbarWithChildren
          value={percentage}
          strokeWidth={10}
          styles={buildStyles({
            pathColor: "#7b61ff",
            trailColor: "#f0f0f0"
          })}
        >
          <div className="text-purple-500 text-xl">{icon}</div>
        </CircularProgressbarWithChildren>
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>
    </div>
  );
}
