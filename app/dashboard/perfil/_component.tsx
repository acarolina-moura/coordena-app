'use client'

import { useState } from 'react'
import { Plus, X, Save, Edit2, Linkedin, Github, Globe, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateFormadorPerfil } from '@/app/dashboard/perfil/actions'
import { AvatarUploader } from '@/components/avatar-uploader'

interface FormadorData {
  nome: string
  email: string
  especialidade: string
  competencias: string
  linkedin: string
  github: string
  idioma: string
  nacionalidade: string
  userId: string
  image?: string | null
}

const IDIOMAS = [
  'Português',
  'Inglês',
  'Espanhol',
  'Francês',
  'Alemão',
  'Italiano',
  'Russo',
  'Chinês',
  'Japonês',
  'Outro'
]

const NACIONALIDADES = [
  'Portugal',
  'Brasil',
  'Espanha',
  'França',
  'Alemanha',
  'Itália',
  'Reino Unido',
  'EUA',
  'Canadá',
  'Outro'
]

const COMPETENCIAS = [
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C#',
  'C++',
  'PHP',
  'Ruby',
  'Go',
  'Rust',
  'SQL',
  'PostgreSQL',
  'MongoDB',
  'React',
  'Vue.js',
  'Angular',
  'Node.js',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'Git',
  'CI/CD',
  'TDD',
  'Agile',
  'Scrum',
  'HTML',
  'CSS',
  'REST API',
  'GraphQL',
  'Outro'
]

