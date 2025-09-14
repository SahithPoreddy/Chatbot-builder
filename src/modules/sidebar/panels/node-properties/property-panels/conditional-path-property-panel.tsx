import type { ConditionalPathNodeData } from '~/modules/nodes/nodes/conditional-path-node/conditional-path.node'
import type { BuilderNodeType } from '~/modules/nodes/types'
import { useState } from 'react'
import { nanoid } from 'nanoid'
import { useConditionStore } from '~/stores/condition-store'
import { useCaseStore } from '~/stores/case-store'
import { useReactFlow } from '@xyflow/react'

type ConditionalPathNodePropertyPanelProps = Readonly<{
  id: string;
  type: BuilderNodeType;
  data: ConditionalPathNodeData;
  updateData: (data: Partial<ConditionalPathNodeData>) => void;
}>

export default function ConditionalPathNodePropertyPanel({ id, data, updateData }: ConditionalPathNodePropertyPanelProps) {
  const { conditions } = useConditionStore()
  const { cases } = useCaseStore()
  const [newPathCase, setNewPathCase] = useState('')
  const { setEdges } = useReactFlow()

  const handleConditionChange = (conditionId: string) => {
    const selectedCondition = conditions.find(c => c.id === conditionId)
    if (selectedCondition) {
      updateData({
        condition: {
          id: selectedCondition.id,
          condition: selectedCondition.condition
        }
      })
    }
  }

  const handleAddPath = () => {
    const selectedCase = cases.find(c => c.id === newPathCase)
    if (selectedCase && !data.paths.some(p => p.case.id === selectedCase.id)) {
      updateData({
        paths: [...data.paths, {
          id: nanoid(),
          case: {
            id: selectedCase.id,
            value: selectedCase.value
          }
        }]
      })
      setNewPathCase('')
    }
  }

  const handleRemovePath = (pathId: string) => {
    updateData({
      paths: data.paths.filter(p => p.id !== pathId)
    })
    setEdges(edges => edges.filter(edge => edge.sourceHandle !== pathId))
  }

  return (
    <div className="flex flex-col gap-4.5 p-4">
      <div className="flex flex-col">
        <div className="text-xs text-light-900/60 font-semibold">
          Unique Identifier
        </div>
        <div className="mt-2 flex">
          <input
            type="text"
            value={id}
            readOnly
            className="h-8 w-full border border-dark-200 rounded-md bg-dark-400 px-2.5 text-sm font-medium shadow-sm outline-none transition hover:(bg-dark-300/60) read-only:(text-light-900/80 op-80 hover:bg-dark-300/30)"
          />
        </div>
      </div>

      <div className="flex flex-col">
        <div className="text-xs text-light-900/60 font-semibold">
          Condition
        </div>
        <div className="mt-2 flex">
          <select
            value={data.condition?.id || ''}
            onChange={(e) => handleConditionChange(e.target.value)}
            className="h-8 w-full border border-dark-200 rounded-md bg-dark-400 px-2.5 text-sm shadow-sm outline-none transition hover:(bg-dark-300/60) focus:(border-purple-600 ring-1 ring-purple-600/50)"
          >
            <option value="">Select a condition...</option>
            {conditions.map(condition => (
              <option key={condition.id} value={condition.id}>
                {condition.condition}
              </option>
            ))}
          </select>
        </div>
        {data.condition && (
          <div className="mt-2 text-xs text-light-900/80">
            Selected: {data.condition.condition}
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <div className="text-xs text-light-900/60 font-semibold">
          Paths
        </div>
        <div className="mt-2 flex gap-2">
          <select
            value={newPathCase}
            onChange={(e) => setNewPathCase(e.target.value)}
            className="h-8 flex-1 border border-dark-200 rounded-md bg-dark-400 px-2.5 text-sm shadow-sm outline-none transition hover:(bg-dark-300/60) focus:(border-purple-600 ring-1 ring-purple-600/50)"
          >
            <option value="">Select a case...</option>
            {cases.filter(c => !data.paths.some(p => p.case.id === c.id)).map(caseItem => (
              <option key={caseItem.id} value={caseItem.id}>
                {caseItem.value}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddPath}
            disabled={!newPathCase}
            className="px-3 py-1 rounded bg-purple-600 text-white text-sm disabled:(opacity-50 cursor-not-allowed) hover:(bg-purple-700)"
          >
            Add
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {data.paths.map(path => (
            <div key={path.id} className="flex items-center justify-between p-2 bg-dark-300/50 rounded border border-dark-200">
              <span className="text-sm text-light-900/80">{path.case.value}</span>
              <button
                type="button"
                onClick={() => handleRemovePath(path.id)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
