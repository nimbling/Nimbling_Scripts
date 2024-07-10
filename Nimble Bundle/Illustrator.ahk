#SingleInstance force
; Set the path to the Adobe Illustrator executable
IllustratorPath := "C:\Program Files\Adobe\Adobe Illustrator 2024\Support Files\Contents\Windows\Illustrator.exe"

SplashTextOn, 300, 100,, Illustrator Scripts Loaded
sleep 2000
SplashTextOff

; Function to run a specified JSX script in Illustrator
RunJSX(scriptName, message := "", timeout := 0) {
    global IllustratorPath
    scriptPath := A_ScriptDir . "\" . scriptName
    if (message != "") {
        SplashTextOn, 300, 100,, %message%
        sleep %timeout%
        SplashTextOff
    }
    Run, %IllustratorPath% "%scriptPath%"
}



; Only listen for hotkeys when Illustrator is the active window
#IfWinActive ahk_class illustrator  ; Replace "illustrator" with the actual class name from Window Spy

; Define your shortcuts, messages, timeouts, and the corresponding JSX script names
; Example: Ctrl+Shift+H to run FlipH.jsx
notifyduration = 600

^+H::   RunJSX("FlipH.jsx", "Flip Horizontal", notifyduration) return
^+V::   RunJSX("FlipV.jsx", "Flip Vertical", notifyduration) return
!w::   RunJSX("Align Top.jsx", "Align ⬆︎", notifyduration) return
!d::   RunJSX("Align Right.jsx", "Align ➡︎", notifyduration) return
!s::   RunJSX("Align Bottom.jsx", "Align ⬇︎", notifyduration) return
!a::   RunJSX("Align Left.jsx", "Align ⬅︎", notifyduration) return
!h::   RunJSX("Align Hor.jsx", "Align ⬌", notifyduration) return
!v::   RunJSX("Align Vert.jsx", "Align ⬍", notifyduration) return
!c::   RunJSX("Align Center.jsx", "Align ●", notifyduration) return
!+w::   RunJSX("Align Top Force AB.jsx", "Align ⬆︎ Force ◻︎", notifyduration) return
!+d::   RunJSX("Align Right Force AB.jsx", "Align ➡︎ Force ◻︎", notifyduration) return
!+s::   RunJSX("Align Bottom Force AB.jsx", "Align ⬇︎ Force ◻︎", notifyduration) return
!+a::   RunJSX("Align Left Force AB.jsx", "Align ⬅︎ Force ◻︎", notifyduration) return
!+h::   RunJSX("Align Hor Force AB.jsx", "Align ⬌ Force ◻︎", notifyduration) return
!+v::   RunJSX("Align Vert Force AB.jsx", "Align ⬍ Force ◻︎", notifyduration) return
!+c::   RunJSX("Align Center Force AB.jsx", "Align ● Force ◻︎", notifyduration) return
^7::   RunJSX("Clipper.jsx", "Clip to Top object", notifyduration) return
!^+7::   RunJSX("Bottomclipper.jsx", "Clip to Bottom Object", notifyduration) return
!^+]::   RunJSX("Bring in Front of.jsx", "Bring in Front of", notifyduration) return
!^+[::   RunJSX("Send Behind.jsx", "Send Behind", notifyduration) return
!/::   RunJSX("Clear Fill.jsx", "/ Clear Fill", notifyduration) return
^/::   RunJSX("Clear Stroke.jsx", "/ Clear Stroke", notifyduration) return
!]::   RunJSX("Stroke Up.jsx", " ◀︎ | ▶︎", 300) return
![::   RunJSX("Stroke Down.jsx", " ▶︎ | ◀︎", 300) return
!+]::   RunJSX("Stroke Up 10px.jsx", " ◀︎ ● ▶︎", 300) return
!+[::   RunJSX("Stroke Down 10px.jsx", " ▶︎ ● ◀︎", 300) return
!^]::   RunJSX("Stroke Up dot1.jsx", " ◀︎ • ▶︎", 300) return
!^[::   RunJSX("Stroke Down dot1.jsx", " ▶︎ • ◀︎", 300) return
^+r::   RunJSX("Stroke Rounded Caps.jsx", "Stroke Toggle", 2000) return
!^+r::   RunJSX("Reverse Path Direction.jsx", "Reverse Path Direction", 1500) return
^+o::   RunJSX("Outline Stroke and Text.jsx", "Outline Stroke and Text", 1000) return
!^r::   RunJSX("Rename Artboard.jsx", "", notifyduration) return
^f::   RunJSX("Scale Object To Artboard.jsx", "Scale Object To Artboard", notifyduration) return
; !^+]::   RunJSX("Select Next Artboard.jsx", "Select Next Artboard", 0) return
; !^+[::   RunJSX("Select Previous Artboard.jsx", "Select Previous Artboard", 0) return
; ::   RunJSX("Select Next Artboard and Rename.jsx", "Select Next Artboard and Rename", 0) return
!^+s::   RunJSX("Swap Object Colors.jsx", "Swap Object Colors", notifyduration) return
^h::   RunJSX("ToggleCruft.jsx", "Toggle Edges and Bounding Box", notifyduration) return
; ::   RunJSX("ToggleStrokeNFX.jsx", "", 0) return
!^+h::   RunJSX("Hard Export.jsx", "Hard Export", notifyduration) return
!^+w::   RunJSX("Hard Close.jsx", "Hard Close", 1.5) return
!o::   RunJSX("Opacity Set.jsx", "", notifyduration) return
; ::   RunJSX("ImportPNGtoArtboardGrid.jsx", "Import Files to Grid", 0) return
; ::   RunJSX("Zoom And Center Selection Animated.jsx", "", notifyduration) return
; ::   RunJSX("Smart Corner Delete Anchors.jsx", "", 0) return
; ::   RunJSX("Smart Heal.jsx", "", 0) return
; ::   RunJSX("Join Paths.jsx", "", 0) return
; ::   RunJSX("Points Test.jsx", "", 0) return
; ::   RunJSX("Unclip.jsx", "", 0) return
; ::   RunJSX("TrimMasks.jsx", "Trim Masks", notifyduration) return
; ::   RunJSX("Rotate Bounding Box.jsx", "Rotate Bounding Box", 0.5) return
!^+e::   RunJSX("Export Now.jsx", "Exporting Current Artboard", notifyduration) return
^!.::   RunJSX("Hue Up.jsx", "", 0) return
^!,::   RunJSX("Hue Down.jsx", "", 0) return






#IfWinActive  ; Turn off context sensitivity