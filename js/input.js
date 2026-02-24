/**
 * Input layer: keyboard, gamepad, touch → single "jump" action.
 */
(function (global) {
  'use strict';

  var jumpCallbacks = [];
  var jumpReleaseCallbacks = [];
  var actionCallbacks = []; // generic action (start/restart/confirm)

  function preventDefault(e) {
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
    }
  }

  function onKeyDown(e) {
    var isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
      e.preventDefault();
    }
    if (e.key === ' ' || e.key === 'ArrowUp') {
      jumpCallbacks.forEach(function (cb) { cb(); });
    }
    if (e.key === 'Enter') {
      actionCallbacks.forEach(function (cb) { cb(); });
    }
    if (!isInput) {
      actionCallbacks.forEach(function (cb) { cb(); });
    }
  }

  function onTouchStart(e) {
    if (e.target.id === 'gameCanvas' || e.target.closest('body')) {
      e.preventDefault();
      jumpCallbacks.forEach(function (cb) { cb(); });
    }
  }

  function onTouchEnd(e) {
    if (e.target.id === 'gameCanvas' || e.target.closest('body')) {
      jumpReleaseCallbacks.forEach(function (cb) { cb(); });
    }
  }

  function pollGamepad() {
    var pads = navigator.getGamepads ? navigator.getGamepads() : [];
    var aPressed = false;
    var startPressed = false;
    for (var i = 0; i < pads.length; i++) {
      var pad = pads[i];
      if (!pad) continue;
      if (pad.buttons[0] && pad.buttons[0].pressed) aPressed = true;
      if (pad.buttons[9] && pad.buttons[9].pressed) startPressed = true;
    }
    if (aPressed) {
      if (!pollGamepad.prevA) {
        pollGamepad.prevA = true;
        jumpCallbacks.forEach(function (cb) { cb(); });
      }
    } else {
      if (pollGamepad.prevA) {
        jumpReleaseCallbacks.forEach(function (cb) { cb(); });
      }
      pollGamepad.prevA = false;
    }
    if (startPressed) {
      if (!pollGamepad.prevStart) {
        pollGamepad.prevStart = true;
        actionCallbacks.forEach(function (cb) { cb(); });
      }
    } else {
      pollGamepad.prevStart = false;
    }
  }
  pollGamepad.prevA = false;
  pollGamepad.prevStart = false;

  var lastJumpFrame = -1;
  var lastActionFrame = -1;

  function onJump(callback) {
    jumpCallbacks.push(callback);
  }

  function onAction(callback) {
    actionCallbacks.push(callback);
  }

  function emitJump(frame) {
    if (frame === lastJumpFrame) return;
    lastJumpFrame = frame;
    jumpCallbacks.forEach(function (cb) { cb(); });
  }

  function emitAction(frame) {
    if (frame === lastActionFrame) return;
    lastActionFrame = frame;
    actionCallbacks.forEach(function (cb) { cb(); });
  }

  function tick(frame) {
    pollGamepad();
  }

  document.addEventListener('keydown', onKeyDown, false);
  document.addEventListener('keyup', function (e) {
    if (e.key === ' ' || e.key === 'ArrowUp') {
      e.preventDefault();
      jumpReleaseCallbacks.forEach(function (cb) { cb(); });
    }
  }, false);
  document.addEventListener('keydown', preventDefault, false);
  document.addEventListener('touchstart', onTouchStart, { passive: false });
  document.addEventListener('touchend', onTouchEnd, { passive: true });

  global.Input = {
    onJump: onJump,
    onJumpRelease: function (callback) { jumpReleaseCallbacks.push(callback); },
    onAction: onAction,
    emitJump: emitJump,
    emitAction: emitAction,
    tick: tick
  };
})(typeof window !== 'undefined' ? window : this);
