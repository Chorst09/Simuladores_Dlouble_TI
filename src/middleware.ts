import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/login', 
    '/signup', 
    '/forgot-password', 
    '/reset-password',
    '/change-password',
    '/api/auth/login', 
    '/api/auth/signup', 
    '/api/auth/forgot-password', 
    '/api/auth/reset-password',
    '/api/auth/change-password',
    '/api/auth/logout'
  ];
  
  // Verificar se é uma rota pública
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Para rotas protegidas, apenas verificar se há token
  // A validação completa será feita nas API routes individuais
  const protectedApiRoutes = ['/api/users', '/api/proposals', '/api/admin'];
  const protectedPageRoutes = ['/', '/app', '/admin', '/dashboard'];
  
  if (protectedApiRoutes.some(route => pathname.startsWith(route)) || 
      protectedPageRoutes.some(route => pathname.startsWith(route))) {
    
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Token não fornecido' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Para API routes, deixar que cada rota faça sua própria validação
    // Para páginas, apenas verificar presença do token
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};