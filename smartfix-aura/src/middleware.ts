import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Визначаємо, які маршрути є ПУБЛІЧНИМИ (доступні всім)
// Головна (/), Сторінка товару (/product/...), API для Uploadthing (якщо буде)
const isPublicRoute = createRouteMatcher([
  '/', 
  '/product(.*)', 
  '/api/uploadthing(.*)',
  '/sign-in(.*)', 
  '/sign-up(.*)'
])

export default clerkMiddleware((auth, req) => {
  // Якщо маршрут НЕ публічний -> вимагаємо захист
  if (!isPublicRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    // Виключаємо статичні файли (картинки, шрифти) з перевірки
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}