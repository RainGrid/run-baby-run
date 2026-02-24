/**
 * Entry: canvas init, resize, requestAnimationFrame loop, wire Input to Game.
 */
(function (global) {
  'use strict';

  var canvas = document.getElementById('gameCanvas');
  if (!canvas) return;

  function resize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
  }

  resize();
  window.addEventListener('resize', resize);

  Game.init(canvas);

  // Load obstacle images from assets/obstacles/*.svg or *.png (fallback: canvas drawing if load fails)
  (function () {
    var ids = ['cube', 'ball', 'rattle', 'bottle', 'tricycle', 'pacifier', 'car', 'duckling', 'wind', 'toy'];
    var base = 'assets/obstacles/';
    var ext = ['svg', 'png'];
    ids.forEach(function (id) {
      var idx = 0;
      function tryNext() {
        if (idx >= ext.length) return;
        var img = new Image();
        img.onload = function () { Obstacles.setImage(id, img); };
        img.onerror = function () { idx++; tryNext(); };
        img.src = base + id + '.' + ext[idx++];
      }
      tryNext();
    });
  })();

  Input.onJump(function () {
    Game.onJump();
  });
  Input.onJumpRelease(function () {
    Game.onJumpRelease();
  });
  Input.onAction(function () {
    Game.onAction();
  });

  var lastTime = 0;
  function loop(now) {
    if (lastTime === 0) lastTime = now;
    var dt = Math.min(now - lastTime, 50);
    lastTime = now;
    Game.update(dt);
    Game.render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})(typeof window !== 'undefined' ? window : this);
