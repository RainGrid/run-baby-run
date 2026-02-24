/**
 * Player (baby): position, gravity, jump, draw.
 */
(function (global) {
  'use strict';

  var GRAVITY = 2600;
  var JUMP_VELOCITY = -800;
  var JUMP_CUT_MULT = 0.38;
  var GROUND_Y = 280;
  var WIDTH = 44;
  var HEIGHT = 50;

  function create(opt) {
    opt = opt || {};
    var groundY = opt.groundY != null ? opt.groundY : GROUND_Y;
    return {
      x: opt.x != null ? opt.x : 80,
      y: groundY - HEIGHT,
      width: WIDTH,
      height: HEIGHT,
      vy: 0,
      groundY: groundY,
      onGround: true,
      phase: 0,
      skin: Math.random() < 0.5 ? 'boy' : 'girl'
    };
  }

  function jump(p) {
    if (p.onGround) {
      p.vy = JUMP_VELOCITY;
      p.onGround = false;
    }
  }

  function releaseJump(p) {
    if (!p.onGround && p.vy < 0) {
      p.vy *= JUMP_CUT_MULT;
    }
  }

  function update(p, dt) {
    p.phase = (p.phase || 0) + dt * 4;
    if (p.phase > 1e4) p.phase = 0;
    p.vy += GRAVITY * dt;
    p.y += p.vy * dt;
    if (p.y >= p.groundY - p.height) {
      p.y = p.groundY - p.height;
      p.vy = 0;
      p.onGround = true;
    }
  }

  function updatePhaseOnly(p, dt) {
    p.phase = (p.phase || 0) + dt * 4;
    if (p.phase > 1e4) p.phase = 0;
  }

  function draw(ctx, p, scale) {
    scale = scale || 1;
    var x = p.x * scale;
    var y = p.y * scale;
    var w = p.width * scale;
    var h = p.height * scale;
    var phase = p.phase || 0;
    var running = p.onGround;
    var jumping = !p.onGround;
    var legSwing = running ? Math.sin(phase * Math.PI * 2) : 0;
    var legSwing2 = running ? Math.sin(phase * Math.PI * 2 + Math.PI) : 0;

    ctx.save();

    var skin = p.skin || 'boy';
    var bodyY = y + h * 0.35;
    var bodyH = h * 0.65;
    var bodyCx = x + w / 2;
    var bodyCy = bodyY + bodyH / 2;
    var bodyRx = w * 0.34;
    var bodyRy = bodyH / 2;

    if (skin === 'girl') {
      ctx.fillStyle = '#e8a8b8';
      ctx.beginPath();
      ctx.ellipse(bodyCx, bodyCy, bodyRx, bodyRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c87888';
      ctx.lineWidth = 1 * scale;
      ctx.stroke();
      ctx.fillStyle = '#f0c0d0';
      ctx.beginPath();
      ctx.ellipse(bodyCx - w * 0.12, bodyCy - bodyH * 0.1, w * 0.12, bodyH * 0.22, 0, 0, Math.PI * 2);
      ctx.ellipse(bodyCx + w * 0.12, bodyCy - bodyH * 0.1, w * 0.12, bodyH * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,200,220,0.4)';
      ctx.beginPath();
      ctx.ellipse(bodyCx, bodyCy - bodyH * 0.05, w * 0.2, bodyH * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = '#7eb8da';
      ctx.beginPath();
      ctx.ellipse(bodyCx, bodyCy, bodyRx, bodyRy, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5a9ab8';
      ctx.lineWidth = 1 * scale;
      ctx.stroke();
      ctx.fillStyle = '#9ecee8';
      ctx.beginPath();
      ctx.ellipse(bodyCx - w * 0.12, bodyCy - bodyH * 0.1, w * 0.12, bodyH * 0.22, 0, 0, Math.PI * 2);
      ctx.ellipse(bodyCx + w * 0.12, bodyCy - bodyH * 0.1, w * 0.12, bodyH * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.ellipse(bodyCx, bodyCy - bodyH * 0.05, w * 0.2, bodyH * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // only feet (следики): run = alternating small lift, jump = both higher
    var footBaseY = y + h * 0.96;
    var foot1x = x + w * 0.3;
    var foot2x = x + w * 0.7;
    var footRx = 6 * scale;
    var footRy = 4 * scale;
    var lift1 = 0;
    var lift2 = 0;
    if (jumping) {
      lift1 = 10 * scale;
      lift2 = 10 * scale;
    } else if (running) {
      lift1 = Math.max(0, legSwing) * 6 * scale;
      lift2 = Math.max(0, legSwing2) * 6 * scale;
    }
    var foot1y = footBaseY - lift1;
    var foot2y = footBaseY - lift2;
    ctx.fillStyle = '#ffdfc4';
    ctx.beginPath();
    ctx.ellipse(foot1x, foot1y, footRx, footRy, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(foot2x, foot2y, footRx, footRy, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e8c9a8';
    ctx.lineWidth = 1 * scale;
    ctx.beginPath();
    ctx.ellipse(foot1x, foot1y, footRx, footRy, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(foot2x, foot2y, footRx, footRy, 0, 0, Math.PI * 2);
    ctx.stroke();

    // head (circle)
    ctx.fillStyle = '#ffdfc4';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.32, w * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e8c9a8';
    ctx.lineWidth = 1 * scale;
    ctx.stroke();

    // hair: boy = tuft, girl = bow
    if (skin === 'girl') {
      ctx.fillStyle = '#d85870';
      ctx.beginPath();
      ctx.ellipse(x + w * 0.38, y + h * 0.06, w * 0.1, h * 0.08, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + w * 0.62, y + h * 0.06, w * 0.1, h * 0.08, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c04860';
      ctx.beginPath();
      ctx.ellipse(x + w * 0.5, y + h * 0.1, w * 0.06, h * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a83850';
      ctx.lineWidth = 1 * scale;
      ctx.stroke();
    } else {
      ctx.fillStyle = '#8b7355';
      ctx.beginPath();
      ctx.ellipse(x + w * 0.52, y + h * 0.08, w * 0.12, h * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // cheeks
    ctx.fillStyle = 'rgba(255,180,160,0.5)';
    ctx.beginPath();
    ctx.ellipse(x + w * 0.28, y + h * 0.28, w * 0.08, h * 0.06, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.72, y + h * 0.28, w * 0.08, h * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // eyes
    ctx.fillStyle = '#333';
    var eyeY = y + h * 0.25;
    ctx.beginPath();
    ctx.arc(x + w * 0.35, eyeY, 2.5 * scale, 0, Math.PI * 2);
    ctx.arc(x + w * 0.65, eyeY, 2.5 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + w * 0.36, eyeY - 0.5 * scale, 1 * scale, 0, Math.PI * 2);
    ctx.arc(x + w * 0.66, eyeY - 0.5 * scale, 1 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
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

  global.Player = {
    create: create,
    jump: jump,
    releaseJump: releaseJump,
    update: update,
    updatePhaseOnly: updatePhaseOnly,
    draw: draw,
    WIDTH: WIDTH,
    HEIGHT: HEIGHT
  };
})(typeof window !== 'undefined' ? window : this);
