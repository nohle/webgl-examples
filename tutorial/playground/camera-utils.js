// Default camera values
const DEFAULT_CAMERA_PARAMETERS = {
  POSITION: vec3.fromValues(0.0, 0.0, 0.0),
  WORLD_UP: vec3.fromValues(0.0, 1.0, 0.0),
  FRONT: vec3.fromValues(0.0, 0.0, -1.0),
  YAW: - 90.0 * Math.PI / 180.0,
  PITCH: 0.0,
  SPEED: 2.5,
  SENSITIVITY: 0.1,
  ZOOM: 45.0 * Math.PI / 180.0
}

const CAMERA_DIRECTIONS = {
  FORWARD: "forward",
  BACKWARD: "backward",
  LEFT: "left",
  RIGHT: "right"
};

class Camera {

  constructor(gl, position = DEFAULT_CAMERA_PARAMETERS.POSITION,
                  worldUp = DEFAULT_CAMERA_PARAMETERS.WORLD_UP,
                  front = DEFAULT_CAMERA_PARAMETERS.FRONT,
                  yaw = DEFAULT_CAMERA_PARAMETERS.YAW,
                  pitch = DEFAULT_CAMERA_PARAMETERS.PITCH,
                  zoom = DEFAULT_CAMERA_PARAMETERS.ZOOM,
                  speed = DEFAULT_CAMERA_PARAMETERS.SPEED,
                  sensitivity = DEFAULT_CAMERA_PARAMETERS.SENSITIVITY) {
    this.position = position;
    this.front = front;
    this.worldUp = worldUp;
    this.yaw = yaw;
    this.constrainPitch = true;
    this._pitch = null;
    this.pitch = pitch;  // use setter
    this.contrainZoom = true;
    this._zoom = null;
    this.zoom = zoom;  // use setter
    this.speed = speed;
    this.sensitivity = sensitivity;
    this.up = null;
    this.right = null;

    this.update();
  }

  set pitch(pitch) {
    this._pitch = pitch;
    if(this.constrainPitch) {
      if(this._pitch > 89.0)
        this._pitch = 89.0;
      else if(this._pitch < -89.0)
        this._pitch = -89.0;
    }
  }

  get pitch() {
    return this._pitch;
  }

  set zoom(zoom) {
    this._zoom = zoom;
    if(this.constrainZoom) {
      if (this._zoom < 1.0)
        this._zoom = 1.0;
      else if (this._zoom > 45.0)
        this._zoom = 45.0;
    }
  }

  get zoom() {
    return this._zoom;
  }

  update() {
    // update front
    vec3.set(this.front,
      Math.cos(this.pitch) * Math.cos(this.yaw),
      Math.sin(this.pitch),
      Math.cos(this.pitch) * Math.sin(this.yaw));
    vec3.normalize(this.front);

    // update up
    vec3.cross(this.up, this.front, this.worldUp);

    // update right


  }
}
