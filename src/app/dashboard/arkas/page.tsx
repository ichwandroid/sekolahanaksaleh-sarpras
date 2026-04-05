"use client"

import { useEffect, useState, useCallback } from "react"
import { DataTable } from "@/components/data-table"
import { arkasColumns, Arkas } from "./columns"
import pb from "@/lib/pocketbase"
import { ImportCsvDialog } from "@/components/import-csv-dialog"

export default function ArkasPage() {
  const [data, setData] = useState<Arkas[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const records = await pb.collection("arkas").getFullList<Arkas>({
        sort: "-tanggal",
      })
      setData(records)
      setError("")
    } catch (err: any) {
      if (!err.isAbort) {
        console.error(err)
        setError(
          "Gagal memuat data dari PocketBase. Pastikan PocketBase sedang berjalan dan Collection 'arkas' telah dibuat."
        )
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
            <h1 className="text-2xl font-bold tracking-tight">Data ARKAS</h1>
            <p className="text-muted-foreground mt-1">
              Data Anggaran dan Realisasi Kegiatan Anggaran Sekolah.
            </p>
          </div>
          <ImportCsvDialog collection="arkas" onSuccess={fetchData} />
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-muted-foreground border rounded-md bg-card">
            Memuat data...
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable columns={arkasColumns} data={data} />
          </div>
        )}
      </div>
    </div>
  )
}
