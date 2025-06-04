"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronRight, ArrowUpDown, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import chaptersData from "@/data/chapters.json"
import type { Chapter, Subject, Filters } from "@/types/chapter"
import {
  getChapterIcon,
  calculateTrend,
  getTotalQuestions,
  getUniqueClasses,
  getUniqueUnits,
} from "@/utils/dataProcessing"
import Image from "next/image"

const subjects = [
  { key: "Physics" as Subject, name: "Physics PYQs", icon: "/icons/physics.png", color: "orange" },
  { key: "Chemistry" as Subject, name: "Chemistry PYQs", icon: "/icons/chemistry.png", color: "green" },
  { key: "Mathematics" as Subject, name: "Mathematics PYQs", icon: "/icons/maths.png", color: "blue" },
]

export default function JEEMainDashboard() {
  const [activeSubject, setActiveSubject] = useState<Subject>("Physics")
  const [filters, setFilters] = useState<Filters>({
    classes: [],
    units: [],
    status: [],
    weakChapters: false,
  })
  const [sortBy, setSortBy] = useState<"name" | "questions" | "solved">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  // Filter chapters by active subject
  const currentChapters = useMemo(() => {
    return (chaptersData as Chapter[]).filter((chapter) => chapter.subject === activeSubject)
  }, [activeSubject])

  // Get unique classes and units for current subject
  const availableClasses = useMemo(() => getUniqueClasses(currentChapters), [currentChapters])
  const availableUnits = useMemo(() => getUniqueUnits(currentChapters), [currentChapters])
  const availableStatuses = ["Not Started", "In Progress", "Completed"]

  // Filter and sort chapters
  const filteredAndSortedChapters = useMemo(() => {
    const filtered = currentChapters.filter((chapter) => {
      // Class filter
      if (filters.classes.length > 0 && !filters.classes.includes(chapter.class)) {
        return false
      }

      // Unit filter
      if (filters.units.length > 0 && !filters.units.includes(chapter.unit)) {
        return false
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(chapter.status)) {
        return false
      }

      // Weak chapters filter
      if (filters.weakChapters && !chapter.isWeakChapter) {
        return false
      }

      return true
    })

    // Sort chapters
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "name":
          comparison = a.chapter.localeCompare(b.chapter)
          break
        case "questions":
          comparison = getTotalQuestions(a.yearWiseQuestionCount) - getTotalQuestions(b.yearWiseQuestionCount)
          break
        case "solved":
          comparison = a.questionSolved - b.questionSolved
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [currentChapters, filters, sortBy, sortOrder])

  const getTrendIcon = (chapter: Chapter) => {
    const trend = calculateTrend(chapter.yearWiseQuestionCount)
    switch (trend) {
      case "up":
        return <span className="text-green-500">↑</span>
      case "down":
        return <span className="text-red-500">↓</span>
      default:
        return null
    }
  }

  const handleFilterChange = (filterType: keyof Filters, value: string | boolean) => {
    setFilters((prev) => {
      if (filterType === "weakChapters") {
        return { ...prev, [filterType]: value as boolean }
      } else {
        const currentValues = prev[filterType] as string[]
        const newValues = currentValues.includes(value as string)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value as string]
        return { ...prev, [filterType]: newValues }
      }
    })
  }

  const clearAllFilters = () => {
    setFilters({
      classes: [],
      units: [],
      status: [],
      weakChapters: false,
    })
  }

  const getSubjectStats = (subject: Subject) => {
    const subjectChapters = (chaptersData as Chapter[]).filter((ch) => ch.subject === subject)
    const totalQuestions = subjectChapters.reduce((sum, ch) => sum + getTotalQuestions(ch.yearWiseQuestionCount), 0)
    const solvedQuestions = subjectChapters.reduce((sum, ch) => sum + ch.questionSolved, 0)
    return { total: subjectChapters.length, totalQuestions, solvedQuestions }
  }

  const getActiveSubjectIcon = () => {
    const subject = subjects.find((s) => s.key === activeSubject)
    return subject?.icon || "/icons/physics.png"
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-[320px] bg-gray-50 border-r border-gray-200 p-4">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <Image
                src="/icons/exam-logo.png"
                alt="JEE Main"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-semibold text-xl text-gray-900">JEE Main</span>
          </div>
          <p className="text-sm text-gray-500">2025 - 2009 | 173 Papers | 15825 Qs</p>
        </div>

        <div className="space-y-3">
          {subjects.map((subject) => {
            const isActive = activeSubject === subject.key
            return (
              <div
                key={subject.key}
                onClick={() => setActiveSubject(subject.key)}
                className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-900 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg overflow-hidden">
                    <Image
                      src={subject.icon || "/placeholder.svg"}
                      alt={subject.name}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-medium">{subject.name}</span>
                </div>
                <ChevronRight className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg overflow-hidden">
              <Image
                src={getActiveSubjectIcon() || "/placeholder.svg"}
                alt={`${activeSubject} PYQs`}
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">{activeSubject} PYQs</h1>
          </div>
          <p className="text-sm text-gray-500">Chapter-wise Collection of {activeSubject} PYQs</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Class Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-sm border-gray-300 bg-white">
                Class {filters.classes.length > 0 && `(${filters.classes.length})`}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availableClasses.map((cls) => (
                <DropdownMenuCheckboxItem
                  key={cls}
                  checked={filters.classes.includes(cls)}
                  onCheckedChange={() => handleFilterChange("classes", cls)}
                >
                  {cls}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Units Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-sm border-gray-300 bg-white">
                Units {filters.units.length > 0 && `(${filters.units.length})`}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-60 overflow-y-auto">
              {availableUnits.map((unit) => (
                <DropdownMenuCheckboxItem
                  key={unit}
                  checked={filters.units.includes(unit)}
                  onCheckedChange={() => handleFilterChange("units", unit)}
                >
                  {unit}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-sm border-gray-300 bg-white">
                Status {filters.status.length > 0 && `(${filters.status.length})`}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availableStatuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={filters.status.includes(status)}
                  onCheckedChange={() => handleFilterChange("status", status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Weak Chapters Toggle */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="weak-chapters"
              checked={filters.weakChapters}
              onCheckedChange={(checked) => handleFilterChange("weakChapters", checked as boolean)}
            />
            <label htmlFor="weak-chapters" className="text-sm font-medium cursor-pointer">
              Weak Chapters
            </label>
          </div>

          {/* Clear Filters */}
          {(filters.classes.length > 0 ||
            filters.units.length > 0 ||
            filters.status.length > 0 ||
            filters.weakChapters) && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </div>

        {/* Chapter Count and Sort */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredAndSortedChapters.length} chapters ({currentChapters.length} total)
          </p>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-blue-600 font-medium">
                  <ArrowUpDown className="w-4 h-4 mr-1" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuCheckboxItem checked={sortBy === "name"} onCheckedChange={() => setSortBy("name")}>
                  Name
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === "questions"}
                  onCheckedChange={() => setSortBy("questions")}
                >
                  Total Questions
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={sortBy === "solved"} onCheckedChange={() => setSortBy("solved")}>
                  Questions Solved
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
              {sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </div>
        </div>

        {/* Chapters List */}
        <div className="space-y-3">
          {filteredAndSortedChapters.map((chapter, index) => (
            <Card key={index} className="p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-orange-500 w-6 text-center">{getChapterIcon(chapter.chapter)}</div>
                  <div>
                    <span className="font-medium text-gray-900">{chapter.chapter}</span>
                    {chapter.isWeakChapter && (
                      <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Weak</span>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {chapter.class} • {chapter.unit} • {chapter.status}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-4">
                    <div className="text-gray-600">
                      <span className="font-medium">2025:</span> {chapter.yearWiseQuestionCount["2025"] || 0}Qs{" "}
                      {getTrendIcon(chapter)}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">2024:</span> {chapter.yearWiseQuestionCount["2024"] || 0}Qs
                    </div>
                  </div>
                  <div className="text-gray-500 min-w-[100px] text-right">
                    {chapter.questionSolved}/{getTotalQuestions(chapter.yearWiseQuestionCount)} Qs
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredAndSortedChapters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No chapters match your current filters.</p>
            <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
