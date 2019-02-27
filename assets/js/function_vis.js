var canvasWidth = 600;
var canvasHeight = 400;
var transX = canvasWidth*0.5;
var transY = canvasHeight*0.5;
var coordScale = 50;
var val = 0;

// Get element by class.
function getElementsByClassName(node,classname) {
  if (node.getElementsByClassName) { // use native implementation if available
    return node.getElementsByClassName(classname);
  } else {
    return (function getElementsByClass(searchClass,node) {
        if ( node == null )
          node = document;
        var classElements = [],
            els = node.getElementsByTagName("*"),
            elsLen = els.length,
            pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)"), i, j;

        for (i = 0, j = 0; i < elsLen; i++) {
          if ( pattern.test(els[i].className) ) {
              classElements[j] = els[i];
              j++;
          }
        }
        return classElements;
    })(classname, node);
  }
}

// Function to calculate median.
function median(values){
    values.sort(function(a,b){
    return a-b;
  });

  if(values.length === 0) return 0

  var half = Math.floor(values.length / 2);

  if (values.length % 2)
    return values[half];
  else
    return (values[half - 1] + values[half]) / 2.0;
}

class Point {
  constructor(x, y) {
      this.x = x;
      this.y = y;
  }

  translateX(Tx) {
    return this.x + Tx;
  }

  translateY(Ty) {
    return this.y + Ty;
  }
}

// Direction coeff.
function getDirCoef(p1, p2) {
    return (p2.y - p1.y)/(p2.x - p1.x);
}

// Line Equation
function getLineEqPoint(p1, p2) {
    var m = getDirCoef(p1, p2);
    return new Point(m, (-m * p1.x) + p1.y);
}

