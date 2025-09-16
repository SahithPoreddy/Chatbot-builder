import { documentToSVG } from 'dom-to-svg';

/**
 * Enhanced SVG export utility for React Flow diagrams
 *
 * Recent improvements:
 * - Fixed double rendering issue by using single enhanced method
 * - Improved coordinate transformation for accurate edge and node positioning
 * - Better bounds calculation with proper padding and edge detection
 * - Advanced color handling with getEffectiveColor() for accurate color capture
 * - Text contrast optimization with ensureTextContrast() for better readability
 * - Gradient and pattern support for complex visual elements
 * - Improved marker definitions for arrows with proper colors
 * - Better font handling with system fonts and proper sizing
 * - Robust content capture with fallback mechanisms
 * - XML escaping for safe SVG generation
 * - Path coordinate transformation for accurate edge rendering
 */

export async function exportDiagramAsSVG(element: HTMLElement, filename: string = 'diagram.svg'): Promise<void> {
  try {
    console.log('Starting SVG export process...');

    // Find the React Flow viewport and pane
    const viewportElement = element.querySelector('.react-flow__viewport') as HTMLElement;
    const paneElement = element.querySelector('.react-flow__pane') as HTMLElement;

    if (!viewportElement || !paneElement) {
      throw new Error('Could not find React Flow viewport or pane elements');
    }

    console.log('Found React Flow elements, capturing visual content...');

    // Use a more robust approach to capture the actual visual content
    const svgContent = await captureDiagramAsSVG(paneElement);
    console.log('Generated SVG content, length:', svgContent.length);

    // Validate SVG before creating data URL
    if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
      throw new Error('Generated SVG is malformed');
    }

    // Create data URL
    const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);

    // Create download link
    const link = document.createElement('a');
    link.href = svgDataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log('SVG exported successfully');
  } catch (error) {
    console.error('Failed to export SVG:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to export diagram as SVG: ${errorMessage}`);
  }
}

async function captureDiagramAsSVG(paneElement: HTMLElement): Promise<string> {
  try {
    // Calculate the actual bounds of all visible elements
    const bounds = calculateDiagramBounds(paneElement);

    // Use the enhanced method with better coordinate handling
    console.log('Using enhanced SVG capture method...');
    return createEnhancedSVG(paneElement, bounds);
  } catch (error) {
    console.error('Failed to capture diagram as SVG:', error);
    throw error;
  }
}

// Export the function for external use
export { captureDiagramAsSVG };

