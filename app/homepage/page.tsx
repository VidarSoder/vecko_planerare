'use client'
import { WeeklyPlannerComponent } from "@/components/weekly-planner";
import { useUser } from '@/context/UserContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Import the Button component

export default function Home() {
  const { user, setUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    setUser(null);
    router.push('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative min-h-screen">
      <Button
        onClick={handleLogout}
        className="absolute top-4 right-4"
      >
        Logout
      </Button>
      <WeeklyPlannerComponent />
    </div>
  );
}