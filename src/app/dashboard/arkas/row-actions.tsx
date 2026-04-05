"use client"

import { useState } from "react"
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
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
