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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import pb from "@/lib/pocketbase"
import { toast } from "sonner"

interface AddInventoryDialogProps {
  onSuccess: () => void
}

export function AddInventoryDialog({ onSuccess }: AddInventoryDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        kode_barang: formData.get("kode_barang") as string,
        nama_barang: formData.get("nama_barang") as string,
        merk: formData.get("merk") as string,
        lokasi: formData.get("lokasi") as string,
        kondisi: formData.get("kondisi") as string,
        harga: Number(formData.get("harga")),
        sumber_dana: formData.get("sumber_dana") as string,
        tahun_anggaran: formData.get("tahun_anggaran") as string,
      }

      await pb.collection("barang").create(data)
      
      toast.success("Berhasil", { description: "Data barang berhasil ditambahkan." })
      setOpen(false)
      onSuccess()
    } catch (error: any) {
      console.error(error)
      toast.error("Gagal", { description: error.message || "Gagal menambahkan data barang." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="cursor-pointer hover:bg-primary/80">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Inventaris
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tambah Inventaris Baru</DialogTitle>
          <DialogDescription>
            Masukkan detail barang atau sarana prasarana baru ke dalam sistem.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kode_barang">Kode Barang</Label>
                <Input id="kode_barang" name="kode_barang" placeholder="Contoh: BRG-001" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama_barang">Nama Barang</Label>
                <Input id="nama_barang" name="nama_barang" placeholder="Contoh: Meja Guru" required />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="merk">Merk / Brand</Label>
                <Input id="merk" name="merk" placeholder="Contoh: Olympic" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lokasi">Lokasi</Label>
                <Input id="lokasi" name="lokasi" placeholder="Contoh: Ruang Kelas 1A" required />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kondisi">Kondisi</Label>
                <Select name="kondisi" defaultValue="baik" required>
                  <SelectTrigger id="kondisi">
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
                <Label htmlFor="harga">Harga (Rp)</Label>
                <Input id="harga" name="harga" type="number" placeholder="Contoh: 500000" min="0" required />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sumber_dana">Sumber Dana</Label>
                <Input id="sumber_dana" name="sumber_dana" placeholder="BOS / Yayasan" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tahun_anggaran">Tahun Anggaran</Label>
                <Input id="tahun_anggaran" name="tahun_anggaran" placeholder="Contoh: 2024" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Barang"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
