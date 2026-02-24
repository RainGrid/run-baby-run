/**
 * Obstacle types and spawn. Original Dino-style: gap in distance (px), one obstacle per spawn.
 */
(function (global) {
  'use strict';

  var TYPES = [
    {
      id: 'cube',
      width: 28,
      height: 28,
      offsetY: 0,
      color: '#c96',
      name: 'cube',
    },
    {
      id: 'ball',
      width: 26,
      height: 26,
      offsetY: 0,
      color: '#e87',
      name: 'ball',
    },
    {
      id: 'rattle',
      width: 24,
      height: 32,
      offsetY: 0,
      color: '#9bd',
      name: 'rattle',
    },
    {
      id: 'bottle',
      width: 28,
      height: 34,
      offsetY: 0,
      color: '#fff',
      stroke: '#ccc',
      name: 'bottle',
    },
    {
      id: 'tricycle',
      width: 56,
      height: 56,
      offsetY: 0,
      color: '#df4d60',
      name: 'tricycle',
    },
    {
      id: 'pacifier',
      width: 24,
      height: 24,
      offsetY: 0,
      color: '#fbc134',
      name: 'pacifier',
    },
    {
      id: 'car',
      width: 58,
      height: 58,
      offsetY: 0,
      color: '#35c3ee',
      name: 'car',
    },
    {
      id: 'duckling',
      width: 49,
      height: 49,
      offsetY: 0,
      color: '#f6c346',
      name: 'duckling',
    },
    {
      id: 'wind',
      width: 54,
      height: 54,
      offsetY: 0,
      color: '#805333',
      name: 'wind',
    },
    {
      id: 'toy',
      width: 54,
      height: 54,
      offsetY: 0,
      color: '#c03a2b',
      name: 'toy',
    },
  ];

  var list = [];
  var nextSpawnAt = 0;
  var MIN_GAP = 220;
  var MAX_GAP = 380;
  var images = {}; // id -> HTMLImageElement (loaded from assets/obstacles/)

  function setImage(id, img) {
    if (id && img) images[id] = img;
  }

  function setImages(map) {
    if (map) for (var k in map) images[k] = map[k];
  }

  function reset() {
    list.length = 0;
    nextSpawnAt = 320;
  }

  function spawn(gameWidth, groundY, distance, currentSpeed) {
    if (nextSpawnAt === 0) nextSpawnAt = 320;
    if (distance < nextSpawnAt) return;
    var type = TYPES[Math.floor(Math.random() * TYPES.length)];
    var offsetY = (type.offsetY || 0) + (Math.random() * 12 - 6);
    var o = {
      type: type.id,
      x: gameWidth + (Math.random() * 20 - 10),
      y: groundY - type.height - offsetY,
      width: type.width,
      height: type.height,
      color: type.color,
      stroke: type.stroke,
      name: type.name,
    };
    list.push(o);
    nextSpawnAt = distance + MIN_GAP + Math.random() * (MAX_GAP - MIN_GAP);
  }

  function update(dt, distance, gameWidth, groundY, currentSpeed) {
    var dtSec = dt / 1000;
    var speed = currentSpeed != null ? currentSpeed : 640;
    var i = 0;
    while (i < list.length) {
      list[i].x -= speed * dtSec;
      if (list[i].x + list[i].width < 0) {
        list.splice(i, 1);
      } else {
        i++;
      }
    }
    spawn(gameWidth, groundY, distance, currentSpeed);
  }

  function draw(ctx, scale) {
    scale = scale || 1;
    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      var x = o.x * scale;
      var y = o.y * scale;
      var w = o.width * scale;
      var h = o.height * scale;
      ctx.save();

      var img = images[o.type];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, x, y, w, h);
      } else if (o.name === 'cube') {
        drawCube(ctx, x, y, w, h, scale);
      } else if (o.name === 'ball') {
        drawBall(ctx, x, y, w, h, scale);
      } else if (o.name === 'rattle') {
        drawRattle(ctx, x, y, w, h, scale);
      } else if (o.name === 'bottle') {
        drawBottle(ctx, x, y, w, h, scale);
      } else if (o.name === 'tricycle') {
        drawTricycle(ctx, x, y, w, h, scale);
      } else if (o.name === 'pacifier') {
        drawPacifier(ctx, x, y, w, h, scale);
      } else if (
        o.name === 'car' ||
        o.name === 'duckling' ||
        o.name === 'wind' ||
        o.name === 'toy'
      ) {
        drawGeneric(ctx, x, y, w, h, scale, o.color);
      } else {
        ctx.fillStyle = o.color;
        ctx.fillRect(x, y, w, h);
      }
      // Рамка хитбокса для сопоставления с картинками
      ctx.strokeStyle = '#f00';
      ctx.lineWidth = 1.5 * scale;
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    }
  }

  function drawCube(ctx, x, y, w, h, scale) {
    var pad = 2 * scale;
    var g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#e8c070');
    g.addColorStop(0.4, '#c99650');
    g.addColorStop(1, '#a67c38');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#8b6914';
    ctx.lineWidth = 1.5 * scale;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#fff';
    ctx.font = 10 * scale + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('A', x + w / 2, y + h / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(x + pad, y + pad, w * 0.25, h * 0.2);
  }

  function drawBall(ctx, x, y, w, h, scale) {
    var cx = x + w / 2;
    var cy = y + h / 2;
    var r = w / 2 - 1 * scale;
    var g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
    g.addColorStop(0, '#fff0b0');
    g.addColorStop(0.5, '#e8b050');
    g.addColorStop(1, '#c89030');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#a07020';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();
    ctx.strokeStyle = '#c89840';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.85, 0, Math.PI);
    ctx.stroke();
  }

  function drawRattle(ctx, x, y, w, h, scale) {
    var handleW = w * 0.35;
    var ballR = w * 0.4;
    var ballY = y + ballR + 2 * scale;
    var g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#b8e0f0');
    g.addColorStop(1, '#78b0c8');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x + w / 2, ballY, ballR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5a90a8';
    ctx.lineWidth = 1 * scale;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(
      x + w / 2 - ballR * 0.2,
      ballY - ballR * 0.2,
      ballR * 0.25,
      ballR * 0.2,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = '#e0d0a0';
    ctx.fillRect(
      x + w / 2 - handleW / 2,
      ballY + ballR - 2 * scale,
      handleW,
      h - (ballY + ballR - y) + 4 * scale,
    );
    ctx.strokeStyle = '#b8a060';
    ctx.strokeRect(
      x + w / 2 - handleW / 2,
      ballY + ballR - 2 * scale,
      handleW,
      h - (ballY + ballR - y) + 4 * scale,
    );
  }

  function drawBottle(ctx, x, y, w, h, scale) {
    var nippleH = h * 0.2;
    var bodyY = y + nippleH;
    var bodyH = h * 0.8;
    var g = ctx.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, '#f8f8f8');
    g.addColorStop(0.5, '#e8e8e8');
    g.addColorStop(1, '#d0d0d0');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + nippleH * 0.5, w * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + w * 0.2, bodyY, w * 0.6, bodyH);
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 1 * scale;
    ctx.stroke();
    ctx.fillStyle = 'rgba(200,220,255,0.5)';
    ctx.fillRect(x + w * 0.25, bodyY + bodyH * 0.2, w * 0.5, bodyH * 0.5);
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(x + w / 2, bodyY + bodyH * 0.15);
    ctx.lineTo(x + w / 2, bodyY + bodyH * 0.85);
    ctx.stroke();
  }

  function drawTricycle(ctx, x, y, w, h, scale) {
    var r = 6 * scale;
    roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = '#df4d60';
    ctx.fill();
    ctx.strokeStyle = '#a33447';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();
  }

  function drawPacifier(ctx, x, y, w, h, scale) {
    var cx = x + w / 2;
    var cy = y + h / 2;
    var r = Math.min(w, h) / 2 - 2 * scale;
    ctx.fillStyle = '#fbc134';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e0a020';
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();
  }

  function drawGeneric(ctx, x, y, w, h, scale, color) {
    var r = Math.min(4 * scale, w / 4, h / 4);
    roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1 * scale;
    ctx.stroke();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  global.Obstacles = {
    list: list,
    setImage: setImage,
    setImages: setImages,
    reset: reset,
    spawn: spawn,
    update: update,
    draw: draw,
  };
})(typeof window !== 'undefined' ? window : this);
