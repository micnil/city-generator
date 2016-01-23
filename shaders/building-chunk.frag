vec3 absNormal = abs(vNormal);
float windowHeight = 0.1;
vec3 windowColor = vec3(0.1);
vec3 wallColor = vec3(0.8, 0.5, 0.3);
vec3 roofColor = vec3(0.5, 0.5, 0.5);
vec3 position = vec3(vPosition);
position.z += dimensions.z / 2.0;
float isWindow = mod(floor(position.z / windowHeight), 2.0);
float isRoof = (absNormal.z > 0.5) ? 1.0 : 0.0;

vec3 color = mix(windowColor, wallColor, isWindow);
diffuseColor = vec4(mix(color, roofColor, isRoof), opacity);