import { useMemo, useState } from "react"
import type { DateRange } from "react-day-picker"
import {
  GitBranch,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react"
import { useChannelAttribution } from "@/hooks/use-channel-attribution"
import {
  CHANNEL_MACROS,
  detalladosForMacro,
  normalizePair,
} from "@/lib/channel-taxonomy"
import type { ChannelDetallado, ChannelMacro } from "@/types/analytics"
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
import { mockAdSpend } from "@/data/ads"
import { DateRangePicker } from "@/components/ui/date-picker"
import {
  defaultDateRange,
  filterByStrictRange,
  strictRangeFromDateRange,
} from "@/lib/date-range"

const MACRO_FILTER_ALL = "__all__"

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

  const [macroFilter, setMacroFilter] = useState<string>(MACRO_FILTER_ALL)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<AdChannelMappingRow | null>(null)
  const [formAdId, setFormAdId] = useState("")
  const [formMacro, setFormMacro] = useState<ChannelMacro>("Paid Social")
  const [formDet, setFormDet] = useState<ChannelDetallado>("Meta Ads")
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdChannelMappingRow | null>(
    null
  )
  const dr0 = defaultDateRange()
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: dr0.from,
    to: dr0.to,
  })
  const strictRange = useMemo(
    () => strictRangeFromDateRange(dateRange),
    [dateRange],
  )

  const adIdsWithSpendInRange = useMemo(() => {
    const ads = filterByStrictRange(mockAdSpend, strictRange)
    return new Set(ads.map((a) => a.ad_id))
  }, [strictRange])

  const filtered = useMemo(() => {
    return [...mappings]
      .filter((row) => {
        const existsInSpend = mockAdSpend.some((a) => a.ad_id === row.ad_id)
        if (existsInSpend && !adIdsWithSpendInRange.has(row.ad_id)) {
          return false
        }
        if (macroFilter !== MACRO_FILTER_ALL && row.canal_macro !== macroFilter)
          return false
        return true
      })
      .sort((a, b) => a.ad_id.localeCompare(b.ad_id))
  }, [mappings, macroFilter, adIdsWithSpendInRange])

  function openCreate() {
    setEditing(null)
    setFormAdId("")
    setFormMacro("Paid Social")
    setFormDet("Meta Ads")
    setFormError(null)
    setDialogOpen(true)
  }

  function openEdit(row: AdChannelMappingRow) {
    setEditing(row)
    setFormAdId(row.ad_id)
    setFormMacro(row.canal_macro)
    setFormDet(row.canal_detallado)
    setFormError(null)
    setDialogOpen(true)
  }

  function handleSave() {
    setFormError(null)
    const pair = normalizePair(formMacro, formDet)
    if (editing) {
      const res = updateMapping({
        row_id: editing.row_id,
        canal_macro: pair.canal_macro,
        canal_detallado: pair.canal_detallado,
      })
      if (res.ok === false) setFormError(res.error)
      else setDialogOpen(false)
      return
    }
    const res = createMapping({
      ad_id: formAdId,
      canal_macro: pair.canal_macro,
      canal_detallado: pair.canal_detallado,
    })
    if (res.ok === false) setFormError(res.error)
    else setDialogOpen(false)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
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
            Define cómo cada <span className="font-medium">ad_id</span> se
            atribuye a <span className="font-medium">canal macro</span> y{" "}
            <span className="font-medium">canal detallado</span>. Esta capa es
            la fuente de verdad para el gasto publicitario en resumen y
            marketing.
          </p>
          <p className="text-xs text-muted-foreground">
            Última actualización del modelo:{" "}
            <span className="font-medium text-foreground">
              {formatDateTime(updatedAt)}
            </span>
          </p>
        </div>
        <Card className="w-full shrink-0 border-primary/15 bg-primary/5 lg:max-w-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <GitBranch className="size-4 text-primary" />
              <CardTitle className="text-sm font-medium">
                Impacto en el panel
              </CardTitle>
            </div>
            <CardDescription className="text-xs leading-relaxed">
              Al guardar, los gráficos y tablas que agrupan inversión por canal
              se recalculan al instante usando estos mapeos (simulación con
              datos mock).
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="gap-4 space-y-0 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
              <div className="grid w-full min-w-0 gap-2 sm:max-w-[min(100%,320px)]">
                <Label>Fechas (gasto con actividad)</Label>
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  className="w-full"
                  numberOfMonths={2}
                />
              </div>
              {/* <div className="grid w-full min-w-0 flex-1 gap-2 sm:max-w-xs">
                <Label htmlFor="search-ad">Buscar</Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="search-ad"
                    placeholder="ad_id o canal…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="h-9 pl-9"
                  />
                </div>
              </div> */}
              <div className="grid w-full gap-2 sm:w-52">
                <Label htmlFor="filter-macro">Canal macro</Label>
                <Select value={macroFilter} onValueChange={setMacroFilter}>
                  <SelectTrigger id="filter-macro" className="h-9 w-full">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MACRO_FILTER_ALL}>Todos</SelectItem>
                    {CHANNEL_MACROS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
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
                  <TableHead className="font-semibold">ad_id</TableHead>
                  <TableHead className="font-semibold">canal_macro</TableHead>
                  <TableHead className="font-semibold">canal_detallado</TableHead>
                  <TableHead className="w-[120px] text-right font-semibold">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-16 text-center text-sm text-muted-foreground"
                    >
                      No hay mapeos que coincidan con los filtros.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row) => (
                    <TableRow
                      key={row.row_id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="font-mono text-xs font-medium md:text-sm">
                        {row.ad_id}
                      </TableCell>
                      <TableCell>{row.canal_macro}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.canal_detallado}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={`Editar mapeo ${row.ad_id}`}
                            onClick={() => openEdit(row)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:text-destructive"
                            aria-label={`Eliminar mapeo ${row.ad_id}`}
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
            {filtered.length} de {mappings.length} mapeo(s) · Los pedidos y
            leads siguen usando su propia dimensión; el gasto de anuncios usa
            esta tabla.
          </p>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar mapeo" : "Nuevo mapeo"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Modifica la asignación de canales para este ad_id."
                : "Crea una regla de atribución. El ad_id debe ser único."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="dlg-ad-id">ad_id</Label>
              <Input
                id="dlg-ad-id"
                value={formAdId}
                onChange={(e) => setFormAdId(e.target.value)}
                disabled={!!editing}
                placeholder="p. ej. AD-03"
                className="font-mono"
              />
              {editing ? (
                <p className="text-[11px] text-muted-foreground">
                  El identificador no se puede cambiar desde aquí. Elimina y
                  vuelve a crear si necesitas otro ad_id.
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label>canal_macro</Label>
              <Select
                value={formMacro}
                onValueChange={(v) => {
                  const macro = v as ChannelMacro
                  setFormMacro(macro)
                  const dets = detalladosForMacro(macro)
                  setFormDet(dets[0] as ChannelDetallado)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANNEL_MACROS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>canal_detallado</Label>
              <Select
                value={formDet}
                onValueChange={(v) => setFormDet(v as ChannelDetallado)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {detalladosForMacro(formMacro).map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formError ? (
              <p className="text-sm text-destructive">{formError}</p>
            ) : null}
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

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar mapeo</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la regla para{" "}
              <span className="font-mono font-medium text-foreground">
                {deleteTarget?.ad_id}
              </span>
              . El anuncio volverá a atribuirse con los canales del dataset de
              origen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteMapping(deleteTarget.row_id)
                setDeleteTarget(null)
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
