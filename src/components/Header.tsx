import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
  return (
    <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
      <h1 className="text-2xl font-bold dark:text-white">CRM Dashboard</h1>
      <DarkModeToggle />
    </div>
  );
}