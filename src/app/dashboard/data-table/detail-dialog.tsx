"use client"

import Image from "next/image"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Barang, getBarangNoBukti } from "./columns"

interface DetailDialogProps {
  barang: Barang | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const kondisiBadge = (kondisi: string) => {
  if (kondisi === "baik") return "default"
  if (kondisi === "rusak ringan") return "secondary"
  return "destructive"
}

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount ?? 0)

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "-"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  } catch {
    return dateString
  }
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="text-sm text-muted-foreground min-w-35">{label}</span>
      <span className="text-sm font-medium text-right">{value ?? "-"}</span>
    </div>
  )
}

export function DetailDialog({ barang, open, onOpenChange }: DetailDialogProps) {
  if (!barang) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle className="text-xl">{barang.nama_barang}</DialogTitle>
          <DialogDescription className="mt-1.5">
            Kode barang: <span className="font-mono font-semibold text-foreground">{barang.kode_barang}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <div className="inline-flex bg-white p-1 rounded border shadow-xs dark:bg-slate-900 overflow-hidden shrink-0">
            <Image
              src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(barang.kode_barang)}&includetext=false&scale=2&height=4&padding=0`}
              alt={barang.kode_barang}
              width={118}
              height={16}
              unoptimized
              className="h-4 w-auto grayscale dark:invert"
            />
          </div>
        </div>

        <div className="mt-6 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Informasi Umum</p>
          <Separator />
          <DetailRow label="Nama Barang" value={barang.nama_barang} />
          <DetailRow label="Kode Barang" value={barang.kode_barang} />
          <DetailRow label="No. Bukti" value={getBarangNoBukti(barang)} />
          <DetailRow label="Merk / Brand" value={barang.merk} />
          <DetailRow label="Spesifikasi" value={barang.spesifikasi} />

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-1 pt-3">Lokasi & Kondisi</p>
          <Separator />
          <DetailRow label="Lokasi" value={barang.lokasi} />
          <div className="flex justify-between gap-4 py-1.5">
            <span className="text-sm text-muted-foreground min-w-35">Kondisi</span>
            <Badge variant={kondisiBadge(barang.kondisi)}>
              {barang.kondisi ? barang.kondisi.toUpperCase() : "N/A"}
            </Badge>
          </div>
          <DetailRow label="Penanggung Jawab" value={barang.penanggung_jawab} />

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-1 pt-3">Keuangan & Pengadaan</p>
          <Separator />
          <DetailRow label="Harga" value={formatRupiah(barang.harga)} />
          <DetailRow label="Sumber Dana" value={barang.sumber_dana} />
          <DetailRow label="Tahun Anggaran" value={formatDate(barang.tahun_anggaran)} />
          <DetailRow label="Tanggal Perolehan" value={formatDate(barang.tanggal_perolehan)} />

          {barang.keterangan && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-1 pt-3">Keterangan</p>
              <Separator />
              <p className="text-sm py-1.5">{barang.keterangan}</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
