"use client"

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */
// Property 'then' does not exist on type 'void'.ts(2339) ignore this



import { useState, useEffect } from "react"
import { format, addDays, startOfWeek, addMinutes } from "date-fns"
import { sv } from "date-fns/locale"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar as CalendarIcon, Printer, Paintbrush, Type, Save, Download, Proportions, Trash } from "lucide-react"
import { createBlob, fetchAllBlobs, deleteBlob, saveBlob, updateBlob } from '@/components/firebase/firestore';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import React from "react"
import { ExtraTasks } from "./extra_tasks"
import { CustomAlertDialog } from "./custom_alert_dialog"
import { LoadScheduleDialog } from "./load_schedule_dialog"
import { DeleteScheduleDialog } from "./delete_schedule_dialog"
import { CreateScheduleDialog } from "./create_schedule_dialog"
import { CustomAlert } from "./custom_alert"
import { useUser } from "@/context/UserContext"

const intervals = [
  { value: "10", label: "10 minuter" },
  { value: "30", label: "30 minuter" },
  { value: "45", label: "45 minuter" },
  { value: "60", label: "1 timme" },
  { value: "120", label: "2 timmar" },
  { value: "240", label: "4 timmar" },
]

const weekDays = ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"]

interface ScheduleCell {
  backgroundColor: string;
  textColor: string;
  text: string;
  borderColor: string;
}

interface Block {
  title: string
  content: string
  color: string
  borderColor: string;
}

const STORAGE_KEY = "weekly-planner-data"

