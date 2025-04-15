import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Function to parse JWT without a library
function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split(".")[1]))
  } catch (e) {
    return null
  }
}

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value
  const path = request.nextUrl.pathname

  // If trying to access protected routes without a token
  if (path.startsWith("/dashboard") || path.startsWith("/profile")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Parse token to get role
    const payload = parseJwt(token)
    if (!payload || !payload.role) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const role = payload.role

    // Check if user is trying to access the correct role-specific dashboard
    if (path.startsWith("/dashboard")) {
      const correctPath =
        role === "patient"
          ? "/dashboard/patient"
          : role === "doctor_general"
            ? "/dashboard/doctor-general"
            : "/dashboard/doctor-specialty"

      // If user is trying to access a dashboard that doesn't match their role
      if (!path.startsWith(correctPath)) {
        return NextResponse.redirect(new URL(correctPath, request.url))
      }
    }
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
}
