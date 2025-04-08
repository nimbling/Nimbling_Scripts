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
    return "";
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

// Helper: Safely get resolved color value (ASYNC VERSION)
async function utils_getResolvedVariableColor(variable) {
  if (!variable || variable.resolvedType !== "COLOR" || !variable.valuesByMode) {
    if (variable) console.warn("Invalid variable passed to utils_getResolvedVariableColor:", variable.id, variable.name);
    return null;
  }
  try {
    const modeIds = Object.keys(variable.valuesByMode);
    if (modeIds.length === 0) {
      console.warn("Variable has no modes:", variable.name);
      return null;
    }
    const firstModeId = modeIds[0];
    let value = variable.valuesByMode[firstModeId];
    let depth = 0;
    const visitedAliasIds = new Set();

    while (value && value.type === "VARIABLE_ALIAS" && value.id && depth < 10) {
      if (visitedAliasIds.has(value.id)) {
        console.warn("Circular variable alias detected:", variable.name);
        return null;
      }
      visitedAliasIds.add(value.id);
      depth++;
      try {
        const aliasedVariable = await figma.variables.getVariableByIdAsync(value.id);
        if (aliasedVariable && aliasedVariable.resolvedType === "COLOR" && aliasedVariable.valuesByMode) {
          const aliasedModeIds = Object.keys(aliasedVariable.valuesByMode);
          if (aliasedModeIds.length > 0) {
            const modeToUse = aliasedVariable.valuesByMode[firstModeId] ? firstModeId : aliasedModeIds[0];
            value = aliasedVariable.valuesByMode[modeToUse];
          } else {
            console.warn("Aliased variable has no modes:", aliasedVariable.name);
            value = null;
          }
        } else {
          console.warn("Could not resolve alias or it's not a COLOR variable:", value.id);
          value = null;
        }
      } catch (aliasError) {
        console.error(`Error fetching aliased variable ID: ${value.id} for ${variable.name}`, aliasError);
        value = null;
        break;
      }
    }
    if (value && typeof value === "object" && value.hasOwnProperty("r") && value.hasOwnProperty("g") && value.hasOwnProperty("b")) {
      const colorValue = {
        r: value.r,
        g: value.g,
        b: value.b,
        a: typeof value.a === "number" ? value.a : 1, // Ensure alpha exists, default 1
      };
      return colorValue;
    } else {
      console.warn("Resolved value is not a color object for variable:", variable.name);
      return null;
    }
  } catch (e) {
    const varName = variable && variable.name ? variable.name : "unknown";
    console.error(`Error resolving variable color for: ${varName}`, e);
    return null;
  }
}

