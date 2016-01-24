vec3 absNormal = abs(vNormal);
float windowHeight = 0.1;
float windowWidth = 0.09;
vec3 glassColor = vec3(0.1);
vec3 windowEdgeColor = vec3(0.9);
vec3 wallColor = vec3(uWallColor);
vec3 roofColor = vec3(uRoofColor);
vec3 position = vec3(vPosition);

wallColor += wallColor * snoise(vUv/3.0);
float xCoord = (absNormal.x > 0.5) ? position.y + dimensions.y / 2.0 : position.x + dimensions.x / 2.0;
position.z += dimensions.z / 2.0;
float isWindow = mod(floor(position.z / windowHeight), 2.0);
float windowCoord = fract(xCoord / windowWidth);
float isWindowEdge = (windowCoord < 0.3) ? 1.0 : 0.0;
vec3 windowColor = mix(glassColor, windowEdgeColor, isWindowEdge);
float isRoof = (absNormal.z > 0.5) ? 1.0 : 0.0;

vec3 color = mix(windowColor, wallColor, isWindow);
color = mix(color, roofColor, isRoof);
diffuseColor = vec4(color, opacity);