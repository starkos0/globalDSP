export interface PreprocessedRecipe {
  itemsNeeded: ItemsNeeded[]
  resultItems: ResultItem[]
  timeNeeded: number
  ID: number
  name: string
}

export interface ItemsNeeded {
  name: string
  iconpath: string
  itemsNeeded: number
}

export interface ResultItem {
  name: string
  iconpath: string
  itemsResult: number
}
