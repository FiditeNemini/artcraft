import { EventDispatcher, Quaternion, Vector3, Vector2 } from "three";

class FreeCam extends EventDispatcher {
  constructor(object, domElement) {
    super();

    this.object = object;
    this.domElement = domElement;

    // API

    // Set to false to disable this control
    this.enabled = true;

    this.movementSpeed = 1.0;
    this.rollSpeed = 0.005;

    this.dragToLook = false;
    this.autoForward = false;

    this.lastMousePosition = new Vector2();
    this.mouseVelocity = new Vector2();

    // disable default target object behavior

    // internals

    const scope = this;

    this.tmpQuaternion = new Quaternion();

    this.status = 0;

    this.moveState = {
      up: 0,
      down: 0,
      left: 0,
      right: 0,
      forward: 0,
      back: 0,
      pitchUp: 0,
      pitchDown: 0,
      yawLeft: 0,
      yawRight: 0,
      rollLeft: 0,
      rollRight: 0,
    };
    this.moveVector = new Vector3(0, 0, 0);
    this.rotationVector = new Vector3(0, 0, 0);

    this.keydown = function (event) {
      if (this.enabled === false) return;
      if (event.altKey || this.enabled === false) {
        return;
      }

      switch (event.code) {
        case "KeyW":
          this.moveState.forward = 1;
          break;
        case "KeyS":
          this.moveState.back = 1;
          break;

        case "KeyA":
          this.moveState.left = 1;
          break;
        case "KeyD":
          this.moveState.right = 1;
          break;

        case "KeyQ":
          this.moveState.down = 1;
          break;
        case "KeyE":
          this.moveState.up = 1;
          break;

        case "ArrowUp":
          this.moveState.pitchUp = 1;
          break;
        case "ArrowDown":
          this.moveState.pitchDown = 1;
          break;

        case "ArrowLeft":
          this.moveState.yawLeft = 1;
          break;
        case "ArrowRight":
          this.moveState.yawRight = 1;
          break;
      }

      this.updateMovementVector();
    };

    this.keyup = function (event) {
      if (this.enabled === false) return;
      if (this.enabled === false) return;

      switch (event.code) {
        case "KeyW":
          this.moveState.forward = 0;
          break;
        case "KeyS":
          this.moveState.back = 0;
          break;

        case "KeyA":
          this.moveState.left = 0;
          break;
        case "KeyD":
          this.moveState.right = 0;
          break;

        case "ArrowUp":
          this.moveState.pitchUp = 0;
          break;
        case "ArrowDown":
          this.moveState.pitchDown = 0;
          break;

        case "ArrowLeft":
          this.moveState.yawLeft = 0;
          break;
        case "ArrowRight":
          this.moveState.yawRight = 0;
          break;

        case "KeyQ":
          this.moveState.down = 0;
          break;
        case "KeyE":
          this.moveState.up = 0;
          break;
      }

      this.updateMovementVector();
    };

    this.reset = function () {
      this.moveState.forward = 0;
      this.moveState.back = 0;
      this.moveState.left = 0;
      this.moveState.right = 0;
      this.moveState.pitchUp = 0;
      this.moveState.pitchDown = 0;
      this.moveState.yawLeft = 0;
      this.moveState.yawRight = 0;
      this.moveState.down = 0;
      this.moveState.up = 0;
      this.updateMovementVector();
    };

    this.update = function (delta) {
      if (this.enabled === false) return;

      const moveMult = delta * scope.movementSpeed;

      scope.object.translateX(scope.moveVector.x * moveMult);
      scope.object.translateY(scope.moveVector.y * moveMult);
      scope.object.translateZ(scope.moveVector.z * moveMult);
    };

    this.updateMovementVector = function () {
      const forward =
        this.moveState.forward || (this.autoForward && !this.moveState.back)
          ? 1
          : 0;

      this.moveVector.x = -this.moveState.left + this.moveState.right;
      this.moveVector.y = -this.moveState.down + this.moveState.up;
      this.moveVector.z = -forward + this.moveState.back;
    };

    this.getContainerDimensions = function () {
      if (this.domElement != document) {
        return {
          size: [this.domElement.offsetWidth, this.domElement.offsetHeight],
          offset: [this.domElement.offsetLeft, this.domElement.offsetTop],
        };
      } else {
        return {
          size: [window.innerWidth, window.innerHeight],
          offset: [0, 0],
        };
      }
    };

    this.dispose = function () {
      this.domElement.removeEventListener("contextmenu", _contextmenu);
      this.domElement.removeEventListener("pointerdown", _pointerdown);
      this.domElement.removeEventListener("pointermove", _pointermove);
      this.domElement.removeEventListener("pointerup", _pointerup);
      this.domElement.removeEventListener("pointercancel", _pointercancel);

      window.removeEventListener("keydown", _keydown);
      window.removeEventListener("keyup", _keyup);
    };

    const _keydown = this.keydown.bind(this);
    const _keyup = this.keyup.bind(this);

    window.addEventListener("keydown", _keydown);
    window.addEventListener("keyup", _keyup);

    this.updateMovementVector();
  }
}

export { FreeCam };
