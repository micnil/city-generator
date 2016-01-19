import THREE from 'three';
import CityGenerator from 'src/city-generator';
import streetVertexShader from 'shaders/streetshader.vert!text';
import streetFragmentShader from 'shaders/streetshader.frag!text';
import _ from 'lodash';

var MIN_AREA = 0.16;
var MIN_SIDE_RATIO = 0.2;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BufferGeometry();

// list of blocks represented as quads => blocks[block][vertex][X/Y/Z]
var quadBlocks = [
	[
		[-5.0, -5.0, 0.0],
		[5.0, -5.0, 0.0],
		[5.0, 5.0, 0.0],
		[-5.0, 5.0, 0.0]
	]
];

_.each(quadBlocks, (block) => {
	//get distances to adjecent vertices
	var blockDim = dimensions(block);
	var longSide = Math.max(...blockDim);
	var shortSide = Math.min(...blockDim);

	var paddingRule1 = MIN_AREA / shortSide;
	var paddingRule2 = shortSide * MIN_SIDE_RATIO;
	var cutPadding = Math.max(paddingRule1, paddingRule2);
	if(cutPadding*2 > longSide){
		return false;
	}
	var cutInterval = longSide - cutPadding * 2;
	var cutOffset = Math.random() * cutInterval + cutPadding;

	//lerp cutting points
	var cutPoint1 = lerp(block[0], block[1], cutOffset / blockDim[0]);
	var cutPoint2 = lerp(block[3], block[2], cutOffset / blockDim[0]);
});

function lerp(p1, p2, t){
	return [
		(1 - t) * p1[0] + t * p2[0],
		(1 - t) * p1[1] + t * p2[1],
		(1 - t) * p1[2] + t * p2[2]
	];
}
function dimensions(block){
	return [
		distance(block[0], block[1]),
		distance(block[0], block[3])
	]
}
function distance(p1, p2){
	return magnitude([Math.abs(p2[0] - p1[0]), Math.abs(p2[1]- p1[1])]);
}
function magnitude(v){
	return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
}
// triangulate the blocks
var triangulatedBlocks = _.map(quadBlocks, (block) => {
	// slice to break reference from quadBlocks array.
	return [
		block[0].slice(),
		block[1].slice(),
		block[2].slice(),
		block[0].slice(),
		block[2].slice(),
		block[3].slice()
	];
});

var faceCoordinates = _.flatMap(triangulatedBlocks, (block)=>{
	return [
		// distance X							distance Y
		Math.abs(block[0][0]-block[1][0]), Math.abs(block[0][1]-block[1][1]),
		0.0, 0.0,
		Math.abs(block[2][0]-block[1][0]), Math.abs(block[2][1]-block[1][1]),
		Math.abs(block[0][0]-block[5][0]), Math.abs(block[0][1]-block[5][1]),
		Math.abs(block[2][0]-block[5][0]), Math.abs(block[2][1]-block[5][1]),
		0.0, 0.0
	];
});
console.log(faceCoordinates)
var blockTriangleList = _.flattenDeep(triangulatedBlocks);

var vertices = new Float32Array( blockTriangleList );
var coordinates =  new Float32Array(faceCoordinates);

geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
geometry.addAttribute( 'afaceCoordinates', new THREE.BufferAttribute( coordinates, 2 ) );

var material = new THREE.ShaderMaterial( {
		uniforms: {
			groundcolor: { type: "v4", value: new THREE.Vector4(0.96, 0.64, 0.38, 1.0) },
			streetcolor: { type: "v4", value: new THREE.Vector4(0.66, 0.66,0.66, 1.0) }
		},
		vertexShader: streetVertexShader,
		fragmentShader: streetFragmentShader
	} );
var mesh = new THREE.Mesh( geometry, material );

scene.add( mesh );
//LIGHT
// ambient
var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

// directional
var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
directionalLight.position.set( -1, 1, 1 );
scene.add( directionalLight );

camera.position.z = 5;

var render = function () {
	requestAnimationFrame( render );

	renderer.render(scene, camera);
};

render();