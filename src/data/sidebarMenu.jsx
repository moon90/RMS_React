import {
  FaThLarge, FaInfoCircle, FaChartLine
} from 'react-icons/fa';

export const sidebarMenu = [
  { label: 'Dashboard', icon: <FaThLarge />, path: '/' },
  { label: 'Apps', icon: <FaInfoCircle />, children: [] },
  { label: 'Charts', icon: <FaChartLine />, children: [] }
];