export function WeeklyPlannerComponent() {
  const { user, setUser } = useUser();
  const [date, setDate] = useState<Date>(new Date())
  const [interval, setInterval] = useState("60")
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [schedule, setSchedule] = useState<ScheduleCell[][]>(
    Array(7).fill([]).map(() => Array(18).fill({
      backgroundColor: "", textColor: "#000000", text: "", borderColor: ""
    }))
  )
  const [blocks, setBlocks] = useState<Block[]>([])
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState("#4F46E5")
  const [selectedTextColor, setSelectedTextColor] = useState("#000000")
  const [mode, setMode] = useState<"color" | "text">("color")
  const [isPrintMode, setIsPrintMode] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogTitle, setDialogTitle] = useState("")
  const [dialogDescription, setDialogDescription] = useState("")
  const [onDialogConfirm, setOnDialogConfirm] = useState(() => () => { })
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertDescription, setAlertDescription] = useState("");
  const [scheduleNames, setScheduleNames] = useState<string[]>([])
  const [currentScheduleName, setCurrentScheduleName] = useState<string>("");
  const [isBorderMode, setIsBorderMode] = useState(false);

  useEffect(() => {
    if (date) {
      setWeekStart(startOfWeek(date, { weekStartsOn: 1 }))
    }
  }, [date])

  useEffect(() => {
    handleApplyDateAndInterval()
  }, [])

  useEffect(() => {
    updateScheduleNames();
  }, []);

  const updateScheduleNames = () => {
    if (user?.uid) {
      fetchAllBlobs(user.uid)
        .then((blobs: any[]) => {
          setScheduleNames(blobs.map((blob: { id: any }) => blob.id));
        })
        .catch((error: any) => {
          console.error("Error fetching schedule names:", error);
        });
    }
  };

  const handleApplyDateAndInterval = () => {
    setWeekStart(startOfWeek(date, { weekStartsOn: 1 }))
    const intervalMinutes = parseInt(interval)
    const slotsPerDay = Math.floor((18 * 60) / intervalMinutes) // 18 hours from 06:00 to 24:00
    const newSchedule = Array(7).fill([]).map(() => {
      const daySchedule = []
      for (let i = 0; i < slotsPerDay; i++) {
        daySchedule.push({ backgroundColor: "", textColor: "#000000", text: "", borderColor: "" })
      }
      return daySchedule
    })
    setSchedule(newSchedule)
  }

  const handleCellClick = (day: number, slot: number) => {
    const newSchedule = [...schedule];
    newSchedule[day][slot] = {
      ...newSchedule[day][slot],
      backgroundColor: isBorderMode ? "" : selectedBackgroundColor,
      borderColor: isBorderMode ? selectedBackgroundColor : ""
    };
    setSchedule(newSchedule);
  };

  const handleCellTextChange = (day: number, slot: number, text: string) => {
    const newSchedule = [...schedule]
    newSchedule[day][slot] = { ...newSchedule[day][slot], text, textColor: selectedTextColor }
    setSchedule(newSchedule)
  }

  const handlePrint = () => {
    window.print()
  }

  const openDialog = (title: string, description: string, confirmCallback: () => void) => {
    setDialogTitle(title);
    setDialogDescription(description);
    setOnDialogConfirm(() => confirmCallback);
    setIsDialogOpen(true);
  };

  const showAlert = (title: string, description: string) => {
    setAlertTitle(title);
    setAlertDescription(description);
    setAlertOpen(true);
  };

  const handleSave = () => {
    if (!currentScheduleName) {
      showAlert("Fel", "Du måste skapa ett schema innan du kan spara.");
      return;
    }
    if (user?.uid) {
      const data = {
        schedule,
        blocks,
        date,
        interval,
        selectedBackgroundColor,
        selectedTextColor,
      };
      saveBlob(currentScheduleName, data, user.uid)
        .then(() => {
          showAlert("Schema sparat", `Schema "${currentScheduleName}" har sparats!`);
          updateScheduleNames(); // Update schedule names after saving
        })
        .catch((error: any) => {
          console.error("Error saving schedule:", error);
          showAlert("Fel", "Det gick inte att spara schemat.");
        });
    }
  };

  const handleLoad = () => {
    if (scheduleNames.length === 0) {
      showAlert("Inga scheman", "Inga sparade scheman hittades.");
      return;
    }
    setIsLoadDialogOpen(true);
  };

  const handleLoadConfirm = (scheduleName: string) => {
    if (user?.uid) {
      fetchAllBlobs(user.uid)
        .then((blobs: any[]) => {
          const data = blobs.find((blob: { id: string }) => blob.id === scheduleName)?.data;
          if (data) {
            setSchedule(data.schedule);
            setBlocks(data.blocks);
            setDate(data.date);
            setInterval(data.interval);
            setSelectedBackgroundColor(data.selectedBackgroundColor);
            setSelectedTextColor(data.selectedTextColor);
            setCurrentScheduleName(scheduleName);
            showAlert("Schema laddat", `Schema "${scheduleName}" laddat!`);
          } else {
            showAlert("Fel", "Det gick inte att ladda schemat.");
          }
        })
        .catch((error: any) => {
          console.error("Error loading schedule:", error);
          showAlert("Fel", "Det gick inte att ladda schemat.");
        });
    }
  };

  const handleProportions = () => {
    setIsPrintMode(!isPrintMode)
  }

  const handleDelete = () => {
    if (scheduleNames.length === 0) {
      showAlert("Inga scheman", "Inga sparade scheman hittades.");
      return;
    }
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = (scheduleName: string) => {
    if (user?.uid) {
      deleteBlob(scheduleName, user.uid)
        .then(() => {
          showAlert("Schema borttaget", `Schema "${scheduleName}" har tagits bort!`);
          updateScheduleNames(); // Update schedule names after deletion
        })
        .catch((error: any) => {
          console.error("Error deleting schedule:", error);
          showAlert("Fel", "Det gick inte att ta bort schemat.");
        });
    }
  };

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
  };

  return (
    <div className={`container mx-auto p-4 max-w-full bg-gradient-to-b from-indigo-50 to-white min-h-screen ${isPrintMode ? "print-mode" : ""}`}>
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4 print:hidden">
        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-sm">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP", { locale: sv }) : <span>Välj ett datum</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
                locale={sv}
              />
            </PopoverContent>
          </Popover>
          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Välj intervall" />
            </SelectTrigger>
            <SelectContent>
              {intervals.map((int) => (
                <SelectItem key={int.value} value={int.value}>
                  {int.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleApplyDateAndInterval} variant="secondary">
            Spara
          </Button>
        </div>
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <div className="flex gap-1 bg-white rounded-md p-1 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2",
                mode === "color" && "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
              )}
              onClick={() => setMode("color")}
            >
              <Paintbrush className="h-4 w-4" />
              Färg
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "gap-2",
                mode === "text" && "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white"
              )}
              onClick={() => setMode("text")}
            >
              <Type className="h-4 w-4" />
              Text
            </Button>
          </div>
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
            <Input
              type="color"
              value={selectedBackgroundColor}
              onChange={(e) => setSelectedBackgroundColor(e.target.value)}
              className="w-12 h-8 p-1 rounded"
            />
            <Input
              type="color"
              value={selectedTextColor}
              onChange={(e) => setSelectedTextColor(e.target.value)}
              className="w-12 h-8 p-1 rounded"
            />
            <label htmlFor="border-mode" className="flex items-center cursor-pointer">
              <Checkbox
                id="border-mode"
                checked={isBorderMode}
                onCheckedChange={() => setIsBorderMode(!isBorderMode)}
              />
            </label>
            <label htmlFor="border-mode" className="ml-2">Border</label>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} variant="outline" className="bg-green-50 hover:bg-green-100" disabled={!currentScheduleName}>
              <Save className="mr-2 h-4 w-4" />
              Spara
            </Button>
            <Button onClick={handleLoad} variant="outline" className="bg-blue-50 hover:bg-blue-100">
              <Download className="mr-2 h-4 w-4" />
              Ladda
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Skriv ut
            </Button>
            <Button onClick={handleProportions} variant="outline">
              <Proportions className="mr-2 h-4 w-4" />
              Utskriftsvänlig
            </Button>
            <Button onClick={handleDelete} variant="outline" className="bg-red-50 hover:bg-red-100">
              <Trash className="mr-2 h-4 w-4" />
              Ta bort sparade
            </Button>
            <Button onClick={handleCreate} variant="outline" className="bg-green-50 hover:bg-green-100">
              Skapa
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-indigo-900">
            {currentScheduleName || "Skapa ett schema"}
          </span>
        </div>
      </div>
      <div className="flex">
        <div className="grid grid-cols-8 gap-1 bg-white p-6 rounded-xl shadow-lg overflow-x-auto flex-grow">
          <div className="font-bold text-center py-2 min-w-[100px]">Tid</div>
          {weekDays.map((day, index) => (
            <div key={day} className="font-bold text-center py-2 min-w-[150px]">
              {day}
              <br />
              <span>
                {format(addDays(weekStart, index), "d MMM", { locale: sv })}
              </span>
            </div>
          ))}
          {schedule[0].map((_, slot) => (
            <React.Fragment key={slot}>
              <div className="text-center py-2 border min-w-[100px] font-medium">
                {format(addMinutes(new Date().setHours(6, 0, 0, 0), slot * parseInt(interval)), "HH:mm")}
              </div>
              {weekDays.map((_, day) => (
                <div
                  key={`${day}-${slot}`}
                  className={cn(
                    "schedule-cell cursor-pointer transition-all duration-200 ease-in-out min-w-[150px] min-h-[60px] relative hover:shadow-md",
                    schedule[day][slot].backgroundColor === schedule[day][slot - 1]?.backgroundColor &&
                    schedule[day][slot].backgroundColor !== "" &&
                    "border-t-0"
                  )}
                  style={{
                    backgroundColor: schedule[day][slot].backgroundColor,
                    borderColor: schedule[day][slot].borderColor,
                    borderStyle: schedule[day][slot].borderColor ? "solid" : "none",
                    borderWidth: schedule[day][slot].borderColor ? "2px" : "0px" // Adjust border width as needed
                  }}
                  onClick={() => handleCellClick(day, slot)}
                >
                  <textarea
                    className="w-full h-full p-2 bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
                    value={schedule[day][slot].text}
                    onChange={(e) => handleCellTextChange(day, slot, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    readOnly={mode === "color"}
                    style={{
                      color: schedule[day][slot].textColor,
                      pointerEvents: mode === "color" ? "none" : "auto"
                    }}
                  />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
        <ExtraTasks blocks={blocks} setBlocks={setBlocks} selectedBackgroundColor={selectedBackgroundColor} selectedTextColor={selectedTextColor} isBorderMode={isBorderMode} />
      </div>
      <CustomAlertDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={onDialogConfirm}
        title={dialogTitle}
        description={dialogDescription}
        textColor={selectedTextColor}
      />
      <LoadScheduleDialog
        isOpen={isLoadDialogOpen}
        onClose={() => setIsLoadDialogOpen(false)}
        onConfirm={handleLoadConfirm}
        scheduleNames={scheduleNames}
      />
      <DeleteScheduleDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        scheduleNames={scheduleNames}
      />
      <CreateScheduleDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onConfirm={(scheduleName) => {
          if (scheduleNames.includes(scheduleName)) {
            showAlert("Fel", "Schemanamnet finns redan. Vänligen välj ett annat namn.");
            return;
          }
          setCurrentScheduleName(scheduleName);
          showAlert("Schema skapat", `Schema "${scheduleName}" har skapats!`);
        }}
        existingNames={scheduleNames}
      />
      <CustomAlert
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        title={alertTitle}
        description={alertDescription}
      />
    </div>
  )
}
