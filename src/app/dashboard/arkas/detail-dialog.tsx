"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Arkas } from "./columns"

interface DetailDialogProps {
  arkas: Arkas | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount ?? 0)

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex justify-between gap-4 py-1.5">
      <span className="text-sm text-muted-foreground min-w-35">{label}</span>
      <span className="text-sm font-medium text-right">{value ?? "-"}</span>
    </div>
  )
}

export function DetailDialog({ arkas, open, onOpenChange }: DetailDialogProps) {
  if (!arkas) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-130">
        <DialogHeader>
          <DialogTitle>Detail ARKAS</DialogTitle>
          <DialogDescription>
            ID Barang: <span className="font-mono font-semibold">{arkas.id_barang}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Informasi Kegiatan</p>
          <Separator />
          <DetailRow label="Tanggal" value={arkas.tanggal ? new Date(arkas.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-"} />
          <DetailRow label="Kode Kegiatan" value={arkas.kode_kegiatan} />
          <DetailRow label="Kode Rekening" value={arkas.kode_rekening} />
          <DetailRow label="No. Bukti" value={arkas.no_bukti} />

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-1 pt-3">Informasi Barang</p>
          <Separator />
          <DetailRow label="ID Barang" value={arkas.id_barang} />
          <DetailRow label="Uraian" value={arkas.uraian} />
          <DetailRow label="Jumlah Barang" value={arkas.jumlah_barang} />

          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-4 mb-1 pt-3">Keuangan</p>
          <Separator />
          <DetailRow label="Harga Satuan" value={formatRupiah(arkas.harga_satuan)} />
          <DetailRow label="Realisasi" value={formatRupiah(arkas.realisasi)} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
