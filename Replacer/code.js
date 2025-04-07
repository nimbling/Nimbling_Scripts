// Load the UI from ui.html
figma.showUI(__html__, { width: 500, height: 800 }); // Panel dimensions

// --- Helper Functions ---
function utils_rgbToHex(r, g, b) {
  const toHex = (c) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
function utils_C(a) {
  return Math.round(a * 255);
}
function utils_compareRgb(rgb1, rgb2) {
  if (!rgb1 || !rgb2) return false;
  return utils_C(rgb1.r) === utils_C(rgb2.r) && utils_C(rgb1.g) === utils_C(rgb2.g) && utils_C(rgb1.b) === utils_C(rgb2.b);
}
function utils_getPathPrefix(variableName) {
  if (!variableName) return "";
  const lastSlashIndex = variableName.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    return variableName;
  }
  return variableName.substring(0, lastSlashIndex);
}
function utils_getBaseName(variableName) {
  if (!variableName) return "";
  const lastSlashIndex = variableName.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    return variableName;
  }
  return variableName.substring(lastSlashIndex + 1);
}
function utils_getGroupPrefix(pathPrefix) {
  if (!pathPrefix) return "";
  const lastSlashIndex = pathPrefix.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    return "";
  }
  return pathPrefix.substring(0, lastSlashIndex);
}
function utils_getSwitchableSegment(pathPrefix) {
  if (!pathPrefix) return "";
  const lastSlashIndex = pathPrefix.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    return pathPrefix;
  }
  return pathPrefix.substring(lastSlashIndex + 1);
}

// Helper: Safely get resolved color value
function utils_getResolvedVariableColor(variable) {
  if (!variable || variable.resolvedType !== "COLOR" || !variable.valuesByMode) {
    return null;
  }
  try {
    const modeIds = Object.keys(variable.valuesByMode);
    if (modeIds.length === 0) {
      return null;
    }
    const firstModeId = modeIds[0];
    let value = variable.valuesByMode[firstModeId];
    let depth = 0; // Prevent infinite loops
    while (value && value.type === "VARIABLE_ALIAS" && value.id && depth < 10) {
      depth++;
      try {
        const aliasedVariable = figma.variables.getVariableById(value.id);
        if (aliasedVariable && aliasedVariable.resolvedType === "COLOR" && aliasedVariable.valuesByMode) {
          const aliasedModeIds = Object.keys(aliasedVariable.valuesByMode);
          if (aliasedModeIds.length > 0) {
            value = aliasedVariable.valuesByMode[aliasedModeIds[0]];
          } else {
            value = null;
          }
        } else {
          value = null;
        }
      } catch (aliasError) {
        value = null;
        break;
      }
    }
    if (value && typeof value === "object" && value.hasOwnProperty("r")) {
      return value;
    }
  } catch (e) {
    return null;
  }
  return null;
}

// --- Generic Tree Traversal ---
async function traverseNodeTree(nodes, visitorCallback) {
  for (const node of nodes) {
    await visitorCallback(node);
    if ("children" in node && node.children) {
      await traverseNodeTree(node.children, visitorCallback);
    }
  }
}

// --- Plugin Listeners ---
figma.on("selectionchange", () => {
  const currentSelection = figma.currentPage.selection;
  figma.ui.postMessage({ type: "selection-changed", hasSelection: currentSelection.length > 0 });
});
figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === "scan-selection") {
      if (msg.mode === "groups") {
        await groups_scanSelection();
      } else if (msg.mode === "variables") {
        await variables_scanSelection();
      }
    } else if (msg.type === "apply-group") {
      await groups_applyVariableSwitch(msg.targetGroup);
    } else if (msg.type === "replace-value") {
      await variables_applyReplace(msg.sourceValue, msg.targetVariableId);
    } else if (msg.type === "set-storage") {
      await figma.clientStorage.setAsync(msg.key, msg.value);
    } else if (msg.type === "get-storage") {
      const value = await figma.clientStorage.getAsync(msg.key);
      figma.ui.postMessage({ type: "get-storage-result", key: msg.key, value: value });
    } else if (msg.type === "check-selection-state-initial") {
      const currentSelection = figma.currentPage.selection;
      figma.ui.postMessage({ type: "initial-selection-state-info", hasSelection: currentSelection.length > 0 });
    } else if (msg.type === "resize") {
      figma.ui.resize(500, Math.max(300, Math.min(msg.height, 900)));
    } else if (msg.type === "close") {
      figma.closePlugin();
    } else if (msg.type === "notify-user") {
      figma.notify(msg.message, msg.options || {});
    }
  } catch (error) {
    figma.ui.postMessage({ type: "error", message: "Plugin Error: " + (error.message || "Unknown error") });
  }
};

