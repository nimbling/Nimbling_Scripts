hs.alert.show("Illustrator helper\nscripts loaded", 3.5)

-- What is Illustrator called on your system?
illuinstall = "Adobe Illustrator 2020"
scriptsfolder = Illustratorscriptsfolder
-- Modify the duration of the notification
local notifyduration = 0.6

local function florp()
  print("aaargh")
end

hs.urlevent.bind("derp", florp)
  



-- The main function running all the scripts passed
local function runScript(thescript, notification, notifyduration)
    if notification ~= "" then
        hs.alert.show(notification, notifyduration)
    end
    local thecommand = "open -a " .. "\"Adobe Illustrator\" " .. "\"" .. scriptsfolder .. thescript .. "\""
    -- print(thecommand) -- for debugging
    os.execute(thecommand, false)   
end

-- function to reset the bounding box
local illuapp = hs.appfinder.appFromName(illuinstall)
local function resettransform()
    hs.eventtap.keyStrokes("e")
    illuapp:selectMenuItem("Reset Bounding Box")
    hs.eventtap.keyStrokes("v")
    hs.alert.show("Transform reset", 1.5)
end

-- function to toggle scaling strokes and effects
local function togglescalestrokes()
  local currentscalestate = hs.execute("defaults read com.illhelpers.togsf scalestate", true)
  print(currentscalestate)
  if currentscalestate == "donotscale\n" then
    hs.osascript.applescript("tell application \"" .. illuinstall .. "\"\n do script \"ScaleStrokeFX\" from \"Helpers\" without dialogs\nend tell")
    hs.execute("defaults write com.illhelpers.togsf scalestate doscale", true)
  else
    hs.osascript.applescript("tell application \"" .. illuinstall .. "\"\n do script \"DoNotScaleStrokeFX\" from \"Helpers\" without dialogs\nend tell")
    hs.execute("defaults write com.illhelpers.togsf scalestate donotscale", true)
  end
end

local function togglecolorfocus()
  local currentcolorfocus = hs.execute("defaults read com.illhelpers.togsf colorfocus", true)
    if currentcolorfocus == "fill\n" then
    hs.alert.defaultStyle.textSize =  80
    hs.alert.show(" ☐", 0.4)
    hs.osascript.applescript("tell application \"" .. illuinstall .. "\"\n do script \"FocusOnStroke\" from \"Helpers\" without dialogs\nend tell")
    hs.execute("defaults write com.illhelpers.togsf colorfocus stroke", true)
    hs.alert.defaultStyle.textSize =  27
  else
    hs.alert.defaultStyle.textSize =  80
    hs.alert.show(" ◼︎", 0.4)
    hs.osascript.applescript("tell application \"" .. illuinstall .. "\"\n do script \"FocusOnFill\" from \"Helpers\" without dialogs\nend tell")
    hs.execute("defaults write com.illhelpers.togsf colorfocus fill", true)
    hs.alert.defaultStyle.textSize =  27
  end
end

hotkeys = hs.hotkey.modal.new()

-- hotkeys:bind("shift", "z",           function() togglecolorfocus() end)

