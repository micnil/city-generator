uniform vec4 groundcolor;
uniform vec4 streetcolor;

varying vec2 vfaceCoordinates;
varying vec2 vfaceDimensions;
void main() {
	vec4 color = (abs(vfaceCoordinates.x) < 0.01 || abs(vfaceCoordinates.y) < 0.01) ? streetcolor : groundcolor;
	color = (abs(vfaceCoordinates.x) > vfaceDimensions.x - 0.01 || abs(vfaceCoordinates.y) > vfaceDimensions.y - 0.01) ? streetcolor : color;
    gl_FragColor = color;
}