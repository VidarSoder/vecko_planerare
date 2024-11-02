import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        // Assume you have some logic to authenticate the user and get a token
        const { user, token } = await authenticateUser(req);

        // Set the cookie with the token
        const response = NextResponse.json({ message: 'Login successful', user });

        response.cookies.set('authToken', token, {
            httpOnly: true, // More secure, prevents client-side JavaScript from accessing the cookie
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
        });

        return response;
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ message: 'Login failed', error: error.message }, { status: 401 });
        } else {
            return NextResponse.json({ message: 'Login failed', error: 'Unknown error' }, { status: 401 });
        }
    }
}

// Mock function for user authentication
async function authenticateUser(req: NextRequest) {
    // Your authentication logic here
    // For example, verify credentials and return user and token
    return {
        user: { id: '123', name: 'John Doe' },
        token: 'your-generated-token',
    };
}
