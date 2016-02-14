import THREE from 'three';
import OrbitControls from 'three-orbit-controls';
import CityGenerator from 'src/city-generator';
import dat from 'datgui';

var params = {
	amplitude: 0.6,
	frequency: 1,
	width: 6,
	length: 6,
	minArea: 0.16,
	minRatio: 0.3,
	streetWidth: 0.15
}

var scene = new THREE.Scene();
//scene.fog = new THREE.FogExp2( 0xAAAAAA, 0.25 );
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var gui = new dat.GUI();
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var cityGenerator = CityGenerator();
var city = cityGenerator.generate(params);
scene.add( city );
city.rotation.x -= Math.PI / 4;
var Controls = OrbitControls(THREE);
var controls = new Controls( camera, renderer.domElement );
controls.addEventListener( 'change', _.throttle(render, 1/60) );
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

//LIGHT
// ambient
var light = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light );

// directional
var directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
directionalLight.position.set( -0.5, 1, 2 );
scene.add( directionalLight );

// menu

function heightNoiseChanged(value) {
	city.children.forEach((building)=>{
		cityGenerator.setHeightNoise(building, params.frequency, params.amplitude);
	});
	render();
}
function streetWidthChanged(value) {
	cityGenerator.setStreetWidth(city, value);
	render();
}
function recreate(){
	let transform = city.matrix;
	scene.remove(city);
	city = cityGenerator.generate(params);
	city.applyMatrix(transform);
	scene.add(city);
	render();
}

gui.add(params, 'amplitude', 0, 1).onChange(heightNoiseChanged);
gui.add(params, 'frequency', 0, 10).onChange(heightNoiseChanged);
gui.add(params, 'width').onChange(_.throttle(recreate, 1/10));
gui.add(params, 'length').onChange(_.throttle(recreate, 1/10));
gui.add(params, 'minArea', 0, 1).onChange(_.throttle(recreate, 1/10));
gui.add(params, 'minRatio', 0, 0.5).onChange(_.throttle(recreate, 1/10));
gui.add(params, 'streetWidth', 0, 0.5).onChange(_.throttle(streetWidthChanged, 1/10));

camera.position.z = 4;

function render() {
	//requestAnimationFrame( render );
	controls.update();
	renderer.render(scene, camera);
	//console.log(menu.hej)
};

render();