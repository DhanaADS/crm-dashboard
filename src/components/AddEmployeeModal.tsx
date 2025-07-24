'use client';

import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function AddEmployeeModal({ onAdded }: { onAdded?: () => void }) {
  const supabase = createClientComponentClient();
  const [open, setOpen] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    let avatar_url = '';

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employee-photo')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload failed:', uploadError.message);
        setLoading(false);
        return;
      }

      const { data: imageData } = supabase
        .storage
        .from('employee-photo')
        .getPublicUrl(filePath);

      avatar_url = imageData.publicUrl;
    }

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
      console.error('Insert failed:', insertError.message);
    } else {
      setOpen(false);
      if (onAdded) onAdded();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">+ Add Employee</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <Input
            placeholder="Designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
          />
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          {file && (
            <img
              src={URL.createObjectURL(file)}
              alt="Avatar preview"
              className="w-24 h-24 rounded-full mx-auto object-cover mt-2"
            />
          )}
          <Button
            disabled={loading}
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Adding...' : 'Add Employee'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}