// Show instances on screen
window.addEventListener('load', function () {

  // Adjacency matrix A
  const A = [
    [0, 1, 0, 0, 0],
    [1, 0, 1, 0, 1],
    [0, 0, 0, 1, 0],
    [1, 0, 1, 0, 0],
    [1, 1, 0, 0, 0],
  ];

  const Test = [
    [0, 1, 0, 0, 0],
    [1, 0, 1, 0, 1],
    [0, 0, 0, 1, 0],
    [1, 0, 1, 0, 0],
    [1, 1, 0, 0, 0],
  ];

  // Cost matrix C
  const C = [
    [0, 8, 0, 0, 0],
    [3, 0, 9, 0, 4],
    [0, 0, 0, 7, 0],
    [2, 0, 1, 0, 0],
    [6, 11, 0, 0, 0],
  ];

  // Time matrix T
  const T = [
    [0, 3, 0, 0, 0],
    [1, 0, 4, 0, 1],
    [0, 0, 0, 2, 0],
    [3, 0, 1, 0, 0],
    [2, 9, 0, 0, 0],
  ];

  // Example in visualisation 2.
  const X_ex = [
    [0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ];

  // Example for visualisation 4.
  const A_4 = [
    [0, 1, 1, 1],
    [1, 0, 1, 1],
    [1, 1, 0, 1],
    [1, 1, 1, 0],
  ];

  const C_4 = [
    [0, 1, 11, 4],
    [4, 0, 5, 7],
    [9, 4, 0, 3],
    [8, 9, 2, 0],
  ];

  const T_4 = [
    [0, 3, 5, 2],
    [8, 0, 1, 6],
    [3, 9, 0, 5],
    [3, 7, 1, 0],
  ];

  // Check if node has no incoming / outgoing nodes.
  // Returns sorted list of nodes that are lonely.
  function check_lonely_nodes(M) {
    var column_sums = new Array(M.length).fill(0);
    var row_sums = new Array(M.length).fill(0);
    var empty_nodes = [];

    for(var i = 0; i < M.length; i++) {
      for(var j = 0; j < M.length; j++) {
        row_sums[i] += M[i][j];
        row_sums[j] += M[i][j];
      }
    }

    // Check for which i both column_sums and row_sums are 0.
    for(var i = 0; i < M.length; i++) {
      if((column_sums[i] == 0) && (row_sums[i] == 0)) {
        empty_nodes.push(i);
      }
    }
    return empty_nodes;
  }

  function binarySearch (list, value) {
    // initial values for start, middle and end
    var start = 0
    var stop = list.length - 1
    var middle = Math.floor((start + stop) / 2)

    // While the middle is not what we're looking for and the list does not have a single item
    while (list[middle] !== value && start < stop) {
      if (value < list[middle]) {
        stop = middle - 1
      } else {
        start = middle + 1
      }

      // recalculate middle on every iteration
      middle = Math.floor((start + stop) / 2)
    }

    // if the current middle item is what we're looking for return it's index, else return -1
    return (list[middle] !== value) ? -1 : middle
  }

  // Combines checking for lonely nodes & unique pushes to visualised elements.
  function cyPush(idx, element, target, considered, matrix) {
    // Vertex already added?
    if(considered[idx] == 0 ) {
      // Check if the vertex has ingoing/outgoing edges
      if(binarySearch(check_lonely_nodes(matrix), idx) == -1) {
        target.push(element);
      }
      considered[idx] = 1;
    }
  }

  function matrices_to_cyt(adj_matrix, cost_matrix, time_matrix) {
    // Elements combines vertices and edges.
    var elements = [];
    var considered_vertices = new Array(adj_matrix.length).fill(0);
    for(var i = 0; i < adj_matrix.length; i++) {
      for(var j = 0; j < adj_matrix.length; j++) {
        var i_str = String(i);
        var j_str = String(j);
        var idx_str = '[' + i_str + ',' + j_str + ']'
        var cost_str = String(cost_matrix[i][j]);
        var time_str = String(time_matrix[i][j]);

        cyPush(i, {data:{id: i_str}}, elements, considered_vertices, adj_matrix);
        cyPush(j, {data:{id: j_str}}, elements, considered_vertices, adj_matrix);

        if(adj_matrix[i][j] == 1) {
          elements.push({
            data: {
              id: i_str + j_str,
              source: i_str,
              target: j_str,
              label_text: 'C'+idx_str+'='+cost_str+', T'+ idx_str+'='+time_str
            }
          })
        }
      }
    }
    return elements;
  }

  let cy1 = cytoscape({
    container: document.getElementById('graph-vis-1'),
    elements: matrices_to_cyt(A, C, T),
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(id)',
          "text-valign": "center",
          "text-halign": "center",
           "color": "#FFF",
        }
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'edge-text-rotation': 'autorotate',
          'text-margin-y': -13,
          'width': 2,
          'line-color': '#ccc',
          'label': 'data(label_text)',
          //'target-arrow-color': '#ccc',
          "text-valign": "top",
          'target-arrow-shape': 'triangle'
        }
      },
      {
        selector: ':active',
        style: {
          'overlay-opacity': 0
        }
      }
    ],
    layout: {
      name: 'concentric',
      fit: true,
      padding: 40,
      minNodeSpacing: 200,
    }
  });

  let cy2 = cytoscape({
    container: document.getElementById('graph-vis-2'),
    elements: matrices_to_cyt(X_ex, C, T),
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(id)',
          "text-valign": "center",
          "text-halign": "center",
           "color": "#FFF",
        }
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'edge-text-rotation': 'autorotate',
          'text-margin-y': -13,
          'width': 2,
          'line-color': '#ccc',
          'label': 'data(label_text)',
          "text-valign": "top",
          'target-arrow-shape': 'triangle'
        }
      },
      {
        selector: ':active',
        style: {
          'overlay-opacity': 0
        }
      }
    ],
    layout: {
      name: 'concentric',
      fit: true,
      padding: 40,
      minNodeSpacing: 200,
    }
  });

  let cy3 = cytoscape({
    container: document.getElementById('graph-vis-3'),
    elements: matrices_to_cyt(A, C, T),
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(id)',
          "text-valign": "center",
          "text-halign": "center",
           "color": "#FFF",
        }
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'edge-text-rotation': 'autorotate',
          'text-margin-y': -13,
          'width': 2,
          'line-color': '#ccc',
          'label': 'data(label_text)',
          "text-valign": "top",
          'target-arrow-shape': 'triangle'
        }
      },
      {
        selector: ':active',
        style: {
          'overlay-opacity': 0
        }
      }
    ],
    layout: {
      name: 'concentric',
      fit: true,
      padding: 40,
      minNodeSpacing: 200,
    }
  });

  let cy4 = cytoscape({
    container: document.getElementById('graph-vis-4'),
    // elements: matrices_to_cyt(A_4, C_4, create_square_ones_matrix(C_4.length)),
    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(id)',
          "text-valign": "center",
          "text-halign": "center",
           "color": "#FFF",
        }
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'edge-text-rotation': 'autorotate',
          'text-margin-y': -11,
          'width': 2,
          'line-color': '#ccc',
          'label': 'data(label_text)',
          "text-valign": "top",
          'target-arrow-shape': 'triangle'
        }
      },
      {
        selector: ':active',
        style: {
          'overlay-opacity': 0
        }
      }
    ],
    elements: [
      {
        "data": {
          "id": "0"
        },
        "position": {
          "x": 250.71428571428564,
          "y": 255.93686889852268
        },
        "group": "nodes",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": ""
      },
      {
        "data": {
          "id": "1"
        },
        "position": {
          "x": 480.4917025300487,
          "y": 108.57142857142851
        },
        "group": "nodes",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": ""
      },
      {
        "data": {
          "id": "2"
        },
        "position": {
          "x": 252.14285714285722,
          "y": 494.0631311014774
        },
        "group": "nodes",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": ""
      },
      {
        "data": {
          "id": "3"
        },
        "position": {
          "x": 25.222583184236907,
          "y": 105.7142857142857
        },
        "group": "nodes",
        "removed": false,
        "selected": true,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": ""
      },
      {
        "data": {
          "id": "01",
          "source": "0",
          "target": "1",
          "label_text": "1/3 = 0.33"
        },
        "position": {
          "x": 0,
          "y": 0
        },
        style: {
          'line-color': '#0000FF',
          'target-arrow-color': '#0000FF',
        },
        "group": "edges",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": "",
      },
      {
        "data": {
          "id": "02",
          "source": "0",
          "target": "2",
          "label_text": "11/5 = 2.2"
        },
        "position": {
          "x": 0,
          "y": 0
        },
        "group": "edges",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": ""
      },
      {
        "data": {
          "id": "03",
          "source": "0",
          "target": "3",
          "label_text": "4/2 = 2"
        },
        "position": {
          "x": 0,
          "y": 0
        },
        "group": "edges",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": ""
      },
      {
        "data": {
          "id": "10",
          "source": "1",
          "target": "0",
          "label_text": "4/8 = 0.5"
        },
        "position": {
          "x": 0,
          "y": 0
        },
        style: {
          'line-color': '#0000FF',
          'target-arrow-color': '#0000FF',
        },
        "group": "edges",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": "",
      },
      {
        "data": {
          "id": "12",
          "source": "1",
          "target": "2",
          "label_text": "5/1 = 5"
        },
        "position": {
          "x": 0,
          "y": 0
        },
        "group": "edges",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": ""
      },
      {
        "data": {
          "id": "13",
          "source": "1",
          "target": "3",
          "label_text": "7/6 = 1.17"
        },
        "position": {
          "x": 0,
          "y": 0
        },
        "group": "edges",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": ""
      },
      {
        "data": {
          "id": "20",
          "source": "2",
          "target": "0",
          "label_text": "9/3 = 3"
        },
        "position": {
          "x": 0,
          "y": 0
        },
        "group": "edges",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": ""
      },
      {
        "data": {
          "id": "21",
          "source": "2",
          "target": "1",
          "label_text": "4/9 = 0.44"
        },
        "position": {
          "x": 0,
          "y": 0
        },
        "group": "edges",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": ""
      },
      {
        "data": {
          "id": "23",
          "source": "2",
          "target": "3",
          "label_text": "3/5 = 0.6"
        },
        "position": {
          "x": 0,
          "y": 0
        },
        "group": "edges",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": ""
      },
      {
        "data": {
          "id": "30",
          "source": "3",
          "target": "0",
          "label_text": "8/3 = 2.67"
        },
        "position": {
          "x": 0,
          "y": 0
        },
        "group": "edges",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": ""
      },
      {
        "data": {
          "id": "31",
          "source": "3",
          "target": "1",
          "label_text": "9/7 = 1.29"
        },
        "position": {
          "x": 0,
          "y": 0
        },
        "group": "edges",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": ""
      },
      {
        "data": {
          "id": "32",
          "source": "3",
          "target": "2",
          "label_text": "2/1 = 2"
        },
        "position": {
          "x": 0,
          "y": 0
        },
        "group": "edges",
        "removed": false,
        "selected": false,
        "selectable": true,
        "locked": false,
        "grabbable": true,
        "classes": ""}],
    layout: {
      name: 'preset'
    }
  });


  // Default options for every cytoscape graph.
  function setCyDefaults(cy) {
    cy.width(500);
    cy.height(500);
    cy.zoom(0.7);
    cy.center();
    cy.minZoom(0.5);
    cy.maxZoom(0.9);
  }

  // Set default cytoscape options.
  setCyDefaults(cy1);
  setCyDefaults(cy2);
  setCyDefaults(cy4);


  //f = parameterize(Test, C, T);

  // window.addEventListener("click", function() {
  //   console.log(cy4.json(true).elements);
  // });

}); // Page Load.
