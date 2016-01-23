import THREE from 'three';
import CityGenerator from 'src/city-generator';
import streetVertexShader from 'shaders/streetshader.vert!text';
import streetFragmentShader from 'shaders/streetshader.frag!text';
import buildingVertexShader from 'shaders/buildingshader.vert!text';
import buildingFragmentShader from 'shaders/buildingshader.frag!text';
import _ from 'lodash';
import SimplexNoise from 'simplex-noise';
import {CustomLambertMaterial} from 'src/custom-lambert-material';

//import building shaders
import buildingVertParams from 'shaders/building-pars.vert!text';
import buildingVertShader from 'shaders/building-chunk.vert!text';
import buildingFragParams from 'shaders/building-pars.frag!text';
import buildingFragShader from 'shaders/building-chunk.frag!text';

//import street shaders
import streetVertParams from 'shaders/street-pars.vert!text';
import streetVertShader from 'shaders/street-chunk.vert!text';
import streetFragParams from 'shaders/street-pars.frag!text';
import streetFragShader from 'shaders/street-chunk.frag!text';

console.log(CustomLambertMaterial);
var simplex = new SimplexNoise(Math.random);

var MIN_AREA = 0.16;
var MIN_SIDE_RATIO = 0.3;
var streetWidth = 0.15;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BufferGeometry();
var size = 4;
// list of blocks represented as quads => blocks[block][vertex][X/Y/Z]
var quadBlocks = [
	[
		[-size/2, -size/2.0, 0.0],
		[size/2.0, -size/2.0, 0.0],
		[size/2.0, size/2.0, 0.0],
		[-size/2.0, size/2.0, 0.0]
	]
];
var iterations = 0;
while(iterations < 15){
	iterations+=1;
	quadBlocks = _.flatMap(quadBlocks, (block) => {

		//get distances to adjecent vertices
		var blockDim = dimensions(block);
		var longSide = Math.max(...blockDim);
		var shortSide = Math.min(...blockDim);

		var paddingRule1 = MIN_AREA / shortSide;
		var paddingRule2 = shortSide * MIN_SIDE_RATIO;
		var cutPadding = Math.max(paddingRule1, paddingRule2);
		if(cutPadding*2 > longSide){
			return [block];
		}

		var cutInterval = longSide - cutPadding * 2;
		var cutOffset = Math.random() * cutInterval + cutPadding;
		var cutPoint1;
		var cutPoint2;
		var newBlock1;
		var newBlock2;

		//lerp cutting points
		if(blockDim[0] > blockDim[1]){
			cutPoint1 = lerp(block[0], block[1], cutOffset / blockDim[0]);
			cutPoint2 = lerp(block[3], block[2], cutOffset / blockDim[0]);

			newBlock1 = [
				block[0].slice(),
				cutPoint1.slice(),
				cutPoint2.slice(),
				block[3].slice()
			];

			newBlock2 = [
				cutPoint1.slice(),
				block[1].slice(),
				block[2].slice(),
				cutPoint2.slice()
			];
		} else {
			cutPoint1 = lerp(block[0], block[3], cutOffset / blockDim[1]);
			cutPoint2 = lerp(block[1], block[2], cutOffset / blockDim[1]);

			newBlock1 = [
				block[0].slice(),
				block[1].slice(),
				cutPoint2.slice(),
				cutPoint1.slice()
			];

			newBlock2 = [
				cutPoint1.slice(),
				cutPoint2.slice(),
				block[2].slice(),
				block[3].slice()
			];
		}

		return [newBlock1, newBlock2];
	});
}

function lerp(p1, p2, t){
	return [
		(1 - t) * p1[0] + t * p2[0],
		(1 - t) * p1[1] + t * p2[1],
		(1 - t) * p1[2] + t * p2[2]
	];
}

function dimensions(block){
	return [Math.abs(block[2][0] - block[0][0]), Math.abs(block[2][1]- block[0][1])];
}