-- Flip horizontal and Vertical, like a human
hotkeys:bind({"cmd", "shift"}, "h",         function() runScript("FlipH.jsx", "Flip Horizontal", notifyduration) end)
hotkeys:bind({"cmd", "shift"}, "v",         function() runScript("FlipV.jsx", "Flip Vertical", notifyduration) end)
-- Alignment        
hotkeys:bind("alt", "w",                    function() runScript("Align Top.jsx", "Align ⬆︎", notifyduration) end)
hotkeys:bind("alt", "d",                    function() runScript("Align Right.jsx", "Align ➡︎", notifyduration) end)
hotkeys:bind("alt", "s",                    function() runScript("Align Bottom.jsx", "Align ⬇︎", notifyduration) end)
hotkeys:bind("alt", "a",                    function() runScript("Align Left.jsx", "Align ⬅︎", notifyduration) end)
hotkeys:bind("alt", "h",                    function() runScript("Align Hor.jsx", "Align ⬌", notifyduration) end)
hotkeys:bind("alt", "v",                    function() runScript("Align Vert.jsx", "Align ⬍", notifyduration) end)
hotkeys:bind("alt", "c",                    function() runScript("Align Center.jsx", "Align ●", notifyduration) end)
hotkeys:bind({"alt", "shift"}, "w",         function() runScript("Align Top Force AB.jsx", "Align ⬆︎ Force ◻︎", notifyduration) end)
hotkeys:bind({"alt", "shift"}, "d",         function() runScript("Align Right Force AB.jsx", "Align ➡︎ Force ◻︎", notifyduration) end)
hotkeys:bind({"alt", "shift"}, "s",         function() runScript("Align Bottom Force AB.jsx", "Align ⬇︎ Force ◻︎", notifyduration) end)
hotkeys:bind({"alt", "shift"}, "a",         function() runScript("Align Left Force AB.jsx", "Align ⬅︎ Force ◻︎", notifyduration) end)
hotkeys:bind({"alt", "shift"}, "h",         function() runScript("Align Hor Force AB.jsx", "Align ⬌ Force ◻︎", notifyduration) end)
hotkeys:bind({"alt", "shift"}, "v",         function() runScript("Align Vert Force AB.jsx", "Align ⬍ Force ◻︎", notifyduration) end)
hotkeys:bind({"alt", "shift"}, "c",         function() runScript("Align Center Force AB.jsx", "Align ● Force ◻︎", notifyduration) end)
-- Clipping while retaining appearance
hotkeys:bind("cmd", "7",                    function() runScript("Clipper.jsx", "Clip to Top object", notifyduration) end)
hotkeys:bind({"cmd", "ctrl", "alt"}, "7",   function() runScript("Bottomclipper.jsx", "Clip to Bottom Object", notifyduration) end)
-- Z Ordering
hotkeys:bind({"cmd", "shift", "ctrl"}, "]", function() runScript("Bring in Front of.jsx", "Bring in Front of", notifyduration) end)
hotkeys:bind({"cmd", "shift", "ctrl"}, "[", function() runScript("Send Behind.jsx", "Send Behind", notifyduration) end)
-- Clear Fill or Stroke?
hotkeys:bind("alt", "/",                    function() runScript("Clear Fill.jsx", "/ Clear Fill", notifyduration) end)
hotkeys:bind("cmd", "/",                    function() runScript("Clear Stroke.jsx", "/ Clear Stroke", notifyduration) end)
-- Stroke width, stroke rounding
hotkeys:bind("alt", "]",                    function() runScript("Stroke Up.jsx", " ◀︎ | ▶︎", 0.3) end)
hotkeys:bind("alt", "[",                    function() runScript("Stroke Down.jsx", " ▶︎ | ◀︎", 0.3) end)
hotkeys:bind({"alt", "shift"}, "]",         function() runScript("Stroke Up 10px.jsx", " ◀︎ ● ▶︎", 0.3) end)
hotkeys:bind({"alt", "shift"}, "[",         function() runScript("Stroke Down 10px.jsx", " ▶︎ ● ◀︎", 0.3) end)
hotkeys:bind({"alt", "ctrl"}, "]",          function() runScript("Stroke Up dot1.jsx", " ◀︎ • ▶︎", 0.3) end)
hotkeys:bind({"alt", "ctrl"}, "[",          function() runScript("Stroke Down dot1.jsx", " ▶︎ • ◀︎", 0.3) end)
hotkeys:bind({"cmd", "shift", "ctrl"}, "r", function() runScript("Stroke Rounded Caps.jsx", "Stroke Toggle", 2) end)
-- Reverse path direction (useful when compund paths are misbehaving)
hotkeys:bind({"cmd", "alt", "ctrl"}, "r",   function() runScript("Reverse Path Direction.jsx", "Reverse Path Direction", 1.5) end)
hotkeys:bind({"cmd", "shift"}, "o",         function() runScript("Outline Stroke and Text.jsx", "Outline Stroke and Text", 1) end)
-- Artboards, rename, select
hotkeys:bind({"cmd", "alt"}, "r",           function() runScript("Rename Artboard.jsx", "", notifyduration) end)
hotkeys:bind("ctrl", "f",                   function() runScript("Scale Object To Artboard.jsx", "Scale Object To Artboard", notifyduration) end)
hotkeys:bind({"cmd", "alt", "ctrl"}, "]",   function() runScript("Select Next Artboard.jsx", "Select Next Artboard", 0) end)
hotkeys:bind({"cmd", "alt", "ctrl"}, "[",   function() runScript("Select Previous Artboard.jsx", "Select Previous Artboard", 0) end)
hotkeys:bind({"cmd", "shift", "alt", "ctrl"}, "]", function() runScript("Select Next Artboard and Rename.jsx", "Select Next Artboard and Rename", 0) end)
-- Misc :)
hotkeys:bind({"cmd", "alt", "ctrl"}, "s",   function() runScript("Swap Object Colors.jsx", "Swap Object Colors", notifyduration) end)
hotkeys:bind("cmd", "h",                    function() runScript("ToggleCruft.jsx", "Toggle Edges and Bounding Box", notifyduration) end)
hotkeys:bind({"cmd", "alt"}, "t",           function() resettransform() end)
hotkeys:bind({"cmd", "alt", "ctrl", "shift"}, "s", function() togglescalestrokes() end)
hotkeys:bind({"ctrl", "alt", "cmd"}, "h", function() runScript("Hard Export.jsx", "Hard Export", notifyduration) end)
hotkeys:bind({"ctrl", "alt", "cmd"}, "w", function() runScript("Hard Close.jsx", "Hard Close", 1.5) end)
hotkeys:bind("alt", "o",                    function() runScript("Opacity Set.jsx", "", notifyduration) end)
hotkeys:bind({"cmd", "shift", "alt", "ctrl"}, "i", function() runScript("ImportPNGtoArtboardGrid.jsx", "Import Files to Grid", 0) end)
hotkeys:bind("ctrl", "z",                   function() runScript("Zoom And Center Selection Animated.jsx", "", notifyduration) end)
-- Define a callback function to be called when application events happen
function applicationWatcherCallback(appName, eventType, appObject)
  if (appName == "Adobe Illustrator 2020") then
    if (eventType == hs.application.watcher.activated) then
      hotkeys:enter()
    elseif (eventType == hs.application.watcher.deactivated) then
      hotkeys:exit()
    end
  end
end

-- Create and start the application event watcher
watcher = hs.application.watcher.new(applicationWatcherCallback)
watcher:start()

-- Activate the modal state
hotkeys:exit()