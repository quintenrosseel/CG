function create_square_matrix(ref, n) {
  for(var i = 0; i < n; i++) {
      ref[i] = new Array(n);
  }
}


// Transform Adjacency matrix, cost matrix and time matrix into a matrix
// that can be used by the Floyd-Warshall algorithm.
function to_fw_matrix(adj_matrix, cost_matrix, time_matrix) {

  let fw_matrix = [];
  create_square_matrix(fw_matrix, adj_matrix.length);

  let count = 0;
  for(var i = 0; i < adj_matrix.length; i++) {
    //console.log(i);
    for(var j = 0; j < adj_matrix.length; j++) {
      // No self loops; 0s on the diagonal.
      fw_matrix[i][j] = count;
      count++;
      if(i == j) {
        fw_matrix[i][j] = 0;
      } else if (adj_matrix[i][j] == 1) {
        fw_matrix[i][j] = (cost_matrix[i][j] / time_matrix[i][j]);
      } else {
        fw_matrix[i][j] = Infinity;
      }
    }
  }
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
function negative_cycle_detector(dp, n) {
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
function floyd_warshall(adj_matrix, cost_matrix, time_matrix) {
  let m = to_fw_matrix(adj_matrix, cost_matrix, time_matrix);
  let n = adj_matrix.length;

  // Memory table that contains the APSP Solutions.
  let dp = [];
  create_square_matrix(dp, n);

  // Used to reconstruct the SPs for each node.
  // Contains undefined vallues by default.
  let next = [];
  create_square_matrix(next, n);

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
  negative_cycle_detector();
  return [dp, next];
}

// Reconstructs the shortest path between two nodes, given the dp matrix and next
// matrix of the floyd_warshall algorithm.


// Return values:
// Empty path: no shortest path from node start to end.
// Null: a negative cycle path on the path from start to end.
// Non-empty path: a shortest path from node start to end.
function reconstruct_paths(start, end, dp, next) {
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
