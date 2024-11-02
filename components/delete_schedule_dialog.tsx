import React, { useState } from "react";
import { CustomAlertDialog } from "./custom_alert_dialog";

interface DeleteScheduleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (scheduleName: string) => void;
    scheduleNames: string[];
    textColor?: string;
}

export function DeleteScheduleDialog({
    isOpen,
    onClose,
    onConfirm,
    scheduleNames,
    textColor = "#000000",
}: DeleteScheduleDialogProps) {
    const [selectedSchedule, setSelectedSchedule] = useState("");

    return (
        <CustomAlertDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={() => onConfirm(selectedSchedule)}
            title="Ta bort Schema"
            description="Välj ett schema att ta bort."
            textColor={textColor}
        >
            <select
                value={selectedSchedule}
                onChange={(e) => setSelectedSchedule(e.target.value)}
                className="w-full p-2 border rounded"
            >
                <option value="" disabled>Välj ett schema</option>
                {scheduleNames.map((name) => (
                    <option key={name} value={name}>
                        {name}
                    </option>
                ))}
            </select>
        </CustomAlertDialog>
    );
}