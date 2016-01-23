float when_gt(float x, float y) {
	return max(sign(x - y), 0.0);
}

float when_lt(float x, float y) {
	return max(sign(y - x), 0.0);
}