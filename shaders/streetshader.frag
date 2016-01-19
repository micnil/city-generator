uniform vec4 groundcolor;
uniform vec4 streetcolor;

varying vec2 vfaceCoordinates;
void main() {
	vec4 color = (vfaceCoordinates.x < 0.2 || vfaceCoordinates.y < 0.2) ? streetcolor : groundcolor;
    gl_FragColor = color;
}