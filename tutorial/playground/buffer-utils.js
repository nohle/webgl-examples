class BufferConfig {
  constructor(gl, _bufferType, _typedData, _drawType) {
    if(!(_typedData.buffer instanceof ArrayBuffer)) {
      console.log("_typedData input to BufferConfig ctor is not an instance of TypedArray.");
      return;
    }

    // if(_typedData == null) {
    //   console.log("_typedData input to BufferConfig ctor cannot be null.");
    //   return;
    // }

    this.bufferType = _bufferType;
    this.typedData = _typedData;
    this.drawType = _drawType;

    // Create and bind buffer
    this.buffer = gl.createBuffer();
    gl.bindBuffer(this.bufferType, this.buffer);

    // Fill buffer with data
    gl.bufferData(this.bufferType, this.typedData, this.drawType);

    // Unbind buffer
    gl.bindBuffer(this.bufferType, null);
  }
}

class AttributeConfig {
  constructor(_bufferConfig, _location, _numComponents, _type, _normalize, _stride, _offset) {
    if(!(_bufferConfig instanceof BufferConfig)) {
      console.log("_bufferConfig input to AttributeConfig ctor is not an instance of BufferConfig.");
      return;
    }

    this.bufferConfig = _bufferConfig;
    this.location = _location;
    this.numComponents = _numComponents;
    this.type = _type;
    this.normalize = _normalize;
    this.stride = _stride;
    this.offset = _offset;
  }
}

function initVAO(gl, attribConfigArray, indexBufferConfig = null) {
  if(!(attribConfigArray instanceof Array)) {
    console.log("attribConfigArray input to initVAO is not an instance of an Array.");
    return null;
  }

  output = {
    vao: null,
    useIndices: false,
  };

  // Create and bind VAO
  const vao = gl.createVertexArray();
  output.vao = vao;
  gl.bindVertexArray(vao);

  for(let i = 0; i < attribConfigArray.length; i++) {
    const attribConfig = attribConfigArray[i];
    if(!(attribConfig instanceof AttributeConfig)) {
      console.log("Non-AttributeConfig type in attribConfigArray.");
      return null;
    }

    // Bind buffer
    gl.bindBuffer(attribConfig.bufferConfig.bufferType,
                  attribConfig.bufferConfig.buffer);

    // Set and enable attribute
    gl.vertexAttribPointer(
        attribConfig.location,
        attribConfig.numComponents,
        attribConfig.type,
        attribConfig.normalize,
        attribConfig.stride,
        attribConfig.offset);
    gl.enableVertexAttribArray(attribConfig.location);

    // Unbind buffer
    gl.bindBuffer(attribConfig.bufferConfig.bufferType, null);
  }

  if(indexBufferConfig != null) {
    if(!(indexBufferConfig instanceof BufferConfig)) {
      console.log("indexBufferConfig not an instance of BufferConfig.");
      return null;
    }

    // Bind index buffer (must keep bound for VAO!)
    gl.bindBuffer(indexBufferConfig.bufferType, indexBufferConfig.buffer);

    output.useIndices = true;
    output.indexCount = indexBufferConfig.typedData.length;
    // TODO: change hardcoding?
    output.indexType = gl.UNSIGNED_SHORT;
    output.indexOffset = 0;
  }

  // Unbind VAO
  gl.bindVertexArray(null);

  return output;
}
