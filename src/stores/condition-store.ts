// src/modules/nodes/stores/condition-store.ts
import { nanoid } from 'nanoid'
import { create } from 'zustand'

interface Condition {
  id: string;
  condition: string;
}

interface ConditionStore {
  conditions: Condition[];
  addCondition: (condition: string) => void;
  removeCondition: (id: string) => void;
}

const initialConditions: Condition[] = [
  { id: nanoid(), condition: 'User ordered a product' },
  { id: nanoid(), condition: 'User added a product to cart' },
  { id: nanoid(), condition: 'User visited a page' },
  { id: nanoid(), condition: 'User clicked a button' },
  { id: nanoid(), condition: 'User submitted a form data' },
]

export const useConditionStore = create<ConditionStore>(set => ({
  conditions: initialConditions,
  addCondition: (condition) => {
    if (condition.trim()) {
      const newCondition = { id: nanoid(), condition: condition.trim() }
      set(state => ({
        conditions: [...state.conditions, newCondition],
      }))
    }
  },
  removeCondition: (id) => {
    set(state => ({
      conditions: state.conditions.filter(c => c.id !== id),
    }))
  },
}))
