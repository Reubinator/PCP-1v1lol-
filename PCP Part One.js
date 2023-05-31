// ==UserScript==
// @name         PCP Part One
// @version      0.1
// @description  An all in one utility mod for 1v1.lol.
// @author       Absurv
// @match        https://1v1.lol/*
// @icon         https://www.google.com/s2/favicons?domain=pornhub.com
// @require      https://pastebin.com/raw/PPBXMS89
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


// Rapid fire hack
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

function initMod({
    toggleKey: e,
    godInBlink: t,
    debugMode: n
}) {
    let o = false,
        i = {},
        l = 0,
        d = [],
        c = WebSocket.prototype.send;
    WebSocket.prototype.send = function() {
        o ? (n && console.log("Holding Packet"), d.push({
            this: this,
            args: arguments
        })) : c.apply(this, arguments);
    };

    let s = Object.getOwnPropertyDescriptors(WebSocket.prototype).onmessage.set;
    Object.defineProperty(WebSocket.prototype, "onmessage", {
        set: function() {
            let e = () => {};
            if (typeof arguments[0] === "function") {
                e = arguments[0];
                arguments[0] = function() {
                    (function() {
                        if (arguments[0].data instanceof ArrayBuffer) {
                            let e = new Uint8Array(arguments[0].data);
                            return o && t && e[0] === 243 && e[1] === 4 && e[2] === 200 && e[3] === 2 && e[4] === 245 && e[5] === 21 && (e.length === 48 || e.length === 25 || e.length === 49 || e.length === 50) ? (n && console.error(`Blocked Packet ${e.length === 48 ? "Damage?" : "Shot? " + e.length}`, e), false) : (n && console.log("Packet", e), true);
                        }
                        return true;
                    }).apply(this, arguments) && e.apply(this, arguments);
                };
            }
            s.apply(this, arguments);
        }
});

document.addEventListener("keydown", t => {
    if (o) {
        let blinkElement = document.getElementById("blink");
        if (t.code === "KeyC") {
            blinkElement.style.color = "#EE4B2B";
        } else {
            blinkElement.style.color = "#AAFF00";
        }
    }
    if (t.code === e) {
        o = !o;
        let blinkAtElement = document.getElementById("blink_at");
        blinkAtElement.innerText = `Blink: ${o ? "ON (C)" : "OFF (C)"}`;
        if (o) {
            let blinkCtElement = document.getElementById("blink_ct");
            blinkCtElement.style.visibility = "";
            blinkCtElement.style.color = "#AAFF00";
            let blinkElement = document.getElementById("blink");
            blinkElement.style.color = "#AAFF00";
            l = 0;
            i = setInterval(function() {
                l++;
                blinkCtElement.innerText = `${l / 10}s`;
            }, 100);
        } else {
            let blinkCtElement = document.getElementById("blink_ct");
            blinkCtElement.style.visibility = "hidden";
            blinkCtElement.style.color = "#EE4B2B";
            clearInterval(i);

            function dumpPackets() {
                n && console.warn("Dumping Packets...");
                for (let e in d) c.apply(d[e].this, d[e].args);
                d = [];
            }
            dumpPackets();
        }
    }
});

    (function() {
        let e = document.createElement("div");
        e.id = "blink";
        e.style.visibility = "";
        e.style.position = "absolute";
        e.style.zIndex = 999999;
        e.style.fontFamily = "Arial";
        e.style.color = "#EE4B2B";
        e.style.fontSize = "20px";
        e.style.fontWeight = "bold";

        let t = document.createElement("p");
        let n = document.createTextNode("Blink OFF (C)");
        t.id = "blink_at";
        t.style.marginTop = "40px";
        t.style.marginRight = "71px";
        t.appendChild(n);

        let o = document.createElement("p");
        let i = document.createTextNode("0 s");
        o.id = "blink_ct";
        o.style.position = "absolute";
        o.style.zIndex = 999999;
        o.style.bottom = "-2px";
        o.style.left = "139px";
        o.style.visibility = "hidden";
        o.style.color = "#AAFF00";
        o.style.fontFamily = "Arial";
        o.appendChild(i);

        e.appendChild(t);
        e.appendChild(o);
        document.body.insertBefore(e, document.body.firstChild);
    })();

}

(function() {
  var pinkElement = document.createElement('div');
  pinkElement.style.visibility = "";
  pinkElement.id = "blackbg";
  pinkElement.style.position = 'absolute';
  pinkElement.style.width = '330px';
  pinkElement.style.left = '5.5%';
  pinkElement.style.height = '492px';
  pinkElement.style.top = '-10px';
  pinkElement.style.transform = 'translate(-50%, -50%)';
  pinkElement.style.background = 'black';
  pinkElement.style.opacity = '50%';
  pinkElement.style.borderRadius = '10px'; // Rounded edges

  document.body.appendChild(pinkElement);
})();

