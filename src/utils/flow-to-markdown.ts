import type { BuilderNodeType } from '~/modules/nodes/types'

interface FlowNode {
  id: string
  type: BuilderNodeType
  position: { x: number; y: number }
  data: any
  width?: number
  height?: number
}

interface FlowEdge {
  id: string
  source: string
  target: string
  type?: string
  sourceHandle?: string
  targetHandle?: string
}

interface FlowData {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export function convertFlowToMarkdown(flowData: FlowData): string {
  const { nodes, edges } = flowData

  let markdown = '# Chatbot Flow Documentation\n\n'
  markdown += `**Generated on:** ${new Date().toLocaleString()}\n\n`
  markdown += `**Total Nodes:** ${nodes.length}\n`
  markdown += `**Total Connections:** ${edges.length}\n\n`

  // Flow Overview
  markdown += '## 📊 Flow Overview\n\n'
  const nodeTypes = nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  markdown += '### Node Types Summary:\n'
  Object.entries(nodeTypes).forEach(([type, count]) => {
    const typeName = getNodeTypeDisplayName(type)
    markdown += `- **${typeName}**: ${count} node${count > 1 ? 's' : ''}\n`
  })
  markdown += '\n'

  // Detailed Node Descriptions
  markdown += '## 🔍 Node Details\n\n'

  // Sort nodes by position (left to right, top to bottom)
  const sortedNodes = [...nodes].sort((a, b) => {
    if (a.position.y !== b.position.y) {
      return a.position.y - b.position.y
    }
    return a.position.x - b.position.x
  })

  sortedNodes.forEach((node, index) => {
    markdown += `### ${index + 1}. ${getNodeTypeDisplayName(node.type)}\n\n`
    markdown += `**Node ID:** \`${node.id}\`\n`
    markdown += `**Type:** ${node.type}\n`
    markdown += `**Position:** (${node.position.x}, ${node.position.y})\n`

    if (node.width && node.height) {
      markdown += `**Dimensions:** ${node.width} × ${node.height}\n`
    }

    // Node-specific data
    const nodeData = getNodeDataDescription(node)
    if (nodeData) {
      markdown += '\n**Configuration:**\n'
      markdown += nodeData
    }

    // Find connections
    const outgoingEdges = edges.filter(edge => edge.source === node.id)
    const incomingEdges = edges.filter(edge => edge.target === node.id)

    if (incomingEdges.length > 0) {
      markdown += '\n**Incoming Connections:**\n'
      incomingEdges.forEach(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source)
        if (sourceNode) {
          markdown += `- From: ${getNodeTypeDisplayName(sourceNode.type)} (\`${sourceNode.id}\`)\n`
        }
      })
    }

    if (outgoingEdges.length > 0) {
      markdown += '\n**Outgoing Connections:**\n'
      outgoingEdges.forEach(edge => {
        const targetNode = nodes.find(n => n.id === edge.target)
        if (targetNode) {
          markdown += `- To: ${getNodeTypeDisplayName(targetNode.type)} (\`${targetNode.id}\`)\n`
        }
      })
    }

    markdown += '\n---\n\n'
  })

  // Flow Logic
  markdown += '## 🔄 Flow Logic\n\n'
  const startNodes = nodes.filter(node => node.type === 'start')
  const endNodes = nodes.filter(node => node.type === 'end')

  if (startNodes.length > 0) {
    markdown += '### Entry Points:\n'
    startNodes.forEach(node => {
      markdown += `- **Start Node** (\`${node.id}\`)\n`
    })
    markdown += '\n'
  }

  if (endNodes.length > 0) {
    markdown += '### Exit Points:\n'
    endNodes.forEach(node => {
      markdown += `- **End Node** (\`${node.id}\`)\n`
    })
    markdown += '\n'
  }

  // Conditional Logic
  const conditionalNodes = nodes.filter(node => node.type === 'conditional-path')
  if (conditionalNodes.length > 0) {
    markdown += '### Conditional Logic:\n'
    conditionalNodes.forEach(node => {
      markdown += `- **Conditional Node** (\`${node.id}\`)\n`
      if (node.data?.conditions) {
        node.data.conditions.forEach((condition: any, index: number) => {
          markdown += `  - Condition ${index + 1}: ${condition.description || 'No description'}\n`
        })
      }
    })
    markdown += '\n'
  }

  // Message Flow
  const messageNodes = nodes.filter(node => node.type === 'text-message')
  if (messageNodes.length > 0) {
    markdown += '### Message Flow:\n'
    messageNodes.forEach(node => {
      markdown += `- **${node.data?.channel || 'General'} Message** (\`${node.id}\`)\n`
      if (node.data?.message) {
        markdown += `  - Content: "${node.data.message}"\n`
      }
    })
    markdown += '\n'
  }

  // Technical Details
  markdown += '## ⚙️ Technical Details\n\n'
  markdown += '### Raw Data Structure:\n\n'
  markdown += '```json\n'
  markdown += JSON.stringify(flowData, null, 2)
  markdown += '\n```\n\n'

  markdown += '### Node Types Legend:\n'
  markdown += '- **Start**: Entry point of the flow\n'
  markdown += '- **End**: Exit point of the flow\n'
  markdown += '- **Text Message**: Sends a message to the user\n'
  markdown += '- **Conditional Path**: Evaluates conditions and branches the flow\n\n'

  return markdown
}

function getNodeTypeDisplayName(type: string): string {
  const typeNames: Record<string, string> = {
    'start': '🚀 Start',
    'end': '🏁 End',
    'text-message': '💬 Text Message',
    'conditional-path': '🔀 Conditional Path'
  }
  return typeNames[type] || type
}

function getNodeDataDescription(node: FlowNode): string | null {
  switch (node.type) {
    case 'text-message':
      let description = ''
      if (node.data?.channel) {
        description += `- **Channel:** ${node.data.channel}\n`
      }
      if (node.data?.message) {
        description += `- **Message:** ${node.data.message}\n`
      }
      if (node.data?.deletable !== undefined) {
        description += `- **Deletable:** ${node.data.deletable ? 'Yes' : 'No'}\n`
      }
      return description || null

    case 'conditional-path':
      let condDescription = ''
      if (node.data?.conditions && Array.isArray(node.data.conditions)) {
        condDescription += `- **Conditions:** ${node.data.conditions.length} condition(s)\n`
        node.data.conditions.forEach((condition: any, index: number) => {
          condDescription += `  - Condition ${index + 1}: ${condition.description || 'No description'}\n`
        })
      }
      return condDescription || null

    case 'start':
    case 'end':
      return node.data?.deletable !== undefined ? `- **Deletable:** ${node.data.deletable ? 'Yes' : 'No'}\n` : null

    default:
      return null
  }
}
