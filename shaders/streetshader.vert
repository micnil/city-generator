attribute vec2 afaceCoordinates;
attribute vec2 afaceDimensions;

varying vec2 vfaceCoordinates;
varying vec2 vfaceDimensions;
void main()	{
	vfaceCoordinates = afaceCoordinates;
	vfaceDimensions = afaceDimensions;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}