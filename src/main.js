import THREE from 'three';
import OrbitControls from 'three-orbit-controls';
import CityGenerator from 'src/city-generator';
import dat from 'datgui';
var scene = new THREE.Scene();
//scene.fog = new THREE.FogExp2( 0xAAAAAA, 0.25 );
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var gui = new dat.GUI();
console.log(gui);

var menu = {
	hej: "hej"
}

gui.add(menu, 'hej')
//menu.hej = "då";
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var cityGenerator = CityGenerator();
var city = cityGenerator.generate(6, 6);
scene.add( city );
city.rotation.x -= Math.PI / 4;
var Controls = OrbitControls(THREE);
var controls = new Controls( camera, renderer.domElement );
controls.addEventListener( 'change', render );
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

camera.position.z = 4;

function render() {
	//requestAnimationFrame( render );
	controls.update();
	renderer.render(scene, camera);
	console.log(menu.hej)
};

render();