// --- Deep Color Variable Replace Logic ---
async function variables_scanSelection() {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.ui.postMessage({ type: "scan-results-variables", reset: true });
    return;
  }
  let colorVariablesFound = new Map();
  let hexColorsFound = new Map();
  let variablesCount = 0;
  let hexCount = 0;

  const visitNodeForVariableScan = async (node) => {
    if (!node) return;
    const processFoundVariable = (variable) => {
      if (!variable) return;
      const id = variable.id;
      if (!colorVariablesFound.has(id)) {
        const colorValue = utils_getResolvedVariableColor(variable);
        colorVariablesFound.set(id, { id: id, name: variable.name, type: "variable", color: colorValue });
        variablesCount++;
      }
    };
    const processFoundHex = (hex) => {
      if (!hexColorsFound.has(hex)) {
        hexColorsFound.set(hex, { hex: hex, type: "hex", color: null });
        hexCount++;
      }
    };

    // Check Paints (Fills/Strokes) - Unchanged
    const checkPaints = (paintType) => {
      if (node[paintType] && Array.isArray(node[paintType])) {
        node[paintType].forEach((paint, index) => {
          if (!paint || paint.visible === false) return;
          const paintBinding = node.boundVariables && node.boundVariables[paintType] && node.boundVariables[paintType][index];
          if (paintBinding && paintBinding.id) {
            try {
              const variable = figma.variables.getVariableById(paintBinding.id);
              if (variable && variable.resolvedType === "COLOR") processFoundVariable(variable);
            } catch (e) {}
          } else if (paint.type === "SOLID" && paint.color) {
            processFoundHex(utils_rgbToHex(paint.color.r, paint.color.g, paint.color.b));
          } else if (paint.type.startsWith("GRADIENT") && paint.gradientStops) {
            paint.gradientStops.forEach((stop) => {
              const stopVarId = stop.boundVariables && stop.boundVariables.color && stop.boundVariables.color.id;
              if (stopVarId) {
                try {
                  const variable = figma.variables.getVariableById(stopVarId);
                  if (variable && variable.resolvedType === "COLOR") processFoundVariable(variable);
                } catch (e) {}
              } else if (stop.color) {
                processFoundHex(utils_rgbToHex(stop.color.r, stop.color.g, stop.color.b));
              }
            });
          }
        });
      }
    };
    checkPaints("fills");
    checkPaints("strokes");

    // Check Text Segments - Unchanged
    if (node.type === "TEXT") {
      try {
        const segments = node.getStyledTextSegments(["fills", "boundVariables"]);
        for (const segment of segments) {
          if (segment.fills && Array.isArray(segment.fills)) {
            for (const fill of segment.fills) {
              const fillVarId = fill.boundVariables && fill.boundVariables.color && fill.boundVariables.color.id;
              if (fillVarId) {
                try {
                  const variable = figma.variables.getVariableById(fillVarId);
                  if (variable && variable.resolvedType === "COLOR") processFoundVariable(variable);
                } catch (e) {}
              } else if (fill.type === "SOLID" && fill.color) {
                processFoundHex(utils_rgbToHex(fill.color.r, fill.color.g, fill.color.b));
              }
            }
          }
        }
      } catch (e) {}
    }

    // *** NEW: Check Effects ***
    if (node.effects && Array.isArray(node.effects)) {
      node.effects.forEach((effect) => {
        if (!effect.visible) return; // Skip invisible effects
        // Check effects with a color property (Shadows)
        if ((effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") && effect.color) {
          const effectVarId = effect.boundVariables && effect.boundVariables.color && effect.boundVariables.color.id;
          if (effectVarId) {
            try {
              const variable = figma.variables.getVariableById(effectVarId);
              if (variable && variable.resolvedType === "COLOR") {
                processFoundVariable(variable);
              }
            } catch (e) {} // Ignore errors resolving variable
          } else {
            // If not bound, treat as a hex color
            processFoundHex(utils_rgbToHex(effect.color.r, effect.color.g, effect.color.b));
          }
        }
        // Add checks for other effect types with bindable colors if needed in the future
      });
    }
  }; // end visitNodeForVariableScan

  await traverseNodeTree(selection, visitNodeForVariableScan);

  // Process and send results (Unchanged)
  const variablesFoundArray = Array.from(colorVariablesFound.values()).sort((a, b) => a.name.localeCompare(b.name));
  const hexColorsFoundArray = Array.from(hexColorsFound.values()).sort((a, b) => a.hex.localeCompare(b.hex));
  const combinedFound = [].concat(variablesFoundArray, hexColorsFoundArray);
  let allColorVariables = [];
  try {
    const allVars = await figma.variables.getLocalVariablesAsync();
    for (const variable of allVars) {
      if (variable.resolvedType === "COLOR") {
        const colorValue = utils_getResolvedVariableColor(variable);
        allColorVariables.push({ id: variable.id, name: variable.name, color: colorValue });
      }
    }
    allColorVariables.sort((a, b) => a.name.localeCompare(b.name));
  } catch (e) {
    figma.ui.postMessage({ type: "error", message: "Could not fetch local variables." });
    return;
  }
  figma.ui.postMessage({ type: "scan-results-variables", variablesFound: combinedFound, allColorVariables: allColorVariables, hasVariablesInSelection: variablesCount + hexCount > 0 });
}

