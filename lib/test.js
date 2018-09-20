import { Canvas } from './index';



let cvs = new Canvas(null,true);
cvs.init().then( () => {

  cvs.context.fillStyle = "red";

  cvs.addPoint( 20, 20 );
  cvs.addPoint( 40, 10 );
  cvs.addPoint( 50, 90 );
  cvs.stroke(true);

});