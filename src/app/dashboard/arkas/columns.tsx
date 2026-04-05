"use client"

import { ColumnDef } from "@tanstack/react-table"

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
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value ?? 0)

export const arkasColumns: ColumnDef<Arkas>[] = [
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
]
