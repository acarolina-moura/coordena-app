'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function obterAulasFormador() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'FORMADOR') {
      throw new Error('Não autorizado');
    }

    const formador = await prisma.formador.findUnique({
      where: { userId: session.user.id },
      include: {
        user: true,
        aulas: {
          include: {
            modulo: true,
          },
          orderBy: { dataHora: 'asc' },
        },
      },
    });

    if (!formador) {
      return { success: true, aulas: [], message: 'Formador não encontrado' };
    }

    return {
      success: true,
      aulas: formador.aulas.map((aula) => {
        const horas = Math.floor(aula.duracao / 60);
        const minutos = aula.duracao % 60;
        let durationStr = '';
        if (horas > 0) durationStr += `${horas}h`;
        if (minutos > 0) durationStr += `${minutos}m`;
        if (!durationStr) durationStr = '0m';
        
        const timeStr = aula.dataHora.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
        return {
          id: aula.id,
          titulo: aula.titulo,
          formador: formador.user.nome,
          data: aula.dataHora.toISOString().split('T')[0],
          horaInicio: timeStr,
          duracao: durationStr,
          durationMinutes: aula.duracao,
          ufcd: aula.modulo.nome,
          cor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        };
      }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao obter aulas:', message);
    return { success: false, error: message, aulas: [] };
  }
}

/**
 * Obter alunos inscritos num módulo com status de presença para uma aula
 */
export async function obterAlunosComPresenca(aulaId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'FORMADOR') {
      throw new Error('Não autorizado');
    }

    const aula = await prisma.aula.findUnique({
      where: { id: aulaId },
      include: {
        modulo: {
          include: {
            curso: {
              include: {
                inscricoes: {
                  include: {
                    formando: {
                      include: {
                        user: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!aula) {
      return { success: false, error: 'Aula não encontrada', alunos: [] };
    }

    // Para cada aluno inscrito no curso, obter status de presença nesta aula
    const alunos = await Promise.all(
      aula.modulo.curso.inscricoes.map(async (insc) => {
        const presenca = await prisma.presenca.findFirst({
          where: {
            aulaId: aulaId,
            formandoId: insc.formando.id,
          },
        });

        return {
          id: insc.formando.id,
          nome: insc.formando.user.nome,
          status: presenca?.status || 'AUSENTE',
        };
      })
    );

    return {
      success: true,
      alunos: alunos.sort((a, b) => a.nome.localeCompare(b.nome)),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao obter alunos:', message);
    return { success: false, error: message, alunos: [] };
  }
}

/**
 * Guardar presença de um aluno numa aula
 */
export async function guardarPresenca(
  aulaId: string,
  formandoId: string,
  status: 'PRESENTE' | 'AUSENTE' | 'JUSTIFICADO'
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'FORMADOR') {
      throw new Error('Não autorizado');
    }

    const formador = await prisma.formador.findUnique({
      where: { userId: session.user.id },
    });

    if (!formador) {
      throw new Error('Formador não encontrado');
    }

    const aula = await prisma.aula.findUnique({
      where: { id: aulaId },
    });

    if (!aula || aula.formadorId !== formador.id) {
      throw new Error('Aula não pertence ao formador');
    }

    // Verificar se presença já existe
    const presencaExistente = await prisma.presenca.findFirst({
      where: {
        aulaId: aulaId,
        formandoId: formandoId,
      },
    });

    if (presencaExistente) {
      // Atualizar presença existente
      await prisma.presenca.update({
        where: { id: presencaExistente.id },
        data: { status },
      });
    } else {
      // Criar nova presença
      await prisma.presenca.create({
        data: {
          aulaId: aulaId,
          formandoId: formandoId,
          formadorId: formador.id,
          status,
        },
      });
    }

    return { success: true, message: 'Presença guardada' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao guardar presença:', message);
    return { success: false, error: message };
  }
}
