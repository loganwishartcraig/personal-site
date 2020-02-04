export const src = `

	#ifdef GL_OES_standard_derivatives
	#extension GL_OES_standard_derivatives : enable
	#endif

	uniform vec3 color;

	void main() {

		float r = 0.0, delta = 0.0, alpha = 1.0;
		vec2 cxy = 2.0 * gl_PointCoord - 1.0;
		r = dot(cxy, cxy);

		delta = fwidth(r);
		alpha = 1.0 - smoothstep(0.80 - delta, 0.80 + delta, r);

		gl_FragColor = vec4(color, alpha);
	}
`;
