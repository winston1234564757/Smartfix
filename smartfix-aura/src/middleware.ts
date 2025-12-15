import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/", 
  "/product(.*)", 
  "/catalog(.*)",
  "/request(.*)",    // <--- ОСЬ ЦЬОГО НЕ ВИСТАЧАЛО
  "/cart",
  "/repair",
  "/trade-in",
  "/tracking",
  "/api/uploadthing(.*)",
  "/sign-in(.*)", 
  "/sign-up(.*)"
])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}