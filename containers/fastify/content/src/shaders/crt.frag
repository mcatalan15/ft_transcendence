# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    crt.frag                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/04/17 15:11:44 by hmunoz-g          #+#    #+#              #
#    Updated: 2025/04/17 15:11:45 by hmunoz-g         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

precision mediump float;

uniform float time;
uniform vec2 resolution;

varying vec2 vTextureCoord;
uniform sampler2D uSampler;

void main() {
	vec2 uv = vTextureCoord;

	// Normalize coords to -1 to 1 for distortion
	vec2 centeredUV = (uv - 0.5) * 2.0;

	// Apply barrel distortion
	float r2 = dot(centeredUV, centeredUV);
	centeredUV *= 1.0 + 0.25 * r2;

	// Re-normalize coords back to 0 - 1
	uv = centeredUV * 0.5 + 0.5;

	// Subtle RGB shift (chromatic aberration)
	float offset = 1.0 / resolution.x; // Adjust based on resolution
	vec3 color;
	color.r = texture2D(uSampler, uv + vec2(offset, 0.0)).r;
	color.g = texture2D(uSampler, uv).g;
	color.b = texture2D(uSampler, uv - vec2(offset, 0.0)).b;

	// Scanline effect
	float scanline = sin(uv.y * resolution.y * 1.5) * 0.1;
	color.rgb -= scanline;

	// Vignette (darken edges)
	float vignette = smoothstep(0.8, 0.5, r2);
	color *= vignette;

	gl_FragColor = vec4(color, 1.0);
}
