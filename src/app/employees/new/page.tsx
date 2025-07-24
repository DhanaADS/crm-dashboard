'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddEmployeePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddEmployee = async () => {
    setLoading(true);
    let avatar_url = '';

    try {
      // 1. Upload Image if present
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('employee-photos')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: imageData } = supabase.storage
          .from('employee-photos')
          .getPublicUrl(filePath);

        if (!imageData?.publicUrl) {
          throw new Error('Could not retrieve public URL');
        }

        avatar_url = imageData.publicUrl;
      }

      // 2. Insert Employee Record
      const { error: insertError } = await supabase.from('employees').insert([
        {
          first_name: firstName,
          last_name: lastName,
          email,
          department,
          designation,
          avatar_url,
        },
      ]);

      if (insertError) {
        throw new Error(`Insert failed: ${insertError.message}`);
      }

      router.push('/employees');
    } catch (err: any) {
      console.error(err.message || err);
      alert(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Employee</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label>First Name</Label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
              required
            />
          </div>
          <div>
            <Label>Last Name</Label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
              required
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
            />
          </div>
          <div>
            <Label>Department</Label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Enter department"
            />
          </div>
          <div>
            <Label>Designation</Label>
            <Input
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="Enter designation"
            />
          </div>
          <div>
            <Label>Profile Photo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <img
                src={URL.createObjectURL(file)}
                alt="Avatar preview"
                className="w-20 h-20 mt-2 rounded-full object-cover border"
              />
            )}
          </div>
          <Button
            onClick={handleAddEmployee}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Adding...' : 'Add Employee'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}