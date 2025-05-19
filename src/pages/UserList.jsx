import { useEffect, useState } from 'react';

const dummyUsers = [
  { id: 1, name: 'John Doe', username: 'johnd', email: 'john@example.com', phone: '123-456' },
  { id: 2, name: 'Jane Smith', username: 'janes', email: 'jane@example.com', phone: '456-789' },
];

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => setUsers(dummyUsers), 500);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">User List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Full Name</th>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.username}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
