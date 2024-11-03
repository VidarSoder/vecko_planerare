'use client'
import { WeeklyPlannerComponent } from "@/components/weekly-planner";
import { useUser } from '@/context/UserContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { createBlob, fetchAllBlobs } from '@/components/firebase/firestore';

export default function Home() {
  const { user, setUser } = useUser();
  const router = useRouter();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, set the user in your context
        setUser(firebaseUser);
      } else {
        // User is signed out, redirect to login
        setUser(null);
        router.push('/login');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router, setUser]);

  useEffect(() => {
    // const loginUser = async () => {
    //   await signInWithIdToken(auth.currentUser?.getIdToken())
    // }

    // Cleanup subscription on unmount
    if (user?.uid) {
      fetchAllBlobs(user.uid)
      console.log('user', user)
      // loginUser()
    }
  }, [user]);

  const handleLogout = () => {
    auth.signOut().then(() => {
      setUser(null);
      router.push('/login');
    });
  };

  useEffect(() => {
    if (!user) {
      const timeoutId = setTimeout(() => {
        router.push('/login');
      }, 5000); // 5000 milliseconds = 5 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [user, router]);

  if (!user) {
    console.log('user', user)
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