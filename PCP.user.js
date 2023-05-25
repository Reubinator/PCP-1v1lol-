// ==UserScript==
// @name         PCP
// @version      0.1
// @description  An all in one utility mod for 1v1.lol.
// @author       Absurv
// @match        https://1v1.lol/*
// @icon         https://www.google.com/s2/favicons?domain=pornhub.com
// @require      https://pastebin.com/raw/HpZZG2QG
// @require      https://greasyfork.org/scripts/436749-wasm-patcher/code/wasm_patcher.js
// @namespace https://greasyfork.org/users/933239
// ==/UserScript==

// This script contains the following features:
//
// Blink, Blink delays the player movement packet to appear as if you are standing still on the opponents screen but you actually are moving in game.
// You get kicked if you have it on for longer than 15 seconds at a time. Their is a useful clock on your screen (top left) that keeps you up to date
// with how long it has been toggled on for to avoid getting kicked.
//
// ESP, Changes player models to red and allows you to see them through walls. Works poorly in battle royale as it turns many other things red making
// your view of players poor. Works best in 1v1 mode.
//
// Wireframe, Basically shows everything as wires. Only real benefit of wireframe is to see players through walls in battle royale and to see where
// people are. Use wireframe as a subsitute for ESP if you are playing Battle Royale but stick with ESP for 1v1's.
//
// Rapid Fire, rapid fire removes the shooting delay for your Assault Rifle and your Shotgun allowing you to shoot a whole Assault Rifle clip in a
// couple of seconds. This hack also modifys the shotgun delay and the completley removes the reload time for it pretty much allowing you to shoot
// it like an Assault Rife.
//
// READ ME!!!
//
// I couldn't be bothered fixing the compatibility issue between this script and the one containing esp, aimbot and wireframe so i decided to run
// a seperate instance of the script. You must download this second script and run it along side this one in order for the aimbot, wireframe and esp
// to function correctly. A link for it is provided below, this version has absoultley ZERO ads ;)
//
//
//
//
//
// Toggles for the script:
//
// "T" Toggles Blink on and off
// "N" To toggle ESP on and off
// "M" To toggle Wireframe on and off
// "G" To toggle Aimbot on and off

// Notes to self:
// Add a display showing what hacks are active.
// Make Rapid fire toggleable

(function() {
    'use strict';

    setTimeout(function() {
    // Create the div element
    var divElement = document.createElement('div');
    divElement.className = 'cheatlogo';
    divElement.style.display = 'block';

    // Create the image element
    var imgElement = document.createElement('img');
    imgElement.src = 'https://uploads.dailydot.com/083/ae/dancing-kid.gif?auto=compress&amp;fm=gif';
    imgElement.style.position = 'absolute';
    imgElement.style.width = '330px';
    imgElement.style.left = '5.5%';
    imgElement.style.top = '2.3%';
    imgElement.style.transform = 'translate(-50%, -50%)';
    imgElement.style.height = '100px';

    // Append the image element to the div element
    divElement.appendChild(imgElement);

    // Append the div element to the body
    document.body.appendChild(divElement);
    }, 8000); // 8 seconds delay (8000 milliseconds)
})();

(function() {
    'use strict';

    // Create the image element
    var imgElement = document.createElement('img');
    imgElement.src = 'https://upload.wikimedia.org/wikipedia/commons/7/71/Black.png';
    imgElement.style.position = 'absolute';
    imgElement.style.width = '330px';
    imgElement.style.left = '5.5%';
    imgElement.style.height = '230px';
    imgElement.style.top = '11.5%';
    imgElement.style.transform = 'translate(-50%, -50%)';

    // Append the image to the document body or any desired container
    document.body.appendChild(imgElement);
})();



// Rapid Fire Hack


const Log = function(msg) {
  console.log("Rapid Fire Status: " + msg);
};

const wasm = WebAssembly;
const oldInstantiate = wasm.instantiate;
let scriptEnabled = false; // Track if the script is enabled or not

function handleKeyPress(event) {
  if (event.code === "KeyU") {
    scriptEnabled = !scriptEnabled; // Toggle the script enable/disable state
    Log("Script " + (scriptEnabled ? "enabled" : "disabled"));
  }
}

document.addEventListener("keydown", handleKeyPress);

wasm.instantiate = async function(bufferSource, importObject) {
  if (!scriptEnabled) {
    // If the script is disabled, bypass the patching and return the original result
    return oldInstantiate(bufferSource, importObject);
  }

  // Rest of your code for patching and executing the script
  // ...

  const result = await oldInstantiate(patcher.patch(), importObject);

  // Rest of your code for handling the patched script
  // ...

  return result;
};

if (new URLSearchParams(window.location.search).get("TU9SRUhBQ0tT") === "true") {
  return;
}

// Blink Hack

(function() {
    'use strict';

    // Change this key to change the keybind of the Blink Exploit
    let toggleKey = "KeyK";
    // If true an attempt will be made to keep you alive while in blink, doesn't really work anymore but its recommended to keep it on.
    let godInBlink = true;
    // Turn this on if you want to see the blink modules debug information
    let debugMode = false;

    initMod({toggleKey, godInBlink, debugMode});
})();







