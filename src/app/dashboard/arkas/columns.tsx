"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { RowActions } from "./row-actions"
import { cn } from "@/lib/utils"

export type Arkas = {
  id: string
  tanggal: string
  kode_kegiatan: string
  kode_rekening: string
  no_bukti: string
  id_barang: string
  uraian: string
  jumlah_barang: number
  harga_satuan: number
  realisasi: number
  status_generate?: boolean
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value ?? 0)

export function getArkasColumns(onRefresh: () => void): ColumnDef<Arkas>[] {
  return [
    {
      accessorKey: "tanggal",
      header: "Tanggal",
      cell: ({ row }) => {
        const val = row.getValue("tanggal") as string
        if (!val) return "-"
        return new Date(val).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      },
    },
    {
      accessorKey: "kode_kegiatan",
      header: "Kode Kegiatan",
    },
    {
      accessorKey: "kode_rekening",
      header: "Kode Rekening",
    },
    {
      accessorKey: "no_bukti",
      header: "No. Bukti",
    },
    {
      accessorKey: "id_barang",
      header: "ID Barang",
    },
    {
      accessorKey: "uraian",
      header: "Uraian",
    },
    {
      accessorKey: "jumlah_barang",
      header: "Jumlah Barang",
      cell: ({ row }) => (
        <div className="text-right tabular-nums">{row.getValue("jumlah_barang")}</div>
      ),
    },
    {
      accessorKey: "harga_satuan",
      header: () => <div className="text-right">Harga Satuan</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums font-medium">
          {formatRupiah(row.getValue("harga_satuan"))}
        </div>
      ),
    },
    {
      accessorKey: "realisasi",
      header: () => <div className="text-right">Realisasi</div>,
      cell: ({ row }) => (
        <div className="text-right tabular-nums font-medium">
          {formatRupiah(row.getValue("realisasi"))}
        </div>
      ),
    },
    {
      accessorKey: "status_generate",
      header: "Status",
      cell: ({ row }) => {
        const isGenerated = row.getValue("status_generate") as boolean
        return (
          <Badge 
            variant={isGenerated ? "secondary" : "outline"}
            className={cn(
              isGenerated 
                ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400" 
                : "border-red-500/50 text-red-600 bg-red-500/5 dark:text-red-400"
            )}
          >
            {isGenerated ? "Generate" : "Belum"}
          </Badge>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Aksi</div>,
      size: 60,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <RowActions arkas={row.original} onRefresh={onRefresh} />
        </div>
      ),
    },
  ]
}

// Backward compatibility
export const arkasColumns = getArkasColumns(() => {})