function centerOf(block){
	return [
		(block[0][0] + block[1][0] + block[2][0] + block[3][0]) / 4,
		(block[0][1] + block[1][1] + block[2][1] + block[3][1]) / 4,
		(block[0][2] + block[1][2] + block[2][2] + block[3][2]) / 4
	]
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
//triangle surface coordinates relative right angled point
var faceCoordinates = _.flatMap(triangulatedBlocks, (block)=>{
	return [
		// distance X			 distance Y
		block[0][0]-block[1][0], block[0][1]-block[1][1],
		0.0, 0.0,
		block[2][0]-block[1][0], block[2][1]-block[1][1],
		block[0][0]-block[5][0], block[0][1]-block[5][1],
		block[2][0]-block[5][0], block[2][1]-block[5][1],
		0.0, 0.0
	];
});

var faceDimensions = _.flatMap(quadBlocks, (block)=>{
	let dim = dimensions(block);
	return [
		dim[0], dim[1],
		dim[0], dim[1],
		dim[0], dim[1],
		dim[0], dim[1],
		dim[0], dim[1],
		dim[0], dim[1]
	];
});

var buildings = _.map(quadBlocks, (block) => {
	let dim = dimensions(block);
	let center = centerOf(block);
	dim[0] -= streetWidth;
	dim[1] -= streetWidth;
	let height = 0.3;
	height += Math.abs(simplex.noise2D(center[0]/size, center[1]/size)) * 0.6;
	height += simplex.noise2D(center[0], center[1]) * 0.3;
	height += simplex.noise2D(center[0]*2, center[1]*2) * 0.1;
	let geometry = new THREE.BoxGeometry( ...dim, height );
	let material = CustomLambertMaterial( {
		uniforms: {
			dimensions: { type: "v3", value: new THREE.Vector3(dim[0], dim[1], height)}
		},
		vertParams: buildingVertParams,
		fragParams: buildingFragParams,
		vertChunk: buildingVertShader,
		fragChunk: buildingFragShader
	} );
	let building = new THREE.Mesh( geometry, material );

	building.position.set(center[0], center[1], height/2 + center[2]);
	return building;
});

var blockTriangleList = _.flattenDeep(triangulatedBlocks);

var vertices = new Float32Array( blockTriangleList );
var coordinates =  new Float32Array(faceCoordinates);
var dimensions = new Float32Array(faceDimensions);

geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
geometry.addAttribute( 'afaceCoordinates', new THREE.BufferAttribute( coordinates, 2 ) );
geometry.addAttribute( 'afaceDimensions', new THREE.BufferAttribute( dimensions, 2 ) );

/*var material = new THREE.ShaderMaterial( {
		uniforms: {
			groundcolor: { type: "v4", value: new THREE.Vector4(0.96, 0.64, 0.38, 1.0) },
			streetcolor: { type: "v4", value: new THREE.Vector4(0.30, 0.30, 0.30, 1.0) },
			streetWidth: { type: "f", value: streetWidth}
		},
		vertexShader: streetVertexShader,
		fragmentShader: streetFragmentShader
	} );*/
var material = CustomLambertMaterial( {
		uniforms: {
			groundcolor: { type: "v4", value: new THREE.Vector4(0.96, 0.64, 0.38, 1.0) },
			streetcolor: { type: "v4", value: new THREE.Vector4(0.30, 0.30, 0.30, 1.0) },
			streetWidth: { type: "f", value: streetWidth}
		},
		vertParams: streetVertParams,
		fragParams: streetFragParams,
		vertChunk: streetVertShader,
		fragChunk: streetFragShader
	} );
var city = new THREE.Mesh( geometry, material );
scene.add( city );
_.each(buildings, (building)=>city.add(building));

city.rotation.x -= Math.PI / 4;
//LIGHT
// ambient
var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

// directional
var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.7 );
directionalLight.position.set( -1, 1, 1 );
scene.add( directionalLight );

camera.position.z = 4;

var render = function () {
	requestAnimationFrame( render );

	renderer.render(scene, camera);
};

render();