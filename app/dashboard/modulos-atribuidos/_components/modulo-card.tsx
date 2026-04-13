/**
 * Modulo Card Component
 * 
 * File: modulos-atribuidos/_components/modulo-card.tsx
 * 
 * This file exports the ModuloCard client component which displays
 * a single module in a card format with the ability to view detailed information.
 * 
 * It consists of two main components:
 * 1. ModuloCard - The interactive card that displays module info
 * 2. ModuloDetailModal - The modal that shows full details when eye icon is clicked
 */

"use client";

import { useState } from "react";
import { Puzzle, GraduationCap, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Type Definition: ModuloStatus
 * Represents the possible states of a module
 */
type ModuloStatus = "Ativo" | "Inativo" | "Concluído";

/**
 * Interface: ModuloAtribuido
 * Defines the structure of a module object
 * 
 * Properties:
 * - id: Unique identifier for the module
 * - nome: Name/title of the module
 * - codigo: Module code (e.g., UFCD-XXXX)
 * - curso: The course this module belongs to
 * - tags: Array of skills/competencies for this module
 * - formandos: Number of students enrolled in this module
 * - status: Current status of the module (Ativo, Inativo, or Concluído)
 * - estudantes: Array of student objects enrolled in this course/module
 */
interface ModuloAtribuido {
  id: string;
  nome: string;
  codigo: string;
  curso: string;
  tags: string[];
  formandos: number;
  status: ModuloStatus;
  estudantes: Array<{
    id: string;
    nome: string;
    email: string;
    dataInscricao: Date;
  }>;
}

/**
 * Styling Configuration: STATUS_STYLE
 * Maps each module status to its corresponding Tailwind CSS classes
 * for visual styling (border color, text color, background color)
 * 
 * - Ativo: Green styling (active module)
 * - Inativo: Gray styling (inactive module)
 * - Concluído: Blue styling (completed module)
 */
const STATUS_STYLE: Record<ModuloStatus, string> = {
  Ativo:     "border-green-300 dark:border-green-900/30 text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-900/20",
  Inativo:   "border-gray-300 dark:border-gray-800 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50",
  Concluído: "border-blue-300 dark:border-blue-900/30 text-blue-700 dark:text-blue-500 bg-blue-50 dark:bg-blue-900/20",
};

/**
 * ModuloDetailModal
 * 
 * Component that displays a modal with detailed information about a module.
 * Shows:
 * - Module name, code, and course name
 * - Current status with color-coded badge
 * - Number of students enrolled
 * - Skills/competencies as tags
 * - List of all students enrolled in this course/module
 * - Close button to dismiss the modal
 * 
 * @param modulo - The module data to display
 * @param onClose - Callback function to close the modal
 */
function ModuloDetailModal({ modulo, onClose }: { modulo: ModuloAtribuido; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      {/* Modal Container with max width and scrollable content */}
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-lg dark:shadow-2xl border dark:border-gray-800">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mb-6 sticky top-0 bg-white dark:bg-gray-900 pb-4 border-b border-gray-200 dark:border-gray-800">
          {/* Module icon */}
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
            <Puzzle className="h-7 w-7 text-purple-500 dark:text-purple-400" />
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </button>
        </div>

        {/* Module Information Section */}
        <div className="space-y-6">
          {/* Module Name and Code */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{modulo.nome}</h2>
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mt-1">{modulo.codigo}</p>
          </div>
          
          {/* Additional Details Box */}
          <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border dark:border-gray-800">
            {/* Course Name */}
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Curso:</span> {modulo.curso}
            </p>
            {/* Module Status - with color-coded styling */}
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-semibold text-gray-900 dark:text-gray-100">Status:</span>{" "}
              <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold inline-block", STATUS_STYLE[modulo.status])}>
                {modulo.status}
              </span>
            </p>
            {/* Number of Students Enrolled */}
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              {modulo.formandos} formando{modulo.formandos !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Skills/Tags Section - only shows if tags exist */}
          {modulo.tags.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Competências:</p>
              {/* Tag badges displaying skills/topics */}
              <div className="flex flex-wrap gap-2">
                {modulo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-purple-100 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 text-xs font-medium text-purple-600 dark:text-purple-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Students List Section */}
          <div className="border-t dark:border-gray-800 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Formandos Inscritos ({modulo.estudantes.length})
              </h3>
            </div>

            {/* Check if there are students */}
            {modulo.estudantes.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">Nenhum formando inscrito neste curso</p>
              </div>
            ) : (
              /* Students List */
              <div className="space-y-2">
                {modulo.estudantes.map((estudante, index) => (
                  <div
                    key={estudante.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {/* Student Number and Info */}
                    <div className="flex items-center gap-3 flex-1">
                      {/* Student number badge */}
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 text-xs font-bold">
                        {index + 1}
                      </div>
                      {/* Student details */}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{estudante.nome}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{estudante.email}</p>
                      </div>
                    </div>
                    {/* Inscription date */}
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(estudante.dataInscricao).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t dark:border-gray-800">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-purple-600 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ModuloCard Component (Client-side)
 * 
 * This is a client component that handles the interactive card display for a module.
 * 
 * Features:
 * - Displays module information in a visually appealing card
 * - Has a small "eye" button to view full details in a modal
 * - Shows status badge with appropriate color coding
 * - Displays tags/skills associated with the module
 * - Shows the number of students enrolled
 * 
 * State Management:
 * - showDetails: Boolean state to control modal visibility
 * 
 * @param modulo - The module data object to display
 */
export default function ModuloCard({ modulo }: { modulo: ModuloAtribuido }) {
  // State to control whether the detail modal is open or closed
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      {/* Main Card Container */}
      <div className="group flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-sm transition-all focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2">
        
        {/* Card Header: Puzzle Icon and Status Badge */}
        <div className="flex items-start justify-between gap-3">
          {/* Module icon - purple puzzle piece */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
            <Puzzle className="h-6 w-6 text-purple-500 dark:text-purple-400" />
          </div>
          {/* Status badge - color-coded based on module status */}
          <span className={cn("rounded-full border px-3 py-0.5 text-xs font-semibold", STATUS_STYLE[modulo.status])}>
            {modulo.status}
          </span>
        </div>

        {/* Module Information Section */}
        <div className="flex flex-col gap-1">
          {/* Module Name */}
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{modulo.nome}</h3>
          {/* Module Code (e.g., UFCD-XXXX) */}
          <span className="text-sm text-purple-500 dark:text-purple-400 font-medium">{modulo.codigo}</span>
          {/* Course Name */}
          <span className="text-sm text-gray-400 dark:text-gray-500">{modulo.curso}</span>
        </div>

        {/* Tags/Skills Section */}
        <div className="flex flex-wrap gap-1.5">
          {/* Map through tags and display as badges */}
          {modulo.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-purple-100 dark:border-purple-900/30 bg-purple-50 dark:bg-purple-900/20 px-2.5 py-0.5 text-xs font-medium text-purple-600 dark:text-purple-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Card Footer: Student Count and View Details Button */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-3">
          {/* Left side: Number of students enrolled */}
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <GraduationCap className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            {modulo.formandos} formando{modulo.formandos !== 1 ? "s" : ""}
          </div>
          
          {/* Right side: View Details Button - small eye icon */}
          <button
            onClick={() => setShowDetails(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            title="Ver detalhes do módulo"
            aria-label="Ver detalhes"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Modal Overlay - only renders if showDetails is true */}
      {showDetails && (
        <ModuloDetailModal modulo={modulo} onClose={() => setShowDetails(false)} />
      )}
    </>
  );
}
