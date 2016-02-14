uniform vec4 groundcolor;
uniform vec4 streetcolor;
uniform float streetWidth;
uniform float pavementWidth;

varying vec2 vfaceCoordinates;
varying vec2 vfaceDimensions;

float when_gt(float x, float y) {
	return max(sign(x - y), 0.0);
}

float when_lt(float x, float y) {
	return max(sign(y - x), 0.0);
}