"use client"

import { useState } from "react"
import { doc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  itemType: "vehicle" | "driver"
  itemId: string
  itemName: string
}

export function DeleteConfirmationModal({ isOpen, onClose, itemType, itemId, itemName }: DeleteConfirmationModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const collection = itemType === "vehicle" ? "vehicles" : "drivers"
      await deleteDoc(doc(db, collection, itemId))

      toast({
        title: `${itemType === "vehicle" ? "Vehículo" : "Conductor"} eliminado`,
        description: `${itemName} ha sido eliminado correctamente`,
      })

      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar el ${itemType === "vehicle" ? "vehículo" : "conductor"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Eliminación
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar {itemType === "vehicle" ? "el vehículo" : "al conductor"}{" "}
            <strong>{itemName}</strong>? Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleDelete} disabled={isLoading} className="flex-1 bg-red-600 hover:bg-red-700">
            {isLoading ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
