import { useMemo, useState } from "react"
import {
  GitBranch,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react"
import { useChannelAttribution } from "@/hooks/use-channel-attribution"
import { CHANNEL_MACROS } from "@/lib/channel-taxonomy"
import type { AdChannelMappingRow } from "@/types/ad-channel-mapping"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { formatDateTime } from "@/lib/format"
import { cn } from "@/lib/utils"

const MACRO_FILTER_ALL = "__all__"
const NEW_MACRO_SENTINEL = "__new__"

export function ParametrosCanalesPage() {
  const {
    mappings,
    revision,
    updatedAt,
    createMapping,
    updateMapping,
    deleteMapping,
    resetToSeed,
  } = useChannelAttribution()

  // ── Filter ──────────────────────────────────────────────────────────────────
  const [macroFilter, setMacroFilter] = useState<string>(MACRO_FILTER_ALL)

  // ── Form dialog ─────────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdChannelMappingRow | null>(null)
  const [formMacro, setFormMacro] = useState<string>(CHANNEL_MACROS[0]!)
  const [formDet, setFormDet] = useState("")
  const [formError, setFormError] = useState<string | null>(null)

  // ── New canal macro mini-dialog ──────────────────────────────────────────────
  const [newMacroDialogOpen, setNewMacroDialogOpen] = useState(false)
  const [newMacroName, setNewMacroName] = useState("")
  const [newMacroError, setNewMacroError] = useState<string | null>(null)
  const [customMacros, setCustomMacros] = useState<string[]>([])

  // ── Delete confirm ───────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<AdChannelMappingRow | null>(null)

  // All available macros = built-in + user-created
  const allMacros = useMemo(
    () => [...CHANNEL_MACROS, ...customMacros],
    [customMacros]
  )

  const filtered = useMemo(
    () =>
      [...mappings]
        .filter((row) =>
          macroFilter === MACRO_FILTER_ALL ? true : row.canal_macro === macroFilter
        )
        .sort((a, b) => `${a.canal_macro}${a.canal_detallado}`.localeCompare(`${b.canal_macro}${b.canal_detallado}`)),
    [mappings, macroFilter, revision]
  )

  function openCreate() {
    setEditing(null)
    setFormMacro(allMacros[0]!)
    setFormDet("")
    setFormError(null)
    setDialogOpen(true)
  }

  function openEdit(row: AdChannelMappingRow) {
    setEditing(row)
    setFormMacro(row.canal_macro)
    setFormDet(row.canal_detallado)
    setFormError(null)
    setDialogOpen(true)
  }

  function handleSave() {
    setFormError(null)
    if (editing) {
      const res = updateMapping({ row_id: editing.row_id, canal_macro: formMacro, canal_detallado: formDet })
      if (res.ok === false) setFormError(res.error)
      else setDialogOpen(false)
    } else {
      const res = createMapping({ canal_macro: formMacro, canal_detallado: formDet })
      if (res.ok === false) setFormError(res.error)
      else setDialogOpen(false)
    }
  }

  function handleMacroSelectChange(val: string) {
    if (val === NEW_MACRO_SENTINEL) {
      setNewMacroName("")
      setNewMacroError(null)
      setNewMacroDialogOpen(true)
    } else {
      setFormMacro(val)
    }
  }

  function handleCreateNewMacro() {
    const name = newMacroName.trim()
    if (!name) { setNewMacroError("El nombre no puede estar vacío."); return }
    if (allMacros.map(m => m.toLowerCase()).includes(name.toLowerCase())) {
      setNewMacroError("Ya existe un canal con ese nombre.")
      return
    }
    setCustomMacros((prev) => [...prev, name])
    setFormMacro(name)
    setNewMacroDialogOpen(false)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Parámetros de canales
            </h1>
            <Badge variant="secondary" className="font-mono text-xs">
              rev {revision}
            </Badge>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground text-pretty">
            Define pares de <span className="font-medium">canal global</span> y{" "}
            <span className="font-medium">canal detallado</span> para la atribución
            de gasto publicitario en resumen y marketing.
          </p>
          <p className="text-xs text-muted-foreground">
            Última actualización:{" "}
            <span className="font-medium text-foreground">{formatDateTime(updatedAt)}</span>
          </p>
        </div>
        <Card className="w-full shrink-0 border-primary/15 bg-primary/5 lg:max-w-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <GitBranch className="size-4 text-primary" />
              <CardTitle className="text-sm font-medium">Impacto en el panel</CardTitle>
            </div>
            <CardDescription className="text-xs leading-relaxed">
              Al guardar, los gráficos y tablas que agrupan inversión por canal
              se recalculan al instante usando estos mapeos.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Table card */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="gap-4 space-y-0 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
              <div className="grid w-full gap-2 sm:w-52">
                <Label htmlFor="filter-macro">Canal global</Label>
                <Select value={macroFilter} onValueChange={setMacroFilter}>
                  <SelectTrigger id="filter-macro" className="h-9 w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MACRO_FILTER_ALL}>Todos</SelectItem>
                    {allMacros.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={openCreate} className="gap-1.5">
                <Plus className="size-4" />
                Nuevo mapeo
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-1.5"
                onClick={() => resetToSeed()}
              >
                <RotateCcw className="size-4" />
                Restaurar catálogo
              </Button>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4">
          <div className="overflow-hidden rounded-lg border border-border/60">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="font-semibold pl-4">Canal global</TableHead>
                  <TableHead className="font-semibold">Canal detallado</TableHead>
                  <TableHead className="w-[100px] text-right font-semibold pr-4">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-16 text-center text-sm text-muted-foreground">
                      No hay mapeos que coincidan con el filtro.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow key={row.row_id} className="transition-colors hover:bg-muted/30">
                      <TableCell className="pl-4 font-medium">{row.canal_macro}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {row.canal_detallado}
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={`Editar ${row.canal_macro} · ${row.canal_detallado}`}
                            onClick={() => openEdit(row)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            aria-label={`Eliminar ${row.canal_macro} · ${row.canal_detallado}`}
                            onClick={() => setDeleteTarget(row)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {filtered.length} de {mappings.length} mapeo(s)
          </p>
        </CardContent>
      </Card>

      {/* ── Create / Edit dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar mapeo" : "Nuevo mapeo"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Modifica la asignación de canales."
                : "Define un par de canal global y canal detallado."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {/* Canal global selector */}
            <div className="grid gap-2">
              <Label>Canal global</Label>
              <Select value={formMacro} onValueChange={handleMacroSelectChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {allMacros.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                  <Separator className="my-1" />
                  <SelectItem
                    value={NEW_MACRO_SENTINEL}
                    className={cn("text-primary font-medium gap-2")}
                  >
                    <Plus className="size-3.5 inline mr-1" />
                    Nuevo canal global…
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Canal detallado free-text input */}
            <div className="grid gap-2">
              <Label htmlFor="dlg-det">Canal detallado</Label>
              <Input
                id="dlg-det"
                value={formDet}
                onChange={(e) => setFormDet(e.target.value)}
                placeholder="p. ej. wsp, TB13, 12024381…"
                className="font-mono"
                autoComplete="off"
              />
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave}>
              {editing ? "Guardar cambios" : "Crear mapeo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── New canal macro mini-dialog ── */}
      <Dialog open={newMacroDialogOpen} onOpenChange={setNewMacroDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nuevo canal global</DialogTitle>
            <DialogDescription>
              Escribe el nombre del nuevo canal global que quieres añadir.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <Label htmlFor="new-macro-input">Nombre</Label>
            <Input
              id="new-macro-input"
              value={newMacroName}
              onChange={(e) => { setNewMacroName(e.target.value); setNewMacroError(null) }}
              placeholder="p. ej. TikTok, WhatsApp…"
              onKeyDown={(e) => { if (e.key === "Enter") handleCreateNewMacro() }}
              autoFocus
            />
            {newMacroError && <p className="text-sm text-destructive">{newMacroError}</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setNewMacroDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreateNewMacro}>
              Crear canal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar mapeo</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará el mapeo{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.canal_macro} · {deleteTarget?.canal_detallado}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteTarget) deleteMapping(deleteTarget.row_id); setDeleteTarget(null) }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
