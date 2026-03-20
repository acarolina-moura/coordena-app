'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Guardar disponibilidades do formador
 * 
 * @param slots - Objeto com disponibilidades por dia e hora
 * Formato: { "09:00-Segunda": true/false, ... }
 */
export async function salvarDisponibilidades(
  slots: Record<string, boolean>
) {
  try {
    const session = await auth();
    if (!session?.user?.email || session.user.role !== 'FORMADOR') {
      throw new Error('Não autorizado');
    }

    // Buscar formador
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { formador: true },
    });

    if (!user?.formador) {
      throw new Error('Formador não encontrado');
    }

    // Limpar disponibilidades antigas
    await prisma.disponibilidade.deleteMany({
      where: { formadorId: user.formador.id },
    });

    // Inserir novas disponibilidades
    const disponibilidades = Object.entries(slots)
      .filter(([, isAvailable]) => isAvailable)
      .map(([key]) => {
        const [time, day] = key.split('-');
        const [hora, minuto] = time.split(':').map(Number);
        
        return {
          id: crypto.randomUUID(),
          formadorId: user.formador.id,
          diaSemana: day,
          hora,
          minuto,
          disponivel: true,
        };
      });

    if (disponibilidades.length > 0) {
      await prisma.disponibilidade.createMany({
        data: disponibilidades,
      });
    }

    revalidatePath('/dashboard/disponibilidades');
    return { success: true, total: disponibilidades.length };
  } catch (error) {
    console.error('Erro ao guardar disponibilidades:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao guardar'
    };
  }
}

/**
 * Carregar disponibilidades do formador autenticado
 */
export async function carregarDisponibilidades() {
  try {
    const session = await auth();
    if (!session?.user?.email || session.user.role !== 'FORMADOR') {
      throw new Error('Não autorizado');
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { formador: true },
    });

    if (!user?.formador) {
      throw new Error('Formador não encontrado');
    }

    const disponibilidades = await prisma.disponibilidade.findMany({
      where: { 
        formadorId: user.formador.id,
        disponivel: true,
      },
    });

    // Converter para formato de slots { "09:00-Segunda": true, ... }
    const slots: Record<string, boolean> = {};
    
    disponibilidades.forEach((disp) => {
      const hora = String(disp.hora).padStart(2, '0');
      const minuto = String(disp.minuto).padStart(2, '0');
      const key = `${hora}:${minuto}-${disp.diaSemana}`;
      slots[key] = true;
    });

    return { success: true, slots };
  } catch (error) {
    console.error('Erro ao carregar disponibilidades:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao carregar'
    };
  }
}
