"use client"

import { useState } from "react"
import { MoreHorizontal, Eye, Pencil, Trash2, PackagePlus } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import pb from "@/lib/pocketbase"
import { toast } from "sonner"
import { Arkas } from "./columns"
import { DetailDialog } from "./detail-dialog"
import { EditDialog } from "./edit-dialog"

interface RowActionsProps {
  arkas: Arkas
  onRefresh: () => void
}

export function RowActions({ arkas, onRefresh }: RowActionsProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [generating, setGenerating] = useState(false)

  async function handleGenerateInventaris() {
    if (arkas.status_generate) {
      toast.info("Data ini sudah pernah di-generate sebelumnya.")
      return
    }

    setGenerating(true)
    try {
      const jumlah = arkas.jumlah_barang || 1
      const tahun = arkas.tanggal ? new Date(arkas.tanggal).getFullYear() : new Date().getFullYear()
      
      const getAbbr = (text: string) => {
        const cleaned = text.replace(/[^a-zA-Z]/g, "").toUpperCase()
        const consonants = cleaned.replace(/[AIUEO]/g, "")
        const base = consonants.length >= 3 ? consonants : cleaned
        return base.substring(0, 3).padEnd(3, "X")
      }
      
      const abbr = getAbbr(arkas.uraian)
      const noBukti = arkas.no_bukti.replace(/[^a-zA-Z0-9]/g, "")

      // --- FAIL-SAFE: Cek apakah sudah ada barang dengan pola ini di database barang ---
      const checkPattern = `${tahun}-${abbr}-${noBukti}-001`
      const existing = await pb.collection("barang").getList(1, 1, {
        filter: `kode_barang = "${checkPattern}"`,
        $autoCancel: false
      })

      if (existing.totalItems > 0) {
        toast.warning("Peringatan", { 
          description: "Data inventaris untuk transaksi ini terdeteksi sudah ada di database." 
        })
        
        // Paksa sinkronisasi status jika ternyata belum ter-update
        try {
          await pb.collection("arkas").update(arkas.id, { status_generate: true })
          onRefresh()
        } catch (e) {}
        
        setGenerating(false)
        return
      }

      // Buat data untuk setiap item
      const promises = []
      for (let i = 1; i <= jumlah; i++) {
        const indexStr = String(i).padStart(3, "0")
        const kodeBarang = `${tahun}-${abbr}-${noBukti}-${indexStr}`

        const data = {
          kode_barang: kodeBarang,
          nama_barang: arkas.uraian,
          tanggal_perolehan: new Date().toISOString(),
          harga: arkas.harga_satuan,
          tahun_anggaran: arkas.tanggal,
          sumber_dana: "ARKAS",
          kondisi: "baik",
          status: "Aktif",
          merk: "-",
          spesifikasi: `ARKAS: ${arkas.kode_kegiatan} / ${arkas.kode_rekening}`,
          keterangan: `Item ${i} dari ${jumlah}. No Bukti: ${arkas.no_bukti}`,
        }
        promises.push(pb.collection("barang").create(data))
      }

      await Promise.all(promises)

      // Update status ARKAS 
      try {
        await pb.collection("arkas").update(arkas.id, {
          status_generate: true
        })
      } catch (updateErr: any) {
        console.warn("Update status_generate failed.", updateErr)
      }

      onRefresh()

      toast.success("Berhasil", { 
        description: `${jumlah} data inventaris baru telah di-generate.` 
      })
    } catch (error: any) {
      console.error(error)
      toast.error("Gagal", { description: error.message || "Gagal generate inventaris." })
    } finally {
      setGenerating(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await pb.collection("arkas").delete(arkas.id)
      toast.success("Berhasil", { description: `Data ARKAS berhasil dihapus.` })
      setDeleteOpen(false)
      onRefresh()
    } catch (error: any) {
      toast.error("Gagal", { description: error.message || "Gagal menghapus data ARKAS." })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-8 w-8"
          )}
          aria-label="Buka menu aksi"
        >
          <MoreHorizontal className="h-4 w-4 text-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDetailOpen(true)}>
            <Eye className="h-4 w-4" />
            Lihat Detail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleGenerateInventaris}
            disabled={generating || arkas.status_generate}
          >
            <PackagePlus className="h-4 w-4" />
            {generating ? "Generating..." : (arkas.status_generate ? "Sudah Ter-generate" : "Generate Inventaris")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Detail Dialog */}
      <DetailDialog
        arkas={arkas}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Edit Dialog */}
      <EditDialog
        arkas={arkas}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Hapus Data ARKAS</DialogTitle>
            <DialogDescription>
              Apakah kamu yakin ingin menghapus data ARKAS ini?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
