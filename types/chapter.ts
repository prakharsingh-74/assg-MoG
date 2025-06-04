export interface Chapter {
  subject: string
  chapter: string
  class: string
  unit: string
  yearWiseQuestionCount: {
    [year: string]: number
  }
  questionSolved: number
  status: string
  isWeakChapter: boolean
}

export type Subject = "Physics" | "Chemistry" | "Mathematics"

export interface Filters {
  classes: string[]
  units: string[]
  status: string // Changed from string[] to string
  weakChapters: boolean
}
