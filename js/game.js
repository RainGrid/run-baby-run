/**
 * Game: states (menu, play, gameover, enterName), update/render, score, best, localStorage, enterName UI.
 */
(function (global) {
  'use strict';

  var STATE_MENU = 'menu';
  var STATE_PLAY = 'play';
  var STATE_GAMEOVER = 'gameover';
  var STATE_ENTER_NAME = 'enterName';

  var BASE_WIDTH = 800;
  var BASE_HEIGHT = 400;
  var GROUND_Y = 280;
  var STORAGE_KEY = 'runBabyRunScores';
  var SPEED_START = 300;
  var SPEED_MAX = 680;
  var SPEED_RAMP_DIST = 26000;

  var state = STATE_MENU;
  var score = 0;
  var bestScore = 0;
  var bestName = '';
  var scores = []; // [{ name, score }, ...]
  var distance = 0;
  var scale = 1;
  var canvasEl;
  var player;
  var overlayEl;
  var enterNameEl;
  var finalScoreEl;
  var playerNameEl;
  var btnSave;
  var btnSkip;

  function getScores() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  function saveScores(arr) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {}
  }

  function loadBest() {
    scores = getScores();
    if (scores.length > 0) {
      scores.sort(function (a, b) { return (b.score - a.score); });
      bestScore = scores[0].score;
      bestName = scores[0].name || '';
    }
  }

  function init(canvas) {
    canvasEl = canvas;
    overlayEl = document.getElementById('uiOverlay');
    enterNameEl = document.getElementById('enterNameScreen');
    finalScoreEl = document.getElementById('finalScore');
    playerNameEl = document.getElementById('playerName');
    btnSave = document.getElementById('btnSave');
    btnSkip = document.getElementById('btnSkip');
    loadBest();
    player = Player.create({ groundY: GROUND_Y });

    if (btnSave) {
      btnSave.addEventListener('click', function () {
        var name = (playerNameEl && playerNameEl.value) ? playerNameEl.value.trim() : 'Игрок';
        if (name.length === 0) name = 'Игрок';
        scores.push({ name: name, score: score });
        scores.sort(function (a, b) { return b.score - a.score; });
        if (scores.length > 10) scores.length = 10;
        saveScores(scores);
        bestScore = scores[0].score;
        bestName = scores[0].name;
        hideEnterName();
        state = STATE_MENU;
      });
    }
    if (btnSkip) {
      btnSkip.addEventListener('click', function () {
        hideEnterName();
        state = STATE_MENU;
      });
    }
  }

  function showEnterName() {
    if (overlayEl) overlayEl.classList.add('active');
    if (overlayEl) overlayEl.classList.remove('hidden');
    if (enterNameEl) enterNameEl.classList.remove('hidden');
    if (finalScoreEl) finalScoreEl.textContent = score;
    if (playerNameEl) {
      playerNameEl.value = '';
      playerNameEl.focus();
    }
  }

  function hideEnterName() {
    if (overlayEl) overlayEl.classList.remove('active');
    if (overlayEl) overlayEl.classList.add('hidden');
    if (enterNameEl) enterNameEl.classList.add('hidden');
  }

  function startGame() {
    state = STATE_PLAY;
    score = 0;
    distance = 0;
    player = Player.create({ groundY: GROUND_Y });
    Obstacles.reset();
  }

  function gameOver() {
    state = STATE_GAMEOVER;
    setTimeout(function () {
      state = STATE_ENTER_NAME;
      showEnterName();
    }, 100);
  }

  function update(dt) {
    Input.tick(typeof requestAnimationFrame !== 'undefined' ? performance.now() : 0);

    var dtSec = dt / 1000;
    if (state === STATE_PLAY) {
      distance += 400 * dtSec;
      score = Math.floor(distance / 2);
      var currentSpeed = SPEED_START + (distance / SPEED_RAMP_DIST) * (SPEED_MAX - SPEED_START);
      if (currentSpeed > SPEED_MAX) currentSpeed = SPEED_MAX;
      Player.update(player, dtSec);
      Obstacles.update(dt, distance, BASE_WIDTH, GROUND_Y, currentSpeed);
      if (Collision.checkPlayerObstacles(player, Obstacles.list)) {
        gameOver();
      }
    }
  }

  function render() {
    var ctx = canvasEl.getContext('2d');
    var cw = canvasEl.width;
    var ch = canvasEl.height;
    scale = Math.min(cw / BASE_WIDTH, ch / BASE_HEIGHT);
    var offsetX = (cw - BASE_WIDTH * scale) / 2;
    var offsetY = (ch - BASE_HEIGHT * scale) / 2;

    ctx.save();
    ctx.fillStyle = '#e8dcc8';
    ctx.fillRect(0, 0, cw, ch);

    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // floor fill
    ctx.fillStyle = '#ddd5c4';
    ctx.fillRect(0, GROUND_Y, BASE_WIDTH + 200, BASE_HEIGHT - GROUND_Y);
    var stripe;
    for (stripe = 0; stripe < BASE_WIDTH + 200; stripe += 24) {
      ctx.fillStyle = 'rgba(196,181,154,0.25)';
      ctx.fillRect(stripe, GROUND_Y, 8, BASE_HEIGHT - GROUND_Y);
    }
    // ground line
    ctx.strokeStyle = '#c4b59a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(BASE_WIDTH + 100, GROUND_Y);
    ctx.stroke();

    if (state === STATE_MENU) {
      Player.draw(ctx, player, 1);
      ctx.fillStyle = '#333';
      ctx.font = '24px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Run Baby Run', BASE_WIDTH / 2, 120);
      ctx.font = '16px system-ui, sans-serif';
      ctx.fillText('Пробел / Стрелка вверх / Тап — прыжок', BASE_WIDTH / 2, 160);
      ctx.fillText('Любая — начать', BASE_WIDTH / 2, 190);
      var top5 = scores.slice(0, 5);
      if (top5.length > 0) {
        ctx.fillText('Топ-5', BASE_WIDTH / 2, 218);
        ctx.font = '14px system-ui, sans-serif';
        top5.forEach(function (entry, i) {
          ctx.fillText((entry.name || '—') + ' — ' + entry.score, BASE_WIDTH / 2, 238 + i * 20);
        });
      }
      return ctx.restore();
    }

    if (state === STATE_PLAY || state === STATE_GAMEOVER || state === STATE_ENTER_NAME) {
      Obstacles.draw(ctx, 1);
      Player.draw(ctx, player, 1);
    }

    ctx.fillStyle = '#333';
    ctx.font = '20px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('' + score, 20, 30);
    ctx.textAlign = 'right';
    ctx.font = '14px system-ui, sans-serif';
    var top5 = scores.slice(0, 5);
    top5.forEach(function (entry, i) {
      ctx.fillText((entry.name || '—') + ' — ' + entry.score, BASE_WIDTH - 20, 30 + i * 18);
    });

    if (state === STATE_GAMEOVER) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
      ctx.fillStyle = '#fff';
      ctx.font = '28px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Конец игры', BASE_WIDTH / 2, BASE_HEIGHT / 2 - 20);
      ctx.font = '18px system-ui, sans-serif';
      ctx.fillText('Счёт: ' + score, BASE_WIDTH / 2, BASE_HEIGHT / 2 + 20);
    }

    ctx.restore();
  }

  function onJump() {
    if (state === STATE_PLAY) {
      Player.jump(player);
    }
  }

  function onJumpRelease() {
    if (state === STATE_PLAY) {
      Player.releaseJump(player);
    }
  }

  function onAction() {
    if (state === STATE_MENU) {
      startGame();
    } else if (state === STATE_ENTER_NAME) {
      var name = (playerNameEl && playerNameEl.value) ? playerNameEl.value.trim() : '';
      if (name.length === 0) {
        hideEnterName();
        state = STATE_MENU;
      } else {
        scores.push({ name: name, score: score });
        scores.sort(function (a, b) { return b.score - a.score; });
        if (scores.length > 10) scores.length = 10;
        saveScores(scores);
        bestScore = scores[0].score;
        bestName = scores[0].name;
        hideEnterName();
        state = STATE_MENU;
      }
    }
  }

  global.Game = {
    init: init,
    update: update,
    render: render,
    onJump: onJump,
    onJumpRelease: onJumpRelease,
    onAction: onAction,
    startGame: startGame,
    state: function () { return state; },
    BASE_WIDTH: BASE_WIDTH,
    BASE_HEIGHT: BASE_HEIGHT,
    GROUND_Y: GROUND_Y
  };
})(typeof window !== 'undefined' ? window : this);
