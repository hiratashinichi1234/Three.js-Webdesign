uniform sampler2D uTexture;
uniform float uTime;
uniform vec3 uColor;
varying vec2 vUv;

void main() {
  vec4 texcel = texture2D(uTexture, vUv);
  vec3 color = texcel.rgb * uColor;
  gl_FragColor = vec4(color, texcel.a);
}
