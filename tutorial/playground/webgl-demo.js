var cubeRotation = 0.0;
// will set to true when video can be copied to texture
var copyVideo = false;

main();

//
// Start here
//
function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl2');

  // If we don't have a GL context, give up now

  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  let shaderProgram = new ShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attributes our shader program is using
  // for aVertexPosition, aVertexNormal, aTextureCoord,
  // and look up uniform locations.
  shaderProgram.storeAttribLocation('vertexPosition', 'aVertexPosition');
  shaderProgram.storeAttribLocation('vertexNormal', 'aVertexNormal');
  shaderProgram.storeAttribLocation('textureCoord', 'aTextureCoord');
  shaderProgram.storeUniformLocation('projectionMatrix', 'uProjectionMatrix');
  shaderProgram.storeUniformLocation('modelViewMatrix', 'uModelViewMatrix');
  shaderProgram.storeUniformLocation('normalMatrix', 'uNormalMatrix');
  shaderProgram.storeUniformLocation('sampler', 'uSampler');

  console.log(shaderProgram);

  const attribConfigArray = [
    // positions
    new AttributeConfig(new BufferConfig(gl, gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW),
                        shaderProgram.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0),
    // normals
    new AttributeConfig(new BufferConfig(gl, gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW),
                        shaderProgram.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0),
    // texture coordinates
    new AttributeConfig(new BufferConfig(gl, gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW),
                        shaderProgram.attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0)
  ];
  const indexConfig =
      new IndexConfig(new BufferConfig(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW),
                      gl.UNSIGNED_SHORT, 0);

  const vao = new VAO(gl, attribConfigArray, indexConfig);

  const texture = initTexture(gl);

  const video = setupVideo('Firefox.mp4');

  var then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    if (copyVideo) {
      updateTexture(gl, texture, video);
    }

    drawScene(gl, shaderProgram, vao, texture, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

function setupVideo(url) {
  const video = document.createElement('video');

  var playing = false;
  var timeupdate = false;

  video.autoplay = true;
  video.muted = true;
  video.loop = true;

  // Waiting for these 2 events ensures
  // there is data in the video

  video.addEventListener('playing', function() {
     playing = true;
     checkReady();
  }, true);

  video.addEventListener('timeupdate', function() {
     timeupdate = true;
     checkReady();
  }, true);

  video.src = url;
  video.play();

  function checkReady() {
    if (playing && timeupdate) {
      copyVideo = true;
    }
  }

  return video;
}

//
// Draw the scene.
//
function drawScene(gl, shaderProgram, vao, texture, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument
  // as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is
  // the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to
  // start drawing the square.

  mat4.translate(modelViewMatrix,     // destination matrix
                 modelViewMatrix,     // matrix to translate
                 [-0.0, 0.0, -6.0]);  // amount to translate
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation,     // amount to rotate in radians
              [0, 0, 1]);       // axis to rotate around (Z)
  mat4.rotate(modelViewMatrix,  // destination matrix
              modelViewMatrix,  // matrix to rotate
              cubeRotation * .7,// amount to rotate in radians
              [0, 1, 0]);       // axis to rotate around (X)

  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix);

  // Tell WebGL to use our program when drawing
  gl.useProgram(shaderProgram.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(
      shaderProgram.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      shaderProgram.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
  gl.uniformMatrix4fv(
      shaderProgram.uniformLocations.normalMatrix,
      false,
      normalMatrix);

  // Specify the texture to map onto the faces.

  // Tell WebGL we want to affect texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture to texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // Tell the shader we bound the texture to texture unit 0
  gl.uniform1i(shaderProgram.uniformLocations.sampler, 0);
  // Unbind the texture
  // gl.bindTexture(gl.TEXTURE_2D, null);

  {
    gl.bindVertexArray(vao.vao);
    gl.drawElements(gl.TRIANGLES, vao.count, vao.type, vao.offset);
    gl.bindVertexArray(null);
  }

  // Update the rotation for the next draw
  cubeRotation += deltaTime;
}
