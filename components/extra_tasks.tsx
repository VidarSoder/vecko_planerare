import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash } from "lucide-react"
import { CustomAlertDialog } from "./custom_alert_dialog"

interface Block {
    title: string
    content: string
    color: string
}

export function ExtraTasks({ blocks, setBlocks, selectedBackgroundColor, selectedTextColor }: { blocks: Block[], setBlocks: React.Dispatch<React.SetStateAction<Block[]>>, selectedBackgroundColor: string, selectedTextColor: string }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newBlockTitle, setNewBlockTitle] = useState("")
    const [newBlockContent, setNewBlockContent] = useState("")

    const addBlock = () => {
        if (!newBlockTitle) return
        setBlocks([...blocks, { title: newBlockTitle, content: newBlockContent || "", color: selectedBackgroundColor }])
        setNewBlockTitle("")
        setNewBlockContent("")
        setIsDialogOpen(false)
    }

    const removeBlock = (index: number) => {
        const newBlocks = blocks.filter((_, i) => i !== index)
        setBlocks(newBlocks)
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="font-bold text-center py-2 text-indigo-900">Anteckningar</h3>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="bg-yellow-50 hover:bg-yellow-100 mb-4">
                Lägg till block
            </Button>
            <div className="flex flex-col gap-4">
                {blocks.map((block, index) => (
                    <div key={index} className="p-4 border rounded shadow-sm max-w-[300px] relative" style={{ backgroundColor: block.color }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBlock(index)}
                            className="text-red-500 hover:text-red-700 absolute top-0 right-0 m-2"
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                        <div>
                            <h4 className="font-bold">{block.title}</h4>
                            <p className="break-words">{block.content}</p>
                        </div>
                    </div>
                ))}
            </div>
            <CustomAlertDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onConfirm={addBlock}
                textColor={selectedTextColor}
                title="Lägg till block"
            >
                <input
                    type="text"
                    value={newBlockTitle}
                    onChange={(e) => setNewBlockTitle(e.target.value)}
                    placeholder="Titel"
                    className="w-full p-2 border rounded mb-2"
                />
                <textarea
                    value={newBlockContent}
                    onChange={(e) => setNewBlockContent(e.target.value)}
                    placeholder="Innehåll"
                    className="w-full p-2 border rounded"
                />
            </CustomAlertDialog>
        </div>
    )
}

