attribute vec2 afaceCoordinates;

varying vec2 vfaceCoordinates;
void main()	{
	vfaceCoordinates = afaceCoordinates;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}