//Get random float between two numbers
function randFloatBetween(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

// Megiddo's function inside the set.
function megiddo_f(a, b, lambda) {
  return (b * lambda + a);
}

// Returns function that takes 1 argument.
function get_megiddo_f(a, b) {
  return function(lambda) {
    return (b * lambda + a);
  }
}

// Calculate Critical Point
function megiddo_f_intersect(a_1, b_1, a_2, b_2) {
  if(!((b_1 - b_2) == 0)) {
    var lambda = (a_2 - a_1)/ (b_1 - b_2);
    var f_y = megiddo_f(a_1, b_1, lambda);

    return (new Point(lambda, f_y));
  } else {
    return null;
  }
}

// Actually plot megiddo's function for x € [min_range, max_range]
function plot_megiddo_f(sketch, min_range, max_range, a, b) {
  sketch.line(min_range,
              megiddo_f(a, b, min_range),
              max_range,
              megiddo_f(a, b, max_range));
}

// Plot big function F over range [min_range, max_range] with stepsize.
function plot_megiddo_F(sketch, min_range, max_range, set) {
  var stepsize = 80;
  var steps = (max_range - min_range)/stepsize;
  var n = set.length;
  var f_values = new Array(steps);

  var step = 0;
  for(var lambda = min_range; lambda < max_range; lambda = lambda + stepsize) {
    var points = new Array(n);
    for(var i = 0; i < n; i++) {
      f_i = set[i];
      points[i] = f_i(lambda);
    }
    // console.log(points);
    // console.log(median(points));
    f_values[step] = median(points);
    step++;
  }

  // Draw lines for values in f_values
  var step = 0;
  var points = new Array(steps);
  for(var lambda = min_range; lambda < max_range; lambda = lambda + stepsize) {
    sketch.line(lambda,
                f_values[i],
                (lambda+stepsize),
                f_values[i+1]);
    points[step] = new Point(lambda, f_values[i]);
    step++;
  }

  console.log(points);
}


// Initialise origin.
var origin = new Point(0,0);

// Show instances on screen
window.addEventListener('load', function () {

  // First function visualisation canvas
  var vis_1 = function(sketch) {
    sketch.setup = function() {
      sketch.createCanvas(canvasWidth, canvasHeight);
    };
    sketch.draw = function() {
      // document.getElementById('preliminary').attribute

      // Map to negatives
      var a_1 = document.getElementById('a_1_slider_1').value - 10;
      var a_2 = document.getElementById('a_2_slider_1').value - 10;
      var b_1 = document.getElementById('b_1_slider_1').value;
      var b_2 = document.getElementById('b_2_slider_1').value;

      var canvas = document.getElementById('defaultCanvas0');
      var context = canvas.getContext('2d');

      // Set background color to page color.
      sketch.background(249, 249, 251);

      // Translate & Flip Canvas
      context.translate(transX, transY);
      context.scale(1 * coordScale, -1 * coordScale);

      // Draw Axis
      sketch.strokeWeight(0.02);
      sketch.noFill();
      sketch.stroke(120,120,120);
      sketch.line(origin.x, canvasHeight/2, origin.x, -canvasHeight/2); // Y axis
      sketch.line(-canvasWidth/2, origin.y, canvasWidth/2, origin.y); // X axis

      // Plot functions
      sketch.strokeWeight(0.035);
      sketch.stroke(247,123,107);
      plot_megiddo_f(sketch, -20, 20, a_1, b_1);
      plot_megiddo_f(sketch, -20, 20, a_2, b_2);

      // Plot Intersection
      var intersection = megiddo_f_intersect(a_1, b_1, a_2, b_2);
      if(intersection) {
        sketch.fill(20);
        sketch.noStroke();
        sketch.ellipse(intersection.x, intersection.y, 0.1, 0.1)
      }

    };
    sketch.frameRate(10);
  };

  // Second function visualisation canvas.
  var vis_2 = function(sketch) {

    // Initialise slider values
    var a_min = Number(document.getElementById('a_1_slider_2').value - 10);
    var a_max = Number(document.getElementById('a_2_slider_2').value - 10);
    var b_min = Number(document.getElementById('b_1_slider_2').value);
    var b_max = Number(document.getElementById('b_2_slider_2').value);
    var n = document.getElementById('n_slider_2').value;

    var functionSet = new Array(n);

    // Calculate the set for F.
    function calculateFunctions() {
        for (var i = 0; i < n; i++) {
          var a = randFloatBetween(a_min, a_max);
          var b = randFloatBetween(b_min, b_max);
          functionSet[i] = get_megiddo_f(a, b);
        }
    }

    // Initialise set for F
    calculateFunctions();

    // Add event handlers for when slider values change.
    var elements = getElementsByClassName(document, "range-2"), n = elements.length;

    for (var i = 0; i < n; i++) {
      var e = elements[i];
      e.addEventListener("mouseup", function(e){
        var srcId = e.srcElement.id;
        var srcVal = Number(e.srcElement.value);

        if(srcId == "a_1_slider_2") {
          a_min = srcVal - 10;
        } else if (srcId == "a_2_slider_2"){
          a_max = srcVal - 10;
        } else if (srcId == "b_1_slider_2") {
          b_min = srcVal;
        } else if (srcId == "b_2_slider_2") {
          b_max = srcVal;
        } else if (srcId == "n_slider_2") {
          n = srcVal;
        }
        console.log(a_min, a_max, b_min, b_max, n );
        calculateFunctions();
      });
    }

    sketch.setup = function() {
      sketch.createCanvas(canvasWidth, canvasHeight);
      sketch.frameRate(0.5);
    };

    sketch.draw = function() {

      localScale = 1;
      var canvas = document.getElementById('defaultCanvas1');
      var context = canvas.getContext('2d');

      // Set background color to page color.
      sketch.background(249, 249, 251);

      // Translate & Flip Canvas
      context.translate(transX, transY);
      context.scale(1 * localScale, -1 * localScale);

      // Draw Axis
      sketch.strokeWeight(0.5);
      sketch.noFill();
      sketch.stroke(120,120,120);
      sketch.line(origin.x, canvasHeight/2, origin.x, -canvasHeight/2); // Y axis
      sketch.line(-canvasWidth/2, origin.y, canvasWidth/2, origin.y); // X axis

      // Plot functions
      sketch.strokeWeight(0.5);
      sketch.stroke(247,123,107);

      plot_megiddo_F(sketch, -400, 400, functionSet);
    };
  };

  // Attach sketches to DOM.
  var myp5_1 = new p5(vis_1, document.getElementById('func-vis-1'));
  var myp5_2 = new p5(vis_2, document.getElementById('func-vis-2'));

}, false);
