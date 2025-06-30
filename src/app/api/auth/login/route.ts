import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, remember } = body

    // Demo credentials check
    if (email === "demo@tsmarthub.com" && password === "demo123456") {
      return NextResponse.json({
        success: true,
        token: "demo_auth_token_" + Date.now(),
        user: {
          id: "demo_user",
          email: "demo@tsmarthub.com",
          name: "Demo User",
          role: "admin",
        },
        message: "Login successful",
      })
    }

    // For any other credentials, simulate a successful login for demo purposes
    if (email && password) {
      return NextResponse.json({
        success: true,
        token: "auth_token_" + Date.now(),
        user: {
          id: "user_" + Date.now(),
          email: email,
          name: email.split("@")[0],
          role: "user",
        },
        message: "Login successful",
      })
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid email or password",
      },
      { status: 401 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Server error occurred",
      },
      { status: 500 },
    )
  }
}
