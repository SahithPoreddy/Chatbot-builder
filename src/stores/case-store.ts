// src/modules/nodes/stores/case-store.ts
import { nanoid } from 'nanoid'
import { create } from 'zustand'

interface Case {
  id: string;
  value: string;
}

interface CaseStore {
  cases: Case[];
  addCase: (value: string) => void;
  removeCase: (id: string) => void;
}

const initialCases: Case[] = [
  { id: nanoid(), value: 'Allowed' },
  { id: nanoid(), value: 'Denied' },
  { id: nanoid(), value: 'Pending' },
  { id: nanoid(), value: 'Approved' },
  { id: nanoid(), value: 'Rejected' },
  { id: nanoid(), value: 'Cancelled' },
  { id: nanoid(), value: 'Completed' },
  { id: nanoid(), value: 'Failed' },
]

export const useCaseStore = create<CaseStore>(set => ({
  cases: initialCases,
  addCase: (value) => {
    if (value.trim()) {
      const newCase = { id: nanoid(), value: value.trim() }
      set(state => ({
        cases: [...state.cases, newCase],
      }))
    }
  },
  removeCase: (id) => {
    set(state => ({
      cases: state.cases.filter(c => c.id !== id),
    }))
  },
}))
