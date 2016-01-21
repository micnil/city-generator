uniform vec4 groundcolor;
uniform vec4 streetcolor;
uniform float streetWidth;

varying vec2 vfaceCoordinates;
varying vec2 vfaceDimensions;
void main() {
	vec4 color = (abs(vfaceCoordinates.x) < streetWidth/2.0 || abs(vfaceCoordinates.y) < streetWidth/2.0) ? streetcolor : groundcolor;
	color = (abs(vfaceCoordinates.x) > vfaceDimensions.x - streetWidth/2.0 || abs(vfaceCoordinates.y) > vfaceDimensions.y - streetWidth/2.0) ? streetcolor : color;

    gl_FragColor = color;
}