let A_4;
let C_4;
let T_4;

// Global vars.
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
var canvasWidth = 600;
var canvasHeight = 400;
var transX = canvasWidth*0.5;
var transY = canvasHeight*0.5;
var coordScale = 50;
var val = 0;
var origin = new Point(0,0);

// Get element by class.
function getElementsByClassName(node, classname) {
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

//Get random int between two numbers
function randIntBetween(min, max) {
  return Math.floor((Math.random() * max) + min);
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

function slope(p1, p2) {
  let slope;
  if((p2.x - p1.x) != 0) {
    slope = (p2.y - p1.y)/(p2.x - p1.x);
  } else {
    slope = 0;
  }
  return slope;
}

function linear_f(p1, p2) {
  return function (x) {
    const m = slope(p1, p2);
    return (m * x) - (m * p1.x) + p1.y;
  }
}

function linear_intersection(f1_p1, f1_p2, f2_p1, f2_p2) {
  const m1 = slope(f1_p1, f1_p2);
  const f1 = linear_f(f1_p1, f1_p2);
  const m2 = slope(f2_p1, f2_p2);

  // Check if there is a difference in slope. (No infinity number of solutions)
  if((m1 - m2) != 0) {
    const x = (-m2 * f2_p1.x + m1 * f1_p1.x - f1_p1.y + f2_p1.y)/(m1 - m2);
    const y = f1(x);
    return (new Point(x, y));
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
  var stepsize = 0.1;
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
    // console.log(points)

    f_values[step] = median(points);
    step++;
  }
  //console.log(f_values);
  // Draw lines for values in f_values
  var step = 0;
  var points = new Array(steps);
  for(var lambda = min_range; lambda < (max_range-1); lambda = lambda + stepsize) {
    sketch.line(lambda,
                f_values[step],
                (lambda+stepsize),
                f_values[step+1]);
    points[step] = new Point(lambda, f_values[step]);
    step++;
  }
}

function isInfinity(number) {
  return (number == Infinity) || (number == -Infinity);
}

// Show instances on screen
window.addEventListener('load', function () {

  // First function visualisation canvas
  var vis_1 = function(sketch) {
    // Sketch global vars.
    var a_1 = Number(document.getElementById('a_1_slider_1').value - 10);
    var a_2 = Number(document.getElementById('a_2_slider_1').value - 10);
    var a_3 = Number(document.getElementById('a_3_slider_1').value - 10);
    var b_1 = Number(document.getElementById('b_1_slider_1').value);
    var b_2 = Number(document.getElementById('b_2_slider_1').value);
    var b_3 = Number(document.getElementById('b_3_slider_1').value);

    let graph_a_1_label_i = document.getElementById('a_1_slider_1_label_i');
    let graph_a_2_label_i = document.getElementById('a_2_slider_1_label_i');
    let graph_a_3_label_i = document.getElementById('a_3_slider_1_label_i');
    let graph_b_1_label_i = document.getElementById('b_1_slider_1_label_i');
    let graph_b_2_label_i = document.getElementById('b_2_slider_1_label_i');
    let graph_b_3_label_i = document.getElementById('b_3_slider_1_label_i');

    var functionSet = new Array(3);

    // Fill functionSet
    function calculateFunctions() {
      functionSet[0] = get_megiddo_f(a_1, b_1);
      functionSet[1] = get_megiddo_f(a_2, b_2);
      functionSet[2] = get_megiddo_f(a_3, b_3);
    }

    // Recalculate function set only when needed. (When slider values change)
    var elements = getElementsByClassName(document, "range-1"), n = elements.length;
    for (var i = 0; i < n; i++) {
      var e = elements[i];
      e.addEventListener("pointerup", function(e){
        var srcId = e.srcElement.id;
        var srcVal = Number(e.srcElement.value);
        if(srcId == "a_1_slider_1") {
          a_1 = srcVal - 10;
          graph_a_1_label_i.innerHTML = String(srcVal - 10);
        } else if (srcId == "a_2_slider_1"){
          a_2 = srcVal - 10;
          graph_a_2_label_i.innerHTML = String(srcVal - 10);
        } else if (srcId == "a_3_slider_1"){
          a_3 = srcVal - 10;
          graph_a_3_label_i.innerHTML = String(srcVal - 10);
        } else if (srcId == "b_1_slider_1") {
          b_1 = srcVal;
          graph_b_1_label_i.innerHTML = String(srcVal);
        } else if (srcId == "b_2_slider_1") {
          b_2 = srcVal;
          graph_b_2_label_i.innerHTML = String(srcVal);
        } else if (srcId == "b_3_slider_1") {
          b_3 = srcVal;
          graph_b_3_label_i.innerHTML = String(srcVal);
        }

        // Refill function set upon change.
        calculateFunctions();
      });
    }

    // Initialise function set
    calculateFunctions();

    sketch.setup = function() {
      sketch.createCanvas(canvasWidth, canvasHeight);
      sketch.frameRate(10);
    };

    sketch.draw = function() {
      // document.getElementById('preliminary').attribute
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
      plot_megiddo_f(sketch, -20, 20, a_3, b_3);

      // Plot Megiddo's F
      sketch.noFill();
      sketch.stroke(88,187,238);
      plot_megiddo_F(sketch, -20, 20, functionSet);

      // Plot Intersection
      var intersection1 = megiddo_f_intersect(a_1, b_1, a_2, b_2);
      var intersection2 = megiddo_f_intersect(a_1, b_1, a_3, b_3);
      var intersection3 = megiddo_f_intersect(a_2, b_2, a_3, b_3);

      if(intersection1) {
        sketch.fill(20);
        sketch.noStroke();
        sketch.ellipse(intersection1.x, intersection1.y, 0.1, 0.1)
      }

      if(intersection2) {
        sketch.fill(20);
        sketch.noStroke();
        sketch.ellipse(intersection2.x, intersection2.y, 0.1, 0.1)
      }

      if(intersection3) {
        sketch.fill(20);
        sketch.noStroke();
        sketch.ellipse(intersection3.x, intersection3.y, 0.1, 0.1)
      }

    };
  };

  // Matrices for function plot.
  // Example for visualisation 4.
  A_4 = [
    [0, 1, 1, 1],
    [1, 0, 1, 1],
    [1, 1, 0, 1],
    [1, 1, 1, 0],
  ];
  C_4 = [
    [0, 1, 11, 4],
    [4, 0, 5, 7],
    [9, 4, 0, 3],
    [8, 9, 2, 0],
  ];
  T_4 = [
    [0, 3, 5, 2],
    [8, 0, 1, 6],
    [3, 9, 0, 5],
    [3, 7, 1, 0],
  ];

  // Cost of [0, 1, 0] == 12.5

  // const A_4 = [
  //   [0, 1, 1, 1],
  //   [1, 0, 1, 1],
  //   [1, 1, 0, 1],
  //   [1, 1, 1, 0],
  // ];
  // const C_4 = [
  //   [0, 30, 11, 4],
  //   [20, 0, 5, 7],
  //   [9, 4, 0, 3],
  //   [8, 9, 2, 0],
  // ];
  // const T_4 = [
  //   [0, 3, 5, 2],
  //   [8, 0, 1, 6],
  //   [3, 9, 0, 5],
  //   [3, 7, 1, 0],
  // ];

  // Second function visualisation canvas.
  var vis_2 = function(sketch) {
    const stepsize = 4;
    const minrange = -80;
    const maxrange = 80;
    const elements = getElementsByClassName(document, "range-2"); // All range elements for this vis.

    // Get slider values & Store Label ids.
    let graph_i = Number(document.getElementById('i_slider_2').value);
    let graph_j = Number(document.getElementById('j_slider_2').value);
    let graph_m = Number(document.getElementById('m_slider_2').value);
    let graph_i_label_i = document.getElementById('i_slider_2_label_i');
    let graph_j_label_i = document.getElementById('j_slider_2_label_i');
    let graph_m_label_i = document.getElementById('m_slider_2_label_i');

    // Remove edges that should not be considered by parameterization.
    let A_4_ij = remove_edges_from_m(A_4, graph_m, graph_i, graph_j);
    let A_4_im = remove_edges_from_m(A_4, graph_m, graph_i, graph_m);
    let A_4_mj = remove_edges_from_m(A_4, graph_m, graph_m, graph_j);

    // Parameterize without cycle detection, i.e. APSP.
    let f_ij = parameterize(A_4_ij, C_4, T_4, false);
    let f_im = parameterize(A_4_im, C_4, T_4, false);
    let f_mj = parameterize(A_4_mj, C_4, T_4, false);

    // console.log("A_4", A_4);
    // console.log("ij", clone_array(A_4_ij));
    // console.log("im", clone_array(A_4_im));
    // console.log("mj", clone_array(A_4_mj));

    // Construct arrays to plot functions.
    let f_ij_values = calculate_f_values(f_ij, graph_i, graph_j);
    let f_im_values = calculate_f_values(f_im, graph_i, graph_m);
    let f_mj_values = calculate_f_values(f_mj, graph_m, graph_j);

    // console.log("f_ij values", f_ij_values);
    // console.log("f_im values:", f_im_values);
    // console.log("f_mj values: ", f_mj_values);

    let f_rhs_values = f_im_values.map(function(el, i) {
      return el + f_mj_values[i];
    });

    // Attach event listener to all range sliders to update functions.
    for (var i = 0; i < elements.length; i++) {
      var e = elements[i];
      e.addEventListener("pointerup", function(e) {
        var srcId = e.srcElement.id;
        var srcVal = Number(e.srcElement.value);
        if(srcId == "i_slider_2") {
          graph_i = srcVal;
          graph_i_label_i.innerHTML = String(srcVal);
        } else if (srcId == "j_slider_2"){
          graph_j = srcVal;
          graph_j_label_i.innerHTML = String(srcVal);
        } else if (srcId == "m_slider_2") {
          graph_m = srcVal;
          graph_m_label_i.innerHTML = String(srcVal);
        }

        // Update arrays and functions.
        let A_4_ij = remove_edges_from_m(A_4, graph_m, graph_i, graph_j);
        let A_4_im = remove_edges_from_m(A_4, graph_m, graph_i, graph_m);
        let A_4_mj = remove_edges_from_m(A_4, graph_m, graph_m, graph_j);

        // console.log("A_4_mj: ", A_4_mj);
        // console.log("A_ij", A_4_ij);
        // console.log("A_im", A_4_im);
        // console.log("A_mj", A_4_mj);

        // Parameterize without cycle detection, i.e. APSP.
        let f_ij = parameterize(A_4_ij, C_4, T_4, false);
        let f_im = parameterize(A_4_im, C_4, T_4, false);
        let f_mj = parameterize(A_4_mj, C_4, T_4, false);



        // Recalculate function values.
        //console.log("ij values with m:", graph_m);
        f_ij_values = calculate_f_values(f_ij, graph_i, graph_j);

        //console.log("im values with m:", graph_m);
        f_im_values = calculate_f_values(f_im, graph_i, graph_m);

        //console.log("mj values with m:", graph_m);
        f_mj_values = calculate_f_values(f_mj, graph_m, graph_j);


        f_rhs_values = f_im_values.map(function(el, i) {
          return el + f_mj_values[i];
        });


        // 
        // console.log("i (" + String(graph_i)+") to j (" + String(graph_j) + "): ", f_ij_values,
        //             "i (" + String(graph_i)+") to m (" + String(graph_m) + "): ", f_im_values,
        //             "m (" + String(graph_m)+") to j (" + String(graph_j) + "): ", f_mj_values,
        //             "Sum of rhs (im, mj)", f_rhs_values);
      });
    }

    function calculate_f_values(f, start_vertex, end_vertex) {
      const steps = (maxrange - minrange)/stepsize;
      let f_values = new Array(steps);
      let step = 0;
      let apsp_matrix;

      // Calculate the f values.
      for(var t = minrange; t < maxrange; t = t + stepsize) {
        // Returns array of [dp, next]
        apsp_matrix = f(t)[0];
        // console.log(
        //   "APSP Matrix: ",
        //   apsp_matrix
        // )
        f_values[step] = apsp_matrix[start_vertex][end_vertex];
        step++;
      }

      // console.log("Matrix: ", apsp_matrix);
      // console.log(
      //   "Start vertex: ",
      //   start_vertex,
      //   "End Vertex: ",
      //   end_vertex,
      //   "Function Values: ",
      //   f_values
      // );
      return f_values;
    }

    function plot_f(values) {
      let step = 0;
      for(var t = minrange; t < (maxrange-1); t = t + stepsize) {
        if(!isInfinity(values[step]) && !isInfinity(values[step + 1]) &&
        !(values[step] == undefined) && !(values[step + 1] == undefined)) {
          sketch.line(t,
                      values[step],
                      (t+stepsize),
                      values[step+1]);
        }
        step++;
      }
    }

    sketch.setup = function() {
      sketch.createCanvas(canvasWidth, canvasHeight);
      sketch.frameRate(1);
    };
    sketch.draw = function() {
      localScale = 2;
      var canvas = document.getElementById('defaultCanvas1');
      var context = canvas.getContext('2d');

      // Set background color to page color.
      sketch.background(249, 249, 251);

      // Translate & Flip Canvas
      context.translate(transX, transY);
      context.scale(1 * localScale, -1 * localScale);

      // Draw Axis
      sketch.strokeWeight(0.25);
      sketch.noFill();
      sketch.stroke(120,120,120);
      sketch.line(origin.x, canvasHeight/2, origin.x, -canvasHeight/2); // Y axis
      sketch.line(-canvasWidth/2, origin.y, canvasWidth/2, origin.y); // X axis

      // Plot functions
      sketch.strokeWeight(0.75);
      sketch.stroke(247,123,107);

      // Plot function here. (draw sketch lines)
      plot_f(f_ij_values);

      sketch.stroke(0,0,255);

      // Plot function here. (draw sketch lines)
      plot_f(f_im_values);
      plot_f(f_mj_values);

      sketch.stroke(200,200,0);
      plot_f(f_rhs_values);

      /*
      const f1_p1_min = new Point(minrange, f_ij_values[0]);
      const f1_p2_min = new Point(minrange + stepsize, f_ij_values[1]);
      const f2_p1_min = new Point(minrange, f_rhs_values[0]);
      const f2_p2_min = new Point(minrange + stepsize, f_rhs_values[1]);

      const f1_p1_max = new Point(maxrange - stepsize,
                                  f_ij_values[f_ij_values.length - 2]);

      const f1_p2_max = new Point(maxrange,
                                  f_ij_values[f_ij_values.length - 1]);

      const f2_p1_max = new Point(maxrange - 2 * stepsize,
                                  f_rhs_values[f_rhs_values.length - 2]);

      const f2_p2_max = new Point(maxrange - stepsize,
                                  f_rhs_values[f_rhs_values.length - 1]);

      const intersection1 = linear_intersection(f1_p1_min,
                                                f1_p2_min,
                                                f2_p1_min,
                                                f2_p2_min);

      const intersection2 = linear_intersection(f1_p1_max,
                                                f1_p2_max,
                                                f2_p1_max,
                                                f2_p2_max);

      if(intersection1 && intersection1.x < 0) {
        //console.log(intersection1);
        sketch.fill(20);
        sketch.noStroke();
        sketch.ellipse(intersection1.x, intersection1.y, 2, 2)
      }

      if(intersection2 && intersection2.x > 0) {
        //console.log(intersection2);
        sketch.fill(20);
        sketch.noStroke();
        sketch.ellipse(intersection2.x, intersection2.y, 2, 2)
      }
*/
    };
  };

  // Attach sketches to DOM.
  var myp5_1 = new p5(vis_1, document.getElementById('func-vis-1'));
  var myp5_2 = new p5(vis_2, document.getElementById('func-vis-2'));

}, false);
