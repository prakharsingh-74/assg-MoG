"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronRight, ArrowUpDown, ChevronDown, ArrowLeft } from "lucide-react"
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
import { ThemeToggle } from "@/components/theme-toggle"

const subjects = [
  { key: "Physics" as Subject, name: "Phy", fullName: "Physics PYQs", icon: "/icons/physics.png", color: "orange" },
  {
    key: "Chemistry" as Subject,
    name: "Chem",
    fullName: "Chemistry PYQs",
    icon: "/icons/chemistry.png",
    color: "green",
  },
  {
    key: "Mathematics" as Subject,
    name: "Math",
    fullName: "Mathematics PYQs",
    icon: "/icons/maths.png",
    color: "blue",
  },
]

export default function JEEMainDashboard() {
  const [activeSubject, setActiveSubject] = useState<Subject>("Physics")
  const [filters, setFilters] = useState<Filters>({
    classes: [],
    units: [],
    status: "",
    weakChapters: false,
  })
  const [sortBy, setSortBy] = useState<"name" | "questions" | "solved">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Filter chapters by active subject
  const currentChapters = useMemo(() => {
    return (chaptersData as Chapter[]).filter((chapter) => chapter.subject === activeSubject)
  }, [activeSubject])

  const availableClasses = useMemo(() => getUniqueClasses(currentChapters), [currentChapters])
  const availableUnits = useMemo(() => getUniqueUnits(currentChapters), [currentChapters])
  const availableStatuses = ["Not Started", "In Progress", "Completed"]

  // Filter and sort chapters
  const filteredAndSortedChapters = useMemo(() => {
    const filtered = currentChapters.filter((chapter) => {
      if (filters.classes.length > 0 && !filters.classes.includes(chapter.class)) {
        return false
      }
      if (filters.units.length > 0 && !filters.units.includes(chapter.unit)) {
        return false
      }
      if (filters.status && filters.status !== chapter.status) {
        return false
      }
      if (filters.weakChapters && !chapter.isWeakChapter) {
        return false
      }
      return true
    })

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
      } else if (filterType === "status") {
        return { ...prev, [filterType]: prev.status === value ? "" : (value as string) }
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
      status: "",
      weakChapters: false,
    })
  }

  const getActiveSubjectIcon = () => {
    const subject = subjects.find((s) => s.key === activeSubject)
    return subject?.icon || "/icons/physics.png"
  }

  const getSubjectColor = (subject: Subject) => {
    const subjectData = subjects.find((s) => s.key === subject)
    switch (subjectData?.color) {
      case "orange":
        return "bg-orange-500"
      case "green":
        return "bg-green-500"
      case "blue":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900">
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">JEE Main</h1>
          <div className="w-6 h-6" /> {/* Spacer */}
        </div>

        {/* Subject Tabs */}
        <div className="px-4 py-6 bg-white dark:bg-gray-900">
          <div className="flex justify-center gap-12">
            {subjects.map((subject) => {
              const isActive = activeSubject === subject.key
              return (
                <button
                  key={subject.key}
                  onClick={() => setActiveSubject(subject.key)}
                  className="flex flex-col items-center gap-2 relative"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      subject.color === "orange"
                        ? "bg-orange-500"
                        : subject.color === "green"
                          ? "bg-green-500"
                          : "bg-blue-500"
                    }`}
                  >
                    <Image
                      src={subject.icon || "/placeholder.svg"}
                      alt={subject.name}
                      width={24}
                      height={24}
                      className="w-6 h-6 object-cover"
                    />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {subject.name}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="flex gap-3 px-4 pb-4 overflow-x-auto">
          {/* Class Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-sm rounded-full px-4 py-2 border-gray-300"
              >
                Class
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
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap text-sm rounded-full px-4 py-2 border-gray-300"
              >
                Units
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
          <Button
            variant={filters.status === "Not Started" ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("status", "Not Started")}
            className="whitespace-nowrap text-sm rounded-full px-4 py-2"
          >
            Not Started
          </Button>

          {/* Weak Chapters */}
          <Button
            variant={filters.weakChapters ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange("weakChapters", !filters.weakChapters)}
            className="whitespace-nowrap text-sm rounded-full px-4 py-2"
          >
            Wea...
          </Button>

          {/* More filters indicator */}
          <Button variant="ghost" size="sm" className="px-2">
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Button>
        </div>

        {/* Chapter Count and Sort */}
        <div className="flex items-center justify-between px-4 pb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing all chapters ({filteredAndSortedChapters.length})
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 text-sm">
                ↕ Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuCheckboxItem checked={sortBy === "name"} onCheckedChange={() => setSortBy("name")}>
                Name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={sortBy === "questions"} onCheckedChange={() => setSortBy("questions")}>
                Total Questions
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={sortBy === "solved"} onCheckedChange={() => setSortBy("solved")}>
                Questions Solved
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Chapter List */}
        <div className="px-4 space-y-3 pb-4">
          {filteredAndSortedChapters.map((chapter, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="text-orange-500 text-lg flex-shrink-0">{getChapterIcon(chapter.chapter)}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight">
                  {chapter.chapter}
                </h3>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {chapter.yearWiseQuestionCount["2025"] || 0}: 60s | {chapter.yearWiseQuestionCount["2024"] || 0}: 60s
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {chapter.questionSolved}/{getTotalQuestions(chapter.yearWiseQuestionCount)} Qs
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedChapters.length === 0 && (
          <div className="text-center py-12 px-4">
            <p className="text-gray-500 dark:text-gray-400">No chapters match your current filters.</p>
            <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900">
      {/* Left Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-20" : "w-[320px]"} bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 transition-all duration-300`}
      >
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
            {!sidebarCollapsed && (
              <span className="font-semibold text-xl text-gray-900 dark:text-gray-100">JEE Main</span>
            )}
          </div>
          {!sidebarCollapsed && (
            <p className="text-sm text-gray-500 dark:text-gray-400">2025 - 2009 | 173 Papers | 15825 Qs</p>
          )}
        </div>

        <div className="space-y-3">
          {subjects.map((subject) => {
            const isActive = activeSubject === subject.key
            return (
              <div
                key={subject.key}
                onClick={() => setActiveSubject(subject.key)}
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} p-4 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? "bg-gray-800 dark:bg-gray-700 text-white"
                    : "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
                }`}
                title={sidebarCollapsed ? subject.fullName : undefined}
              >
                <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"}`}>
                  <div className="w-8 h-8 rounded-lg overflow-hidden">
                    <Image
                      src={subject.icon || "/placeholder.svg"}
                      alt={subject.fullName}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {!sidebarCollapsed && <span className="font-medium">{subject.fullName}</span>}
                </div>
                {!sidebarCollapsed && (
                  <ChevronRight className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400 dark:text-gray-500"}`} />
                )}
              </div>
            )
          })}

          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full justify-center"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 relative">
        {/* Theme Toggle Button */}
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>

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
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{activeSubject} PYQs</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Chapter-wise Collection of {activeSubject} PYQs</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Class Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              >
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
              <Button
                variant="outline"
                className="text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              >
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
              <Button
                variant="outline"
                className="text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
              >
                Status {filters.status && `(${filters.status})`}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {availableStatuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={filters.status === status}
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
            <label htmlFor="weak-chapters" className="text-sm font-medium cursor-pointer dark:text-gray-300">
              Weak Chapters
            </label>
          </div>

          {/* Clear Filters */}
          {(filters.classes.length > 0 || filters.units.length > 0 || filters.status || filters.weakChapters) && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </div>

        {/* Chapter Count and Sort */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAndSortedChapters.length} chapters ({currentChapters.length} total)
          </p>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 font-medium">
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
            <Card
              key={index}
              className="p-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow bg-white dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-orange-500 w-6 text-center">{getChapterIcon(chapter.chapter)}</div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{chapter.chapter}</span>
                    {chapter.isWeakChapter && (
                      <span className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                        Weak
                      </span>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {chapter.class} • {chapter.unit} • {chapter.status}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-4">
                    <div className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">2025:</span> {chapter.yearWiseQuestionCount["2025"] || 0}Qs{" "}
                      {getTrendIcon(chapter)}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      <span className="font-medium">2024:</span> {chapter.yearWiseQuestionCount["2024"] || 0}Qs
                    </div>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 min-w-[100px] text-right">
                    {chapter.questionSolved}/{getTotalQuestions(chapter.yearWiseQuestionCount)} Qs
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredAndSortedChapters.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No chapters match your current filters.</p>
            <Button variant="outline" className="mt-4" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
