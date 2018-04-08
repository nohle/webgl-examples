/***** Cube Data *****/
const vertexPositions = [
  // Front face
  -1.0, -1.0,  1.0,
   1.0, -1.0,  1.0,
   1.0,  1.0,  1.0,
  -1.0,  1.0,  1.0,

  // Back face
  -1.0, -1.0, -1.0,
  -1.0,  1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0, -1.0, -1.0,

  // Top face
  -1.0,  1.0, -1.0,
  -1.0,  1.0,  1.0,
   1.0,  1.0,  1.0,
   1.0,  1.0, -1.0,

  // Bottom face
  -1.0, -1.0, -1.0,
   1.0, -1.0, -1.0,
   1.0, -1.0,  1.0,
  -1.0, -1.0,  1.0,

  // Right face
   1.0, -1.0, -1.0,
   1.0,  1.0, -1.0,
   1.0,  1.0,  1.0,
   1.0, -1.0,  1.0,

  // Left face
  -1.0, -1.0, -1.0,
  -1.0, -1.0,  1.0,
  -1.0,  1.0,  1.0,
  -1.0,  1.0, -1.0,
];
const vertexNormals = [
  // Front
   0.0,  0.0,  1.0,
   0.0,  0.0,  1.0,
   0.0,  0.0,  1.0,
   0.0,  0.0,  1.0,

  // Back
   0.0,  0.0, -1.0,
   0.0,  0.0, -1.0,
   0.0,  0.0, -1.0,
   0.0,  0.0, -1.0,

  // Top
   0.0,  1.0,  0.0,
   0.0,  1.0,  0.0,
   0.0,  1.0,  0.0,
   0.0,  1.0,  0.0,

  // Bottom
   0.0, -1.0,  0.0,
   0.0, -1.0,  0.0,
   0.0, -1.0,  0.0,
   0.0, -1.0,  0.0,

  // Right
   1.0,  0.0,  0.0,
   1.0,  0.0,  0.0,
   1.0,  0.0,  0.0,
   1.0,  0.0,  0.0,

  // Left
  -1.0,  0.0,  0.0,
  -1.0,  0.0,  0.0,
  -1.0,  0.0,  0.0,
  -1.0,  0.0,  0.0,
];
const textureCoordinates = [
  // Front
  0.0,  0.0,
  1.0,  0.0,
  1.0,  1.0,
  0.0,  1.0,
  // Back
  0.0,  0.0,
  1.0,  0.0,
  1.0,  1.0,
  0.0,  1.0,
  // Top
  0.0,  0.0,
  1.0,  0.0,
  1.0,  1.0,
  0.0,  1.0,
  // Bottom
  0.0,  0.0,
  1.0,  0.0,
  1.0,  1.0,
  0.0,  1.0,
  // Right
  0.0,  0.0,
  1.0,  0.0,
  1.0,  1.0,
  0.0,  1.0,
  // Left
  0.0,  0.0,
  1.0,  0.0,
  1.0,  1.0,
  0.0,  1.0,
];
const indices = [
  0,  1,  2,      0,  2,  3,    // front
  4,  5,  6,      4,  6,  7,    // back
  8,  9,  10,     8,  10, 11,   // top
  12, 13, 14,     12, 14, 15,   // bottom
  16, 17, 18,     16, 18, 19,   // right
  20, 21, 22,     20, 22, 23,   // left
];
/*********************/

class AttributeConfig {
  constructor(_location, _numComponents, _type, _normalize, _stride, _offset) {
    this.location = _location;
    this.numComponents = _numComponents;
    this.type = _type;
    this.normalize = _normalize;
    this.stride = _stride;
    this.offset = _offset;
  }
}

function initVAO(gl, attribLocations) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // positions
  const positionAttribConfig = new AttributeConfig(attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
  _setup(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(vertexPositions), positionAttribConfig);

  // normals
  const normalAttribConfig = new AttributeConfig(attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
  _setup(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(vertexNormals), normalAttribConfig);

  // texture cooridnates
  const texAttribConfig = new AttributeConfig(attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
  _setup(gl, gl.ARRAY_BUFFER, gl.STATIC_DRAW, new Float32Array(textureCoordinates), texAttribConfig);

  // indices
  const indexBuffer = _setup(gl, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW, new Uint16Array(indices), null, false);

  // Unbind VAO
  gl.bindVertexArray(null);

  return {
    vao: vao,
    indexCount : indices.length,
    indexType : gl.UNSIGNED_SHORT,
    indexOffset : 0,
  };
}

function _setup(gl, buffer_type, draw_type, typed_data, attrib_config, should_unbind = true) {

  // Create and bind buffer
  const buffer = gl.createBuffer();
  gl.bindBuffer(buffer_type, buffer);

  // Fill buffer with data
  gl.bufferData(buffer_type, typed_data, draw_type);

  // Set up attribute
  if(attrib_config instanceof AttributeConfig) {
    gl.vertexAttribPointer(
        attrib_config.location,
        attrib_config.numComponents,
        attrib_config.type,
        attrib_config.normalize,
        attrib_config.stride,
        attrib_config.offset);
    gl.enableVertexAttribArray(attrib_config.location);
  }

  // Unbind buffer (unless told not too, e.g., for element buffer)
  if(should_unbind)
    gl.bindBuffer(buffer_type, null);
}
