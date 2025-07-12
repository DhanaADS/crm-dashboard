export default function Sidebar() {
  return (
    <aside className="w-64 h-full bg-gray-800 text-white p-4">
      <h2 className="text-2xl font-bold mb-6">📊 Menu</h2>
      <ul className="space-y-4">
        <li>🏠 Dashboard</li>
        <li>👤 Contacts</li>
        <li>📈 Analytics</li>
      </ul>
    </aside>
  );
}