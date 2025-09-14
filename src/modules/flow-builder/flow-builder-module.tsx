import type { Connection, Edge, EdgeTypes, Node, NodeChange } from '@xyflow/react'
import { addEdge, Background, ReactFlow, useEdgesState, useNodesState, useReactFlow } from '@xyflow/react'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toSvg } from 'html-to-image'
import { cn } from '~@/utils/cn'
import AddNodeFloatingMenu from '~/modules/flow-builder/components/add-node-floating-menu/add-node-floating-menu'
import CustomControls from '~/modules/flow-builder/components/controls/custom-controls'
import CustomDeletableEdge from '~/modules/flow-builder/components/edges/custom-deletable-edge'
import { useAddNodeOnEdgeDrop } from '~/modules/flow-builder/hooks/use-add-node-on-edge-drop'
import { useDeleteKeyCode } from '~/modules/flow-builder/hooks/use-delete-key-code'
import { useDragDropFlowBuilder } from '~/modules/flow-builder/hooks/use-drag-drop-flow-builder'
import { useIsValidConnection } from '~/modules/flow-builder/hooks/use-is-valid-connection'
import { useNodeAutoAdjust } from '~/modules/flow-builder/hooks/use-node-auto-adjust'
import { useOnNodesDelete } from '~/modules/flow-builder/hooks/use-on-nodes-delete'
import { NODE_TYPES } from '~/modules/nodes'
import { useApplicationState } from '~/stores/application-state'

const edgeTypes: EdgeTypes = {
  deletable: CustomDeletableEdge,
}

