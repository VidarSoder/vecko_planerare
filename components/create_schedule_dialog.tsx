import React, { useState } from "react";
import { CustomAlertDialog } from "./custom_alert_dialog";

interface CreateScheduleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (scheduleName: string) => void;
    existingNames: string[];
    textColor?: string;
}

export function CreateScheduleDialog({
    isOpen,
    onClose,
    onConfirm,
    existingNames,
    textColor = "#000000",
}: CreateScheduleDialogProps) {
    const [inputTitle, setInputTitle] = useState("");

    const handleConfirm = () => {
        if (existingNames.includes(inputTitle)) {
            alert("Schemanamnet finns redan. Vänligen välj ett annat namn.");
        } else {
            onConfirm(inputTitle);
            setInputTitle("");
            onClose();
        }
    };

    return (
        <CustomAlertDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleConfirm}
            title="Skapa Schema"
            textColor={textColor}
        >
            <input
                type="text"
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
                placeholder="Ange schemanamn"
                className="w-full p-2 border rounded"
            />
        </CustomAlertDialog>
    );
}
