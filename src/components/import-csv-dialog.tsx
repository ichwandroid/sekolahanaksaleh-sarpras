"use client"

import { useState, useRef, useCallback } from "react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import pb from "@/lib/pocketbase"
import { toast } from "sonner"
import { Upload, FileSpreadsheet, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

type CollectionType = "barang" | "arkas"

interface UploadPageProps {
  collection: CollectionType
  onSuccess?: () => void
}

interface PreviewRow {
  [key: string]: string | number | null
}

interface UploadResult {
  success: number
  failed: number
  errors: string[]
}

/**
 * Detects dd-mm-yyyy or dd/mm/yyyy patterns and converts to yyyy-mm-dd (ISO date)
 * which PocketBase's date/datetime field accepts.
 */
function normalizeDate(value: string): string {
  // Match dd-mm-yyyy or dd/mm/yyyy
  const match = String(value).match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/)
  if (match) {
    const [, day, month, year] = match
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")} 00:00:00.000Z`
  }
  return value
}

/** Normalize all fields whose key contains "tanggal" or "date" */
function normalizeRow(row: PreviewRow, collection?: CollectionType): PreviewRow {
  const result: PreviewRow = {}
  for (const key of Object.keys(row)) {
    const val = row[key]
    if (typeof val === "string" && (key.includes("tanggal") || key.includes("date"))) {
      result[key] = normalizeDate(val)
    } else {
      result[key] = val
    }
  }

  // Calculate realisasi if it's arkas and fields are present
  if (collection === "arkas") {
    const qty = Number(result["jumlah_barang"] || result["jumlah"] || 0)
    const price = Number(result["harga_satuan"] || 0)
    if (!isNaN(qty) && !isNaN(price)) {
      result["realisasi"] = qty * price
    }
  }

  return result
}

export function ImportCsvDialog({ collection, onSuccess }: UploadPageProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<PreviewRow[]>([])
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setFile(null)
    setHeaders([])
    setRows([])
    setResult(null)
  }

  const parseFile = useCallback((f: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const wb = XLSX.read(data, { type: "binary" })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const json: PreviewRow[] = XLSX.utils.sheet_to_json(sheet, { defval: "" })
        if (json.length === 0) {
          toast.error("File kosong atau format tidak dikenali.")
          return
        }
        setHeaders(Object.keys(json[0]))
        setRows(json)
        setFile(f)
      } catch {
        toast.error("Gagal membaca file. Pastikan format CSV atau Excel yang valid.")
      }
    }
    reader.readAsBinaryString(f)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) parseFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) parseFile(f)
  }

  async function handleImport() {
    if (rows.length === 0) return
    setUploading(true)
    const res: UploadResult = { success: 0, failed: 0, errors: [] }

    for (let i = 0; i < rows.length; i++) {
      try {
        await pb.collection(collection).create(normalizeRow(rows[i], collection))
        res.success++
      } catch (err: any) {
        res.failed++
        res.errors.push(`Baris ${i + 2}: ${err.message}`)
      }
    }

    setResult(res)
    setUploading(false)
    if (res.success > 0) {
      onSuccess?.()
    }
  }

  const handleClose = () => {
    if (!uploading) {
      setOpen(false)
      setTimeout(reset, 300)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Import Data
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Import Data dari File</DialogTitle>
            <DialogDescription>
              Unggah file .csv, .xlsx, atau .xls dengan header kolom sesuai database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Drop zone */}
            {!file && !result && (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors
                  ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/40"}
                `}
              >
                <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium">Tarik file ke sini atau klik untuk memilih</p>
                  <p className="text-sm text-muted-foreground mt-1">Mendukung .csv, .xlsx, .xls</p>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {/* File info + preview */}
            {file && !result && (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                    <span className="font-medium">{file.name}</span>
                    <span className="text-muted-foreground text-xs">({rows.length} baris)</span>
                  </div>
                  <button onClick={reset} className="text-muted-foreground hover:text-destructive" aria-label="Reset">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Preview table - hanya kolom penting */}
                <div className="border rounded-lg overflow-hidden max-h-48">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="px-2 py-2 text-left font-medium text-muted-foreground">#</th>
                          {headers.slice(0, 5).map((h) => (
                            <th key={h} className="px-2 py-2 text-left font-medium text-muted-foreground whitespace-nowrap border-l">
                              {h}
                            </th>
                          ))}
                          {headers.length > 5 && (
                            <th className="px-2 py-2 text-left font-medium text-muted-foreground border-l text-xs">+{headers.length - 5} kolom</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {rows.slice(0, 8).map((row, i) => (
                          <tr key={i} className="hover:bg-muted/40">
                            <td className="px-2 py-1.5 text-muted-foreground text-xs font-medium">{i + 1}</td>
                            {headers.slice(0, 5).map((h) => (
                              <td key={h} className="px-2 py-1.5 truncate max-w-[120px] border-l text-xs">
                                {String(row[h] ?? "-").slice(0, 30)}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {rows.length > 8 && (
                          <tr className="bg-muted/20">
                            <td colSpan={Math.min(6, headers.length + 1)} className="px-2 py-2 text-center text-xs text-muted-foreground">
                              ... {rows.length - 8} baris lainnya
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="space-y-3">
                <div className={`flex items-center gap-3 rounded-lg p-3 ${
                  result.failed === 0 
                    ? "bg-green-500/10 text-green-700 dark:text-green-400" 
                    : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
                }`}>
                  {result.failed === 0
                    ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                    : <AlertCircle className="h-4 w-4 shrink-0" />
                  }
                  <div className="text-sm">
                    <p className="font-medium">
                      {result.success} baris berhasil
                      {result.failed > 0 && ` · ${result.failed} gagal`}
                    </p>
                  </div>
                </div>
                {result.errors.length > 0 && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-2.5 max-h-32 overflow-y-auto space-y-0.5">
                    {result.errors.slice(0, 5).map((e, i) => (
                      <p key={i} className="text-xs text-destructive">{e}</p>
                    ))}
                    {result.errors.length > 5 && (
                      <p className="text-xs text-muted-foreground italic">... dan {result.errors.length - 5} error lainnya</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            {!result ? (
              <>
                <Button variant="outline" onClick={handleClose} disabled={uploading}>
                  Batal
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={rows.length === 0 || uploading}
                >
                  {uploading ? (
                    <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Memproses...</>
                  ) : (
                    <><Upload className="mr-2 h-3.5 w-3.5" /> Impor ({rows.length})</>  
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={handleClose} className="ml-auto">
                Selesai
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
