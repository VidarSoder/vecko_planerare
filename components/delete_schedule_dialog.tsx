import React, { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { Separator } from "@/components/ui/separator";

interface BlobInfo {
    id: string;
    updated_at: any; // Replace with appropriate type if using a specific timestamp type
    data: any;
}

interface DeleteScheduleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (scheduleName: string) => void;
    blobs: BlobInfo[];
    textColor?: string;
}

export function DeleteScheduleDialog({
    isOpen,
    onClose,
    onConfirm,
    blobs,
    textColor = "#000000",
}: DeleteScheduleDialogProps) {
    const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
    const [sortCriteria, setSortCriteria] = useState<string>("updated_at");

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return '';
        const date = new Date(timestamp.seconds * 1000);
        return format(date, 'yyyy-MM-dd HH:mm:ss');
    };

    const calculateBlobSize = (data: any) => {
        return data.schedule ? data.schedule.flat().filter((cell: any) => cell.text || cell.backgroundColor).length : 0;
    };

    const determineDateRange = (data: any) => {
        if (!data.date) return '';
        const startDate = new Date(data.date);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6); // Assuming a week-long schedule
        return `${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`;
    };

    const sortedBlobs = [...blobs].sort((a, b) => {
        switch (sortCriteria) {
            case "updated_at":
                return new Date(b.updated_at.seconds * 1000).getTime() - new Date(a.updated_at.seconds * 1000).getTime();
            case "entries":
                return calculateBlobSize(b.data) - calculateBlobSize(a.data);
            case "title":
                return a.id.localeCompare(b.id);
            default:
                return 0;
        }
    });

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-5xl p-8">
                <AlertDialogHeader>
                    <AlertDialogTitle style={{ color: textColor }}>Ta bort Schema</AlertDialogTitle>
                    <AlertDialogDescription style={{ color: textColor }}>
                        Välj ett schema att ta bort.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex justify-between items-center mb-4">
                    <span style={{ color: textColor }}>Sortera efter:</span>
                    <select
                        value={sortCriteria}
                        onChange={(e) => setSortCriteria(e.target.value)}
                        className="border rounded p-2"
                    >
                        <option value="updated_at">Uppdaterad</option>
                        <option value="entries">Antal</option>
                        <option value="title">Titel</option>
                    </select>
                </div>
                <div className="overflow-y-auto max-h-96 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {sortedBlobs.map((blob) => (
                            <div
                                key={blob.id}
                                className={`p-6 border rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105 ${selectedSchedule === blob.id ? 'border-red-500 bg-red-100' : 'border-gray-300'}`}
                                onClick={() => setSelectedSchedule(blob.id)}
                            >
                                <h3 className="text-xl font-semibold">{blob.id}</h3>
                                <Separator className="my-2" />
                                <p className="text-sm text-gray-700">Updated: {formatTimestamp(blob.updated_at)}</p>
                                <Separator className="my-2" />
                                <p className="text-sm text-gray-500">Entries: {calculateBlobSize(blob.data)}</p>
                                <Separator className="my-2" />
                                <p className="text-sm text-gray-700">Date Range: {determineDateRange(blob.data)}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => selectedSchedule && onConfirm(selectedSchedule)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
