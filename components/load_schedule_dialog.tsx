import React, { useState } from "react";
import { CustomAlertDialog } from "./custom_alert_dialog";

interface LoadScheduleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (scheduleName: string) => void;
    scheduleNames: string[];
    textColor?: string;
}

export function LoadScheduleDialog({
    isOpen,
    onClose,
    onConfirm,
    scheduleNames,
    textColor = "#000000",
}: LoadScheduleDialogProps) {
    const [selectedSchedule, setSelectedSchedule] = useState("");

    return (
        <CustomAlertDialog
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={() => onConfirm(selectedSchedule)}
            title="Ladda Schema"
            description="Välj ett schema att ladda."
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