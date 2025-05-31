import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Lewati middleware untuk route public
  const publicPaths = ['/login', '/favicon.ico', '/_next', '/api']
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Ambil token dari cookies
  const token = request.cookies.get('sb-access-token')?.value

  if (!token) {
    // Belum login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Cek session Supabase
  const { data: { user } } = await supabase.auth.getUser(token)

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Ambil role user dari tabel users
  const { data: profile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const role = profile.role
  const isAdminRoute = pathname.startsWith('/admin')
  const isKasirRoute = pathname.startsWith('/kasir')

  // Proteksi akses berdasarkan role
  if (role === 'admin' && !isAdminRoute) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  if (role === 'kasir' && !isKasirRoute) {
    return NextResponse.redirect(new URL('/kasir', request.url))
  }

  // Lolos semua pengecekan
  return NextResponse.next()
}
