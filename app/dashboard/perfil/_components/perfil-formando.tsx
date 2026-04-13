'use client'

import { useState } from 'react'
import { Save, Edit2, User, Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateFormandoPerfil } from '../actions-formando'
import { AvatarUploader } from '@/components/avatar-uploader'

interface FormandoData {
  id: string
  nome: string
  email: string
  image?: string | null
}

export function PerfilFormando({ formando }: { formando: FormandoData }) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [nome, setNome] = useState(formando.nome)
  const [email, setEmail] = useState(formando.email)
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro', texto: string } | null>(null)

  async function handleSave() {
    if (novaSenha !== confirmarSenha) {
      setMensagem({ tipo: 'erro', texto: 'As senhas não coincidem.' })
      return
    }

    setLoading(true)
    setMensagem(null)
    
    try {
      const resultado = await updateFormandoPerfil(
        formando.id,
        nome,
        email,
        novaSenha || undefined
      )
      
      if (resultado.sucesso) {
        setMensagem({ tipo: 'sucesso', texto: resultado.mensagem })
        setIsEditMode(false)
        setNovaSenha('')
        setConfirmarSenha('')
      } else {
        setMensagem({ tipo: 'erro', texto: resultado.mensagem })
      }
    } catch (_error) {
      setMensagem({ tipo: 'erro', texto: 'Ocorreu um erro inesperado.' })
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    setNome(formando.nome)
    setEmail(formando.email)
    setNovaSenha('')
    setConfirmarSenha('')
    setIsEditMode(false)
    setMensagem(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100">O Meu Perfil</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {isEditMode ? 'Edite as suas informações de conta' : 'Veja as suas informações de conta'}
          </p>
        </div>
        {!isEditMode && (
          <Button
            onClick={() => setIsEditMode(true)}
            className="gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Edit2 className="h-4 w-4" />
            Editar Perfil
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 flex flex-col gap-8 shadow-sm">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <AvatarUploader
            currentImageUrl={formando.image ?? undefined}
            userName={nome}
            size="lg"
          />
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{nome}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              {email}
            </p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 w-fit mt-1">
              Formando
            </span>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Nome Input */}
          <div className="grid gap-2">
            <Label htmlFor="nome" className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <User className="h-4 w-4 text-teal-500" />
              Nome Completo
            </Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={!isEditMode}
              className="rounded-xl border-gray-200 focus:ring-teal-500"
            />
          </div>

          {/* Email Input */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Mail className="h-4 w-4 text-teal-500" />
              Endereço de Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isEditMode}
              className="rounded-xl border-gray-200 focus:ring-teal-500"
            />
          </div>

          {isEditMode && (
            <div className="grid gap-6 pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 border-l-4 border-teal-500 pl-3">Alterar Senha (Opcional)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="novaSenha" className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-teal-500" />
                    Nova Senha
                  </Label>
                  <Input
                    id="novaSenha"
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="••••••••"
                    className="rounded-xl border-gray-200 focus:ring-teal-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmarSenha" className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-teal-500" />
                    Confirmar Senha
                  </Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    placeholder="••••••••"
                    className="rounded-xl border-gray-200 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {isEditMode && (
          <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white min-w-[140px]"
            >
              <Save className="h-4 w-4" />
              {loading ? 'A guardar...' : 'Guardar Alterações'}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {mensagem && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
          mensagem.tipo === 'sucesso' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <span className="text-lg">{mensagem.tipo === 'sucesso' ? '✓' : '⚠️'}</span>
          <span className="text-sm font-medium">{mensagem.texto}</span>
        </div>
      )}
    </div>
  )
}
