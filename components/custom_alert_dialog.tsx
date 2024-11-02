import React, { ReactNode } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CustomAlertDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description?: string
    confirmText?: string
    cancelText?: string
    textColor?: string
    children?: ReactNode
}

export function CustomAlertDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    textColor = "#000000",
    children,
}: CustomAlertDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle style={{ color: textColor }}>{title}</AlertDialogTitle>
                    {description && (
                        <AlertDialogDescription style={{ color: textColor }}>
                            {description}
                        </AlertDialogDescription>
                    )}
                </AlertDialogHeader>
                {children}
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>{confirmText}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
