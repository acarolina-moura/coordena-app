'use client'

import { useState, useRef } from 'react'
import { Camera, Plus, X, Save, Edit2, Linkedin, Github, Globe, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateFormadorPerfil } from '@/app/dashboard/perfil/actions'

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

export function PerfilClient({ formador }: { formador: FormadorData }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [especialidade, setEspecialidade] = useState(formador.especialidade)
  const [newCompetencia, setNewCompetencia] = useState('')
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
    const c = newCompetencia.trim()
    if (c && !competencias.includes(c)) {
      setCompetencias((prev) => [...prev, c])
    }
    setNewCompetencia('')
  }

  function removeCompetencia(competencia: string) {
    setCompetencias((prev) => prev.filter((t) => t !== competencia))
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    // TODO: Futura implementação de upload
    console.log('📸 Ficheiro selecionado:', file.name, file.type, file.size)
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
    setNewCompetencia('')
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
          <h1 className="text-[26px] font-bold text-gray-900">O Meu Perfil</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {isEditMode ? 'Edite as suas informações pessoais' : 'Veja as suas informações pessoais'}
          </p>
        </div>
        {!isEditMode && (
          <Button
            onClick={() => setIsEditMode(true)}
            className="gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Edit2 className="h-4 w-4" />
            Editar
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 flex flex-col gap-8">
        {/* Avatar + name */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar className="h-20 w-20 border-2 border-gray-100">
              <AvatarImage src={`https://i.pravatar.cc/150?u=${formador.email}`} />
              <AvatarFallback className="bg-purple-100 text-purple-600 text-xl font-bold">
                {formador.nome.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            {isEditMode && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  aria-label="Selecionar imagem de perfil"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-white shadow-md hover:bg-purple-700 transition-colors"
                  title="Clique para escolher uma imagem"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-lg font-bold text-gray-900">{formador.nome}</span>
            <span className="text-sm text-gray-400">{formador.email}</span>
          </div>
        </div>

        {isEditMode ? (
          // ===== MODO EDIÇÃO =====
          <>
            {/* Especialidade */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold text-gray-700">Descrição / Bio</Label>
              <Textarea
                value={especialidade}
                onChange={(e) => setEspecialidade(e.target.value)}
                rows={4}
                className="resize-none rounded-xl border-gray-200 text-sm focus-visible:ring-purple-500"
                placeholder="Ex: Professor a 15 anos, especialista em programação web..."
              />
            </div>

            {/* Competências */}
            <div className="flex flex-col gap-3">
              <Label className="text-sm font-semibold text-gray-700">Competências / Skills</Label>

              <div className="flex flex-wrap gap-2">
                {competencias.map((competencia) => (
                  <span
                    key={competencia}
                    className="flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700"
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
                <Input
                  value={newCompetencia}
                  onChange={(e) => setNewCompetencia(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCompetencia())}
                  placeholder="Ex: Python, SQL, etc..."
                  className="rounded-xl border-gray-200 text-sm focus-visible:ring-purple-500"
                />
                <button
                  onClick={addCompetencia}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Idioma e Nacionalidade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Idioma Principal
                </Label>
                <select
                  value={idioma}
                  onChange={(e) => setIdioma(e.target.value)}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Nacionalidade
                </Label>
                <select
                  value={nacionalidade}
                  onChange={(e) => setNacionalidade(e.target.value)}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Redes Sociais (Opcional)</h3>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-600" />
                    LinkedIn
                  </Label>
                  <Input
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/seu-perfil"
                    className="rounded-xl border-gray-200 text-sm focus-visible:ring-blue-500"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </Label>
                  <Input
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="https://github.com/seu-usuario"
                    className="rounded-xl border-gray-200 text-sm focus-visible:ring-purple-500"
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
              <Label className="text-xs font-semibold text-gray-500 uppercase">Descrição / Bio</Label>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {especialidade || <span className="italic text-gray-400">Nenhuma descrição adicionada</span>}
              </p>
            </div>

            {/* Competências */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase">Competências / Skills</Label>
              <div className="flex flex-wrap gap-2">
                {competencias.length > 0 ? (
                  competencias.map((competencia) => (
                    <span
                      key={competencia}
                      className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-700"
                    >
                      {competencia}
                    </span>
                  ))
                ) : (
                  <span className="italic text-gray-400 text-sm">Nenhuma competência adicionada</span>
                )}
              </div>
            </div>

            {/* Idioma e Nacionalidade */}
            {(idioma || nacionalidade) && (
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200">
                {idioma && (
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Idioma
                    </Label>
                    <p className="text-sm text-gray-700">{idioma}</p>
                  </div>
                )}
                {nacionalidade && (
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      Nacionalidade
                    </Label>
                    <p className="text-sm text-gray-700">{nacionalidade}</p>
                  </div>
                )}
              </div>
            )}

            {/* Redes Sociais */}
            {(linkedin || github) && (
              <div className="flex flex-col gap-3">
                <Label className="text-xs font-semibold text-gray-500 uppercase">Redes Sociais</Label>
                <div className="flex gap-3">
                  {linkedin && (
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
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
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-200 border border-gray-300 text-gray-700 hover:bg-gray-300 transition-colors"
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
        <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
          ✓ Perfil guardado com sucesso!
        </div>
      )}
    </div>
  )
}
