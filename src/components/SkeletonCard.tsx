// src/components/SkeletonCard.tsx
export default function SkeletonCard() {
  return (
    <div className="w-full h-32 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse p-4 space-y-4">
      <div className="w-3/4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      <div className="w-full h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      <div className="w-5/6 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
    </div>
  );
}