// --- Generic Tree Traversal ---
async function traverseNodeTree(nodes, visitorCallback) {
  for (const node of nodes) {
    if (!node || node.removed) continue;
    try {
      await visitorCallback(node);
      if (node && !node.removed && "children" in node && node.children) {
        await traverseNodeTree(node.children, visitorCallback);
      }
    } catch (e) {
      const nodeId = node && node.id ? node.id : "unknown";
      console.error(`Error visiting node ${nodeId}:`, e);
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
    console.error("Plugin Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    figma.ui.postMessage({ type: "error", message: "Plugin Error: " + errorMessage });
  }
};

// --- Deep Color Variable Scanner Logic ---
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
    if (!node || node.removed) return;

    const processFoundVariableAsync = async (variableId) => {
      if (!variableId || colorVariablesFound.has(variableId)) return;
      try {
        const variable = await figma.variables.getVariableByIdAsync(variableId);
        if (variable && variable.resolvedType === "COLOR") {
          const colorValue = await utils_getResolvedVariableColor(variable);
          colorVariablesFound.set(variable.id, { id: variable.id, name: variable.name, type: "variable", color: colorValue, unresolved: !colorValue });
          variablesCount++;
        }
      } catch (e) {
        if (!colorVariablesFound.has(variableId)) {
          const shortId = variableId.substring(variableId.length - 6);
          colorVariablesFound.set(variableId, { id: variableId, name: `Library Var (...${shortId})`, type: "variable", color: null, unresolved: true });
          variablesCount++;
        }
        console.warn(`Scanner: Could not fetch variable ID: ${variableId}`, e);
      }
    };

    const processFoundHex = (hex) => {
      if (!hexColorsFound.has(hex)) {
        hexColorsFound.set(hex, { hex: hex, type: "hex", color: null });
        hexCount++;
      }
    };

    const checkPaintsAsync = async (paintType) => {
      if (!node[paintType] || node[paintType] === figma.mixed || !Array.isArray(node[paintType])) {
        return;
      }
      await Promise.all(
        node[paintType].map(async (paint) => {
          // Removed index here, not needed by logic
          if (!paint || paint.visible === false) return;
          let paintVarId = null;
          if (paint.boundVariables && paint.boundVariables.color && paint.boundVariables.color.id) {
            paintVarId = paint.boundVariables.color.id;
          }
          if (paintVarId) {
            await processFoundVariableAsync(paintVarId);
          } else if (paint.type === "SOLID" && paint.color) {
            processFoundHex(utils_rgbToHex(paint.color.r, paint.color.g, paint.color.b));
          } else if (paint.type && paint.type.startsWith("GRADIENT") && paint.gradientStops) {
            await Promise.all(
              paint.gradientStops.map(async (stop) => {
                const stopVarId = stop.boundVariables && stop.boundVariables.color && stop.boundVariables.color.id;
                if (stopVarId) {
                  await processFoundVariableAsync(stopVarId);
                } else if (stop.color) {
                  processFoundHex(utils_rgbToHex(stop.color.r, stop.color.g, stop.color.b));
                }
              })
            );
          }
        })
      );
    };

    await checkPaintsAsync("fills");
    await checkPaintsAsync("strokes");

    if (node.type === "TEXT") {
      try {
        const segments = node.getStyledTextSegments(["fills", "boundVariables"]);
        for (const segment of segments) {
          if (!segment || typeof segment.start !== "number" || typeof segment.end !== "number") continue;
          if (segment.fills && Array.isArray(segment.fills)) {
            await Promise.all(
              segment.fills.map(async (fill) => {
                if (!fill || fill.visible === false) return;
                const fillVarId = fill.boundVariables && fill.boundVariables.color && fill.boundVariables.color.id;
                if (fillVarId) {
                  await processFoundVariableAsync(fillVarId);
                } else if (fill.type === "SOLID" && fill.color) {
                  processFoundHex(utils_rgbToHex(fill.color.r, fill.color.g, fill.color.b));
                }
              })
            );
          }
        }
      } catch (e) {
        if (!node.removed) console.warn(`Scanner: Error getting text segments for node ${node.id}`, e);
      }
    }

    if (node.effects && Array.isArray(node.effects)) {
      await Promise.all(
        node.effects.map(async (effect) => {
          if (!effect || !effect.visible) return;
          if ((effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") && effect.color) {
            const effectVarId = effect.boundVariables && effect.boundVariables.color && effect.boundVariables.color.id;
            if (effectVarId) {
              await processFoundVariableAsync(effectVarId);
            } else {
              processFoundHex(utils_rgbToHex(effect.color.r, effect.color.g, effect.color.b));
            }
          }
        })
      );
    }
  };

  await traverseNodeTree(selection, visitNodeForVariableScan);

  const variablesFoundArray = Array.from(colorVariablesFound.values()).sort((a, b) => {
    if (a.unresolved && !b.unresolved) return 1;
    if (!a.unresolved && b.unresolved) return -1;
    return a.name.localeCompare(b.name);
  });
  const hexColorsFoundArray = Array.from(hexColorsFound.values()).sort((a, b) => a.hex.localeCompare(b.hex));
  const combinedFound = [].concat(variablesFoundArray, hexColorsFoundArray);

  let allColorVariables = [];
  try {
    const allVars = await figma.variables.getLocalVariablesAsync();
    const colorVarPromises = allVars
      .filter((variable) => variable.resolvedType === "COLOR")
      .map(async (variable) => {
        const colorValue = await utils_getResolvedVariableColor(variable);
        return { id: variable.id, name: variable.name, color: colorValue };
      });
    allColorVariables = await Promise.all(colorVarPromises);
    allColorVariables.sort((a, b) => a.name.localeCompare(b.name));
  } catch (e) {
    console.error("Could not fetch local variables for target list:", e);
    figma.ui.postMessage({ type: "error", message: "Could not fetch local variables." });
    allColorVariables = [];
  }
  figma.ui.postMessage({
    type: "scan-results-variables",
    variablesFound: combinedFound,
    allColorVariables: allColorVariables,
    hasVariablesInSelection: variablesCount + hexCount > 0,
  });
}

// --- Variable Replacer Logic ---
async function variables_applyReplace(sourceValue, targetVariableId) {
  const isSourceHex = typeof sourceValue === "string" && sourceValue.startsWith("#");
  if (!sourceValue || !targetVariableId) {
    figma.ui.postMessage({ type: "error", message: "Missing source or target for replacement." });
    return;
  }
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.ui.postMessage({ type: "error", message: "Please select object(s)." });
    return;
  }

  let targetVariable;
  let sourceVariableName = isSourceHex ? sourceValue : `Variable ID: ${sourceValue}`;

  try {
    targetVariable = await figma.variables.getVariableByIdAsync(targetVariableId);
    if (!targetVariable || targetVariable.resolvedType !== "COLOR") {
      throw new Error(`Target variable (${targetVariableId}) not found or not a COLOR variable.`);
    }
    if (!isSourceHex) {
      try {
        const sourceVar = await figma.variables.getVariableByIdAsync(sourceValue);
        if (sourceVar) sourceVariableName = sourceVar.name;
      } catch (e) {
        console.warn(`Could not resolve source variable name for ID: ${sourceValue}`);
      }
    }
  } catch (e) {
    console.error("Error fetching target/source variables:", e);
    figma.ui.postMessage({ type: "error", message: "Could not find source/target variable: " + e.message });
    return;
  }

  const targetVariableAlias = figma.variables.createVariableAlias(targetVariable);
  // Ensure fallback includes alpha=1
  const targetVariableColorRgba = (await utils_getResolvedVariableColor(targetVariable)) || { r: 0, g: 0, b: 0, a: 1 };

  let totalReplacementCount = 0;

  // Helper for Solid/Direct Paint Binding
  const tryReplacePaintVariable = (paint, nodePaint) => {
    const paintVarId = paint.boundVariables && paint.boundVariables.color && paint.boundVariables.color.id;
    if (!isSourceHex && paintVarId === sourceValue) {
      try {
        return figma.variables.setBoundVariableForPaint(nodePaint, "color", targetVariable);
      } catch (e) {
        const nodeId = nodePaint && nodePaint.id ? nodePaint.id : "unknown";
        console.warn(`Failed to rebind paint var->var for node ${nodeId}: ${e.message}`);
        return null;
      }
    } else if (isSourceHex && !paintVarId && paint.color && paint.type === "SOLID") {
      const paintHex = utils_rgbToHex(paint.color.r, paint.color.g, paint.color.b);
      if (paintHex === sourceValue) {
        try {
          return figma.variables.setBoundVariableForPaint(nodePaint, "color", targetVariable);
        } catch (e) {
          const nodeId = nodePaint && nodePaint.id ? nodePaint.id : "unknown";
          console.warn(`Failed to bind paint hex->var for node ${nodeId}: ${e.message}`);
          return null;
        }
      }
    }
    return null;
  };

  // Helper for Gradient Stops (Modifies Copy)
  const tryReplaceGradientStopVariable = (stopsCopy) => {
    let changed = false;
    for (let j = 0; j < stopsCopy.length; j++) {
      let stop = stopsCopy[j];
      const stopVarId = stop.boundVariables && stop.boundVariables.color && stop.boundVariables.color.id;
      if (!isSourceHex && stopVarId === sourceValue) {
        if (!stop.boundVariables) stop.boundVariables = {};
        stop.boundVariables.color = targetVariableAlias;
        // *** FIX: Restore alpha ('a') to stop.color ***
        stop.color = targetVariableColorRgba; // Assign full RGBA object
        changed = true;
        totalReplacementCount++;
      } else if (isSourceHex && !stopVarId && stop.color) {
        const stopHex = utils_rgbToHex(stop.color.r, stop.color.g, stop.color.b);
        if (stopHex === sourceValue) {
          if (!stop.boundVariables) stop.boundVariables = {};
          stop.boundVariables.color = targetVariableAlias;
          // *** FIX: Restore alpha ('a') to stop.color ***
          stop.color = targetVariableColorRgba; // Assign full RGBA object
          changed = true;
          totalReplacementCount++;
        }
      }
    }
    return changed;
  };

  // Visitor function for replacement
  const visitNodeForVariableReplace = async (node) => {
    if (!node || node.removed) return;

    // Process Fills & Strokes
    const processPaints = async (paintType) => {
      const originalPaints = node[paintType];
      if (!originalPaints || originalPaints === figma.mixed || !Array.isArray(originalPaints) || originalPaints.length === 0) {
        return;
      }
      let paintsCopy = null;
      let paintsModified = false;

      for (let i = 0; i < originalPaints.length; i++) {
        const paint = originalPaints[i];
        if (!paint || paint.visible === false) {
          if (paintsCopy) paintsCopy.push(JSON.parse(JSON.stringify(paint)));
          continue;
        }
        let currentPaintModified = false;
        let modifiedPaintResult = null;

        if (paint.type && paint.type.startsWith("GRADIENT") && paint.gradientStops) {
          if (!paintsCopy) paintsCopy = JSON.parse(JSON.stringify(originalPaints.slice(0, i)));
          const currentCopiedPaint = JSON.parse(JSON.stringify(paint));
          // Pass the gradientStops array FROM THE COPY to the helper
          if (tryReplaceGradientStopVariable(currentCopiedPaint.gradientStops)) {
            paintsCopy.push(currentCopiedPaint);
            currentPaintModified = true;
            // Count is incremented inside helper now
          } else {
            paintsCopy.push(currentCopiedPaint); // Push unmodified copy if stops didn't change
          }
        } else if (paint.type === "SOLID") {
          // Pass the ORIGINAL paint object from node's array to setBoundVariable...
          modifiedPaintResult = tryReplacePaintVariable(paint, originalPaints[i]);
          if (modifiedPaintResult) {
            if (!paintsCopy) paintsCopy = JSON.parse(JSON.stringify(originalPaints.slice(0, i)));
            paintsCopy.push(modifiedPaintResult);
            currentPaintModified = true;
            totalReplacementCount++; // Count direct solid replacements here
          }
        }

        if (!currentPaintModified && paintsCopy) {
          paintsCopy.push(JSON.parse(JSON.stringify(paint)));
        }
        if (currentPaintModified) {
          paintsModified = true;
        }
      }

      if (paintsModified && paintsCopy) {
        try {
          if (paintsCopy.length === originalPaints.length) {
            node[paintType] = paintsCopy;
          } else {
            console.error(`Variable Replace: Length mismatch assigning ${paintType} on node ${node.id}`);
          }
        } catch (e) {
          console.error(`Variable Replace: Error assigning ${paintType} on node ${node.id}:`, e);
        }
      }
    };

    await processPaints("fills");
    await processPaints("strokes");

    // Process Text Segments (Should be correct from previous step)
    if (node.type === "TEXT") {
      try {
        const segments = node.getStyledTextSegments(["fills", "boundVariables"]);
        for (const segment of segments) {
          if (!segment || typeof segment.start !== "number" || typeof segment.end !== "number") continue;
          if (!segment.fills || !Array.isArray(segment.fills) || segment.fills.length === 0) continue;
          const fill = segment.fills[0];
          if (!fill || fill.visible === false) continue;
          const fillVarId = fill.boundVariables && fill.boundVariables.color && fill.boundVariables.color.id;
          let match = false;
          if (!isSourceHex && fillVarId === sourceValue) {
            match = true;
          } else if (isSourceHex && !fillVarId && fill.type === "SOLID" && fill.color) {
            if (utils_rgbToHex(fill.color.r, fill.color.g, fill.color.b) === sourceValue) {
              match = true;
            }
          }
          if (match) {
            const newPaint = {
              type: "SOLID",
              // Correct: Use RGB only for setRangeFills
              color: { r: targetVariableColorRgba.r, g: targetVariableColorRgba.g, b: targetVariableColorRgba.b },
              boundVariables: { color: targetVariableAlias },
            };
            if (fill.opacity !== undefined) newPaint.opacity = fill.opacity;
            if (fill.blendMode !== undefined) newPaint.blendMode = fill.blendMode;
            try {
              node.setRangeFills(segment.start, segment.end, [newPaint]);
              totalReplacementCount++;
            } catch (e) {
              console.warn(`Failed to setRangeFills for node ${node.id}, segment ${segment.start}-${segment.end}:`, e);
            }
          }
        }
      } catch (e) {
        if (!node.removed) console.error(`Variable Replace: Error processing text segments for node ${node.id}:`, e);
      }
    }

    // Process Effects
    if (node.effects && Array.isArray(node.effects) && node.effects.length > 0) {
      let effectsModified = false;
      let newEffects = null;
      const originalEffects = node.effects;

      for (let i = 0; i < originalEffects.length; i++) {
        const effect = originalEffects[i];
        let needsUpdate = false;

        if (effect && effect.visible !== false && (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") && effect.color) {
          const effectVarId = effect.boundVariables && effect.boundVariables.color && effect.boundVariables.color.id;
          if (!isSourceHex && effectVarId === sourceValue) {
            needsUpdate = true;
          } else if (isSourceHex && !effectVarId) {
            const effectHex = utils_rgbToHex(effect.color.r, effect.color.g, effect.color.b);
            if (effectHex === sourceValue) {
              needsUpdate = true;
            }
          }
        }

        if (needsUpdate) {
          if (!newEffects) newEffects = JSON.parse(JSON.stringify(originalEffects));
          if (i < newEffects.length) {
            const copiedEffect = newEffects[i];
            if (!copiedEffect.boundVariables) copiedEffect.boundVariables = {};
            copiedEffect.boundVariables.color = targetVariableAlias;
            // *** FIX: Remove explicit setting of copiedEffect.color ***
            // Let the binding handle the color update.
            effectsModified = true;
            totalReplacementCount++;
          } else {
            console.error(`Variable Replace: Index out of bounds when modifying effects copy for node ${node.id}`);
          }
        }
      }

      if (effectsModified && newEffects) {
        try {
          if (newEffects.length === originalEffects.length) {
            node.effects = newEffects;
          } else {
            console.error(`Variable Replace: Length mismatch assigning effects on node ${node.id}`);
          }
        } catch (e) {
          console.error(`Variable Replace: Error assigning effects on node ${node.id}:`, e);
        }
      }
    } // end effects check
  }; // end visitNodeForVariableReplace

  await traverseNodeTree(selection, visitNodeForVariableReplace);

  if (totalReplacementCount > 0) {
    figma.notify(`✅ Replaced ${totalReplacementCount} instance(s) of "${sourceVariableName}" with ${targetVariable.name}.`);
    figma.ui.postMessage({ type: "replacement-complete-variables", count: totalReplacementCount, targetVariableName: targetVariable.name });
  } else {
    figma.notify(`⚠️ No instances of "${sourceVariableName}" found to replace in selection.`, { error: true });
    figma.ui.postMessage({ type: "replacement-complete-variables", count: 0 });
  }
  await variables_scanSelection();
} // End variables_applyReplace

// --- Variable Group Switcher Logic ---

async function groups_scanSelection() {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.ui.postMessage({ type: "scan-results-groups", reset: true });
    return;
  }
  let pathPrefixesInSelection = new Set();
  let variablesFoundCount = 0;

  const processFoundGroupVariableAsync = async (variableId) => {
    if (!variableId) return false;
    try {
      const variable = await figma.variables.getVariableByIdAsync(variableId);
      if (variable && variable.name && variable.name.includes("/")) {
        const pathPrefix = utils_getPathPrefix(variable.name);
        if (pathPrefix) {
          pathPrefixesInSelection.add(pathPrefix);
          variablesFoundCount++;
          return true;
        }
      }
    } catch (e) {
      console.warn(`Group Scanner: Could not fetch variable ID: ${variableId}`, e);
    }
    return false;
  };

  const visitNodeForGroupScan = async (node) => {
    if (!node || node.removed) return;
    const checkGroupPaintsAsync = async (paintType) => {
      if (!node[paintType] || node[paintType] === figma.mixed || !Array.isArray(node[paintType])) {
        return;
      }
      await Promise.all(
        node[paintType].map(async (paint) => {
          if (!paint || paint.visible === false) return;
          let paintVarId = paint.boundVariables && paint.boundVariables.color && paint.boundVariables.color.id;
          if (paintVarId) {
            await processFoundGroupVariableAsync(paintVarId);
          } else if (paint.type && paint.type.startsWith("GRADIENT") && paint.gradientStops) {
            await Promise.all(
              paint.gradientStops.map(async (stop) => {
                const stopVarId = stop.boundVariables && stop.boundVariables.color && stop.boundVariables.color.id;
                if (stopVarId) {
                  await processFoundGroupVariableAsync(stopVarId);
                }
              })
            );
          }
        })
      );
    };
    await checkGroupPaintsAsync("fills");
    await checkGroupPaintsAsync("strokes");
    if (node.type === "TEXT") {
      try {
        const segments = node.getStyledTextSegments(["fills", "boundVariables"]);
        for (const segment of segments) {
          if (!segment || typeof segment.start !== "number" || typeof segment.end !== "number") continue;
          if (segment.fills && Array.isArray(segment.fills)) {
            await Promise.all(
              segment.fills.map(async (fill) => {
                if (!fill || fill.visible === false) return;
                const fillVarId = fill.boundVariables && fill.boundVariables.color && fill.boundVariables.color.id;
                if (fillVarId) {
                  await processFoundGroupVariableAsync(fillVarId);
                }
              })
            );
          }
        }
      } catch (e) {
        if (!node.removed) console.warn(`Group Scanner: Error getting text segments for node ${node.id}`, e);
      }
    }
    if (node.effects && Array.isArray(node.effects)) {
      await Promise.all(
        node.effects.map(async (effect) => {
          if (!effect || !effect.visible) return;
          if (effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") {
            const effectVarId = effect.boundVariables && effect.boundVariables.color && effect.boundVariables.color.id;
            if (effectVarId) {
              await processFoundGroupVariableAsync(effectVarId);
            }
          }
        })
      );
    }
  };

  await traverseNodeTree(selection, visitNodeForGroupScan);

  let allPathPrefixes = new Set();
  try {
    const allVars = await figma.variables.getLocalVariablesAsync();
    for (const variable of allVars) {
      if (variable.resolvedType === "COLOR" && variable.name.includes("/")) {
        const pathPrefix = utils_getPathPrefix(variable.name);
        if (pathPrefix) {
          allPathPrefixes.add(pathPrefix);
        }
      }
    }
  } catch (e) {
    console.error("Could not fetch local variables for group list:", e);
    figma.ui.postMessage({ type: "error", message: "Could not fetch local variables." });
    figma.ui.postMessage({ type: "scan-results-groups", groupsInSelection: Array.from(pathPrefixesInSelection).sort(), allGroups: [] });
    return;
  }
  const selectionGroups = Array.from(pathPrefixesInSelection).sort();
  const allGroups = Array.from(allPathPrefixes).sort();
  figma.ui.postMessage({ type: "scan-results-groups", groupsInSelection: selectionGroups, allGroups: allGroups, noRelevantGroupsFound: selection.length > 0 && selectionGroups.length === 0 });
} // End groups_scanSelection

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
      if (variable.resolvedType === "COLOR" && utils_getPathPrefix(variable.name) === targetPathPrefix) {
        targetVariableMap.set(utils_getBaseName(variable.name), variable);
      }
    }
  } catch (e) {
    console.error("Could not fetch local variables for target map:", e);
    figma.ui.postMessage({ type: "error", message: "Could not fetch variables." });
    return;
  }

  if (targetVariableMap.size === 0) {
    figma.notify(`⚠️ No COLOR variables found matching the exact path "${targetPathPrefix}/...".`, { error: true, timeout: 5000 });
    return;
  }

  let replacementCount = 0;
  let nodesProcessed = new Set();

  // Async helper for paints
  const rebindPaintsAsync = async (node, paintType) => {
    const originalPaints = node[paintType];
    if (!originalPaints || originalPaints === figma.mixed || !Array.isArray(originalPaints) || originalPaints.length === 0) {
      return;
    }
    let newPaints = null;
    let paintsModified = false;

    for (let i = 0; i < originalPaints.length; i++) {
      const paint = originalPaints[i];
      if (!paint || paint.visible === false) {
        if (newPaints) newPaints.push(JSON.parse(JSON.stringify(paint)));
        continue;
      }
      let currentPaintModified = false;
      let modifiedPaintResult = null;
      const solidVarId = paint.boundVariables && paint.boundVariables.color && paint.boundVariables.color.id;

      if (solidVarId) {
        try {
          const currentVar = await figma.variables.getVariableByIdAsync(solidVarId);
          if (currentVar && currentVar.resolvedType === "COLOR") {
            const currentVarPrefix = utils_getPathPrefix(currentVar.name);
            const currentVarGroup = utils_getGroupPrefix(currentVarPrefix);
            const currentBaseName = utils_getBaseName(currentVar.name);
            if (currentVarGroup === targetGroupPrefix && targetVariableMap.has(currentBaseName)) {
              const targetVar = targetVariableMap.get(currentBaseName);
              modifiedPaintResult = figma.variables.setBoundVariableForPaint(originalPaints[i], "color", targetVar);
              if (!newPaints) newPaints = JSON.parse(JSON.stringify(originalPaints.slice(0, i)));
              newPaints.push(modifiedPaintResult);
              replacementCount++;
              currentPaintModified = true;
              nodesProcessed.add(node.id);
            }
          }
        } catch (e) {
          console.warn(`Group Switch: Error checking/rebinding solid paint var on ${node.id}:`, e);
        }
      }

      if (!currentPaintModified && paint.type && paint.type.startsWith("GRADIENT") && paint.gradientStops) {
        let stopsModified = false;
        let currentStopsCopy = JSON.parse(JSON.stringify(paint.gradientStops));
        await Promise.all(
          currentStopsCopy.map(async (stop) => {
            // Removed index j, not used
            const stopVarId = stop.boundVariables && stop.boundVariables.color && stop.boundVariables.color.id;
            if (stopVarId) {
              try {
                const currentVar = await figma.variables.getVariableByIdAsync(stopVarId);
                if (currentVar && currentVar.resolvedType === "COLOR") {
                  const currentVarPrefix = utils_getPathPrefix(currentVar.name);
                  const currentVarGroup = utils_getGroupPrefix(currentVarPrefix);
                  const currentBaseName = utils_getBaseName(currentVar.name);
                  if (currentVarGroup === targetGroupPrefix && targetVariableMap.has(currentBaseName)) {
                    const targetVar = targetVariableMap.get(currentBaseName);
                    const targetAlias = figma.variables.createVariableAlias(targetVar);
                    if (!stop.boundVariables) stop.boundVariables = {};
                    stop.boundVariables.color = targetAlias;
                    const targetColor = await utils_getResolvedVariableColor(targetVar);
                    // *** FIX: Restore alpha ('a') to stop.color ***
                    if (targetColor) stop.color = targetColor; // Assign full RGBA object
                    replacementCount++;
                    stopsModified = true;
                    nodesProcessed.add(node.id);
                  }
                }
              } catch (e) {
                console.warn(`Group Switch: Error checking/rebinding gradient stop var on ${node.id}:`, e);
              }
            }
          })
        );

        if (stopsModified) {
          if (!newPaints) newPaints = JSON.parse(JSON.stringify(originalPaints.slice(0, i)));
          const modifiedGradientPaint = JSON.parse(JSON.stringify(paint));
          modifiedGradientPaint.gradientStops = currentStopsCopy;
          newPaints.push(modifiedGradientPaint);
          currentPaintModified = true;
        }
      }

      if (!currentPaintModified && newPaints) {
        newPaints.push(JSON.parse(JSON.stringify(paint)));
      }
      if (currentPaintModified) {
        paintsModified = true;
      }
    }

    if (paintsModified && newPaints) {
      try {
        if (newPaints.length === originalPaints.length) {
          node[paintType] = newPaints;
        } else {
          console.error(`Group Switch: Length mismatch assigning ${paintType} on node ${node.id}`);
        }
      } catch (e) {
        console.error(`Group Switch: Error assigning ${paintType} on node ${node.id}:`, e);
      }
    }
  };

  // Async helper for text
  const rebindTextSegmentsAsync = async (node) => {
    if (node.type !== "TEXT") return;
    try {
      const segments = node.getStyledTextSegments(["fills", "boundVariables"]);
      for (const segment of segments) {
        if (!segment || typeof segment.start !== "number" || typeof segment.end !== "number") continue;
        if (!segment.fills || !Array.isArray(segment.fills) || segment.fills.length === 0) continue;
        const fill = segment.fills.find((f) => f && f.visible !== false);
        if (!fill) continue;
        const fillVarId = fill.boundVariables && fill.boundVariables.color && fill.boundVariables.color.id;
        if (fillVarId) {
          try {
            const currentVar = await figma.variables.getVariableByIdAsync(fillVarId);
            if (currentVar && currentVar.resolvedType === "COLOR") {
              const currentVarPrefix = utils_getPathPrefix(currentVar.name);
              const currentVarGroup = utils_getGroupPrefix(currentVarPrefix);
              const currentBaseName = utils_getBaseName(currentVar.name);
              if (currentVarGroup === targetGroupPrefix && targetVariableMap.has(currentBaseName)) {
                const targetVar = targetVariableMap.get(currentBaseName);
                // Correct: Use RGB only for setRangeFills color placeholder
                const newPaint = {
                  type: "SOLID",
                  color: { r: 0, g: 0, b: 0 },
                  boundVariables: { color: { type: "VARIABLE_ALIAS", id: targetVar.id } },
                };
                if (fill.opacity !== undefined) newPaint.opacity = fill.opacity;
                if (fill.blendMode !== undefined) newPaint.blendMode = fill.blendMode;
                node.setRangeFills(segment.start, segment.end, [newPaint]);
                replacementCount++;
                nodesProcessed.add(node.id);
              }
            }
          } catch (e) {
            console.warn(`Group Switch: Error checking/rebinding text var on ${node.id}:`, e);
          }
        }
      }
    } catch (e) {
      if (!node.removed) console.error(`Group Switch: Error processing text segments on node ${node.id}:`, e);
    }
  };

  // Async helper for effects
  const rebindEffectsAsync = async (node) => {
    if (!node.effects || !Array.isArray(node.effects) || node.effects.length === 0) return;
    let effectsModified = false;
    let newEffects = null;
    const originalEffects = node.effects;

    // We MUST process effect modifications sequentially if we use lazy copy to avoid race conditions.
    // Alternatively, collect all modifications and apply at the end.
    // Let's stick to sequential processing within this helper for now.
    for (let i = 0; i < originalEffects.length; i++) {
      const effect = originalEffects[i];
      if (!effect || effect.visible === false) continue;

      let needsUpdate = false;
      let targetVar = null; // Store the target variable if found

      if ((effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW") && effect.boundVariables && effect.boundVariables.color && effect.boundVariables.color.id) {
        const effectVarId = effect.boundVariables.color.id;
        try {
          const currentVar = await figma.variables.getVariableByIdAsync(effectVarId);
          if (currentVar && currentVar.resolvedType === "COLOR") {
            const currentVarPrefix = utils_getPathPrefix(currentVar.name);
            const currentVarGroup = utils_getGroupPrefix(currentVarPrefix);
            const currentBaseName = utils_getBaseName(currentVar.name);
            if (currentVarGroup === targetGroupPrefix && targetVariableMap.has(currentBaseName)) {
              targetVar = targetVariableMap.get(currentBaseName); // Found target
              needsUpdate = true;
            }
          }
        } catch (e) {
          console.warn(`Group Switch: Error checking effect var on ${node.id}:`, e);
        }
      }

      if (needsUpdate && targetVar) {
        if (!newEffects) newEffects = JSON.parse(JSON.stringify(originalEffects));
        if (i < newEffects.length) {
          const copiedEffect = newEffects[i];
          if (!copiedEffect) {
            console.error(`Group Switch: Effect copy missing at index ${i} for node ${node.id}`);
            continue;
          } // Skip if copy failed

          if (!copiedEffect.boundVariables) copiedEffect.boundVariables = {};
          copiedEffect.boundVariables.color = { type: "VARIABLE_ALIAS", id: targetVar.id }; // Use targetVar.id

          // *** FIX: Remove explicit setting of copiedEffect.color ***
          // Let the binding update the visual color.

          effectsModified = true;
          replacementCount++;
          nodesProcessed.add(node.id);
        } else {
          console.error(`Group Switch: Index out of bounds when modifying effects copy for node ${node.id}`);
        }
      }
    } // End loop effects

    if (effectsModified && newEffects) {
      try {
        if (newEffects.length === originalEffects.length) {
          node.effects = newEffects;
        } else {
          console.error(`Group Switch: Length mismatch assigning effects on node ${node.id}`);
        }
      } catch (e) {
        console.error(`Group Switch: Error assigning effects on node ${node.id}:`, e);
      }
    }
  }; // End rebindEffectsAsync

  // Async Visitor
  const visitNodeForGroupReplace = async (node) => {
    if (!node || node.removed) return;
    try {
      await rebindTextSegmentsAsync(node);
      await rebindEffectsAsync(node);
      await rebindPaintsAsync(node, "fills");
      await rebindPaintsAsync(node, "strokes");
    } catch (e) {
      if (!node.removed) console.error(`Group Switch: Error processing node ${node.id}:`, e);
    }
  };

  await traverseNodeTree(selection, visitNodeForGroupReplace);

  // Final Notification
  if (replacementCount > 0) {
    figma.notify(`✅ Switched ${replacementCount} variable instances to path prefix "${targetPathPrefix}".`);
    figma.ui.postMessage({ type: "replacement-complete-groups", count: replacementCount, targetGroup: targetPathPrefix });
  } else {
    let message = `No variables matching the target structure "${targetPathPrefix}/..." were found or could be switched.`;
    if (nodesProcessed.size > 0) {
      message = `Selection might use variables from the '${targetGroupPrefix}/...' group, but no switchable matches for base names under '${targetSegmentName}' were found.`;
    } else {
      message = `Selection does not seem to contain variables from the '${targetGroupPrefix}/...' group structure needed for switching.`;
    }
    figma.ui.postMessage({ type: "error", message: message });
    figma.notify(`⚠️ ${message}`, { error: true, timeout: 6000 });
  }
  await groups_scanSelection();
} // End groups_applyVariableSwitch
