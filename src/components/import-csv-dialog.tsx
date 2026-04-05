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
function normalizeRow(row: PreviewRow): PreviewRow {
  const result: PreviewRow = {}
  for (const key of Object.keys(row)) {
    const val = row[key]
    if (typeof val === "string" && (key.includes("tanggal") || key.includes("date"))) {
      result[key] = normalizeDate(val)
    } else {
      result[key] = val
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
        await pb.collection(collection).create(normalizeRow(rows[i]))
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
        Import CSV / Excel
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Import Data dari File</DialogTitle>
            <DialogDescription>
              Upload file <span className="font-semibold">.csv</span> atau{" "}
              <span className="font-semibold">.xlsx / .xls</span>. Header kolom harus sesuai
              dengan nama field di database.
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
                  <p className="font-medium">Klik atau drag & drop file di sini</p>
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
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                    <span>{file.name}</span>
                    <span className="text-muted-foreground font-normal">
                      — {rows.length} baris data ditemukan
                    </span>
                  </div>
                  <button onClick={reset} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Preview table */}
                <div className="border rounded-lg overflow-auto max-h-64">
                  <table className="w-full text-xs">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-muted-foreground font-medium">#</th>
                        {headers.map((h) => (
                          <th key={h} className="px-3 py-2 text-left text-muted-foreground font-medium whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-t odd:bg-muted/20">
                          <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                          {headers.map((h) => (
                            <td key={h} className="px-3 py-1.5 whitespace-nowrap max-w-[160px] truncate">
                              {String(row[h] ?? "")}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {rows.length > 10 && (
                        <tr className="border-t">
                          <td colSpan={headers.length + 1} className="px-3 py-2 text-center text-muted-foreground text-xs">
                            ... dan {rows.length - 10} baris lainnya
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="space-y-3">
                <div className={`flex items-center gap-3 rounded-lg p-4 ${result.failed === 0 ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"}`}>
                  {result.failed === 0
                    ? <CheckCircle2 className="h-5 w-5 shrink-0" />
                    : <AlertCircle className="h-5 w-5 shrink-0" />
                  }
                  <div className="text-sm">
                    <p className="font-semibold">
                      {result.success} baris berhasil diimpor
                      {result.failed > 0 && `, ${result.failed} baris gagal`}
                    </p>
                  </div>
                </div>
                {result.errors.length > 0 && (
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 max-h-40 overflow-auto space-y-1">
                    {result.errors.map((e, i) => (
                      <p key={i} className="text-xs text-destructive">{e}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
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
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengimpor...</>
                  ) : (
                    <><Upload className="mr-2 h-4 w-4" /> Import {rows.length} Baris</>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={handleClose}>Tutup</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