(function() {
  let q = document.createElement("div");
  q.id = "ScriptTitle";
  q.style.visibility = "";
  q.style.position = "absolute";
  q.style.left = "45px";
  q.style.bottom = "1290px";
  q.style.fontStyle = "italic";
  q.style.zIndex = 999999;
  q.style.fontFamily = "Arial Black";
  q.style.fontSize = "x-large";
  q.style.textShadow = "0 0 2px black";
  q.style.textDecoration = "underline";

  // Define an array of colors for the rainbow effect
  var colors = ['orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'pink', 'brown', 'purple', 'white'];

  // Create a CSS animation that cycles through the colors
  var animation = 'rainbow-animation 6s linear infinite';

  // Define the keyframes for the rainbow animation
  var keyframes = '@keyframes rainbow-animation {';
  for (var i = 0; i < colors.length; i++) {
    var offset = (i * 100) / (colors.length - 1);
    keyframes += offset + '% { color: ' + colors[i] + '; }';
  }
  keyframes += '}';

  // Append the keyframes to the document's head
  var styleElement = document.createElement('style');
  styleElement.innerHTML = keyframes;
  document.head.appendChild(styleElement);

  // Apply the animation to the text element
  q.style.animation = animation;

  document.body.insertBefore(q, document.body.firstChild);
})();

            let q = document.getElementById("ScriptTitle")
            q.innerText = "PCP SCRIPT";



(function() {
    function deleteElement() {
        var element = document.getElementsByClassName("ot-floating-button__front")[0];
        if (element) {
            element.parentNode.removeChild(element);
        }
    }

    var delay = 7000;

    setTimeout(deleteElement, delay);
})();

(function() {
    var elements = document.querySelectorAll(".hidemenu, *.toggledhacks, *.esp, *.wireframe, *.aimbot, #blackbg, #ScriptTitle, #blink, #userhelp");
    var isVisible = true;

    function toggleElementsVisibility() {
        elements.forEach(function(element) {
            element.style.visibility = isVisible ? "hidden" : "visible";
        });
        isVisible = !isVisible;
    }

    function checkMenuStatus() {
        var hideMenuElement = document.querySelector(".hidemenu");
        if (hideMenuElement.textContent === "Hide Menu: ON (K)") {
            toggleElementsVisibility();
        }
    }

    checkMenuStatus();

    // Create a MutationObserver to monitor changes in hidemenu's text content
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.textContent === "Hide Menu: ON (K)") {
                toggleElementsVisibility();
            } else if (mutation.target.textContent === "Hide Menu: OFF (K)") {
                toggleElementsVisibility();
            }
        });
    });

    // Start observing changes in hidemenu's text content
    var hideMenuElement = document.querySelector(".hidemenu");
    observer.observe(hideMenuElement, { subtree: true, characterData: true, childList: true });

})();

(function() {
    'use strict';

    // Create a container element for the text
    var container2 = document.createElement('div');
    container2.id = 'userhelp';
    container2.textContent = 'Press K To Show Menu';
    container2.style.visibility = 'shown';
    container2.style.position = 'fixed';
    container2.style.bottom = '10px';
    container2.style.left = '0px';
    container2.style.backgroundColor = 'black';
    container2.style.opacity = '50%';
    container2.style.color = 'white';
    container2.style.fontFamily = 'Arial';
    container2.style.fontSize = '12px';
    container2.style.fontWeight = 'bold';
    container2.style.padding = '8px';
    container2.style.borderRadius = '4px';

    // Define an array of colors for the rainbow effect
    var colors = ['orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'pink', 'brown', 'purple', 'white'];

    // Create a CSS animation that cycles through the colors
    var animation2 = 'rainbow-animation 6s linear infinite';

    // Define the keyframes for the rainbow animation
    var keyframes2 = '@keyframes rainbow-animation {';
    for (var i = 0; i < colors.length; i++) {
        var offset = (i * 100) / (colors.length - 1);
        keyframes2 += offset + '% { color: ' + colors[i] + '; }';
    }
    keyframes2 += '}';

    // Append the keyframes to the document's head
    var styleElement2 = document.createElement('style');
    styleElement2.visiblity = 'shown';
    styleElement2.innerHTML = keyframes2;
    document.head.appendChild(styleElement2);

    // Apply the animation to the text element
    container2.style.animation = animation2;

    // Append the container element to the document body
    document.body.appendChild(container2);

    // Add custom styles
    GM_addStyle(`
        html, body {
            height: 100%;
        }
    `);
})();

