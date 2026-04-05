"use client"

import { useEffect, useState, useCallback } from "react"
import { DataTable } from "@/components/data-table"
import { getColumns, Barang } from "./columns"
import pb from "@/lib/pocketbase"
import { AddInventoryDialog } from "./add-inventory-dialog"
import { ImportCsvDialog } from "@/components/import-csv-dialog"

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
    } catch (err: any) {
      if (!err.isAbort) {
        console.error(err)
        setError("Gagal memuat data dari PocketBase. Pastikan PocketBase sedang berjalan dan Collection 'barang' telah dibuat.")
      }
    } finally {
      setLoading(false)
    }
  }, [])

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
            <ImportCsvDialog collection="barang" onSuccess={fetchData} />
            <AddInventoryDialog onSuccess={fetchData} />
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
