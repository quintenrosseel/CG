function create_square_matrix(n) {
  let matrix = [];
  for(var i = 0; i < n; i++) {
      matrix[i] = new Array(n);
  }
  return matrix;
}

function create_square_ones_matrix(n) {
  let matrix = create_square_matrix(n);
  for(var i = 0; i < n; i++) {
    for(var j = 0; j < n; j++) {
        matrix[i][j] = 1;
    }
  }
  return matrix;
}

function clone_array(arr) {
    var i, copy;
    if(Array.isArray(arr)) {
        copy = arr.slice(0);
        for(i = 0; i < copy.length; i++) {
            copy[i] = clone_array(copy[i]);
        }
        return copy;
    } else if(typeof arr === 'object') {
        throw 'Cannot clone array containing an object!';
    } else {
        return arr;
    }
}

// Transform Adjacency matrix, cost matrix and time matrix into a matrix
// that can be used by the Floyd-Warshall algorithm.
function to_fw_matrix(adj_matrix, cost_matrix, time_matrix) {
  let fw_matrix = create_square_matrix(adj_matrix.length);
  for(var i = 0; i < adj_matrix.length; i++) {
    for(var j = 0; j < adj_matrix.length; j++) {
      // No self loops; 0s on the diagonal.
      if(i == j) {
        fw_matrix[i][j] = 0;
      } else if (adj_matrix[i][j] == 1) {
        fw_matrix[i][j] = (cost_matrix[i][j] / time_matrix[i][j]);
      } else {
        fw_matrix[i][j] = Infinity;
      }
    }
  }
  console.log("FW Matrix: ", fw_matrix);
  return fw_matrix;
}

// Deep copy of m matrix into dp and setup next matrix for path reconstruction.
function setup_fw(m, dp, next) {
  for(var i = 0; i < m.length; i++) {
    for(var j = 0; j < m.length; j++) {
      dp[i][j] = m[i][j];
      if(m[i][j] !== Infinity) {
        // By default, the next node that we want to go to is j by default.
        next[i][j] = j;
      }
    }
  }
}

// Run FW again and check if an improvement is possible.
// If there is, then there must be a negative cycle.
function negative_cycle_detector(dp, next, n) {
  // Get the shortest-distances matrix in O(n^3).
  for(var k = 0; k < n; k++) {
    for(var i = 0; i < n; i++) {
      for(var j = 0; j < n; j++) {
        if(dp[i][k] + dp[k][j] < dp[i][j]) {
          // Shorter path found: NEGATIVE CYCLE!
          dp[i][j] = -Infinity;
          next[i][j] = -1;
        }
      }
    }
  }
}

// Floyd warshall algorithm
// Uses Dynamic programming (it stores subsequent paths to get the shortest path)

// Adj_matrix: an Adjacency matrix that contains only 0 and 1s.
// cost_matrix: Cost matrix
// time_matrix: Time matrix
function floyd_warshall(adj_matrix, cost_matrix, time_matrix) {
  let m = to_fw_matrix(adj_matrix, cost_matrix, time_matrix);
  let n = adj_matrix.length;

  // Memory table that contains the APSP Solutions.
  let dp = create_square_matrix(n);

  // Used to reconstruct the SPs for each node.
  // Contains undefined vallues by default.
  let next = create_square_matrix(n);

  // Setup dp and next based on m.
  setup_fw(m, dp, next);

  // Get the shortest-distances matrix in O(n^3).
  for(var k = 0; k < n; k++) {
    for(var i = 0; i < n; i++) {
      for(var j = 0; j < n; j++) {
        if(dp[i][k] + dp[k][j] < dp[i][j]) {
          // Shorter path found: update APSP matrix.
          dp[i][j] = dp[i][k] + dp[k][j];

          // The shortest path is not node j anymore, but the shortest path
          // from [i][k].
          next[i][j] = next[i][k];
        }
      }
    }
  }
  negative_cycle_detector(dp, next, n);
  return [dp, next];
}

/*
Description:
  Reconstructs the shortest path between two nodes,
  given the dp matrix and next matrix of the floyd_warshall algorithm.
Return values:
  - Empty path: no shortest path from node start to end.
  - Null: a negative cycle path on the path from start to end.
    Non-empty path: a shortest path from node start to end.
*/
function reconstruct_path(start, end, dp, next) {
  let path = [];

  // No path exists.
  if(dp[start][end] == Infinity) {
    return path;
  }

  // Reconstruct path.
  let current = start;
  for(;current != end; current = next[current][end]){
    // Check if path lies on negative cycle.
    if(current == -1) {
      return null;
    } else {
      path.push(current);
    }
  }

  // Current == end: check if last stretch lies on negative cycle.
  if(next[current][end] == -1) {
    return null;
  } else {
    path.push(end);
  }

  return path;
}

/*
Description
  Represents the u_{ij}^{m}(t) function: Returns a function that gives
  the length of a shortest simple path from i to j, only using nodes 1 ... m - 1
Input:
  - Adjacency Matrix: X
  - Cost Matrix: A
  - Time Matrix: B
  - m: Upper bound of set of nodes {1 ... m-1}
Return Values:
  - function f(t, i, j) that returns the length of a shortest path between
    nodes

*/
function remove_edges_from_m(adj_matrix, m) {
  // Deepcopy of array.
  let new_adj_matrix = clone_array(adj_matrix);

  // Remove edges from m to X.length onwards such that only 1 .. m - 1 can be
  // can be used as intermediary nodes.
  for(var i = m; i < new_adj_matrix.length; i++) {
    // Remove any edge from and to m
    for(var j = 0; j < new_adj_matrix.length; j++) {
      new_adj_matrix[i][j] = 0;
      new_adj_matrix[j][i] = 0;
    }
  }
  return new_adj_matrix;
}

function construct_C(t, adj_matrix, cost_matrix, time_matrix) {
  C = clone_array(adj_matrix);
  for(var i = 0; i < cost_matrix.length; i++) {
    for(var j = 0; j < cost_matrix.length; j++) {
      C[i][j] = cost_matrix[i][j] - t * time_matrix[i][j];
    }
  }
  return C;
}

function parameterize(adj_matrix, cost_matrix, time_matrix, m) {
  let new_adj_matrix = remove_edges_from_m(adj_matrix, m);

  return function(i, j, t) {
    let C = construct_C(t, new_adj_matrix, cost_matrix, time_matrix);
    const ones = create_square_ones_matrix(cost_matrix.length);
    const res = floyd_warshall(new_adj_matrix, C, ones); // c_{ij}/1 = c_{ij}
    const dp = res[0];
    const next = res[1];
    const path = reconstruct_path(i, j, dp, next);
    console.log("The shortest path from vertex",
                i, "to",j,
                "when only using vertices in [0, "+String(m-1)+"] as intermediary nodes with t="+String(t)," is: ",
                path, " and has a value of: ", dp[i][j]);
    return path;
  }
}


// EOF
