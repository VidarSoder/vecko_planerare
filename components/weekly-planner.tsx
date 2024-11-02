"use client"

import { useState, useEffect } from "react"
import { format, addDays, startOfWeek, addMinutes } from "date-fns"
import { sv } from "date-fns/locale"
import { Calendar as CalendarIcon, Printer, Paintbrush, Type, Save, Download } from "lucide-react"

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
}

const STORAGE_KEY = "weekly-planner-data"

export function WeeklyPlannerComponent() {
  const [date, setDate] = useState<Date>(new Date())
  const [interval, setInterval] = useState("60")
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [schedule, setSchedule] = useState<ScheduleCell[][]>(
    Array(7).fill([]).map(() => Array(24).fill({ backgroundColor: "", textColor: "#000000", text: "" }))
  )
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState("#4F46E5")
  const [selectedTextColor, setSelectedTextColor] = useState("#000000")
  const [mode, setMode] = useState<"color" | "text">("color")

  useEffect(() => {
    if (date) {
      setWeekStart(startOfWeek(date, { weekStartsOn: 1 }))
    }
  }, [date])

  const handleApplyDateAndInterval = () => {
    setWeekStart(startOfWeek(date, { weekStartsOn: 1 }))
    const intervalMinutes = parseInt(interval)
    const slotsPerDay = Math.floor((24 * 60) / intervalMinutes)
    const newSchedule = Array(7).fill([]).map(() => {
      const daySchedule = []
      for (let i = 0; i < slotsPerDay; i++) {
        daySchedule.push({ backgroundColor: "", textColor: "#000000", text: "" })
      }
      return daySchedule
    })
    setSchedule(newSchedule)
  }

  const handleCellClick = (day: number, slot: number) => {
    if (mode === "color") {
      const newSchedule = [...schedule]
      newSchedule[day][slot] = {
        ...newSchedule[day][slot],
        backgroundColor: selectedBackgroundColor
      }
      setSchedule(newSchedule)
    }
  }

  const handleCellTextChange = (day: number, slot: number, text: string) => {
    const newSchedule = [...schedule]
    newSchedule[day][slot] = { ...newSchedule[day][slot], text, textColor: selectedTextColor }
    setSchedule(newSchedule)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleSave = () => {
    if (window.confirm("Är du säker på att du vill spara nuvarande schema? Detta kommer att skriva över tidigare sparad data.")) {
      const data = {
        schedule,
        date,
        interval
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      alert("Schema sparat!")
    }
  }

  const handleLoad = () => {
    if (window.confirm("Är du säker på att du vill ladda sparad data? Detta kommer att skriva över nuvarande schema.")) {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const data = JSON.parse(savedData)
        setSchedule(data.schedule)
        setDate(new Date(data.date))
        setInterval(data.interval)
        alert("Schema laddat!")
      } else {
        alert("Ingen sparad data hittades.")
      }
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-full bg-gradient-to-b from-indigo-50 to-white min-h-screen">
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
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} variant="outline" className="bg-green-50 hover:bg-green-100">
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
          </div>
        </div>
      </div>
      <div className="grid grid-cols-8 gap-1 bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
        <div className="font-bold text-center py-2 min-w-[100px]">Tid</div>
        {weekDays.map((day, index) => (
          <div key={day} className="font-bold text-center py-2 min-w-[150px] text-indigo-900">
            {day}
            <br />
            <span className="text-indigo-600">
              {format(addDays(weekStart, index), "d MMM", { locale: sv })}
            </span>
          </div>
        ))}
        {schedule[0].map((_, slot) => (
          <React.Fragment key={slot}>
            <div className="text-center py-2 border-t min-w-[100px] text-indigo-900 font-medium">
              {format(addMinutes(new Date().setHours(0, 0, 0, 0), slot * parseInt(interval)), "HH:mm")}
            </div>
            {weekDays.map((_, day) => (
              <div
                key={`${day}-${slot}`}
                className={cn(
                  "border-t cursor-pointer transition-all duration-200 ease-in-out min-w-[150px] min-h-[60px] relative hover:shadow-md",
                  schedule[day][slot].backgroundColor === schedule[day][slot - 1]?.backgroundColor &&
                  schedule[day][slot].backgroundColor !== "" &&
                  "border-t-0"
                )}
                style={{ backgroundColor: schedule[day][slot].backgroundColor }}
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
    </div>
  )
}