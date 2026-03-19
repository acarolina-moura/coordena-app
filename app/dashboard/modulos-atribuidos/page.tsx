/**
 * Modulos Atribuidos Page
 * 
 * File: app/dashboard/modulos-atribuidos/page.tsx
 * 
 * This is a server-side page component that displays all modules assigned to a trainer.
 * 
 * Process Flow:
 * 1. Authenticates the user using NextAuth
 * 2. Retrieves user data from the database
 * 3. Fetches all modules assigned to that user
 * 4. Renders them in a responsive grid of cards
 * 
 * Each card displays:
 * - Module name, code, and course
 * - Status badge (Ativo, Inativo, Concluído)
 * - Skills/competencies tags
 * - Number of enrolled students
 * - Eye icon button to view full details
 */

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getModulosAtribuidosFormador } from "@/app/dashboard/_data/formador";
import { prisma } from "@/lib/prisma";
import ModuloCard from "./_components/modulo-card";

/**
 * ModulosAtribuidosPage
 * 
 * Server component (async) that handles:
 * 1. User authentication
 * 2. Data fetching from database
 * 3. Page rendering with responsive grid layout
 */
export default async function ModulosAtribuidosPage() {
  /**
   * Step 1: Get Current User Session
   * Retrieves the authenticated user's session information
   * Contains: user.email, user.name, user.role, etc.
   */
  const session = await auth();
  
  /**
   * Redirect to login if user is not authenticated
   * Essential for security - ensures only logged-in users can access this page
   */
  if (!session?.user?.email) redirect('/login');

  /**
   * Step 2: Fetch User Data
   * Looks up the user in the database using their email from the session
   * This ensures we have the correct user ID for fetching their modules
   */
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  /**
   * Security check: Redirect if user not found in database
   * This should only happen in edge cases (user session but removed from DB)
   */
  if (!user?.id) redirect('/login');

  /**
   * Step 3: Fetch Assigned Modules
   * Calls getModulosAtribuidosFormador which:
   * - Gets the formador record for this user
   * - Includes all modules assigned to this formador
   * - Returns formatted module data with course info
   */
  const modulos = await getModulosAtribuidosFormador(user.id);

  /**
   * Step 4: Render Page
   * Returns JSX with:
   * - Page header with title and module count
   * - Responsive grid (1 col on mobile, 2 cols on tablet, 3 cols on desktop)
   * - ModuloCard components for each module
   */
  return (
    <div className="flex flex-col gap-6">
      {/* Page Header Section */}
      <div>
        <h1 className="text-[26px] font-bold text-gray-900">Módulos Atribuídos</h1>
        {/* Dynamic count of assigned modules */}
        <p className="mt-0.5 text-sm text-gray-500">{modulos.length} módulos atribuídos</p>
      </div>

      {/* 
        Responsive Grid Layout
        - Mobile (default): grid-cols-1 (1 column)
        - Tablet (md): grid-cols-2 (2 columns)
        - Desktop (xl): grid-cols-3 (3 columns)
        - Gap: 4px between cards
      */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* 
          Map through modules and render a ModuloCard for each
          
          Key prop is important for React's rendering optimization:
          - Must be unique for each item
          - Using m.id (module ID) as the key
          
          Props passed to ModuloCard:
          - modulo: The module data object
        */}
        {modulos.map((m) => (
          <ModuloCard key={m.id} modulo={m} />
        ))}
      </div>
    </div>
  );
}