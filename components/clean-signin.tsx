'use client'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { firebaseConfig } from '@/lib/firebase';
import { useUser } from '@/context/UserContext'


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export function CleanSignin() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();
  const { setUser } = useUser();

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signInWithPopup(auth, provider);
      console.log(result.user);
      setUser(result.user);
      router.push('/homepage');

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-gray-800">Welcome</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            type="button"
            className="w-full h-14 text-lg font-medium transition-all duration-300 ease-in-out bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow"
            onClick={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <div> loading </div>
            ) : (
              <>
                <LogIn className="w-6 h-6 mr-2 text-blue-500" />
                Sign in
              </>
            )}
          </Button>


          By signing in, you agree to our{' '}
          <a href="#" className="text-blue-500 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>
        </CardContent>
      </Card>
    </div>
  )
}
