"use client"

import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import pb from "@/lib/pocketbase"
import { toast } from "sonner"
import { Barang } from "./columns"

interface EditDialogProps {
  barang: Barang | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditDialog({ barang, open, onOpenChange, onSuccess }: EditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [kondisi, setKondisi] = useState<string>(barang?.kondisi ?? "baik")

  // Sync kondisi when barang changes
  if (barang && kondisi !== barang.kondisi && !loading) {
    setKondisi(barang.kondisi)
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!barang) return
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        kode_barang: formData.get("kode_barang") as string,
        nama_barang: formData.get("nama_barang") as string,
        merk: formData.get("merk") as string,
        lokasi: formData.get("lokasi") as string,
        kondisi: kondisi,
        harga: Number(formData.get("harga")),
        sumber_dana: formData.get("sumber_dana") as string,
        tahun_anggaran: formData.get("tahun_anggaran") as string,
        spesifikasi: formData.get("spesifikasi") as string,
        penanggung_jawab: formData.get("penanggung_jawab") as string,
        keterangan: formData.get("keterangan") as string,
      }

      await pb.collection("barang").update(barang.id, data)

      toast.success("Berhasil", { description: "Data barang berhasil diperbarui." })
      onOpenChange(false)
      onSuccess()
    } catch (error: any) {
      console.error(error)
      toast.error("Gagal", { description: error.message || "Gagal memperbarui data barang." })
    } finally {
      setLoading(false)
    }
  }

  if (!barang) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Inventaris</DialogTitle>
          <DialogDescription>
            Perbarui detail barang <span className="font-semibold">{barang.nama_barang}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_kode_barang">Kode Barang</Label>
                <Input id="edit_kode_barang" name="kode_barang" defaultValue={barang.kode_barang} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_nama_barang">Nama Barang</Label>
                <Input id="edit_nama_barang" name="nama_barang" defaultValue={barang.nama_barang} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_merk">Merk / Brand</Label>
                <Input id="edit_merk" name="merk" defaultValue={barang.merk} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_lokasi">Lokasi</Label>
                <Input id="edit_lokasi" name="lokasi" defaultValue={barang.lokasi} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_kondisi">Kondisi</Label>
                <Select value={kondisi} onValueChange={(v) => setKondisi(v ?? "baik")}>
                  <SelectTrigger id="edit_kondisi">
                    <SelectValue placeholder="Pilih Kondisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baik">Baik</SelectItem>
                    <SelectItem value="rusak ringan">Rusak Ringan</SelectItem>
                    <SelectItem value="rusak berat">Rusak Berat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_harga">Harga (Rp)</Label>
                <Input id="edit_harga" name="harga" type="number" defaultValue={barang.harga} min="0" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_sumber_dana">Sumber Dana</Label>
                <Input id="edit_sumber_dana" name="sumber_dana" defaultValue={barang.sumber_dana} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_tahun_anggaran">Tahun Anggaran</Label>
                <Input id="edit_tahun_anggaran" name="tahun_anggaran" defaultValue={barang.tahun_anggaran} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_spesifikasi">Spesifikasi</Label>
              <Input id="edit_spesifikasi" name="spesifikasi" defaultValue={barang.spesifikasi} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_penanggung_jawab">Penanggung Jawab</Label>
              <Input id="edit_penanggung_jawab" name="penanggung_jawab" defaultValue={barang.penanggung_jawab} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_keterangan">Keterangan</Label>
              <Input id="edit_keterangan" name="keterangan" defaultValue={barang.keterangan} />
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
