"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type Barang = {
  id: string
  kode_barang: string
  nama_barang: string
  tanggal_perolehan: string
  harga: number
  lokasi: string
  kondisi: "baik" | "rusak ringan" | "rusak berat"
  status: string
  sumber_dana: string
  tahun_anggaran: string
  penanggung_jawab: string
  merk: string
  spesifikasi: string
  qr_link: string
  keterangan: string
}

export const columns: ColumnDef<Barang>[] = [
  {
    accessorKey: "kode_barang",
    header: "Kode",
  },
  {
    accessorKey: "nama_barang",
    header: "Nama Barang",
  },
  {
    accessorKey: "merk",
    header: "Merk",
  },
  {
    accessorKey: "lokasi",
    header: "Lokasi",
  },
  {
    accessorKey: "kondisi",
    header: "Kondisi",
    cell: ({ row }) => {
      const kondisi = row.getValue("kondisi") as string
      return (
        <Badge variant={kondisi === "baik" ? "default" : (kondisi === "rusak ringan" ? "secondary" : "destructive")}>
          {kondisi ? kondisi.toUpperCase() : "N/A"}
        </Badge>
      )
    }
  },
  {
    accessorKey: "harga",
    header: "Harga",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("harga") ?? "0")
      const formatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    },
  },
]
