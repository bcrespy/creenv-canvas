/**
 * Copyright © 2018 - Baptiste Crespy <baptiste.crespy@gmail.com>
 * under the MIT license 
 * [https://github.com/bcrespy/creenv-core]
 */


class Canvas {

  /**
   * @type {HTMLCanvasElement}
   * @public
   */
  canvas;

  /**
   * @type {CanvasRenderingContext2D}
   * @public
   */
  context;

  /**
   * @type {boolean}
   * @private
   */
  fullWindow = true;

  /**
   * if a path has started - reset when drawing a path 
   * @type {boolean}
   * @private
   */
  pathStarted = false;

  /**
   *  
   * @param {?HTMLCanvasElement} canvasElement the html canvas element, if none is provided, one will be added to the body
   * @param {?boolean} fullWindow if the canvas fills the window
   */
  constructor( canvasElement = null, fullWindow = true ) {
    if( !canvasElement ) {
      canvasElement = document.createElement("canvas");
      document.body.appendChild(canvasElement);
    }
    this.canvas = canvasElement;
    this.context = this.canvas.getContext('2d');
    this.fullWindow = fullWindow;

    this.onWindowResizeHandler = this.onWindowResizeHandler.bind(this);
  }
  
  /**
   * @return {Promise} a promise which resolves when the initialization is completed
   */
  init() {
    return new Promise((resolve) => {
      if( this.fullWindow ) {
        this.setSize( window.innerWidth, window.innerHeight );
        window.addEventListener("resize", this.onWindowResizeHandler);
      }
      resolve();
    });
  }

  /**
   * "Rewriting" some of the most useful context functions so that 
   * coding goes faster
   */

  /**
   * Applies a style to the fill - modifies the fillStyle property of the context
   * [https://developer.mozilla.org/fr/docs/Web/API/CanvasRenderingContext2D/fillStyle]
   * 
   * @param {string} style style to be applied - can be color / gradient / pattern 
   */
  fillStyle( style ) {
    this.context.fillStyle = style;
  }

  /**
   * Applies a style to the stroke - modifies the strokeStyle property of the context
   * [https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle]
   * 
   * @param {string} style style to be applied - can be color / gradient / pattern 
   */
  strokeStyle( style ) {
    this.context.strokeStyle = style;
  }

  /**
   * Calls the context.fillRect with passed params 
   * 
   * @param {number} x the top-left corner x coordinate
   * @param {number} y the top-left y coordinate
   * @param {number} width width of the rectangle
   * @param {number} height height of the rectangle
   */
  rect( x, y, width, height ) {
    this.context.fillRect.apply( this.context, arguments );
  }

  /**
   * You can either draw the arc alone, therefore addToPath has to be set to false, or
   * you can add it to the path
   * 
   * @param {number} x the x coordinate of the arc's center
   * @param {number} y the y coordinate of the arc's center
   * @param {number} radius the radius of the arc
   * @param {number} startAngle The angle at which the arc starts, measured clockwise from the positive x axis and expressed in radians.
   * @param {number} endAngle The angle at which the arc ends, measured clockwise from the positive x axis and expressed in radians.
   * @param {?boolean} addToPath if the arc is part of a path or is lonely
   * @param {?boolean} anticlockwise if true, causes the arc to be drawn counter-clockwise between the two angles. By default it is drawn clockwise.
   */
  arc( x, y, radius, startAngle, endAngle, anticlockwise = false, addToPath = false ) {
    if( !addToPath ) { this.context.beginPath(); }
    this.context.arc( x, y, radius, startAngle, endAngle, anticlockwise );
  }

  /**
   * Adds a point to the path. If a path has not been started, create one
   * 
   * @param {number} x the x coordinate of the point
   * @param {number} y the y coordinate of the point
   */
  addPoint( x, y ) {
    if( !this.pathStarted ) {
      this.context.beginPath();
      this.context.moveTo(x,y);
      this.pathStarted = true;
    } else {
      this.context.lineTo(x,y);
    }
  }

  /**
   * Draws the active path 
   * Calls the context.stroke() method 
   * 
   * @param {?boolean} closed if the path needs to be closed before drawing it
   */
  stroke( closed = false ) {
    if( closed ) this.context.closePath();
    this.context.stroke();
    this.pathStarted = false;
  }

  /**
   * Fills the active path
   * Calls the context.fill() method
   * 
   * @param {?boolean} closed if the path needs to be closed before filling it
   */
  fill( closed = false ) {
    if( closed ) this.context.closePath();
    this.context.fill();
    this.pathStarted = false;
  }

  /**
   * The drawing state gets saved 
   * Calls context.save()
   */
  save() {
    this.context.save();
  }

  /**
   * The previously saved context gets restored
   * Calls context.restore()
   */
  restore() {
    this.context.restore();
  }

  /**
   * Clears the whole canvas from top left corner (0;0) to bottom 
   * right corner (canvas.width, canvas.height)
   */
  clearAll() {
    this.context.clearRect( 0, 0, this.canvas.width, this.canvas.height );
  }

  /**
   * The handler called when window is begin resized 
   */
  onWindowResizeHandler() {
    this.setSize( window.innerWidth, window.innerHeight );
  }

  /**
   * Sets the canvas width and height 
   * 
   * @param {number} width the width, in px
   * @param {number} height the height, in px
   */
  setSize( width, height ) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}


export { Canvas };