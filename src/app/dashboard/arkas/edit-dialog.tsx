"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Arkas } from "./columns"

interface EditDialogProps {
  arkas: Arkas | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditDialog({ arkas, open, onOpenChange, onSuccess }: EditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [jumlah, setJumlah] = useState<number>(0)
  const [harga, setHarga] = useState<number>(0)
  const [realisasi, setRealisasi] = useState<number>(0)

  // Initialize and Reactively calculate realisasi
  useEffect(() => {
    if (arkas && open) {
      setJumlah(arkas.jumlah_barang || 0)
      setHarga(arkas.harga_satuan || 0)
    }
  }, [arkas, open])

  useEffect(() => {
    setRealisasi(jumlah * harga)
  }, [jumlah, harga])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!arkas) return
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      // Handle date formatting
      let tanggalValue = formData.get("tanggal") as string
      // If it's dd-mm-yyyy or dd/mm/yyyy, normalize it
      const match = tanggalValue.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/)
      if (match) {
        const [, day, month, year] = match
        tanggalValue = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")} 00:00:00.000Z`
      }

      const data = {
        tanggal: tanggalValue,
        kode_kegiatan: formData.get("kode_kegiatan") as string,
        kode_rekening: formData.get("kode_rekening") as string,
        no_bukti: formData.get("no_bukti") as string,
        id_barang: formData.get("id_barang") as string,
        uraian: formData.get("uraian") as string,
        jumlah_barang: jumlah,
        harga_satuan: harga,
        realisasi: realisasi,
      }

      await pb.collection("arkas").update(arkas.id, data)

      toast.success("Berhasil", { description: "Data ARKAS berhasil diperbarui." })
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error(error)
      toast.error("Gagal", { description: error.message || "Gagal memperbarui data ARKAS." })
    } finally {
      setLoading(false)
    }
  }

  if (!arkas) return null

  // Format date if it's stored as ISO
  const formattedDate = arkas.tanggal ? new Date(arkas.tanggal).toISOString().split('T')[0] : ""

  const formatRupiah = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(val)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto text-foreground">
        <DialogHeader>
          <DialogTitle>Edit Data ARKAS</DialogTitle>
          <DialogDescription>
            Perbarui detail data ARKAS. Realisasi akan dihitung otomatis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4 text-foreground">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="arkas_tanggal">Tanggal</Label>
                <Input id="arkas_tanggal" name="tanggal" type="date" defaultValue={formattedDate} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arkas_no_bukti">No. Bukti</Label>
                <Input id="arkas_no_bukti" name="no_bukti" defaultValue={arkas.no_bukti} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="arkas_kode_kegiatan">Kode Kegiatan</Label>
                <Input id="arkas_kode_kegiatan" name="kode_kegiatan" defaultValue={arkas.kode_kegiatan} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arkas_kode_rekening">Kode Rekening</Label>
                <Input id="arkas_kode_rekening" name="kode_rekening" defaultValue={arkas.kode_rekening} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="arkas_id_barang">ID Barang</Label>
                <Input id="arkas_id_barang" name="id_barang" defaultValue={arkas.id_barang} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="arkas_jumlah_barang">Jumlah Barang</Label>
                <Input 
                  id="arkas_jumlah_barang" 
                  name="jumlah_barang" 
                  type="number" 
                  value={jumlah} 
                  onChange={(e) => setJumlah(Number(e.target.value))}
                  min="0" 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="arkas_uraian">Uraian</Label>
              <Input id="arkas_uraian" name="uraian" defaultValue={arkas.uraian} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="arkas_harga_satuan">Harga Satuan (Rp)</Label>
                <Input 
                  id="arkas_harga_satuan" 
                  name="harga_satuan" 
                  type="number" 
                  value={harga} 
                  onChange={(e) => setHarga(Number(e.target.value))}
                  min="0" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Realisasi (Otomatis)</Label>
                <div className="p-2 border rounded bg-muted/30 font-medium font-mono text-sm">
                  {formatRupiah(realisasi)}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
