'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchEmployee = async () => {
      const { data } = await supabase.from('employees').select('*').eq('id', id).single();
      setEmployee(data);
    };
    if (id) fetchEmployee();
  }, [id]);

  if (!employee) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Employee Detail</h1>
      <div className="space-y-2">
        <p><strong>Name:</strong> {employee.name}</p>
        <p><strong>Position:</strong> {employee.position}</p>
      </div>
      <button
        className="mt-4 text-blue-500"
        onClick={() => router.push('/employees')}
      >
        ← Back to List
      </button>
    </div>
  );
}