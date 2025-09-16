import { useState } from 'react';
import { useConditionStore } from '~/stores/condition-store';
import { useCaseStore } from '~/stores/case-store';
import SidebarPanelHeading from '~/modules/sidebar/components/sidebar-panel-heading';

export function AttributesManagementPanel() {
  const { conditions, addCondition, removeCondition } = useConditionStore();
  const { cases, addCase, removeCase } = useCaseStore();
  const [newCondition, setNewCondition] = useState('');
  const [newCase, setNewCase] = useState('');

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      addCondition(newCondition);
      setNewCondition('');
    }
  };

  const handleAddCase = () => {
    if (newCase.trim()) {
      addCase(newCase);
      setNewCase('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <SidebarPanelHeading className="shrink-0">
        <div className="i-mynaui:cog size-4.5" />
        Attributes Management
      </SidebarPanelHeading>
      <div className="p-4 flex flex-col gap-6 overflow-auto">
        <div>
          <h3 className="text-sm font-medium text-light-900/80 mb-2">Condition Attributes</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="border border-dark-100 rounded-md px-2 py-1 text-xs bg-dark-50 text-white outline-none flex-1"
              placeholder="Enter new condition"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCondition();
              }}
            />
            <button
              type="button"
              className="px-2 py-1 rounded bg-blue-500 text-white text-xs"
              onClick={handleAddCondition}
            >
              Add
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            {conditions.map(({ id, condition }) => (
              <li key={id} className="flex items-center justify-between text-xs text-light-900">
                <span>{condition}</span>
                <button
                  type="button"
                  className="text-red-400 hover:text-red-600"
                  onClick={() => removeCondition(id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-light-900/80 mb-2">Path Attributes</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="border border-dark-100 rounded-md px-2 py-1 text-xs bg-dark-50 text-white outline-none flex-1"
              placeholder="Enter new path"
              value={newCase}
              onChange={(e) => setNewCase(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCase();
              }}
            />
            <button
              type="button"
              className="px-2 py-1 rounded bg-blue-500 text-white text-xs"
              onClick={handleAddCase}
            >
              Add
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            {cases.map(({ id, value }) => (
              <li key={id} className="flex items-center justify-between text-xs text-light-900">
                <span>{value}</span>
                <button
                  type="button"
                  className="text-red-400 hover:text-red-600"
                  onClick={() => removeCase(id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
