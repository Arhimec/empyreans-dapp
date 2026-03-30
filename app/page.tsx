'use client';

import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('../components/Dashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-mvxdark flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-mvxteal/20 border-t-mvxteal rounded-full animate-spin" />
        <p className="text-mvxmuted font-bold tracking-widest uppercase text-xs">Loading Interface...</p>
      </div>
    </div>
  )
});

export default function Home() {
  return <Dashboard />;
}
