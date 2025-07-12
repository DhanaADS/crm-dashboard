'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useEffect, useState } from 'react'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend)

export default function AnalyticsChart() {
  const [chartData, setChartData] = useState<any>(null)

  useEffect(() => {
    const data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Leads',
          data: [5, 7, 3, 8, 6, 7, 4],
          fill: false,
          borderColor: '#6366f1', // Indigo-500
          tension: 0.4,
        },
      ],
    }

    setChartData(data)
  }, [])

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: { color: '#ccc' },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: { color: '#ccc' },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  }

  return (
    <div className="w-full max-w-[400px] h-64 mx-auto">
      {chartData && <Line data={chartData} options={options} />}
    </div>
  )
}