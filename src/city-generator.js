import THREE from 'three';
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

export default () => {
	// constants
	var MIN_AREA = 0.16;
	var MIN_SIDE_RATIO = 0.3;
	var xSize;
	var ySize;
	var streetWidth = 0.15;
	var windowHeight = 0.1;
	var pavementWidth = 0.05;
	var buildingFrequency;
	var buildingHeight;
	var simplex = new SimplexNoise(Math.random);

	function generate(params) {
		console.log("Generating city...");
		let numBlocks = 0;
		xSize = params.width || 6.0;
		ySize = params.length || 6.0;
		MIN_AREA = params.minArea || 0.16;
		MIN_SIDE_RATIO = params.thickness || 0.3;
		streetWidth = (isNaN(params.streetWidth)) ? 0.15 : params.streetWidth;
		pavementWidth = (isNaN(params.pavementWidth)) ? 0.05 : params.pavementWidth;
		windowHeight = (isNaN(params.windowHeight)) ? 0.1 : params.windowHeight;
		buildingHeight = (isNaN(params.amplitude)) ? 0.6 : params.amplitude;
		buildingFrequency = (isNaN(params.frequency)) ? 1 : params.frequency;

		var quadBlocks = [
			[
				[-xSize/2, -ySize/2.0, 0.0],
				[xSize/2.0, -ySize/2.0, 0.0],
				[xSize/2.0, ySize/2.0, 0.0],
				[-xSize/2.0, ySize/2.0, 0.0]
			]
		];

		quadBlocks = splitBlocks(quadBlocks[0]);

		let triangulatedBlocks = triangulate(quadBlocks);
		let faceCoordinates = surfaceCoordinates(triangulatedBlocks);
		let triangleDimensions = faceDimensions(quadBlocks);
		let buildings = createBuildings(quadBlocks);

		triangulatedBlocks = _.flattenDeep(triangulatedBlocks);

		let vertices = new Float32Array( triangulatedBlocks );
		let coordinates =  new Float32Array(faceCoordinates);
		let dimensions = new Float32Array(triangleDimensions);

		var geometry = new THREE.BufferGeometry();
		geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
		geometry.addAttribute( 'afaceCoordinates', new THREE.BufferAttribute( coordinates, 2 ) );
		geometry.addAttribute( 'afaceDimensions', new THREE.BufferAttribute( dimensions, 2 ) );

		let material = CustomLambertMaterial( {
			uniforms: {
				groundcolor: { type: "v4", value: new THREE.Vector4(0.96, 0.64, 0.38, 1.0) },
				streetcolor: { type: "v4", value: new THREE.Vector4(0.30, 0.30, 0.30, 1.0) },
				streetWidth: { type: "f", value: streetWidth},
				pavementWidth: { type: "f", value: pavementWidth}
			},
			vertParams: streetVertParams,
			fragParams: streetFragParams,
			vertChunk: streetVertShader,
			fragChunk: streetFragShader
		} );
		let city = new THREE.Mesh( geometry, material );

		_.each(buildings, (building)=>city.add(building));

		return city;
	};

	function splitBlocks(block) {

		//get distances to adjecent vertices
		var blockDim = dimensions(block);
		var longSide = Math.max(...blockDim);
		var shortSide = Math.min(...blockDim);
		var paddingRule1 = (2*MIN_AREA) / shortSide;
		var paddingRule2 = (shortSide/2) * MIN_SIDE_RATIO;
		var cutPadding = Math.max(paddingRule1, paddingRule2);
		if(cutPadding*2 > longSide){
			paddingRule1 = MIN_AREA / shortSide;
			paddingRule2 = shortSide * MIN_SIDE_RATIO;
			cutPadding = Math.max(paddingRule1, paddingRule2);
		}

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

		return _.flatten([splitBlocks(newBlock1), splitBlocks(newBlock2)]);
	};

	function lerp(p1, p2, t){
		return [
			(1 - t) * p1[0] + t * p2[0],
			(1 - t) * p1[1] + t * p2[1],
			(1 - t) * p1[2] + t * p2[2]
		];
	};

	function dimensions(block){
		return [Math.abs(block[2][0] - block[0][0]), Math.abs(block[2][1]- block[0][1])];
	};

	function centerOf(block){
		return [
			(block[0][0] + block[1][0] + block[2][0] + block[3][0]) / 4,
			(block[0][1] + block[1][1] + block[2][1] + block[3][1]) / 4,
			(block[0][2] + block[1][2] + block[2][2] + block[3][2]) / 4
		]
	};

	function triangulate(blocks){
		return _.map(blocks, (block) => {
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
	};

	function surfaceCoordinates(triangulatedBlocks){
		return _.flatMap(triangulatedBlocks, (block)=>{
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
	};

	function faceDimensions(quadBlocks){
		return _.flatMap(quadBlocks, (block)=>{
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
	};

	function createBuildings(quadBlocks){
		return _.map(quadBlocks, (block) => {
			let dim = dimensions(block);
			let center = centerOf(block);
			dim[0] -= streetWidth;
			dim[1] -= streetWidth;

			let wallNoise = simplex.noise2D(center[0], center[1])/10;
			let wallColor = new THREE.Vector3(
				Math.random() * 0.3 + 0.35,
				Math.random() * 0.3 + 0.35,
				Math.random() * 0.3 + 0.35
			);
			let roofColor = Math.random() * 0.4 + 0.2;
			//let geometry = new THREE.BoxGeometry( ...dim, 1.0 );
			let geometry = new THREE.BoxGeometry( 1.0, 1.0, 1.0 );
			let material = CustomLambertMaterial( {
				uniforms: {
					uWallColor: { type: "v3", value: wallColor},
					uRoofColor: { type: "v3", value: new THREE.Vector3(roofColor, roofColor, roofColor)},
					windowHeight: { type: "f", value: windowHeight}
				},
				vertParams: buildingVertParams,
				fragParams: buildingFragParams,
				vertChunk: buildingVertShader,
				fragChunk: buildingFragShader
			} );

			let building = new THREE.Mesh( geometry, material );
			building.scale.x = dim[0];
			building.scale.y = dim[1];
			building.position.set(center[0], center[1], 1.0/2 + center[2]);
			setHeightNoise(building, buildingFrequency, buildingHeight);
			return building;
		});
	};

	function setHeightNoise(building, frequency, amplitude){
		let height = 0.3;
		let x = building.position.x/xSize;
		let y = building.position.y/ySize;
		height += Math.abs(simplex.noise2D(x * frequency, y * frequency)) * amplitude;
		height += Math.abs(simplex.noise2D(x * 5, y * 5)) * 0.3;
		height += Math.abs(simplex.noise2D(x * 10, y * 10)) * 0.1;
		building.scale.z = height;
		building.position.z = height/2;
	}
	function setStreetWidth(city, width){
		city.material.uniforms.streetWidth.value = width;
		city.material.needsUpdate = true;
		let buildings = city.children;
		buildings.forEach((building)=>{
			building.scale.x = building.scale.x + streetWidth - width;
			building.scale.y = building.scale.y + streetWidth - width;
		});
		streetWidth = width;
	}
	function setPavementWidth(city, width){
		city.material.uniforms.pavementWidth.value = width;
		city.material.needsUpdate = true;
		pavementWidth = width;
	}
	function setWindowHeight(city, height){
		let buildings = city.children;
		buildings.forEach((building)=>{
			building.material.uniforms.windowHeight.value = height;
			building.material.needsUpdate = true;
		});
		windowHeight = height;
	}
	return {
		generate,
		setHeightNoise,
		setStreetWidth,
		setPavementWidth,
		setWindowHeight
	}
}