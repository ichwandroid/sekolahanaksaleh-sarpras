"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { RowActions } from "./row-actions"

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
  status_generate?: boolean
}

export function getColumns(onRefresh: () => void): ColumnDef<Barang>[] {
  return [
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
      accessorKey: "qr_link",
      header: "QRCode Link",
      cell: ({ row }) => {
        const kode = row.original.kode_barang
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(kode)}`
        return (
          <a 
            href={qrUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline text-xs flex items-center gap-1 font-medium"
          >
            Lihat QRCode
          </a>
        )
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Aksi</div>,
      size: 60,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <RowActions barang={row.original} onRefresh={onRefresh} />
        </div>
      ),
    },
  ]
}

// Backward compat export - will be replaced by getColumns(onRefresh)
export const columns = getColumns(() => {})
