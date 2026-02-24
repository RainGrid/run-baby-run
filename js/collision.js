/**
 * AABB collision between player and obstacles.
 */
(function (global) {
  'use strict';

  function aabb(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  function checkPlayerObstacles(player, obstacles) {
    var px = player.x;
    var py = player.y;
    var pw = player.width;
    var ph = player.height;
    for (var i = 0; i < obstacles.length; i++) {
      var o = obstacles[i];
      if (aabb(px, py, pw, ph, o.x, o.y, o.width, o.height)) {
        return true;
      }
    }
    return false;
  }

  global.Collision = {
    aabb: aabb,
    checkPlayerObstacles: checkPlayerObstacles
  };
})(typeof window !== 'undefined' ? window : this);
