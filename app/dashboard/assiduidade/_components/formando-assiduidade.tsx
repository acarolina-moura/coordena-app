"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AlertTriangle, BookOpen, CheckCircle, XCircle } from "lucide-react";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
type EstadoPresenca = "presente" | "falta" | "justificada";

interface RegistoAula {
    id: number;
    data: string;
    disciplina: string;
    estado: EstadoPresenca;
}

interface ResumoMes {
    mes: string;
    presencas: number;
    faltas: number;
}

// ---------------------------------------------------------------------------
// Dados mockados — substituir por chamada à API quando estiver pronta
// ---------------------------------------------------------------------------

const REGISTOS: RegistoAula[] = [
    { id: 1, data: "03/03/2025", disciplina: "Matemática", estado: "presente" },
    { id: 2, data: "04/03/2025", disciplina: "Português", estado: "presente" },
    { id: 3, data: "05/03/2025", disciplina: "História", estado: "falta" },
    { id: 4, data: "06/03/2025", disciplina: "Ciências", estado: "presente" },
    { id: 5, data: "07/03/2025", disciplina: "Educação Física", estado: "justificada" },
    { id: 6, data: "10/03/2025", disciplina: "Matemática", estado: "presente" },
    { id: 7, data: "11/03/2025", disciplina: "Português", estado: "falta" },
    { id: 8, data: "12/03/2025", disciplina: "Geografia", estado: "presente" },
    { id: 9, data: "13/03/2025", disciplina: "Inglês", estado: "presente" },
    { id: 10, data: "14/03/2025", disciplina: "Ciências", estado: "falta" },
];

const RESUMO_MENSAL: ResumoMes[] = [
    { mes: "Jan", presencas: 18, faltas: 2 },
    { mes: "Fev", presencas: 15, faltas: 5 },
    { mes: "Mar", presencas: 7, faltas: 3 },
];

const TOTAL_AULAS = REGISTOS.length;
const TOTAL_PRESENCAS = REGISTOS.filter((r) => r.estado === "presente").length;
const TOTAL_FALTAS = REGISTOS.filter((r) => r.estado === "falta").length;
const PERCENTAGEM = Math.round((TOTAL_PRESENCAS / TOTAL_AULAS) * 100);
const LIMITE_RISCO = 75; // % mínima exigida

// ---------------------------------------------------------------------------
// Sub-componentes auxiliares
// ---------------------------------------------------------------------------
function BadgeEstado({ estado }: { estado: EstadoPresenca }) {
    if (estado === "presente")
        return (
            <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                <CheckCircle className="w-3 h-3" /> Presente
            </Badge>
        );
    if (estado === "justificada")
        return (
            <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 gap-1">
                <AlertTriangle className="w-3 h-3" /> Justificada
            </Badge>
        );
    return (
        <Badge className="bg-red-100 text-red-700 border-red-200 gap-1">
            <XCircle className="w-3 h-3" /> Falta
        </Badge>
    );
}

function BarraProgresso({ valor, max }: { valor: number; max: number }) {
    const pct = Math.min(100, Math.round((valor / max) * 100));
    const cor =
        pct >= 80 ? "bg-green-500" : pct >= LIMITE_RISCO ? "bg-yellow-500" : "bg-red-500";
    return (
        <div className="w-full bg-muted rounded-full h-2 mt-1">
            <div className={`${cor} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
        </div>
    );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export function FormandoAssiduidade() {
    const emRisco = PERCENTAGEM < LIMITE_RISCO;

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-bold tracking-tight">Minha Assiduidade</h1>

            {/* Alerta de risco */}
            {emRisco && (
                <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <p className="text-sm font-medium">
                        A sua taxa de presenças está abaixo do mínimo exigido ({LIMITE_RISCO}%). Entre em
                        contacto com a escola.
                    </p>
                </div>
            )}

            {/* Cards de resumo */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm text-muted-foreground font-normal">
                            Taxa de Presenças
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-3xl font-bold ${emRisco ? "text-red-600" : "text-green-600"}`}>
                            {PERCENTAGEM}%
                        </p>
                        <BarraProgresso valor={PERCENTAGEM} max={100} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm text-muted-foreground font-normal">Presenças</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600">{TOTAL_PRESENCAS}</p>
                        <p className="text-xs text-muted-foreground mt-1">de {TOTAL_AULAS} aulas</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-1">
                        <CardTitle className="text-sm text-muted-foreground font-normal">Faltas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-red-500">{TOTAL_FALTAS}</p>
                        <p className="text-xs text-muted-foreground mt-1">registadas este período</p>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico de barras por mês (CSS puro) */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Assiduidade por Mês</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-6">
                        {RESUMO_MENSAL.map((m) => {
                            const total = m.presencas + m.faltas;
                            const pctP = Math.round((m.presencas / total) * 100);
                            return (
                                <div key={m.mes} className="flex flex-col items-center gap-1 flex-1">
                                    <div className="w-full flex flex-col items-center gap-0.5">
                                        <span className="text-xs text-muted-foreground">{pctP}%</span>
                                        <div className="w-full rounded overflow-hidden bg-muted h-24 flex flex-col-reverse">
                                            <div
                                                className="bg-green-500 w-full transition-all"
                                                style={{ height: `${pctP}%` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium">{m.mes}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {m.presencas}P / {m.faltas}F
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Tabela de registos */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Registo de Aulas
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Disciplina</TableHead>
                                <TableHead>Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {REGISTOS.map((registo) => (
                                <TableRow key={registo.id}>
                                    <TableCell className="text-muted-foreground">{registo.data}</TableCell>
                                    <TableCell className="font-medium">{registo.disciplina}</TableCell>
                                    <TableCell>
                                        <BadgeEstado estado={registo.estado} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}