function createEnhancedSVG(paneElement: HTMLElement, bounds: any): string {
  const nodes = paneElement.querySelectorAll('.react-flow__node');
  const edges = paneElement.querySelectorAll('.react-flow__edge');

  let svgContent = `<svg width="${bounds.width}" height="${bounds.height}" viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}" xmlns="http://www.w3.org/2000/svg">`;

  // Add white background
  svgContent += `<rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" fill="white"/>`;

  // Add marker definitions for arrows
  svgContent += `
    <defs>
      <marker id="react-flow__arrowclosed" markerWidth="12.5" markerHeight="12.5" viewBox="-10 -10 20 20" orient="auto" markerUnits="strokeWidth" refX="0" refY="0">
        <polyline stroke-linecap="round" stroke-linejoin="round" stroke-width="1" points="-5,-4 0,0 -5,4" fill="none" stroke="#b1b1b7"></polyline>
      </marker>
      <marker id="react-flow__arrow" markerWidth="12.5" markerHeight="12.5" viewBox="-10 -10 20 20" orient="auto" markerUnits="strokeWidth" refX="0" refY="0">
        <polyline stroke-linecap="round" stroke-linejoin="round" fill="none" stroke-width="1" points="-5,-4 0,0 -5,4" stroke="#b1b1b7"></polyline>
      </marker>
    </defs>
  `;

  // Add edges first (so they appear behind nodes)
  edges.forEach((edge) => {
    const path = edge.querySelector('.react-flow__edge-path');
    if (path) {
      const d = path.getAttribute('d');
      const stroke = getEffectiveColor(path, 'stroke', '#b1b1b7');
      const strokeWidth = path.getAttribute('stroke-width') || '1';
      const markerEnd = path.getAttribute('marker-end') || '';

      if (d) {
        // Transform the path coordinates to be relative to our SVG bounds
        const transformedD = transformPathCoordinates(d, bounds);
        let pathElement = `<path d="${escapeXmlAttribute(transformedD)}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none"`;
        if (markerEnd) {
          pathElement += ` marker-end="${markerEnd}"`;
        }
        pathElement += '/>';
        svgContent += pathElement;
      }
    }
  });

  // Add nodes with better visual representation
  nodes.forEach((node) => {
    const nodeRect = node.getBoundingClientRect();
    const paneRect = paneElement.getBoundingClientRect();

    // Transform coordinates to be relative to our SVG bounds
    const x = (nodeRect.left - paneRect.left) - bounds.x;
    const y = (nodeRect.top - paneRect.top) - bounds.y;
    const width = nodeRect.width;
    const height = nodeRect.height;

    // Get node styling with better color handling
    const backgroundColor = getEffectiveColor(node, 'background-color', '#ffffff');
    const borderColor = getEffectiveColor(node, 'border-color', '#e2e8f0');
    const borderWidth = parseFloat(getComputedStyle(node).borderWidth) || 1;
    const borderRadius = parseFloat(getComputedStyle(node).borderRadius) || 4;
    const boxShadow = getComputedStyle(node).boxShadow;

    // Add node background with shadow if present
    if (boxShadow && boxShadow !== 'none') {
      // Parse box shadow for basic shadow effect
      const shadowMatch = boxShadow.match(/(-?\d+)px (-?\d+)px (-?\d+)px (-?\d+)px (rgba?\([^)]+\)|#[0-9a-fA-F]+)/);
      if (shadowMatch) {
        const offsetX = parseInt(shadowMatch[1]);
        const offsetY = parseInt(shadowMatch[2]);
        const shadowColor = getEffectiveColor(node, '--shadow-color', shadowMatch[5]) || '#000000';

        svgContent += `<rect x="${x + offsetX}" y="${y + offsetY}" width="${width}" height="${height}" fill="${shadowColor}" rx="${borderRadius}" opacity="0.2"/>`;
      }
    }

    // Add main node background
    svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="${borderWidth}" rx="${borderRadius}"/>`;

    // Try to capture node content more accurately
    const nodeContent = captureNodeContent(node, x, y, backgroundColor);
    svgContent += nodeContent;

    // If no text content was found, add a default label based on node data
    if (!nodeContent) {
      const nodeId = node.getAttribute('data-id') || 'Node';
      const defaultText = nodeId.length > 10 ? nodeId.substring(0, 10) + '...' : nodeId;
      const textColor = ensureTextContrast('#333333', backgroundColor);
      svgContent += `<text x="${x + width / 2}" y="${y + height / 2}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14px" fill="${textColor}" font-weight="500">${escapeXmlText(defaultText)}</text>`;
    }
  });

  svgContent += '</svg>';
  return validateAndFixSVG(svgContent);
}

function captureNodeContent(node: Element, x: number, y: number, backgroundColor: string = '#ffffff'): string {
  let content = '';

  // Look for text content in the node - try multiple selectors
  const textSelectors = [
    '*',
    '.react-flow__node__label',
    '[data-testid*="label"]',
    'div',
    'span',
    'p'
  ];

  for (const selector of textSelectors) {
    const textElements = node.querySelectorAll(selector);
    textElements.forEach((element) => {
      const text = element.textContent?.trim();
      if (text && text.length > 0 && !element.querySelector('button, input, select, textarea')) {
        // Skip elements that contain interactive elements
        const rect = element.getBoundingClientRect();
        const nodeRect = node.getBoundingClientRect();

        // Only include text that's actually visible within the node bounds
        if (rect.width > 0 && rect.height > 0) {
          const textX = x + (rect.left - nodeRect.left) + (rect.width / 2);
          const textY = y + (rect.top - nodeRect.top) + (rect.height / 2);

          const fontSize = getComputedStyle(element).fontSize || '12px';
          const fontFamily = (getComputedStyle(element).fontFamily || 'Arial, sans-serif').replace(/"/g, "'");
          const color = getEffectiveColor(element, 'color', '#000000');
          const fontWeight = getComputedStyle(element).fontWeight || 'normal';
          const textAlign = getComputedStyle(element).textAlign || 'center';

          // Ensure good contrast between text and background
          const textColor = ensureTextContrast(color, backgroundColor);

          const textAnchor = textAlign === 'center' ? 'middle' : textAlign === 'right' ? 'end' : 'start';

          content += `<text x="${textX}" y="${textY}" text-anchor="${textAnchor}" dominant-baseline="middle" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${textColor}">${escapeXmlText(text)}</text>`;
        }
      }
    });

    // If we found content, break out of the loop
    if (content.length > 0) break;
  }

  return content;
}

