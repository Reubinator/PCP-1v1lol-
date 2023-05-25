// ==UserScript==
// @name         PCP Requirment
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Aimbot, Wireframe and ESP addition to PCP
// @author       Zertalious, Edited by Absurv
// @match        *://1v1.lol/*
// @license      MIT
// @icon         https://www.google.com/s2/favicons?domain=pornhub.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

let espEnabled = false;
let aimbotEnabled = false;
let wireframeEnabled = false;

const searchSize = 300;
const threshold = 4.5;
const aimbotSpeed = 0.15;

const WebGL = WebGL2RenderingContext.prototype;

HTMLCanvasElement.prototype.getContext = new Proxy( HTMLCanvasElement.prototype.getContext, {
	apply( target, thisArgs, args ) {

		if ( args[ 1 ] ) {

			args[ 1 ].preserveDrawingBuffer = true;

		}

		return Reflect.apply( ...arguments );

	}
} );

WebGL.shaderSource = new Proxy( WebGL.shaderSource, {
	apply( target, thisArgs, args ) {

		if ( args[ 1 ].indexOf( 'gl_Position' ) > - 1 ) {

			args[ 1 ] = args[ 1 ].replace( 'void main', `

				out float vDepth;
				uniform bool enabled;
				uniform float threshold;

				void main

			` ).replace( /return;/, `

				vDepth = gl_Position.z;

				if ( enabled && vDepth > threshold ) {

					gl_Position.z = 1.0;

				}

			` );

		} else if ( args[ 1 ].indexOf( 'SV_Target0' ) > - 1 ) {

			args[ 1 ] = args[ 1 ].replace( 'void main', `

				in float vDepth;
				uniform bool enabled;
				uniform float threshold;

				void main

			` ).replace( /return;/, `

				if ( enabled && vDepth > threshold ) {

					SV_Target0 = vec4( 1.0, 0.0, 0.0, 1.0 );

				}

			` );

		}

		return Reflect.apply( ...arguments );

	}
} );

WebGL.getUniformLocation = new Proxy( WebGL.getUniformLocation, {
	apply( target, thisArgs, [ program, name ] ) {

		const result = Reflect.apply( ...arguments );

		if ( result ) {

			result.name = name;
			result.program = program;

		}

		return result;

	}
} );

WebGL.uniform4fv = new Proxy( WebGL.uniform4fv, {
	apply( target, thisArgs, args ) {

		if ( args[ 0 ].name === 'hlslcc_mtx4x4unity_ObjectToWorld' ) {

			args[ 0 ].program.isUIProgram = true;

		}

		return Reflect.apply( ...arguments );

	}
} );

let movementX = 0, movementY = 0;
let count = 0;

WebGL.drawElements = new Proxy( WebGL.drawElements, {
	apply( target, thisArgs, args ) {

		const program = thisArgs.getParameter( thisArgs.CURRENT_PROGRAM );

		if ( ! program.uniforms ) {

			program.uniforms = {
				enabled: thisArgs.getUniformLocation( program, 'enabled' ),
				threshold: thisArgs.getUniformLocation( program, 'threshold' )
			};

		}

		const couldBePlayer = args[ 1 ] > 4000;

		thisArgs.uniform1i( program.uniforms.enabled, ( espEnabled || aimbotEnabled ) && couldBePlayer );
		thisArgs.uniform1f( program.uniforms.threshold, threshold );

		args[ 0 ] = wireframeEnabled && ! program.isUIProgram && args[ 1 ] > 6 ? thisArgs.LINES : args[ 0 ];

		Reflect.apply( ...arguments );

		if ( aimbotEnabled && couldBePlayer ) {

			const width = Math.min( searchSize, thisArgs.canvas.width );
			const height = Math.min( searchSize, thisArgs.canvas.height );

			const pixels = new Uint8Array( width * height * 4 );

			const centerX = thisArgs.canvas.width / 2;
			const centerY = thisArgs.canvas.height / 2;

			const x = Math.floor( centerX - width / 2 );
			const y = Math.floor( centerY - height / 2 );

			thisArgs.readPixels( x, y, width, height, thisArgs.RGBA, thisArgs.UNSIGNED_BYTE, pixels );

			for ( let i = 0; i < pixels.length; i += 4 ) {

				if ( pixels[ i ] === 255 && pixels[ i + 1 ] === 0 && pixels[ i + 2 ] === 0 && pixels[ i + 3 ] === 255 ) {

					const idx = i / 4;

					const dx = idx % width;
					const dy = ( idx - dx ) / width;

					movementX += ( x + dx - centerX );
					movementY += - ( y + dy - centerY );

					count ++;

				}

			}

		}

	}
} );

window.requestAnimationFrame = new Proxy( window.requestAnimationFrame, {
	apply( target, thisArgs, args ) {

		args[ 0 ] = new Proxy( args[ 0 ], {
			apply() {

				const isPlaying = document.querySelector( 'canvas' ).style.cursor === 'none';

				rangeEl.style.display = isPlaying && aimbotEnabled ? '' : 'none';

				if ( count > 0 && isPlaying ) {

					const f = aimbotSpeed / count;

					movementX *= f;
					movementY *= f;

					window.dispatchEvent( new MouseEvent( 'mousemove', { movementX, movementY } ) );

					rangeEl.classList.add( 'range-active' );

				} else {

					rangeEl.classList.remove( 'range-active' );

				}

				movementX = 0;
				movementY = 0;
				count = 0;

				return Reflect.apply( ...arguments );

			}
		} );

		return Reflect.apply( ...arguments );

	}
} )

const el = document.createElement( 'div' );