async function variables_applyReplace(sourceValue, targetVariableId) {
  const isSourceHex = typeof sourceValue === "string" && sourceValue.startsWith("#");
  if (!sourceValue || !targetVariableId) return;
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.ui.postMessage({ type: "error", message: "Please select objects." });
    return;
  }
  let targetVariable;
  let sourceVariableName = sourceValue;
  try {
    targetVariable = figma.variables.getVariableById(targetVariableId);
    if (!targetVariable || targetVariable.resolvedType !== "COLOR") throw new Error(`Invalid target variable`);
    if (!isSourceHex) {
      try {
        const sourceVar = figma.variables.getVariableById(sourceValue);
        if (sourceVar) sourceVariableName = sourceVar.name;
      } catch (e) {}
    }
  } catch (e) {
    figma.ui.postMessage({ type: "error", message: "Could not find source/target variable: " + e.message });
    return;
  }
  let totalReplacementCount = 0;

  const tryReplacePaintVariable = (paint, paintIndex, nodePaints) => {
    /* Unchanged */ const paintVarId = paint.boundVariables && paint.boundVariables.color && paint.boundVariables.color.id;
    if (!isSourceHex && paintVarId === sourceValue) {
      try {
        return figma.variables.setBoundVariableForPaint(nodePaints[paintIndex], "color", targetVariable);
      } catch (e) {
        return null;
      }
    } else if (isSourceHex && !paintVarId && paint.color && paint.type === "SOLID") {
      const paintHex = utils_rgbToHex(paint.color.r, paint.color.g, paint.color.b);
      if (paintHex === sourceValue) {
        try {
          return figma.variables.setBoundVariableForPaint(nodePaints[paintIndex], "color", targetVariable);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };
  const tryReplaceGradientStopVariable = (stops) => {
    /* Unchanged */ let changed = false;
    for (let j = 0; j < stops.length; j++) {
      let stop = stops[j];
      const stopVarId = stop.boundVariables && stop.boundVariables.color && stop.boundVariables.color.id;
      if (!isSourceHex && stopVarId === sourceValue) {
        if (!stop.boundVariables) stop.boundVariables = {};
        stop.boundVariables.color = { type: "VARIABLE_ALIAS", id: targetVariableId };
        changed = true;
        totalReplacementCount++;
      } else if (isSourceHex && !stopVarId && stop.color) {
        const stopHex = utils_rgbToHex(stop.color.r, stop.color.g, stop.color.b);
        if (stopHex === sourceValue) {
          if (!stop.boundVariables) stop.boundVariables = {};
          stop.boundVariables.color = { type: "VARIABLE_ALIAS", id: targetVariableId };
          changed = true;
          totalReplacementCount++;
        }
      }
    }
    return changed;
  };

  const visitNodeForVariableReplace = async (node) => {
    if (!node) return;
    // Process Fills & Strokes (Unchanged)
    const processPaints = (paintType) => {
      if (!node[paintType] || !Array.isArray(node[paintType]) || node[paintType].length === 0) return;
      let paintsCopy = null;
      let paintsModified = false;
      const originalPaints = node[paintType];
      for (let i = 0; i < originalPaints.length; i++) {
        const paint = originalPaints[i];
        let modifiedPaint = null;
        if (paint.type.startsWith("GRADIENT") && paint.gradientStops) {
          if (!paintsCopy) paintsCopy = JSON.parse(JSON.stringify(originalPaints));
          if (tryReplaceGradientStopVariable(paintsCopy[i].gradientStops)) {
            paintsModified = true;
          }
        } else if (paint.type === "SOLID") {
          modifiedPaint = tryReplacePaintVariable(paint, i, originalPaints);
          if (modifiedPaint) {
            if (!paintsCopy) paintsCopy = Array.from(originalPaints);
            paintsCopy[i] = modifiedPaint;
            paintsModified = true;
            totalReplacementCount++;
          }
        }
      }
      if (paintsModified) {
        node[paintType] = paintsCopy;
      }
    };
    processPaints("fills");
    processPaints("strokes");

    // Process Text Segments (Unchanged)
    if (node.type === "TEXT") {
      try {
        const segments = node.getStyledTextSegments(["fills", "boundVariables"]);
        for (const segment of segments) {
          if (!segment.fills || !Array.isArray(segment.fills) || segment.fills.length === 0) continue;
          const fill = segment.fills[0];
          const fillVarId = fill.boundVariables && fill.boundVariables.color && fill.boundVariables.color.id;
          let match = false;
          if (!isSourceHex && fillVarId === sourceValue) match = true;
          else if (isSourceHex && !fillVarId && fill.type === "SOLID") {
            if (utils_rgbToHex(fill.color.r, fill.color.g, fill.color.b) === sourceValue) match = true;
          }
          if (match) {
            const newPaint = { type: "SOLID", color: { r: 0, g: 0, b: 0 }, boundVariables: { color: { type: "VARIABLE_ALIAS", id: targetVariable.id } } };
            if (fill.opacity !== undefined) newPaint.opacity = fill.opacity;
            if (fill.blendMode !== undefined) newPaint.blendMode = fill.blendMode;
            try {
              node.setRangeFills(segment.start, segment.end, [newPaint]);
              totalReplacementCount++;
            } catch (e) {}
          }
        }
      } catch (e) {}
    }

    // *** NEW: Process Effects ***
    if (node.effects && Array.isArray(node.effects) && node.effects.length > 0) {
      let effectsModified = false;
      let newEffects = null; // Lazy deep copy

      for (let i = 0; i < node.effects.length; i++) {
        const effect = node.effects[i];
        let needsUpdate = false;

        // Check only shadow effects with color
        if ((effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") && effect.color) {
          const effectVarId = effect.boundVariables && effect.boundVariables.color && effect.boundVariables.color.id;

          if (!isSourceHex && effectVarId === sourceValue) {
            // Source is variable, and it matches effect's bound variable
            needsUpdate = true;
          } else if (isSourceHex && !effectVarId) {
            // Source is hex, effect is NOT bound, check effect's hex color
            const effectHex = utils_rgbToHex(effect.color.r, effect.color.g, effect.color.b);
            if (effectHex === sourceValue) {
              needsUpdate = true;
            }
          }
        }

        if (needsUpdate) {
          // Ensure we have a copy before modifying
          if (!newEffects) newEffects = JSON.parse(JSON.stringify(node.effects));

          // Modify the copied effect
          const copiedEffect = newEffects[i];

          // Ensure boundVariables object exists
          if (!copiedEffect.boundVariables) copiedEffect.boundVariables = {};
          // Set the new binding
          copiedEffect.boundVariables.color = { type: "VARIABLE_ALIAS", id: targetVariableId };
          // Add placeholder color object (API might require it like setRangeFills)
          // We use black with full alpha as a safe default - the binding should override display.
          copiedEffect.color = { r: 0, g: 0, b: 0, a: 1 };

          effectsModified = true;
          totalReplacementCount++;
        }
      } // end for loop

      // If any effect was modified, assign the whole new array back
      if (effectsModified) {
        node.effects = newEffects;
      }
    } // end effects check
  }; // end visitNodeForVariableReplace

  await traverseNodeTree(selection, visitNodeForVariableReplace);

  // Notify and Rescan (Unchanged)
  if (totalReplacementCount > 0) {
    figma.notify(`✅ Replaced ${totalReplacementCount} instance(s) of "${sourceVariableName}" with ${targetVariable.name}.`);
    figma.ui.postMessage({ type: "replacement-complete-variables", count: totalReplacementCount });
  } else {
    figma.notify(`⚠️ No instances of "${sourceVariableName}" found to replace.`);
    figma.ui.postMessage({ type: "replacement-complete-variables", count: 0 });
  }
  await variables_scanSelection();
}

// --- Variable Group Switcher Logic ---
// (groups_scanSelection and groups_applyVariableSwitch functions remain unchanged from previous version)
async function groups_scanSelection() {
  /* ... As before ... */
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.ui.postMessage({ type: "scan-results-groups", reset: true });
    return;
  }
  let pathPrefixesInSelection = new Set();
  let variablesFoundCount = 0;
  const processFoundGroupVariable = (variable) => {
    if (variable && variable.name.includes("/")) {
      const pathPrefix = utils_getPathPrefix(variable.name);
      if (pathPrefix) {
        pathPrefixesInSelection.add(pathPrefix);
        variablesFoundCount++;
        return true;
      }
    }
    return false;
  };
  const visitNodeForGroupScan = async (node) => {
    try {
      if (node.type === "TEXT") {
        const segments = node.getStyledTextSegments(["fills", "boundVariables"]);
        for (const segment of segments) {
          if (segment.fills && Array.isArray(segment.fills)) {
            for (const fill of segment.fills) {
              const fillVarId = fill.boundVariables && fill.boundVariables.color && fill.boundVariables.color.id;
              if (fillVarId) {
                try {
                  const variable = figma.variables.getVariableById(fillVarId);
                  processFoundGroupVariable(variable);
                } catch (e) {}
              }
            }
          }
        }
      }
      // *** ADDED: Scan effects for group scanner too ***
      if (node.effects && Array.isArray(node.effects)) {
        node.effects.forEach((effect) => {
          if (!effect.visible) return;
          if (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") {
            const effectVarId = effect.boundVariables && effect.boundVariables.color && effect.boundVariables.color.id;
            if (effectVarId) {
              try {
                const variable = figma.variables.getVariableById(effectVarId);
                processFoundGroupVariable(variable);
              } catch (e) {}
            }
          }
        });
      }
      // *** --- ***
      if (node.boundVariables) {
        for (const propKey in node.boundVariables) {
          const bindings = node.boundVariables[propKey];
          if (bindings && bindings.type === "VARIABLE_ALIAS" && bindings.id) {
            try {
              const variable = figma.variables.getVariableById(bindings.id);
              processFoundGroupVariable(variable);
            } catch (e) {}
          } else if (Array.isArray(bindings)) {
            for (const item of bindings) {
              if (item && item.type === "VARIABLE_ALIAS" && item.id) {
                try {
                  const variable = figma.variables.getVariableById(item.id);
                  processFoundGroupVariable(variable);
                } catch (e) {}
              } else if (item && item.boundVariables) {
                for (const subPropKey in item.boundVariables) {
                  const subBoundVar = item.boundVariables[subPropKey];
                  if (subBoundVar && subBoundVar.type === "VARIABLE_ALIAS" && subBoundVar.id) {
                    try {
                      const variable = figma.variables.getVariableById(subBoundVar.id);
                      processFoundGroupVariable(variable);
                    } catch (e) {}
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {}
  };
  await traverseNodeTree(selection, visitNodeForGroupScan);
  let allPathPrefixes = new Set();
  try {
    const allVars = await figma.variables.getLocalVariablesAsync();
    for (const variable of allVars) {
      if (variable.name.includes("/")) {
        const pathPrefix = utils_getPathPrefix(variable.name);
        if (pathPrefix) {
          allPathPrefixes.add(pathPrefix);
        }
      }
    }
  } catch (e) {
    figma.ui.postMessage({ type: "error", message: "Could not fetch local variables." });
    figma.ui.postMessage({ type: "scan-results-groups", groupsInSelection: Array.from(pathPrefixesInSelection).sort(), allGroups: [] });
    return;
  }
  if (variablesFoundCount === 0 && selection.length > 0) {
    figma.ui.postMessage({ type: "scan-results-groups", groupsInSelection: [], allGroups: Array.from(allPathPrefixes).sort() });
    return;
  }
  figma.ui.postMessage({ type: "scan-results-groups", groupsInSelection: Array.from(pathPrefixesInSelection).sort(), allGroups: Array.from(allPathPrefixes).sort() });
}
async function groups_applyVariableSwitch(targetPathPrefix) {
  if (!targetPathPrefix) {
    figma.ui.postMessage({ type: "error", message: "Target path prefix missing" });
    return;
  }
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.ui.postMessage({ type: "error", message: "Please select object(s)." });
    return;
  }
  const targetGroupPrefix = utils_getGroupPrefix(targetPathPrefix);
  const targetSegmentName = utils_getSwitchableSegment(targetPathPrefix);
  let targetVariableMap = new Map();
  try {
    const allVars = await figma.variables.getLocalVariablesAsync();
    for (const variable of allVars) {
      const currentPathPrefix = utils_getPathPrefix(variable.name);
      if (currentPathPrefix === targetPathPrefix) {
        targetVariableMap.set(utils_getBaseName(variable.name), variable);
      }
    }
  } catch (e) {
    figma.ui.postMessage({ type: "error", message: "Could not fetch variables." });
    return;
  }
  if (targetVariableMap.size === 0) {
    figma.notify(`⚠️ No variables found matching "${targetPathPrefix}/...".`, { error: true });
    return;
  }
  let replacementCount = 0;
  let nodesProcessed = new Set();
  const tryRebindProperty = (node, propKey, currentVarId) => {
    try {
      const currentVar = figma.variables.getVariableById(currentVarId);
      if (!currentVar) return false;
      const currentGroupPrefix = utils_getGroupPrefix(utils_getPathPrefix(currentVar.name));
      if (currentGroupPrefix === targetGroupPrefix) {
        const currentBaseName = utils_getBaseName(currentVar.name);
        if (targetVariableMap.has(currentBaseName)) {
          const targetVar = targetVariableMap.get(currentBaseName);
          node.setBoundVariable(propKey, targetVar.id);
          replacementCount++;
          nodesProcessed.add(node.id);
          return true;
        }
      }
    } catch (e) {}
    return false;
  };
  const rebindPaints = (node, propKey) => {
    if (node.type === "TEXT" || !node[propKey] || !Array.isArray(node[propKey])) return;
    let paintsModified = false;
    const originalPaints = node[propKey];
    let newPaints = null;
    for (let i = 0; i < originalPaints.length; i++) {
      const paint = originalPaints[i];
      let needsCopy = false;
      const solidVarId = paint.boundVariables && paint.boundVariables.color && paint.boundVariables.color.id;
      if (solidVarId) {
        try {
          const currentVar = figma.variables.getVariableById(solidVarId);
          if (currentVar) {
            const currentGroupPrefix = utils_getGroupPrefix(utils_getPathPrefix(currentVar.name));
            if (currentGroupPrefix === targetGroupPrefix) {
              const currentBaseName = utils_getBaseName(currentVar.name);
              if (targetVariableMap.has(currentBaseName)) {
                const targetVar = targetVariableMap.get(currentBaseName);
                if (!newPaints) newPaints = JSON.parse(JSON.stringify(originalPaints));
                newPaints[i] = figma.variables.setBoundVariableForPaint(paint, "color", targetVar);
                replacementCount++;
                needsCopy = true;
                nodesProcessed.add(node.id);
              }
            }
          }
        } catch (e) {}
      }
      if (paint.gradientStops) {
        let stopsModified = false;
        if (!newPaints) newPaints = JSON.parse(JSON.stringify(originalPaints));
        for (let j = 0; j < paint.gradientStops.length; j++) {
          const stop = newPaints[i].gradientStops[j];
          const stopVarId = stop.boundVariables && stop.boundVariables.color && stop.boundVariables.color.id;
          if (stopVarId) {
            try {
              const currentVar = figma.variables.getVariableById(stopVarId);
              if (currentVar) {
                const currentGroupPrefix = utils_getGroupPrefix(utils_getPathPrefix(currentVar.name));
                if (currentGroupPrefix === targetGroupPrefix) {
                  const currentBaseName = utils_getBaseName(currentVar.name);
                  if (targetVariableMap.has(currentBaseName)) {
                    const targetVar = targetVariableMap.get(currentBaseName);
                    const targetAlias = figma.variables.createVariableAlias(targetVar);
                    if (!stop.boundVariables) stop.boundVariables = {};
                    stop.boundVariables.color = targetAlias;
                    replacementCount++;
                    stopsModified = true;
                    nodesProcessed.add(node.id);
                  }
                }
              }
            } catch (e) {}
          }
        }
        if (stopsModified) needsCopy = true;
      }
      if (needsCopy) paintsModified = true;
    }
    if (paintsModified) node[propKey] = newPaints;
  };
  const rebindTextSegments = (node) => {
    if (node.type !== "TEXT") return;
    try {
      const segments = node.getStyledTextSegments(["fills", "boundVariables"]);
      for (const segment of segments) {
        if (!segment.fills || !Array.isArray(segment.fills) || segment.fills.length === 0) continue;
        const fill = segment.fills[0];
        const fillVarId = fill.boundVariables && fill.boundVariables.color && fill.boundVariables.color.id;
        if (fillVarId) {
          try {
            const currentVar = figma.variables.getVariableById(fillVarId);
            if (currentVar) {
              const currentGroupPrefix = utils_getGroupPrefix(utils_getPathPrefix(currentVar.name));
              if (currentGroupPrefix === targetGroupPrefix) {
                const currentBaseName = utils_getBaseName(currentVar.name);
                if (targetVariableMap.has(currentBaseName)) {
                  const targetVar = targetVariableMap.get(currentBaseName);
                  const newPaint = { type: "SOLID", color: { r: 0, g: 0, b: 0 }, boundVariables: { color: { type: "VARIABLE_ALIAS", id: targetVar.id } } };
                  if (fill.opacity !== undefined) newPaint.opacity = fill.opacity;
                  if (fill.blendMode !== undefined) newPaint.blendMode = fill.blendMode;
                  try {
                    node.setRangeFills(segment.start, segment.end, [newPaint]);
                    replacementCount++;
                    nodesProcessed.add(node.id);
                  } catch (e) {}
                }
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  };
  // *** NEW: Helper to rebind effect colors ***
  const rebindEffects = (node) => {
    if (!node.effects || !Array.isArray(node.effects) || node.effects.length === 0) return;
    let effectsModified = false;
    let newEffects = null; // Lazy deep copy
    const originalEffects = node.effects;

    for (let i = 0; i < originalEffects.length; i++) {
      const effect = originalEffects[i];
      // Check only shadow effects with color bindings
      if ((effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") && effect.boundVariables && effect.boundVariables.color && effect.boundVariables.color.id) {
        const effectVarId = effect.boundVariables.color.id;
        try {
          const currentVar = figma.variables.getVariableById(effectVarId);
          if (currentVar) {
            const currentGroupPrefix = utils_getGroupPrefix(utils_getPathPrefix(currentVar.name));
            if (currentGroupPrefix === targetGroupPrefix) {
              const currentBaseName = utils_getBaseName(currentVar.name);
              if (targetVariableMap.has(currentBaseName)) {
                const targetVar = targetVariableMap.get(currentBaseName);
                // Ensure deep copy before modifying
                if (!newEffects) newEffects = JSON.parse(JSON.stringify(originalEffects));
                // Modify the copied effect
                const copiedEffect = newEffects[i];
                if (!copiedEffect.boundVariables) copiedEffect.boundVariables = {};
                copiedEffect.boundVariables.color = { type: "VARIABLE_ALIAS", id: targetVar.id };
                // Ensure color property exists
                if (!copiedEffect.color) copiedEffect.color = { r: 0, g: 0, b: 0, a: 1 };

                effectsModified = true;
                replacementCount++;
                nodesProcessed.add(node.id);
              }
            }
          }
        } catch (e) {} // Ignore errors finding/rebinding variable
      }
    }
    if (effectsModified) {
      node.effects = newEffects;
    }
  };

  const visitNodeForGroupReplace = async (node) => {
    try {
      // Order: Text, Effects, Paints, Others
      rebindTextSegments(node);
      rebindEffects(node); // Call new helper
      rebindPaints(node, "fills");
      rebindPaints(node, "strokes");
      if (node.boundVariables && !nodesProcessed.has(node.id)) {
        for (const propKey in node.boundVariables) {
          if (propKey === "fills" || propKey === "strokes" || propKey === "effects") continue;
          const bindings = node.boundVariables[propKey];
          if (bindings && bindings.type === "VARIABLE_ALIAS" && bindings.id) {
            tryRebindProperty(node, propKey, bindings.id);
          }
        }
      }
    } catch (e) {}
  };

  await traverseNodeTree(selection, visitNodeForGroupReplace);

  // Notify and Rescan (Unchanged)
  if (replacementCount > 0) {
    figma.ui.postMessage({ type: "replacement-complete-groups", count: replacementCount, targetGroup: targetPathPrefix });
    figma.notify(`✅ Switched ${replacementCount} variable instances to path prefix "${targetPathPrefix}".`);
  } else {
    let message = `No variables matching the target structure "${targetPathPrefix}/..." were found or could be switched.`;
    if (nodesProcessed.size > 0) {
      message = `Selection might use variables from the '${targetGroupPrefix}' group, but no switchable matches for '${targetSegmentName}' were found.`;
    } else {
      message = `Selection does not seem to contain variables from the '${targetGroupPrefix}' group needed for switching.`;
    }
    figma.ui.postMessage({ type: "error", message: message });
    figma.notify(`⚠️ No variables were switched. ${message}`, { error: true, timeout: 6000 });
  }
  await groups_scanSelection();
}
