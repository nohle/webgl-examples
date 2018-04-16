// Vertex shader program
const vsSource = `#version 300 es
  in vec4 aVertexPosition;
  in vec3 aVertexNormal;
  in vec2 aTextureCoord;

  uniform mat4 uNormalMatrix;
  uniform mat4 uModelViewMatrix;
  uniform mat4 uProjectionMatrix;

  out highp vec2 vTextureCoord;
  out highp vec3 vLighting;

  void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;

    // Apply lighting effect

    highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
    highp vec3 directionalLightColor = vec3(1, 1, 1);
    highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
    vLighting = ambientLight + (directionalLightColor * directional);
  }
`;

// Fragment shader program
const fsSource = `#version 300 es
  in highp vec2 vTextureCoord;
  in highp vec3 vLighting;

  uniform sampler2D uSampler;

  out highp vec4 fragColor;

  void main(void) {
    highp vec4 texelColor = texture(uSampler, vTextureCoord);

    fragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
  }
`;

// Initialize a shader program, so WebGL knows how to draw our data
class ShaderProgram {
  constructor(gl, vsSource, fsSource) {
    this.gl = gl;

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    this.program = gl.createProgram();
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(this.program));
    }

    this.attribLocations = {};
    this.uniformLocations = {};
  }

  storeAttribLocation(key, name) {
    this.attribLocations[key] = this.gl.getAttribLocation(this.program, name);
  }
  storeUniformLocation(key, name) {
    this.uniformLocations[key] = this.gl.getUniformLocation(this.program, name);
  }
}

// Creates a shader of the given type, uploads the source and compiles it.
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
