import { useApplicationState } from '~/stores/application-state';

export default function UndoRedoButtons() {
  const { undo, redo, canUndo, canRedo } = useApplicationState(s => s.diagram);

  console.log('UndoRedoButtons rendering at', new Date().toISOString());

  const handleUndo = () => {
    console.log('Undo button clicked at', new Date().toISOString());
    if (undo && canUndo) {
      console.log('Calling undo function');
      undo();
    } else {
      console.log('Undo not available:', {
        undo: !!undo,
        canUndo: canUndo,
        lastStateRef: 'check flow-builder logs'
      });
    }
  };

  const handleRedo = () => {
    console.log('Redo button clicked');
    if (redo && canRedo) {
      console.log('Calling redo function');
      redo();
    } else {
      console.log('Redo not available:', { redo: !!redo, canRedo: canRedo });
    }
  };

  const isUndoAvailable = undo && canUndo;
  const isRedoAvailable = redo && canRedo;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        title={isUndoAvailable ? "Undo" : "Undo (not available)"}
        className="size-8 flex items-center justify-center rounded-lg border border-transparent outline-none transition bg-transparent hover:(bg-dark-200) active:(bg-dark-500 border-dark-300) disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleUndo}
        disabled={!isUndoAvailable}
      >
        <div className="i-mynaui:undo size-5" />
      </button>
      <button
        type="button"
        title={isRedoAvailable ? "Redo" : "Redo (not available)"}
        className="size-8 flex items-center justify-center rounded-lg border border-transparent outline-none transition bg-transparent hover:(bg-dark-200) active:(bg-dark-500 border-dark-300) disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleRedo}
        disabled={!isRedoAvailable}
      >
        <div className="i-mynaui:redo size-5" />
      </button>
    </div>
  );
}