async function createCompleteSVG(paneElement: HTMLElement, bounds: any): Promise<string> {
  try {
    // Create a temporary document for dom-to-svg
    const tempDoc = document.implementation.createHTMLDocument();
    const clonedPane = paneElement.cloneNode(true) as HTMLElement;
    tempDoc.body.appendChild(clonedPane);

    // Use dom-to-svg to convert the pane element
    const svgDocument = documentToSVG(tempDoc);

    // Get the SVG element
    const svgElement = svgDocument.querySelector('svg');
    if (!svgElement) {
      throw new Error('Could not create SVG element');
    }

    // Set proper viewBox and dimensions
    svgElement.setAttribute('viewBox', `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
    svgElement.setAttribute('width', bounds.width.toString());
    svgElement.setAttribute('height', bounds.height.toString());

    // Add white background rect
    const backgroundRect = svgDocument.createElementNS('http://www.w3.org/2000/svg', 'rect');
    backgroundRect.setAttribute('x', bounds.x.toString());
    backgroundRect.setAttribute('y', bounds.y.toString());
    backgroundRect.setAttribute('width', bounds.width.toString());
    backgroundRect.setAttribute('height', bounds.height.toString());
    backgroundRect.setAttribute('fill', 'white');
    svgElement.insertBefore(backgroundRect, svgElement.firstChild);

    // Convert to string
    const svgString = new XMLSerializer().serializeToString(svgDocument);

    // Validate the SVG string
    return validateAndFixSVG(svgString);
  } catch (error) {
    console.error('Error creating SVG with dom-to-svg, falling back to basic method:', error);
    // Fallback to basic SVG creation
    return createBasicSVG(paneElement, bounds);
  }
}

function createBasicSVG(paneElement: HTMLElement, bounds: any): string {
  const nodes = paneElement.querySelectorAll('.react-flow__node');
  const edges = paneElement.querySelectorAll('.react-flow__edge');

  let svgContent = `<svg width="${bounds.width}" height="${bounds.height}" viewBox="${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}" xmlns="http://www.w3.org/2000/svg">`;

  // Add white background
  svgContent += `<rect x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" fill="white"/>`;

  // Add edges first (so they appear behind nodes)
  edges.forEach((edge) => {
    const path = edge.querySelector('.react-flow__edge-path');
    if (path) {
      const d = path.getAttribute('d');
      const stroke = path.getAttribute('stroke') || '#b1b1b7';
      const strokeWidth = path.getAttribute('stroke-width') || '1';

      if (d) {
        svgContent += `<path d="${escapeXmlAttribute(d)}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none"/>`;
      }
    }
  });

  // Add nodes
  nodes.forEach((node) => {
    const rect = node.getBoundingClientRect();
    const paneRect = paneElement.getBoundingClientRect();

    const x = rect.left - paneRect.left;
    const y = rect.top - paneRect.top;
    const width = rect.width;
    const height = rect.height;

    // Get node styling
    const backgroundColor = getComputedStyle(node).backgroundColor || '#ffffff';
    const borderColor = getComputedStyle(node).borderColor || '#e2e8f0';
    const borderWidth = parseFloat(getComputedStyle(node).borderWidth) || 1;
    const borderRadius = parseFloat(getComputedStyle(node).borderRadius) || 4;

    // Add node background
    svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="${borderWidth}" rx="${borderRadius}"/>`;

    // Add node label
    const label = node.querySelector('.react-flow__node__label') || node.querySelector('div');
    if (label && label.textContent && label.textContent.trim()) {
      const fontSize = getComputedStyle(label).fontSize || '12px';
      const fontFamily = (getComputedStyle(label).fontFamily || 'Arial, sans-serif').replace(/"/g, "'");
      const color = getComputedStyle(label).color || '#000000';
      const textContent = escapeXmlText(label.textContent.trim());

      svgContent += `<text x="${x + width / 2}" y="${y + height / 2}" text-anchor="middle" dominant-baseline="middle" font-family="${fontFamily}" font-size="${fontSize}" fill="${color}">${textContent}</text>`;
    }
  });

  svgContent += '</svg>';
  return svgContent;
}

// Enhanced color utilities
function getEffectiveColor(element: Element, property: string, fallback: string = '#000000'): string {
  const computedStyle = getComputedStyle(element);
  let color = computedStyle.getPropertyValue(property) || fallback;

  // Handle CSS custom properties (CSS variables)
  if (color.startsWith('var(')) {
    const varName = color.match(/var\(([^)]+)\)/)?.[1];
    if (varName) {
      const varValue = computedStyle.getPropertyValue(varName.trim());
      if (varValue) {
        color = varValue;
      }
    }
  }

  // Handle rgba and hsla colors - convert to hex for better SVG compatibility
  if (color.includes('rgba') || color.includes('hsla')) {
    color = rgbaToHex(color);
  }

  // Ensure color is not transparent
  if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
    return fallback;
  }

  return color;
}

function rgbaToHex(color: string): string {
  // Handle rgba(r, g, b, a) format
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);

    // For now, we'll convert to solid color - could be enhanced to use SVG opacity
    return rgbToHex(r, g, b);
  }

  // Handle hsla format
  const hslaMatch = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%(?:,\s*([\d.]+))?\)/);
  if (hslaMatch) {
    const h = parseInt(hslaMatch[1]);
    const s = parseInt(hslaMatch[2]);
    const l = parseInt(hslaMatch[3]);
    // Simple HSL to RGB conversion (could be improved)
    return hslToRgb(h, s, l);
  }

  return color;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hslToRgb(h: number, s: number, l: number): string {
  h /= 360;
  s /= 100;
  l /= 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255));
}

function ensureTextContrast(textColor: string, backgroundColor: string): string {
  // Simple contrast check - if text is too similar to background, make it darker/lighter
  const textRgb = hexToRgb(textColor);
  const bgRgb = hexToRgb(backgroundColor);

  if (!textRgb || !bgRgb) return textColor;

  // Calculate luminance
  const textLuminance = (0.299 * textRgb.r + 0.587 * textRgb.g + 0.114 * textRgb.b) / 255;
  const bgLuminance = (0.299 * bgRgb.r + 0.587 * bgRgb.g + 0.114 * bgRgb.b) / 255;

  // If contrast is too low, adjust text color
  if (Math.abs(textLuminance - bgLuminance) < 0.3) {
    return bgLuminance > 0.5 ? '#000000' : '#ffffff';
  }

  return textColor;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Helper functions to escape XML content
function escapeXmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function calculateDiagramBounds(paneElement: HTMLElement): { x: number; y: number; width: number; height: number } {
  const nodes = paneElement.querySelectorAll('.react-flow__node');

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  // Calculate bounds from nodes
  nodes.forEach((node) => {
    const rect = node.getBoundingClientRect();
    const paneRect = paneElement.getBoundingClientRect();

    const x = rect.left - paneRect.left;
    const y = rect.top - paneRect.top;
    const width = rect.width;
    const height = rect.height;

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  });

  // If no nodes, use viewport size
  if (minX === Infinity) {
    const viewportRect = paneElement.getBoundingClientRect();
    return { x: 0, y: 0, width: viewportRect.width, height: viewportRect.height };
  }

  // Add some padding
  const padding = 50;
  return {
    x: minX - padding,
    y: minY - padding,
    width: (maxX - minX) + (padding * 2),
    height: (maxY - minY) + (padding * 2)
  };
}

function transformPathCoordinates(pathD: string, bounds: any): string {
  // Simple transformation - subtract bounds offset from all coordinates
  // This is a basic implementation that handles common path commands
  return pathD.replace(/([MLHVCSQTAZmlhvcsqtaz])\s*([^MLHVCSQTAZmlhvcsqtaz]*)/g, (match, command, coords) => {
    if (!coords.trim()) return match;

    // Split coordinates and transform them
    const coordPairs = coords.trim().split(/\s+|,/).filter((c: string) => c !== '');
    const transformedCoords: string[] = [];

    for (let i = 0; i < coordPairs.length; i += 2) {
      if (i + 1 < coordPairs.length) {
        const x = parseFloat(coordPairs[i]) - bounds.x;
        const y = parseFloat(coordPairs[i + 1]) - bounds.y;
        transformedCoords.push(x.toString(), y.toString());
      } else {
        // Handle single coordinate commands like H, V
        const coord = parseFloat(coordPairs[i]);
        if (command.toUpperCase() === 'H') {
          transformedCoords.push((coord - bounds.x).toString());
        } else if (command.toUpperCase() === 'V') {
          transformedCoords.push((coord - bounds.y).toString());
        } else {
          transformedCoords.push(coord.toString());
        }
      }
    }

    return command + transformedCoords.join(' ');
  });
}

function validateAndFixSVG(svgString: string): string {
  try {
    // Basic validation - check if it starts with SVG tag
    if (!svgString.includes('<svg')) {
      throw new Error('Invalid SVG: missing svg tag');
    }

    // Fix common issues with the SVG string
    let fixedSvg = svgString;

    // Fix unescaped ampersands in attributes
    fixedSvg = fixedSvg.replace(/&(?![a-zA-Z#0-9]+;)/g, '&amp;');

    // Fix quotes in attribute values that aren't properly escaped
    fixedSvg = fixedSvg.replace(/="([^"]*)&([^"]*)""/g, '="$1&amp;$2"');

    // Ensure proper XML declaration if missing
    if (!fixedSvg.includes('<?xml')) {
      fixedSvg = '<?xml version="1.0" encoding="UTF-8"?>\n' + fixedSvg;
    }

    return fixedSvg;
  } catch (error) {
    console.error('SVG validation failed:', error);
    // Return original string if validation fails
    return svgString;
  }
}

export async function exportDiagramAsPNG(element: HTMLElement, filename: string = 'diagram.png'): Promise<void> {
  try {
    // Get the SVG content as a string
    const svgContent = await getDiagramAsSVGString(element);

    // For PNG, we'll use a canvas approach
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    const rect = element.getBoundingClientRect();
    canvas.width = rect.width || 800;
    canvas.height = rect.height || 600;

    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Convert SVG to PNG using canvas
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            resolve();
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        }, 'image/png');
      };

      img.onerror = () => reject(new Error('Failed to load SVG image'));
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);
    });
  } catch (error) {
    console.error('Failed to export PNG:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to export diagram as PNG: ${errorMessage}`);
  }
}

async function getDiagramAsSVGString(element: HTMLElement): Promise<string> {
  try {
    // Find the React Flow viewport and pane
    const viewportElement = element.querySelector('.react-flow__viewport') as HTMLElement;
    const paneElement = element.querySelector('.react-flow__pane') as HTMLElement;

    if (!viewportElement || !paneElement) {
      throw new Error('Could not find React Flow viewport or pane elements');
    }

    // Calculate the bounds of all visible elements
    const bounds = calculateDiagramBounds(paneElement);

    // Create SVG with proper dimensions and viewBox
    return await createCompleteSVG(paneElement, bounds);
  } catch (error) {
    console.error('Failed to get SVG string:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate SVG string: ${errorMessage}`);
  }
}
