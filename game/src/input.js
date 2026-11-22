// Gilded Vault — keyboard and mouse.
// One job: turn keys and clicks into one clean input state.

export function makeInput(canvas) {
  const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    sneak: false,
    lockpickHeld: false,
    clickTarget: null,
    pressed: {},
  };
  const keyMap = {
    KeyW: 'up',
    ArrowUp: 'up',
    KeyS: 'down',
    ArrowDown: 'down',
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
    ShiftLeft: 'sneak',
    ShiftRight: 'sneak',
    KeyF: 'lockpickHeld',
  };
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    const field = keyMap[e.code];
    if (field) input[field] = true;
    if (!e.repeat) input.pressed[e.code] = true;
  });
  window.addEventListener('keyup', (e) => {
    const field = keyMap[e.code];
    if (field) input[field] = false;
  });
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    input.clickTarget = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
    input.pressed.Mouse = true;
  });
  window.addEventListener('blur', () => {
    input.up = input.down = input.left = input.right = false;
    input.sneak = false;
    input.lockpickHeld = false;
  });
  return input;
}

export function moveVector(input) {
  let x = 0;
  let y = 0;
  if (input.left) x -= 1;
  if (input.right) x += 1;
  if (input.up) y -= 1;
  if (input.down) y += 1;
  if (x !== 0 && y !== 0) {
    x *= Math.SQRT1_2;
    y *= Math.SQRT1_2;
  }
  return { x, y };
}

export function consumePress(input, code) {
  if (input.pressed[code]) {
    delete input.pressed[code];
    return true;
  }
  return false;
}

export function clearPresses(input) {
  input.pressed = {};
}
