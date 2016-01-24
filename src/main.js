import THREE from 'three';
import CityGenerator from 'src/city-generator';

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var cityGenerator = CityGenerator();
var city = cityGenerator.generate(4, 4);
scene.add( city );
city.rotation.x -= Math.PI / 4;

//LIGHT
// ambient
var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

// directional
var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
directionalLight.position.set( -0.5, 1, 2 );
scene.add( directionalLight );

camera.position.z = 4;

var render = function () {
	requestAnimationFrame( render );

	renderer.render(scene, camera);
};

render();