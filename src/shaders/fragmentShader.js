const fragmentShader = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uResolution;

  // Dark purple and white color scheme
  const vec3 top = vec3(0.5, 0.05, 0.25);        // White
  const vec3 bottom = vec3(0.15, 0.05, 0.25);  // Dark purple

  const float widthFactor = 1.5;

  vec3 calcSine(vec2 uv, float speed, 
                float frequency, float amplitude, float shift, float offset,
                vec3 color, float width, float exponent, bool dir)
  {
      float angle = uTime * speed * frequency * -1.0 + (shift + uv.x) * 2.0;
      
      float y = sin(angle) * amplitude + offset;
      float diffY = y - uv.y;
      
      float dsqr = distance(y, uv.y);
      
      if(dir && diffY > 0.0)
      {
          dsqr = dsqr * 4.0;
      }
      else if(!dir && diffY < 0.0)
      {
          dsqr = dsqr * 4.0;
      }
      
      float scale = pow(smoothstep(width * widthFactor, 0.0, dsqr), exponent);
      
      return min(color * scale, color);
  }

  void main() {
      vec2 uv = vUv;
      
      // Dark purple to white gradient background
      vec3 color = vec3(mix(bottom, top, uv.y));

      // White sine waves (group 1)
      color += calcSine(uv, 0.2, 0.20, 0.2, 0.0, 0.5,  vec3(0.8, 0.8, 1.0), 0.1, 15.0, false);
      color += calcSine(uv, 0.4, 0.40, 0.15, 0.0, 0.5, vec3(0.8, 0.8, 1.0), 0.1, 17.0, false);
      color += calcSine(uv, 0.3, 0.60, 0.15, 0.0, 0.5, vec3(0.8, 0.8, 1.0), 0.05, 23.0, false);

      // White sine waves (group 2)
      color += calcSine(uv, 0.1, 0.26, 0.07, 0.0, 0.3, vec3(0.8, 0.8, 1.0), 0.1, 17.0, true);
      color += calcSine(uv, 0.3, 0.36, 0.07, 0.0, 0.3, vec3(0.8, 0.8, 1.0), 0.1, 17.0, true);
      color += calcSine(uv, 0.5, 0.46, 0.07, 0.0, 0.3, vec3(0.8, 0.8, 1.0), 0.05, 23.0, true);
      color += calcSine(uv, 0.2, 0.58, 0.05, 0.0, 0.3, vec3(0.8, 0.8, 1.0), 0.2, 15.0, true);

      // Add some purple tint to the waves for better blending
      color += calcSine(uv, 0.25, 0.35, 0.1, 0.5, 0.4, vec3(0.4, 0.2, 0.6), 0.08, 12.0, false);
      color += calcSine(uv, 0.35, 0.45, 0.08, 0.3, 0.35, vec3(0.3, 0.1, 0.5), 0.06, 18.0, true);

      // Slightly reduce the glow effect for cleaner look
      color = pow(color, vec3(0.98)); 
      
      gl_FragColor = vec4(color, 1.0);
  }
`;

export default fragmentShader;