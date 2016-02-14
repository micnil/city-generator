mat3 scaleMatrix = mat3(1.0);
scaleMatrix[0].x = length(modelMatrix[0]);
scaleMatrix[1].y = length(modelMatrix[1]);
scaleMatrix[2].z = length(modelMatrix[2]);
vPosition = scaleMatrix * position;
vNormal = normal;