// ─── Tipos ────────────────────────────────────────────────────────────────────

export type DocStatus = 'VALIDO' | 'A_EXPIRAR' | 'EXPIRADO' | 'EM_FALTA'

// ─── Config ───────────────────────────────────────────────────────────────────

const DIAS_AVISO = 30 // avisa 30 dias antes de expirar

// ─── Funções ──────────────────────────────────────────────────────────────────

export function calcularStatus(dataValidade: Date | null): DocStatus {
    if (!dataValidade) return 'VALIDO' // sem validade = sempre válido (ex: CV, IBAN)

    const hoje = new Date()
    const diasRestantes = Math.ceil(
        (dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diasRestantes < 0) return 'EXPIRADO'
    if (diasRestantes <= DIAS_AVISO) return 'A_EXPIRAR'
    return 'VALIDO'
}

export function formatarData(data: Date | null): string | null {
    if (!data) return null
    return data.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

export function diasParaExpirar(dataValidade: Date | null): number | null {
    if (!dataValidade) return null
    const hoje = new Date()
    return Math.ceil(
        (dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    )
}