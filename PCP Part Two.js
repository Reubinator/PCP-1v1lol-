// ==UserScript==
// @name         PCP Part Two
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Aimbot, Wireframe and ESP addition to PCP
// @author       Zertalious for original code, Edit by me
// @match        *://1v1.lol/*
// @license      MIT
// @icon         https://www.google.com/s2/favicons?domain=pornhub.com
// @grant        none
// @run-at       document-start
// ==/UserScript==

let espEnabled = false;
let aimbotEnabled = false;
let toggleEnabled = false;
let wireframeEnabled = false;
let menuhideEnabled = false;

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

				aimbotsearchrange.style.display = isPlaying && aimbotEnabled ? '' : 'none';

				if ( count > 0 && isPlaying ) {

					const f = aimbotSpeed / count;

					movementX *= f;
					movementY *= f;

					window.dispatchEvent( new MouseEvent( 'mousemove', { movementX, movementY } ) );

					aimbotsearchrange.classList.add( 'range-active' );

				} else {

					aimbotsearchrange.classList.remove( 'range-active' );

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

.esp {
	position: absolute;
    visibility: shown;
	left: -13.8px;
	bottom: 1155px;
	color: #EE4B2B;
    font-family: Arial;
    font-weight: bold;
    font-size: 20px;
	padding: 15px;
	z-index: 999999;
	pointer-events: none;
}

.hidemenu {
	position: absolute;
    visibility: shown;
	left: -13.8px;
	bottom: 1093px;
	color: #EE4B2B;
    font-family: Arial;
    font-weight: bold;
    font-size: 20px;
	padding: 15px;
	z-index: 999999;
	pointer-events: none;
}

.toggledhacks {
	position: absolute;
    visibility: shown;
	left: -13.8px;
	bottom: 1125px;
	color: #EE4B2B;
    font-family: Arial;
    font-weight: bold;
    font-size: 20px;
	padding: 15px;
	z-index: 999999;
	pointer-events: none;
}

.wireframe {
	position: absolute;
    visibility: shown;
	left: -13.8px;
	bottom: 1215px;
	color: #EE4B2B;
    font-family: Arial;
    font-weight: bold;
    font-size: 20px;
	padding: 15px;
	z-index: 999999;
	pointer-events: none;
}

.aimbot {
	position: absolute;
    visibility: shown;
	left: -13.8px;
	bottom: 1185px;
	color: #EE4B2B;
    font-family: Arial;
    font-size: 20px;
    font-weight: bold;
	padding: 15px;
	z-index: 999999;
	pointer-events: none;
}
.aimbotsearchrange {
	position: absolute;
	left: 50%;
	top: 50%;
	width: ${searchSize}px;
	height: ${searchSize}px;
	max-width: 100%;
	max-height: 100%;
	border: 1px solid white;
    border-radius: 50%;
	transform: translate(-50%, -50%);
}

.range-active {
	border: 2px solid red;
}

</style>

</div>
<div class="hidemenu" style="display: none;"></div>
<div class="esp" style="display: none;"></div>
<div class="toggledhacks" style="display: none;"></div>
<div class="wireframe" style="display: none;"></div>
<div class="aimbot" style="display: none;"></div>
<div class="aimbotsearchrange" style="display: none;"></div>`;


const espstatus = el.querySelector( '.esp' );
const hidemenu = el.querySelector( '.hidemenu' );
const toggledhacks = el.querySelector( '.toggledhacks' );
const wireframestatus = el.querySelector( '.wireframe' );
const aimbotstatus = el.querySelector( '.aimbot' );
const aimbotsearchrange = el.querySelector( '.aimbotsearchrange' );

window.addEventListener( 'DOMContentLoaded', function () {

	while ( el.children.length > 0 ) {

		document.body.appendChild( el.children[ 0 ] );

	}

} );

window.addEventListener( 'keyup', function ( event ) {

	switch ( String.fromCharCode( event.keyCode ) ) {

		case 'V' :

			espEnabled = ! espEnabled;
            showESP( 'ESP', espEnabled );

            break;

         case 'K' :

			menuhideEnabled = ! menuhideEnabled;
            hideModMenu( 'Hide Menu', menuhideEnabled );

            break;

        case 'L' :
			toggleEnabled = ! toggleEnabled;
            showToggledHacks( 'Toggle List', toggleEnabled );

            break;

		case 'N' :

			wireframeEnabled = ! wireframeEnabled;
            showWireframe( 'Wireframe', wireframeEnabled );

			break;

		case 'T' :

			aimbotEnabled = ! aimbotEnabled;
            showAimbot( 'Aimbot', aimbotEnabled );

			break;

	}

} );

function showESP( name, bool ) {

	espstatus.innerText = name + ': ' + ( bool ? 'ON (V)' : 'OFF (V)' );

    if (bool) {
        espstatus.style.color = '#AAFF00';
    } else {
        espstatus.style.color = '#EE4B2B';
    }

	espstatus.style.display = 'none';

	void espstatus.offsetWidth;

	espstatus.style.display = '';

}

function showToggledHacks( name, bool ) {

	toggledhacks.innerText = name + ': ' + ( bool ? 'ON (L)' : 'OFF (L)' );

    if (bool) {
        toggledhacks.style.color = '#AAFF00';
    } else {
        toggledhacks.style.color = '#EE4B2B';
    }

	toggledhacks.style.display = 'none';

	void toggledhacks.offsetWidth;

	toggledhacks.style.display = '';

}

function hideModMenu( name, bool ) {

	hidemenu.innerText = name + ': ' + ( bool ? 'ON (K)' : 'OFF (K)' );

    if (bool) {
        hidemenu.style.color = '#AAFF00';
    } else {
        hidemenu.style.color = '#EE4B2B';
    }

	hidemenu.style.display = 'none';

	void hidemenu.offsetWidth;

	hidemenu.style.display = '';

}

function showWireframe( name, bool ) {

	wireframestatus.innerText = name + ': ' + ( bool ? 'ON (N)' : 'OFF (N)' );

    if (bool) {
        wireframestatus.style.color = '#AAFF00';
    } else {
        wireframestatus.style.color = '#EE4B2B';
    }

	wireframestatus.style.display = 'none';

	void wireframestatus.offsetWidth;

	wireframestatus.style.display = '';

}

function showAimbot( name, bool ) {

	aimbotstatus.innerText = name + ': ' + ( bool ? 'ON (T)' : 'OFF (T)' );

    if (bool) {
        aimbotstatus.style.color = '#AAFF00';
    } else {
        aimbotstatus.style.color = '#EE4B2B';
    }

	aimbotstatus.style.display = 'none';

	void aimbotstatus.offsetWidth;

	aimbotstatus.style.display = '';

}

            showAimbot( 'Aimbot', aimbotEnabled );
            showESP( 'ESP', espEnabled );
            showWireframe( 'Wireframe', wireframeEnabled );
            hideModMenu( 'Hide Menu', menuhideEnabled );
            showToggledHacks('Toggle List', toggleEnabled );


