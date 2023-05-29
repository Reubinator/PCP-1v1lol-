// ==UserScript==
// @name         PCP
// @version      0.1
// @description  An all in one utility mod for 1v1.lol.
// @author       Absurv
// @match        https://1v1.lol/*
// @icon         https://www.google.com/s2/favicons?domain=pornhub.com
// @require      https://pastebin.com/raw/Z8R87mAM
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
// "C" To toggle Blink on and off
// "v" To toggle ESP on and off
// "N" To toggle Wireframe on and off
// "T" To toggle Aimbot on and off

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
    imgElement.style.height = '200px';
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

wasm.instantiate = async function(bufferSource, importObject) {
    const patcher = new WasmPatcher(bufferSource);

    patcher.aobPatchEntry({
        scan: '2A ? ? | 38 ? ? C 2 B 20 0',
        code: [
            OP.drop,
            OP.f32.const, VAR.f32(0)
        ],
        onsuccess: () => Log('Active')
    });

    if(new URLSearchParams( window.location.search ).get('TU9SRUhBQ0tT') === 'true') {

        const pressSpaceKeyIndex = patcher.addGlobalVariableEntry({
            type: 'u32',
            value: 0,
            mutability: true,
            exportName: 'PRESS_SPACE_KEY'
        });

        patcher.aobPatchEntry({
            scan: '4 40 20 B 20 1D 38 2 0 20 F 20 1E [ 38 2 0 ]',
            code: [
                OP.global.get, pressSpaceKeyIndex,
                OP.i32.const, VAR.s32(1),
                OP.i32.eq,
                OP.if,
                    OP.local.get, VAR.u32(15),
                    OP.f32.const, VAR.f32(2.5),
                    OP.f32.store, VAR.u32(2), VAR.u32(0),
                OP.end
            ],
        });

        patcher.aobPatchEntry({
            scan: '4 40 20 6 21 3 B 20 1A 20 21 38 2 0 20 F 20 22 [ 38 2 0 ]',
            code: [
                OP.drop,
                OP.drop,
                OP.global.get, pressSpaceKeyIndex,
                OP.i32.const, VAR.s32(1),
                OP.i32.eq,
                OP.if,
                    OP.local.get, VAR.u32(15),
                    OP.f32.const, VAR.f32(2.5),
                    OP.f32.store, VAR.u32(2), VAR.u32(0),
                OP.end
            ],
        });
    }

    const result = await oldInstantiate(patcher.patch(), importObject);

    if(new URLSearchParams( window.location.search ).get('TU9SRUhBQ0tT') === 'true') {
        const exports = result.instance.exports;

        const pressSpaceKey = exports.PRESS_SPACE_KEY;

        document.addEventListener('keydown', evt => evt.code === 'Space' && (pressSpaceKey.value = 1));
        document.addEventListener('keyup', evt => evt.code === 'Space' && (pressSpaceKey.value = 0));

        localStorage.removeItem('TU9SRUhBQ0tT');
    }

    return result;
};

if(new URLSearchParams( window.location.search ).get('TU9SRUhBQ0tT') === 'true') return;

// Blink Hack

(function() {
    'use strict';

    // Change this key to change the keybind of the Blink Exploit
    let toggleKey = "KeyC";
    // If true an attempt will be made to keep you alive while in blink, doesn't really work anymore but its recommended to keep it on.
    let godInBlink = true;
    // Turn this on if you want to see the blink modules debug information in the console
    let debugMode = false;

    initMod({toggleKey, godInBlink, debugMode});
})();







