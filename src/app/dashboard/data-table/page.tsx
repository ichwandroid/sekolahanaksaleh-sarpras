"use client"

import { useEffect, useState, useCallback } from "react"
import { DataTable } from "@/components/data-table"
import { getColumns, Barang } from "./columns"
import pb from "@/lib/pocketbase"
import { Button } from "@/components/ui/button"
import { DownloadIcon } from "lucide-react"
import { utils, writeFile } from "xlsx"

export default function DataTablePage() {
  const [data, setData] = useState<Barang[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const records = await pb.collection("barang").getFullList<Barang>({
        sort: '-created',
      })
      setData(records)
      setError("")
    } catch (err: unknown) {
      const isAbortError = (value: unknown): value is { isAbort: boolean } =>
        typeof value === "object" &&
        value !== null &&
        "isAbort" in value &&
        (value as { isAbort: unknown }).isAbort === true

      if (!isAbortError(err)) {
        console.error(err)
        setError("Gagal memuat data dari PocketBase. Pastikan PocketBase sedang berjalan dan Collection 'barang' telah dibuat.")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const handleExport = () => {
    if (data.length === 0) return
    const ws = utils.json_to_sheet(data)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, "Inventaris")
    writeFile(wb, `Inventaris-Sarpras-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Data Barang Sarpras</h1>
            <p className="text-muted-foreground mt-1">Kelola data inventaris dan sarana prasarana sekolah.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} disabled={data.length === 0}>
              <DownloadIcon className="mr-2 h-4 w-4" />
              Export ke Excel
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground border rounded-md bg-card">Memuat data...</div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">{error}</div>
        ) : (
          <DataTable columns={getColumns(fetchData)} data={data} />
        )}
      </div>
    </div>
  )
}
