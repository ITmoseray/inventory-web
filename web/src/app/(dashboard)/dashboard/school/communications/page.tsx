import React from 'react';
import { getBroadcasts } from '@/actions/communicationActions';
import { getCourses } from '@/actions/schoolAdminActions';
import CommunicationClient from './CommunicationClient';

export default async function CommunicationsPage() {
  const [broadcasts, courses] = await Promise.all([
    getBroadcasts(),
    getCourses()
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Communication Hub</h1>
        <p className="text-slate-500 dark:text-slate-400">Broadcast SMS, Email, and WhatsApp messages to students and parents.</p>
      </div>

      <CommunicationClient 
        initialBroadcasts={broadcasts} 
        courses={courses} 
      />
    </div>
  );
}
