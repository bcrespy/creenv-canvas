/**
 * Written by Baptiste Crespy 
 * [https://crespy-baptiste.com]
 * [https://github.com/bcrespy/creenv-core]
 * 
 * This module was made to make it -faster- to work with the web 
 * canvas API. Performances are the same, it is just easier to work with 
 * this.
 */

"use strict";

/**
 * The canvas class provides an interface to work with the html canvas API.
 * Most of the drawing methods of this class directly call the built-in functions,
 * it is just faster to write and think code using this
 * 
 * @param {?HTMLCanvasElement} canvasElement the html canvas element, if none
 * is provided, one will be added to the body
 * @param {?boolean} fullWindow (default = false) if the canvas fills the window
 * @param {?boolean} autoInit (default = true) if the canvas will be automatically
 * at the class instanciation. You can set this parameter to false and call the 
 * init method manually 
 */
function Canvas (canvasElement, fullWindow, autoInit) {
  if( !(this instanceof Canvas) ) {
    return new Canvas.apply(null, arguments);
  }

  /**
   * @type {HTMLCanvasElement}
   * @public
   */
  this.canvas = null;

  /**
   * @type {CanvasRenderingContext2D}
   * @public
   */
  this.context = null;

  /**
   * @type {boolean}
   * @private
   */
  this.fullWindow = true;

  /**
   * if a path has started - reset when drawing a path 
   * @type {boolean}
   * @private
   */
  this.pathStarted = false;

  /**
   * width of the canvas, in px
   * @type {number}
   * @public
   */
  this.width = 0;

  /**
   * height of the canvas, in px
   * @type {number}
   * @public
   */
  this.height = 0;
  

  if (canvasElement === undefined) {
    canvasElement = document.createElement("canvas");
    document.body.appendChild(canvasElement);
  }

  if (fullWindow === undefined) {
    fullWindow = true;
  }

  if (autoInit === undefined) {
    autoInit = true;
  }

  this.canvas = canvasElement;
  this.context = this.canvas.getContext('2d');
  this.fullWindow = fullWindow;

  this.onWindowResizeHandler = this.onWindowResizeHandler.bind(this);

  if (autoInit) {
    this.init();
  }
}


Canvas.prototype = {

  /**
   * @return {Promise} a promise which resolves when the initialization is completed
   */
  init: function () {
    return new Promise((resolve) => {
      if (this.fullWindow) {
        this.canvas.style.display = "block";
        this.setSize(window.innerWidth, window.innerHeight);
        window.addEventListener("resize", this.onWindowResizeHandler);
      } else {
        this.width = this.canvas.width;
        this.height = this.canvas.height;
      }
      resolve();
    });
  },

  /**
   * "Rewriting" some of the most useful context functions so that 
   * coding goes faster
   */

  
  /**
   * Fills the canvas with the provided color, in no color is provided fills it 
   * with the active color. Fillstyle is reset to its previous value after this function's
   * call
   * 
   * @param {Color|string} color either a @creenv/color object or a html compliant string
   */
  background: function (color) {
    if (color === undefined) {
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      let fillstyle = this.context.fillStyle;
      this.fillStyle(color);
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.fillStyle(fillstyle);
    }
  },

  /**
   * Applies a style to the fill - modifies the fillStyle property of the context
   * [https://developer.mozilla.org/fr/docs/Web/API/CanvasRenderingContext2D/fillStyle]
   * 
   * @param {string} style style to be applied - can be color / gradient / pattern 
   */
  fillStyle: function (style) {
    this.context.fillStyle = style;
  },

  /**
   * Applies a style to the stroke - modifies the strokeStyle property of the context
   * [https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle]
   * 
   * @param {string} style style to be applied - can be color / gradient / pattern 
   */
  strokeStyle: function (style) {
    this.context.strokeStyle = style;
  },

  /**
   * Calls the context.fillRect with passed params 
   * [https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rect]
   * 
   * @param {number} x the top-left corner x coordinate
   * @param {number} y the top-left y coordinate
   * @param {number} width width of the rectangle
   * @param {number} height height of the rectangle
   */
  rect: function (x, y, width, height) {
    this.context.fillRect.apply(this.context, arguments);
  },

  /**
   * You can either draw the arc alone, therefore addToPath has to be set to false, or
   * you can add it to the path
   * [https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc]
   * 
   * @param {number} x the x coordinate of the arc's center
   * @param {number} y the y coordinate of the arc's center
   * @param {number} radius the radius of the arc
   * @param {number} startAngle The angle at which the arc starts, measured 
   * clockwise from the positive x axis and expressed in radians.
   * @param {number} endAngle The angle at which the arc ends, measured clockwise 
   * from the positive x axis and expressed in radians.
   * @param {?boolean} addToPath (default = false) if the arc is part of a path or is lonely
   * @param {?boolean} anticlockwise (default = false) if true, causes the arc to be 
   * drawn counter-clockwise between the two angles. By default it is drawn clockwise.
   */
  arc: function (x, y, radius, startAngle, endAngle, anticlockwise, addToPath) {
    if (anticlockwise === undefined) anticlockwise = false;
    if (addToPath === undefined) addToPath = false;
    if (!addToPath) this.context.beginPath();
    this.context.arc(x, y, radius, startAngle, endAngle, anticlockwise);
  },

  /**
   * Adds a point to the path. If a path has not been started, create one
   * 
   * @param {number} x the x coordinate of the point
   * @param {number} y the y coordinate of the point
   */
  addPoint: function (x, y) {
    if (!this.pathStarted) {
      this.context.beginPath();
      this.context.moveTo(x,y);
      this.pathStarted = true;
    } else {
      this.context.lineTo(x,y);
    }
  },

  /**
   * Draws the active path 
   * Calls the context.stroke() method 
   * [https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/stroke]
   * 
   * @param {?boolean} closed (default = false) if the path needs to be closed before drawing it
   */
  stroke: function (closed) {
    if (closed === undefined) closed = false;
    if (closed) this.context.closePath();
    this.context.stroke();
    this.pathStarted = false;
  },

  /**
   * Fills the active path
   * Calls the context.fill() method
   * [https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fill]
   * 
   * @param {?boolean} closed (default = false) if the path needs to be closed before filling it
   */
  fill: function (closed) {
    if (closed === undefined) closed = false;
    if (closed) this.context.closePath();
    this.context.fill();
    this.pathStarted = false;
  },

  /**
   * The drawing state gets saved 
   * Calls context.save()
   * [https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/save]
   */
  save: function () {
    this.context.save();
  },

  /**
   * The previously saved context gets restored
   * Calls context.restore()
   * [https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/restore]
   */
  restore: function () {
    this.context.restore();
  },

  /**
   * Clears the whole canvas from top left corner (0;0) to bottom 
   * right corner (canvas.width, canvas.height)
   */
  clearAll: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },

  /**
   * The handler called when window is begin resized 
   */
  onWindowResizeHandler: function () {
    this.setSize( window.innerWidth, window.innerHeight );
  },

  /**
   * Sets the canvas width and height 
   * 
   * @param {number} width the width, in px
   * @param {number} height the height, in px
   */
  setSize: function (width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
  }
}

module.exports = Canvas;