el.innerHTML = `<style>

.dialog {
	position: absolute;
	left: 50%;
	top: 50%;
	padding: 20px;
	background: #1e294a;
	color: #fff;
	transform: translate(-50%, -50%);
	text-align: center;
	z-index: 999999;
	font-family: cursive;
}

.dialog * {
	color: #fff;
}

.close {
	position: absolute;
	right: 5px;
	top: 5px;
	width: 20px;
	height: 20px;
	opacity: 0.5;
	cursor: pointer;
}

.close:before, .close:after {
	content: ' ';
	position: absolute;
	left: 50%;
	top: 50%;
	width: 100%;
	height: 20%;
	transform: translate(-50%, -50%) rotate(-45deg);
	background: #fff;
}

.close:after {
	transform: translate(-50%, -50%) rotate(45deg);
}

.close:hover {
	opacity: 1;
}

.btn {
	cursor: pointer;
	padding: 0.5em;
	background: red;
	border: 3px solid rgba(0, 0, 0, 0.2);
}

.btn:active {
	transform: scale(0.8);
}

.msg {
	position: absolute;
	left: 55px;
	bottom: 1151px;
	color: #fff;
    font-family: Montserrat;
    font-weight: bold;
	padding: 15px;
	animation: msg 0.5s forwards, msg 0.5s reverse forwards 3s;
	z-index: 999999;
	pointer-events: none;
}

.msg2 {
	position: absolute;
	left: 27px;
	bottom: 1199px;
	color: #fff;
    font-family: Montserrat;
    font-weight: bold;
	padding: 15px;
	animation: msg 0.5s forwards, msg 0.5s reverse forwards 3s;
	z-index: 999999;
	pointer-events: none;
}

.msg3 {
	position: absolute;
	left: 43px;
	bottom: 1175px;
	color: #fff;
    font-family: Montserrat;
    font-weight: bold;
	padding: 15px;
	animation: msg 0.5s forwards, msg 0.5s reverse forwards 3s;
	z-index: 999999;
	pointer-events: none;
}
.range {
	position: absolute;
	left: 50%;
	top: 50%;
	width: ${searchSize}px;
	height: ${searchSize}px;
	max-width: 100%;
	max-height: 100%;
	border: 1px solid blue;
    border-radius: 50%;
	transform: translate(-50%, -50%);
}

.range-active {
	border: 2px solid red;
}

</style>
<div class="0">
</div>
<div class="msg" style="display: none;"></div>
<div class="msg2" style="display: none;"></div>
<div class="msg3" style="display: none;"></div>
<div class="range" style="display: none;"></div>`;


const msgEl = el.querySelector( '.msg' );
const msgEl2 = el.querySelector( '.msg2' );
const msgEl3 = el.querySelector( '.msg3' );
const dialogEl = el.querySelector( '.dialog' );

const rangeEl = el.querySelector( '.range' );

window.addEventListener( 'DOMContentLoaded', function () {

	while ( el.children.length > 0 ) {

		document.body.appendChild( el.children[ 0 ] );

	}

} );

window.addEventListener( 'keyup', function ( event ) {

	switch ( String.fromCharCode( event.keyCode ) ) {

		case 'M' :

			espEnabled = ! espEnabled;
            showMsg( 'ESP', espEnabled );

            break;

		case 'V' :

			wireframeEnabled = ! wireframeEnabled;
            showMsg2( 'Wireframe', wireframeEnabled );

			break;

		case 'T' :

			aimbotEnabled = ! aimbotEnabled;
            showMsg3( 'Aimbot', aimbotEnabled );

			break;

	}

} );

function showMsg( name, bool ) {

	msgEl.innerText = name + ': ' + ( bool ? 'ON (M)' : 'OFF (M)' );

    if (bool) {
        msgEl.style.color = '#AAFF00';
    } else {
        msgEl.style.color = '#FF0000';
    }

	msgEl.style.display = 'none';

	void msgEl.offsetWidth;

	msgEl.style.display = '';

}

function showMsg2( name, bool ) {

	msgEl2.innerText = name + ': ' + ( bool ? 'ON (V)' : 'OFF (V)' );

    if (bool) {
        msgEl2.style.color = '#AAFF00';
    } else {
        msgEl2.style.color = '#FF0000';
    }

	msgEl2.style.display = 'none';

	void msgEl2.offsetWidth;

	msgEl2.style.display = '';

}

function showMsg3( name, bool ) {

	msgEl3.innerText = name + ': ' + ( bool ? 'ON (T)' : 'OFF (T)' );

    if (bool) {
        msgEl3.style.color = '#AAFF00';
    } else {
        msgEl3.style.color = '#FF0000';
    }

	msgEl3.style.display = 'none';

	void msgEl3.offsetWidth;

	msgEl3.style.display = '';

}
            showMsg3( 'Aimbot', aimbotEnabled );
            showMsg( 'ESP', espEnabled );
            showMsg2( 'Wireframe', wireframeEnabled );

(function() {
    'use strict';

    // Function to delete the cookie icon
    function deleteElement() {
        var element = document.getElementsByClassName("ot-floating-button__front")[0];
        if (element) {
            element.parentNode.removeChild(element);
        }
    }

    // Delay in milliseconds before deleting the icon
    var delay = 7000; // 7 seconds

    setTimeout(deleteElement, delay);
})();

(function() {
    'use strict';

    // Function to move the element
    function moveElement() {
        const elements = document.getElementsByName("Blink");
        if (elements.length > 0) {
            const blinkEl = elements[0];
            blinkEl.style.position = "absolute";
            blinkEl.style.left = "21px";
            blinkEl.style.bottom = "1020px";
        }
    }

    // Wait for the DOM to be fully loaded
    window.addEventListener("DOMContentLoaded", () => {
        // Move the element
        moveElement();
    });
})();