export function FlowBuilderModule() {
  const [isMobileView, isBuilderBlurred] = useApplicationState(s => [s.view.mobile, s.builder.blurred])

  const reactFlowRef = useRef<HTMLDivElement>(null)

  // Create default simple nodes (just start and end connected)
  const createDefaultNodes = (): Node[] => {
    const startNode: Node = {
      id: nanoid(),
      type: 'start',
      position: { x: 100, y: 100 },
      data: { deletable: false },
    }
    const endNode: Node = {
      id: nanoid(),
      type: 'end',
      position: { x: 400, y: 100 },
      data: { deletable: false },
    }
    return [startNode, endNode]
  }

  const createDefaultEdges = (nodes: Node[]): Edge[] => {
    if (nodes.length >= 2) {
      return [{
        id: nanoid(),
        source: nodes[0].id,
        target: nodes[1].id,
        type: 'deletable',
      }]
    }
    return []
  }

  const [
    nodes,
    setNodesInternal,
    onNodesChange,
  ] = useNodesState<Node>([])
  const [
    edges,
    setEdgesInternal,
    onEdgesChange,
  ] = useEdgesState<Edge>([])

  const { getNodes, getEdges } = useReactFlow()

  // Handle messages from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // IMPORTANT: Replace with your actual parent origin
      const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000', 'https://yourdomain.com'];

      if (!allowedOrigins.includes(event.origin)) {
        console.warn('🚫 Message from unauthorized origin:', event.origin);
        return;
      }

      const data = event.data;
      console.log('� Received message from parent:', data);
      console.log('📍 Message origin:', event.origin);

      if (data && data.type === 'loadData') {
        try {
          console.log('🔄 Processing loadData message...');

          const diagramdata = typeof data.payload === 'string'
            ? JSON.parse(data.payload)
            : data.payload;
          const diagramData = JSON.parse(diagramdata.data.content);

          console.log('📋 Parsed diagram data:', diagramData.nodes);
          console.log('📊 Data structure:');
          console.log('- Nodes count:', diagramData.nodes?.length || 0);
          console.log('- Edges count:', diagramData.edges?.length || 0);
          console.log('- Timestamp:', diagramData.timestamp ? new Date(diagramData.timestamp).toLocaleString() : 'N/A');

                    // Load the data into React Flow
          if (diagramData.nodes && Array.isArray(diagramData.nodes)) {
            console.log('🔍 Loading nodes:')
            diagramData.nodes.forEach((node: any, index: number) => {
              console.log(`  Node ${index + 1}:`, {
                id: node.id,
                type: node.type,
                position: node.position,
                data: node.data
              })
            })
            setNodesInternal(diagramData.nodes)
          } else {
            console.warn('⚠️ No valid nodes array found in data')
          }

          if (diagramData.edges && Array.isArray(diagramData.edges)) {
            console.log('🔗 Loading edges:')
            diagramData.edges.forEach((edge: any, index: number) => {
              console.log(`  Edge ${index + 1}:`, {
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: edge.type
              })
            })
            setEdgesInternal(diagramData.edges)
          } else {
            console.warn('⚠️ No valid edges array found in data')
          }

          // Send confirmation back to parent
          window.parent.postMessage({
            type: 'dataLoaded',
            success: true,
            message: 'Diagram data loaded successfully'
          }, event.origin);

          console.log('✅ Data loaded successfully and confirmation sent to parent');

        } catch (error) {
          console.error('❌ Error parsing/loading diagram data:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

          console.error('Error details:', errorMessage);

          // Send error message back to parent
          window.parent.postMessage({
            type: 'dataLoaded',
            success: false,
            error: errorMessage
          }, event.origin);
        }
      }
    };

    console.log('👂 Setting up message listener for parent communication...');
    window.addEventListener('message', handleMessage);

    // Send ready message when component mounts
    console.log('🚀 Sending ready message to parent...');
    window.parent.postMessage({ type: 'ready' }, '*');

    return () => {
      console.log('🔇 Cleaning up message listener...');
      window.removeEventListener('message', handleMessage);
    };
  }, []); // Empty dependency array - only run once on mount

  // Fallback: Initialize with default nodes if no data loaded
  useEffect(() => {
    if (nodes.length === 0) {
      console.log('📭 No data loaded - initializing with default start/end nodes');
      const defaultNodes = createDefaultNodes();
      const defaultEdges = createDefaultEdges(defaultNodes);

      setNodesInternal(defaultNodes);
      setEdgesInternal(defaultEdges);
    }
  }, [nodes.length]); // Run when nodes array is empty

  // Undo/redo history
  const historyRef = useRef<{ nodes: Node[]; edges: Edge[] }[]>([])
  const historyIndexRef = useRef(-1)
  const [canUndoState, setCanUndoState] = useState(false)
  const [canRedoState, setCanRedoState] = useState(false)
  const maxHistorySize = 50 // Limit history to prevent memory issues
  const isRestoringRef = useRef(false) // Prevent saving during undo/redo operations

  // Initialize history after nodes are loaded
  useEffect(() => {
    if (nodes.length > 0) {
      const initialNodes = getNodes()
      const initialEdges = getEdges()
      if (initialNodes.length > 0 || initialEdges.length > 0) {
        historyRef.current = [{ nodes: [...initialNodes], edges: [...initialEdges] }]
        historyIndexRef.current = 0
        setCanUndoState(false) // No undo available for initial state
        setCanRedoState(false)
      }
    }
  }, [nodes.length, getNodes, getEdges]) // Re-run when nodes are loaded

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Save current state to history with debouncing
  const saveToHistory = useCallback(() => {
    if (isRestoringRef.current) return // Don't save during undo/redo

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Debounce the save to avoid too many saves for rapid changes
    saveTimeoutRef.current = setTimeout(() => {
      const currentNodes = getNodes()
      const currentEdges = getEdges()
      const currentState = { nodes: [...currentNodes], edges: [...currentEdges] }

      // Remove any history after current index (for when we're not at the end)
      historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)

      // Add new state
      historyRef.current.push(currentState)
      historyIndexRef.current = historyRef.current.length - 1

      // Limit history size
      if (historyRef.current.length > maxHistorySize) {
        historyRef.current.shift()
        historyIndexRef.current--
      }

      // Update button states
      setCanUndoState(historyIndexRef.current > 0)
      setCanRedoState(false) // After saving, we're at the end, so no redo available

      console.log('Saved to history, index:', historyIndexRef.current, 'total states:', historyRef.current.length)
    }, 100) // 100ms debounce
  }, [getNodes, getEdges, maxHistorySize])

  // Wrap setNodes and setEdges to save state before changes
  const setNodes = useCallback((nodesOrUpdater: any) => {
    saveToHistory()
    setNodesInternal(nodesOrUpdater)
  }, [setNodesInternal, saveToHistory])

  const setEdges = useCallback((edgesOrUpdater: any) => {
    saveToHistory()
    setEdgesInternal(edgesOrUpdater)
  }, [setEdgesInternal, saveToHistory])

  const undo = useCallback(() => {
    console.log('Undo called, historyIndex:', historyIndexRef.current);
    if (historyIndexRef.current > 0) {
      isRestoringRef.current = true // Prevent saving during restoration
      historyIndexRef.current--
      const previousState = historyRef.current[historyIndexRef.current]
      console.log('Restoring state:', previousState);
      setNodesInternal(previousState.nodes);
      setEdgesInternal(previousState.edges);

      // Update button states
      setCanUndoState(historyIndexRef.current > 0)
      setCanRedoState(true)
      isRestoringRef.current = false // Allow saving again
    } else {
      console.log('No state to undo to');
    }
  }, [setNodesInternal, setEdgesInternal])

  const redo = useCallback(() => {
    console.log('Redo called, historyIndex:', historyIndexRef.current);
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isRestoringRef.current = true // Prevent saving during restoration
      historyIndexRef.current++
      const nextState = historyRef.current[historyIndexRef.current]
      console.log('Restoring state:', nextState);
      setNodesInternal(nextState.nodes);
      setEdgesInternal(nextState.edges);

      // Update button states
      setCanUndoState(historyIndexRef.current > 0)
      setCanRedoState(historyIndexRef.current < historyRef.current.length - 1)
      isRestoringRef.current = false // Allow saving again
    } else {
      console.log('No state to redo to');
    }
  }, [setNodesInternal, setEdgesInternal])

  // SVG Export functionality
  const exportAsSvg = useCallback(async () => {
    if (!reactFlowRef.current) {
      console.error('ReactFlow ref not available')
      return
    }

    try {
      // Get the React Flow instance for zoom control
      const reactFlowInstance = reactFlowRef.current.querySelector('.react-flow__viewport') as HTMLElement
      if (!reactFlowInstance) {
        console.error('React Flow viewport not found')
        return
      }

      // Step 1: Store current zoom level
      const currentTransform = reactFlowInstance.style.transform
      const currentZoom = currentTransform ? parseFloat(currentTransform.match(/scale\(([^)]+)\)/)?.[1] || '1') : 1

      // Step 2: Temporarily zoom out for better overview (70% of current zoom)
      const exportZoom = Math.max(currentZoom * 0.7, 0.5) // Don't go below 50% zoom
      reactFlowInstance.style.transform = currentTransform.replace(/scale\([^)]+\)/, `scale(${exportZoom})`)

      // Step 3: Target the full React Flow wrapper for complete capture
      const reactFlowWrapper = reactFlowRef.current.closest('.react-flow') as HTMLElement
      if (!reactFlowWrapper) {
        console.error('React Flow wrapper not found')
        return
      }

      // Step 4: Temporarily change edge colors to black for better visibility
      const edgeElements = reactFlowWrapper.querySelectorAll('.react-flow__edge-path')
      const originalEdgeColors: string[] = []

      edgeElements.forEach((edgeElement) => {
        const pathElement = edgeElement as SVGPathElement
        const originalColor = pathElement.style.stroke || getComputedStyle(pathElement).stroke
        originalEdgeColors.push(originalColor)
        pathElement.style.stroke = 'black'
        pathElement.style.strokeWidth = '2px' // Make edges slightly thicker for better visibility
      })

      // Step 5: Temporarily disable animations on edges (only for edges that have animated property)
      const originalEdges = [...edges]
      const edgesWithDisabledAnimation = edges.map(edge =>
        edge.animated !== undefined ? { ...edge, animated: false } : edge
      )
      setEdgesInternal(edgesWithDisabledAnimation)

            // Wait for changes to render
      await new Promise(resolve => setTimeout(resolve, 300))

      // Step 6: Define filter to exclude unwanted elements
      const filter = (node: Element) => {
        return !(
          node.classList?.contains('react-flow__controls') ||
          node.classList?.contains('react-flow__minimap') ||
          node.classList?.contains('react-flow__background') ||
          node.classList?.contains('react-flow__attribution') ||
          node.tagName === 'I' // Skip font icons
        )
      }

      // Step 7: Generate SVG with better dimensions
      const svgDataUrl = await toSvg(reactFlowWrapper, {
        filter,
        backgroundColor: 'white',
        skipFonts: false,
        width: Math.max(reactFlowWrapper.scrollWidth, 1200),
        height: Math.max(reactFlowWrapper.scrollHeight, 800),
      })

      // Step 8: Download the SVG
      const svgBlob = await (await fetch(svgDataUrl)).blob()
      const url = URL.createObjectURL(svgBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `flow-diagram-${new Date().toISOString().split('T')[0]}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Step 9: Restore original zoom, edge colors, and re-enable animations
      reactFlowInstance.style.transform = currentTransform

      // Restore original edge colors
      edgeElements.forEach((edgeElement, index) => {
        const pathElement = edgeElement as SVGPathElement
        pathElement.style.stroke = originalEdgeColors[index] || ''
        pathElement.style.strokeWidth = '' // Reset stroke width
      })

      setEdgesInternal(originalEdges)

      console.log('SVG export completed successfully')
    } catch (error) {
      console.error('SVG export failed:', error)
      // Re-enable animations in case of error
      setEdgesInternal(edges)
    }
  }, [edges, setEdgesInternal])

  const deleteKeyCode = useDeleteKeyCode()
  const onNodesDelete = useOnNodesDelete(nodes)

  const autoAdjustNode = useNodeAutoAdjust()

  const [onDragOver, onDrop] = useDragDropFlowBuilder()
  const isValidConnection = useIsValidConnection(nodes, edges)
  const { handleOnEdgeDropConnectEnd, floatingMenuWrapperRef, handleAddConnectedNode } = useAddNodeOnEdgeDrop()

  const { setFunctions } = useApplicationState(s => s.actions.diagram);

  // Set the diagram functions in the application state
  useEffect(() => {
    console.log('Setting diagram functions:', { undo: !!undo, canUndo: canUndoState, canRedo: canRedoState });
    setFunctions({
      getNodes,
      getEdges,
      setNodes,
      setEdges,
      undo,
      redo,
      canUndo: canUndoState,
      canRedo: canRedoState,
      exportAsSvg,
    });
  }, [getNodes, getEdges, setNodes, setEdges, setFunctions, undo, redo, canUndoState, canRedoState, exportAsSvg]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = { ...connection, id: nanoid(), type: 'deletable' } as Edge
      setEdges((edges: Edge[]) => addEdge(edge, edges))
    },
    [setEdges],
  )

  const handleAutoAdjustNodeAfterNodeMeasured = useCallback(
    (id: string) => {
      setTimeout(() => {
        const node = getNodes().find(n => n.id === id)
        if (!node) { return }

        if (node.measured === undefined) {
          handleAutoAdjustNodeAfterNodeMeasured(id)
          return
        }

        autoAdjustNode(node)
      })
    },
    [autoAdjustNode, getNodes],
  )

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes)

      changes.forEach((change) => {
        if (change.type === 'dimensions') {
          const node = getNodes().find(n => n.id === change.id)
          if (node) {
            autoAdjustNode(node)
          }
        }

        if (change.type === 'add') {
          handleAutoAdjustNodeAfterNodeMeasured(change.item.id)
        }
      })
    },
    [
      autoAdjustNode,
      getNodes,
      handleAutoAdjustNodeAfterNodeMeasured,
      onNodesChange,
    ],
  )

  const handleNodesChangeWithHistory = useCallback(
    (changes: NodeChange[]) => {
      // Save current state before applying changes
      const hasSignificantChanges = changes.some(change =>
        change.type === 'add' || change.type === 'remove' || change.type === 'replace'
      )

      if (hasSignificantChanges) {
        saveToHistory()
      }

      // Apply the changes
      handleNodesChange(changes)
    },
    [handleNodesChange, saveToHistory],
  )

  const handleEdgesChangeWithHistory = useCallback(
    (changes: any[]) => {
      // Save current state before applying changes
      const hasSignificantChanges = changes.some((change: any) =>
        change.type === 'add' || change.type === 'remove' || change.type === 'replace'
      )

      if (hasSignificantChanges) {
        saveToHistory()
      }

      // Apply the changes
      onEdgesChange(changes)
    },
    [onEdgesChange, saveToHistory],
  )

  return (
    <div className="relative size-full">
      <ReactFlow
        ref={reactFlowRef}
        proOptions={{ hideAttribution: true }}
        nodeTypes={NODE_TYPES}
        onInit={({ fitView }) => fitView().then()}
        nodes={nodes}
        onNodesChange={handleNodesChangeWithHistory}
        edgeTypes={edgeTypes}
        edges={edges}
        onEdgesChange={handleEdgesChangeWithHistory}
        onConnect={onConnect}
        onConnectEnd={handleOnEdgeDropConnectEnd}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDragStop={(_, node) => {
          saveToHistory() // Save after node drag
          autoAdjustNode(node)
        }}
        onNodesDelete={onNodesDelete}
        isValidConnection={isValidConnection}
        multiSelectionKeyCode={null}
        deleteKeyCode={deleteKeyCode}
        snapGrid={[16, 16]}
        snapToGrid
        fitView
      >
        <Background color={isMobileView ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)'} gap={32} />
        <CustomControls />
      </ReactFlow>

      <div
        className={cn(
          'pointer-events-none absolute inset-0 backdrop-blur-5 transition-all',
          isBuilderBlurred && 'op-100 bg-dark-500/30 backdrop-saturate-80 pointer-events-auto',
          !isBuilderBlurred && 'op-0 bg-dark-800/0 backdrop-saturate-100 pointer-events-none',
        )}
      >
        <div ref={floatingMenuWrapperRef} className="relative size-full">
          <AddNodeFloatingMenu onNodeAdd={handleAddConnectedNode} />
        </div>
      </div>
    </div>
  )
}
