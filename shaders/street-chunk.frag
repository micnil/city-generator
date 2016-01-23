vec4 white = vec4(1.0, 1.0, 1.0, 1.0);
vec4 pavementColor = vec4(0.6, 0.6, 0.6, 1);
float pavementWidth = streetWidth / 8.0;
float lineLength = streetWidth/2.0;
float lineWidth = streetWidth/10.0;
vec4 color = pavementColor;

float x = vfaceCoordinates.x;
float y = vfaceCoordinates.y;
float absx = abs(vfaceCoordinates.x);
float absy = abs(vfaceCoordinates.y);

//so that line width appears more to the center
//color = (absx < (streetWidth + lineWidth*when_lt(x, 0.0))/2.0) ? streetcolor : color;
//color = (absy < (streetWidth + lineWidth*when_lt(y, 0.0))/2.0) ? streetcolor : color;
color = (absy < (streetWidth / 2.0) - pavementWidth) ? streetcolor : color;
color = (absx < (streetWidth / 2.0) - pavementWidth) ? streetcolor : color;
color = (absx > vfaceDimensions.x - (streetWidth / 2.0) + pavementWidth) ? streetcolor : color;
color = (absy > vfaceDimensions.y - (streetWidth / 2.0) + pavementWidth) ? streetcolor : color;

float linePaddingX = mod(vfaceDimensions.x, lineLength * 2.0)/2.0;
float linePaddingY = mod(vfaceDimensions.y, lineLength * 2.0)/2.0;
color = (absx < lineWidth && mod(floor((absy + linePaddingY)/lineLength), 2.0)>0.5 && y>0.0) ? white : color;
color = (absy < lineWidth && mod(floor((absx + linePaddingX)/lineLength), 2.0)>0.5 && x>0.0) ? white : color;


diffuseColor = color;