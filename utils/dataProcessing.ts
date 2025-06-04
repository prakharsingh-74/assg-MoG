import type { Chapter } from "@/types/chapter"

export const getChapterIcon = (chapter: string): string => {
  const iconMap: { [key: string]: string } = {
    "Mathematics in Physics": "𝑓",
    "Units and Dimensions": "📏",
    "Motion In One Dimension": "←",
    "Motion In Two Dimensions": "↗",
    "Laws of Motion": "⊙",
    "Work Energy and Power": "⚡",
    "Rotational Motion": "🔄",
    Gravitation: "🌍",
    "Atomic Structure": "⚛️",
    "Chemical Bonding": "🔗",
    "Periodic Table": "📊",
    "Sets and Relations": "∈",
    Trigonometry: "📐",
    "Complex Numbers": "ℂ",
  }

  return iconMap[chapter] || "📚"
}

export const calculateTrend = (yearWiseQuestionCount: { [year: string]: number }): "up" | "down" | "neutral" => {
  const years = Object.keys(yearWiseQuestionCount).sort()
  const recent = years.slice(-2)

  if (recent.length < 2) return "neutral"

  const [prevYear, currentYear] = recent
  const prevCount = yearWiseQuestionCount[prevYear]
  const currentCount = yearWiseQuestionCount[currentYear]

  if (currentCount > prevCount) return "up"
  if (currentCount < prevCount) return "down"
  return "neutral"
}

export const getTotalQuestions = (yearWiseQuestionCount: { [year: string]: number }): number => {
  return Object.values(yearWiseQuestionCount).reduce((sum, count) => sum + count, 0)
}

export const getUniqueClasses = (chapters: Chapter[]): string[] => {
  return [...new Set(chapters.map((ch) => ch.class))].sort()
}

export const getUniqueUnits = (chapters: Chapter[]): string[] => {
  return [...new Set(chapters.map((ch) => ch.unit))].sort()
}