export function PerfilClient({ formador }: { formador: FormadorData }) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [especialidade, setEspecialidade] = useState(formador.especialidade)
  const [selectedCompetencia, setSelectedCompetencia] = useState('')
  const [customCompetencia, setCustomCompetencia] = useState('')
  const [competencias, setCompetencias] = useState<string[]>(
    formador.competencias ? formador.competencias.split(',').map(t => t.trim()) : []
  )
  const [linkedin, setLinkedin] = useState(formador.linkedin)
  const [github, setGithub] = useState(formador.github)
  const [idioma, setIdioma] = useState(formador.idioma)
  const [nacionalidade, setNacionalidade] = useState(formador.nacionalidade)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  function addCompetencia() {
    let competenciaAdicionar = ''
    
    if (selectedCompetencia === 'Outro') {
      competenciaAdicionar = customCompetencia.trim()
    } else {
      competenciaAdicionar = selectedCompetencia.trim()
    }
    
    if (competenciaAdicionar && !competencias.includes(competenciaAdicionar)) {
      setCompetencias((prev) => [...prev, competenciaAdicionar])
      setSelectedCompetencia('')
      setCustomCompetencia('')
    }
  }

  function removeCompetencia(competencia: string) {
    setCompetencias((prev) => prev.filter((t) => t !== competencia))
  }

  async function handleSave() {
    setLoading(true)
    try {
      const competenciasStr = competencias.join(', ')
      
      const resultado = await updateFormadorPerfil(
        formador.userId,
        especialidade,
        competenciasStr,
        linkedin,
        github,
        idioma,
        nacionalidade
      )
      
      if (resultado.sucesso) {
        setSaved(true)
        setIsEditMode(false)
        setTimeout(() => setSaved(false), 2000)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    setEspecialidade(formador.especialidade)
    setCompetencias(
      formador.competencias ? formador.competencias.split(',').map(t => t.trim()) : []
    )
    setSelectedCompetencia('')
    setCustomCompetencia('')
    setLinkedin(formador.linkedin)
    setGithub(formador.github)
    setIdioma(formador.idioma)
    setNacionalidade(formador.nacionalidade)
    setIsEditMode(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">O Meu Perfil</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {isEditMode ? 'Edite as suas informações pessoais' : 'Veja as suas informações pessoais'}
          </p>
        </div>
        {!isEditMode && (
          <Button
            onClick={() => setIsEditMode(true)}
            className="gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-600 dark:hover:bg-purple-700 dark:text-gray-100"
          >
            <Edit2 className="h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 flex flex-col gap-8">
        {/* Avatar + name */}
        <div className="flex items-center gap-5">
          <AvatarUploader
            currentImageUrl={formador.image ?? undefined}
            userName={formador.nome}
            size="md"
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{formador.nome}</span>
            <span className="text-sm text-gray-400 dark:text-gray-500">{formador.email}</span>
          </div>
        </div>

        {isEditMode ? (
          // ===== MODO EDIÇÃO =====
          <>
            {/* Especialidade */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Descrição / Bio</Label>
              <Textarea
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
                rows={4}
                className="resize-none rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-sm focus-visible:ring-purple-500"
                placeholder="Ex: Professor a 15 anos, especialista em programação web..."
              />
            </div>

            {/* Competências */}
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Competências / Skills</Label>

              <div className="flex flex-wrap gap-2">
                {competencias.map((competencia) => (
                  <span
                    key={competencia}
                    className="flex items-center gap-1.5 rounded-full border border-purple-200 dark:border-purple-800/30 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 text-sm font-medium text-purple-700 dark:text-purple-400"
                  >
                    {competencia}
                    <button
                      onClick={() => removeCompetencia(competencia)}
                      className="text-purple-400 hover:text-purple-700 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedCompetencia}
                  onChange={(e) => {
                    setSelectedCompetencia(e.target.value)
                    if (e.target.value !== 'Outro') {
                      setCustomCompetencia('')
                    }
                  }}
                  className="flex-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione uma competência</option>
                  {COMPETENCIAS.map((comp) => (
                    <option key={comp} value={comp}>
                      {comp}
                    </option>
                  ))}
                </select>
                {selectedCompetencia === 'Outro' && (
                  <Input
                    value={customCompetencia}
                    onChange={(e) => setCustomCompetencia(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetencia())}
                    placeholder="Digite a competência..."
                    className="flex-1 rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-sm focus-visible:ring-purple-500"
                  />
                )}
                <button
                  onClick={addCompetencia}
                  disabled={!selectedCompetencia || (selectedCompetencia === 'Outro' && !customCompetencia.trim())}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-600 dark:hover:text-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Idioma e Nacionalidade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Idioma Principal
                </Label>
                <select
                  value={idioma}
                  onChange={(e) => setIdioma(e.target.value)}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione um idioma</option>
                  {IDIOMAS.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Nacionalidade
                </Label>
                <select
                  value={nacionalidade}
                  onChange={(e) => setNacionalidade(e.target.value)}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecione uma nacionalidade</option>
                  {NACIONALIDADES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Redes Sociais (Opcional)</h3>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    LinkedIn
                  </Label>
                  <Input
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/seu-perfil"
                    className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-sm focus-visible:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Label>
                  <Input
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/seu-usuario"
                    className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-sm focus-visible:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-6 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {loading ? 'A guardar...' : 'Guardar Alterações'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="gap-2 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </Button>
            </div>
          </>
        ) : (
          // ===== MODO VISUALIZAÇÃO =====
          <>
            {/* Especialidade */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Descrição / Bio</Label>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {especialidade || <span className="italic text-gray-400 dark:text-gray-500">Nenhuma descrição adicionada</span>}
              </p>
            </div>

            {/* Competências */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Competências / Skills</Label>
              <div className="flex flex-wrap gap-2">
                {competencias.length > 0 ? (
                  competencias.map((competencia) => (
                    <span
                      key={competencia}
                      className="rounded-full border border-purple-200 dark:border-purple-800/30 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 text-sm font-medium text-purple-700 dark:text-purple-400"
                    >
                      {competencia}
                    </span>
                  ))
                ) : (
                  <span className="italic text-gray-400 dark:text-gray-500 text-sm">Nenhuma competência adicionada</span>
                )}
              </div>
            </div>

            {/* Idioma e Nacionalidade */}
            {(idioma || nacionalidade) && (
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200 dark:border-gray-800">
                {idioma && (
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Idioma
                    </Label>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{idioma}</p>
                  </div>
                )}
                {nacionalidade && (
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      Nacionalidade
                    </Label>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{nacionalidade}</p>
                  </div>
                )}
              </div>
            )}

            {/* Redes Sociais */}
            {(linkedin || github) && (
              <div className="flex flex-col gap-3">
                <Label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Redes Sociais</Label>
                <div className="flex gap-3">
                  {linkedin && (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span className="text-sm font-medium">LinkedIn</span>
                    </a>
                  )}
                  {github && (
                    <a
                      href={github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      <span className="text-sm font-medium">GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {saved && (
        <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg p-3">
          ✓ Perfil guardado com sucesso!
        </div>
      )}
    </div>
  )
}
