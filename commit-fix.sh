#!/bin/bash
cd "C:\Users\Pc\Desktop\APP\student-management"
git add -A
git commit -m "fix: Next.js 16 compatibility - Route params and NextAuth types

Fixed TypeScript errors:
1. Updated all route handlers to use params: Promise<{ id: string }>
2. Added await for params destructuring in all handlers
3. Extended NextAuth types to include role property in User, Session, and JWT

These changes resolve compilation errors with Next.js 16.1.6 and enable successful Vercel deployment."

git log --oneline -3
