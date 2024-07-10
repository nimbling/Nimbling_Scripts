# Nimbling\_Scripts

Scripts to enhance Illustrator.  
Most I wrote myself, some are others' work, attribution is in the scripts themselves.  

## Illustrator Panels

Three panels for use in Illustrator, packaging some of the scripts found below.  
Use https://aescripts.com/learn/zxp-installer/ to install them.  
ZXP's up top:  
• Nimbling Clippers  
• ISO45  
• SSR30  

# Nimble Bundle

A compilation of 40+ Illustrator [scripts](https://github.com/nimbling/Nimbling_Scripts/tree/master/Nimble%20Bundle).  
### **A 5 step guide on how to use on OSX:**
1. install [hammerspoon](https://www.hammerspoon.org/) (or use the **[direct link](https://github.com/Hammerspoon/hammerspoon/releases/latest)** to the latest release)
2. download and unzip **[Nimble Bundle.zip](https://github.com/nimbling/Nimbling_Scripts/blob/master/Nimble%20Bundle.zip)** somewhere practical on your drive, take note of the path
3. Hammerspoon shows a menu bar icon. Click it to find the **"open config"** this will open your init.lua
4. paste the following four lines there (the rest of it can be empty)

Alternatively, use this utility to launch them: [mac](https://tama-san.com/spai/) / [windows](http://sysys.zouri.jp/sppy/).
```
Illustratorscriptsfolder = "/Users/exampleuser/examplefolder/nimblescripts/"  
package.path=Illustratorscriptsfolder.."?.lua"..";"..package.path  
hs.application.enableSpotlightForNameSearches(true)  
require("illustrator")
```
* modify the **the Illustratorscriptsfolder =** bit to say where you unzipped the zip,
* do not "escape" spaces or special characters but keep the quotes before and after
* include the slash on the end
5. restart hammerspoon. You should see a message saying *illustrator helper scripts loaded*.  

They're opinionated as hell and I'm sure some of my shortcuts will conflict with yours or Adobe's. Well.. they can pry "cmd+shift+h" to flip horizontal from my cold, dead hands.  
Pro Tip: Add any other .jsx made to work with Illustrator to that folder, and modify the **illustrator.lua** file to point at that file. Add your own shortcut, and presto!

-----
### Most of the following scripts are bundled in the Nimble Bundle


## Alignment Scripts

![](<images/AlignSmash.gif>)

https://github.com/nimbling/Nimbling_Scripts/tree/master/Alignment%20Scripts

These alignment scripts can help you... align objects on your
Illustrator canvas to one another and to the artboard they're on.
With a single selected object, it will align to the artboard.
Bind these to keys that make sense to you.
I have them bound to Alt + WASD for aligning to objects,
and to Shift + Alt + WASD for aligning to artboard.
Alt + H and V are for Horizontal and Vertical align
Shift + Alt + H and V are for Horizontal and Vertical align to artboard.
Alt + C is for centering on both axes, with shift, again, forcing it to the artboard.

Enjoy :)

## Clip scripts

![](<images/Clipper.png>)

![](<images/Bottomclipper.png>)

HOW TO USE:
1.  Select two or more objects.
2.  **CMD + 7** "Clipper.jsx". AND **CMD + ALT + CTRL + 7** "Bottomclipper.jsx".

These clip scripts attempt to copy the initial objects appearance and paste it
to the resulting clipping mask. Due to illustrator limitations this only works
for single stroke, single fill appearances. Ideal for cell shading objects.
Allowing for a super smooth workflow when used with Astute Graphics' Dynamic
Sketch; Simply draw an object, draw the shadow / highlight bits, select both and
execute the "Bottomclipper".

![](<images/VectorLips.gif>)

## Outline Stroke and Text

Outlines **both** strokes and text in your selection, even when they're in a group.
It then does a "best effort" attempt to reselect what you had selected.

## Send behind… & Bring in Front of…

![](<images/Bring-in-Front-of.png>)

![](<images/Send-Behind.png>)

1.  Select two or more objects.

2.  **CMD + CTRL + SHIFT + \[**

Put the selected objects in front of the topmost- or behind the bottom object of
the selection. Useful when you use large amounts of objects and you just keep
pressing "backward" or "forward" without revealing or eclipsing your other,
chosen object. *Fun fact: these even work when either object is inside- or
outside of a clipping group, allowing you to add or remove an object from a
clipping group super quick*

## Clear fill, clear stroke scripts.

Using these, you can directly clear a fill or a stroke using single shortcuts.
I have them set up to option+/ and cmd+/ - which maps just like photoshop!
If it's not working, use direct- or group selection tools to select your object.

## Stroke width and round Cap scripts

Increase, decrease stroke width

![](<images/Stroke%20Up.png>)

**ALT \]**


![](<images/Stroke%20Down.png>)

**ALT \[**

Round this stroke cap (with bonus corner rounding)

![](<images/RoundCap.png>)

**CTRL SHIFT R**

## Rename Artboard

this pops up a little dialog with the layer name preselected.

![](<images/Rename%20Artboard.png>)

I have it bound to **CMD OPTION R**
I export PNG's so I use this **ALL DAY LONG**

## Center and Zoom view to Selection (Animated)

Centers your viewport on your selection while zooming to it.
One version switches to outlines while moving your view, the other does not.

![](<images/zoomie.gif>)

## Center to artboard

Centers your selection to the artboard you're on. I use this all day as a fast starting point to further align from.
It's only weakness is that it fails on clipping paths, as it takes the bounds of all paths in it.
I have it bound to **CTRL OPTION CMD C**

![](<images/Center%20to%20Artboard.png>)

## Resize Artboard Scripts

* [Resize Artboard + Artwork.jsx](<JSX Scripts/Resize Artboard + Artwork.jsx>)
    * Resize the current artboard, along with it's contents.

* [Resize all Artboards + Artwork.jsx](<JSX Scripts/Resize all Artboards + Artwork.jsx>)
    * Resize all artboards in this file, along with their contents.

* [Resize all Artboards in all Files in Folder.jsx](<JSX Scripts/Resize all Artboards in all Files in Folder.jsx>)
    * Prompts for a folder, and resizes all artboards in all files found in it, along with their contents.

## Rename / Lock Layer

Is moving your mouse all the way to your layer palette wearing you down? Did you wish you could lock the current layer using a shortcut? These scripts got your back.

![](<images/Rename%20Layer.png>)
![](<images/Layer%20Lock.png>)

## Reverse path

Is your compound path misbehaving? Did you apply a nice stroke width that's the wrong way? Do you have a multi-layered appearance stack that just doesn't look right?
Reverse path to the rescue :)
I have it bound to **CTRL SHIFT CMD R**

![](<images/Reverse%20Path.png>)


## Outliner


![](<images/Outliner.png>)

1.  Select one or more objects.

2.  **CMD + SHIFT + O** "Outline Stroke and Text.jsx"

Outline both text and stroke, using the shortcut previously reserved only for
text.

## Swap object colors


1.  Select exactly two objects.

2.  **CMD + ALT + CTRL + S** "Swap Object Colors.jsx"

This script swaps the colors (stroke and-or fill) of exactly TWO selected
objects.

## Flip Horizontal & Vertical


1.  Select a single object.

2.  **CMD + SHIFT + H** & **CMD + SHIFT + V**

Flip Horizontal and Vertical.

## SVG image bevel filters, for use inside of illustrator.


1.  Select an object or group of objects.
2.  Got to "Effect > SVG Filters > Apply SVG filter...
3.  In the dialog you're presented with, press the "new SVG filter" icon (looks like new document)
4.  Paste "ImageBevel10Redshift.txt" or "ImageBevel20Redshift.txt" over everything there.

![](<images/fruitbevels.png>)

~   Slices of fruit made using these SVG filters

## Axonometry actions


![](<images/iso45v.png>)

![](<images/iso45.png>)

![](<images/ssr30.png>)

![](<images/fl2030.png>)

![](<images/fl3020.png>)

1.  Select a single object, run action.

2.  The Axonometry folder contains five illustrator actions sets that emulate
    different axonometries, of which the “SSR 30º” & “ISO 45º + Vertical scale”
    are likely what you want. The “Flatland -20º & 30º” set is the one I used to
    create the cabinet at http://nimbling.com/graphic.html

![](<images/Bookshelf.gif>)

![](<http://nimbling.com/images/pr/gd-06-large.jpg>)

![](<http://nimbling.com/images/pr/gd-07-large.jpg>)


## Window Tiler Script (or .App)


1.  Launch using your launcher of choice (Better touch tool, Alfred,
    Quicksilver, Launchbar, etc.) to tile up to 12 of your finder windows.

## Json Extractor
Development tool:
Combines all same name keys and groups their values.
Show the combined keys in a list, and when clicking on these: show the values in a plain text list for copy-pasting into other design tools like figma or a google sheet.

![](<JsonExtractor.png>)

## Run an Illustrator script using Alfred, on a single shortcut, with auto complete

Install "Illustrator Scripts.alfredworkflow" by double clicking it, modify the folder it looks for your scripts for in this window: ![](<images/Modify%20your%20folder.png>). I have assigned **CTRL OPTION CMD SPACE** to it (just mash the bottom row including space) and start typing what your scripts need to do.
