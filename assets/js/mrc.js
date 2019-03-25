/*
  Helper Functions
*/
function create_square_matrix(n) {
  let matrix = [];
  for(var i = 0; i < n; i++) {
      matrix[i] = new Array(n);
  }
  return matrix;
}
function create_cube_matrix(n) {
  let matrix = [];
  for(var i = 0; i < n; i++) {
    matrix[i] = new Array(n);
    for(var j = 0; j < n; j++){
        matrix[i][j] = new Array(n);
    }
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

/*
Transform Adjacency matrix, cost matrix and time matrix into a matrix
that can be used by the Floyd-Warshall algorithm.
*/
function to_fw_matrix(adj_matrix, cost_matrix, time_matrix, detect_cycle) {
  let fw_matrix = create_square_matrix(adj_matrix.length);
  for(var i = 0; i < adj_matrix.length; i++) {
    for(var j = 0; j < adj_matrix.length; j++) {
      // No self loops; 0s on the diagonal.
      if(i == j) {
        if(detect_cycle) {
          fw_matrix[i][j] = Infinity;  // Shortest simple cycle solution.
        } else {
          fw_matrix[i][j] = 0;    // APSP Solution
        }
      } else if (adj_matrix[i][j] == 1) {
        fw_matrix[i][j] = (cost_matrix[i][j] / time_matrix[i][j]);
      } else {
        fw_matrix[i][j] = Infinity;
      }
    }
  }
  // console.log("FW Matrix: ", fw_matrix);
  return fw_matrix;
}

/*
 Deep copy of m matrix into dp and setup next matrix for path reconstruction.
*/
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

/*

Run FW again and check if an improvement is possible.
If there is, then there must be a negative cycle.

*/
function annotate_negative_cycles(dp, next) {
  // Get the shortest-distances matrix in O(n^3).
  for(var k = 0; k < dp.length; k++) {
    for(var i = 0; i < dp.length; i++) {
      for(var j = 0; j < dp.length; j++) {
        if(dp[i][k] + dp[k][j] < dp[i][j]) {
          // Shorter path found: NEGATIVE CYCLE!
          dp[i][j] = -Infinity;
          next[i][j] = -1;
        }
      }
    }
  }
}

/*
  Check if dp-matrix has a negative cycle.
  Same idea as annotate_negative_cycles.
*/
function has_negative_cycle(dp) {
  // Get the shortest-distances matrix in O(n^3).
  for(var k = 0; k < dp.length; k++) {
    for(var i = 0; i < dp.length; i++) {
      for(var j = 0; j < dp.length; j++) {
        if(dp[i][k] + dp[k][j] < dp[i][j]) {
          return true;
        }
      }
    }
  }
  return false;
}

/*
  Find the shortest cycle through a node w.r.t. distance function.
  given the FW results dp and next.
*/
function find_shortest_cycle(dp, next){
  let dp_local = clone_array(dp);
  let next_local = clone_array(next);

  // Identify negative cycles to avoid infinite loops.
  //annotate_negative_cycles(dp_local, next_local);
  // console.log("Non Annotated DP: ", dp_local);
  // console.log("Non Annotated Next: ", next_local);

  let max_idx;
  let max_val = -Infinity;
  for(var i = 0; i < dp.length; i++){
    if((dp_local[i][i] < 0) && (dp_local[i][i] > max_val)) { // Value should be below 0.
      max_idx = i;
      max_val = dp_local[i][i];
    }
  }

  // console.log("max idx: ", max_idx);
  return reconstruct_path(max_idx, max_idx, dp_local, next_local, true);
}

/* ADD TRESHOLD HERE TO AVOID INFINITE LOOPING? */
function find_zero_cycle(dp, next) {
  for(var i = 0; i < dp.length; i++) {
    if(dp[i][i] == 0) {
      let dp_local = clone_array(dp);
      let next_local = clone_array(next);

      // Identify negative cycles to avoid infinite looping.
      annotate_negative_cycles(dp_local, next_local);
      return reconstruct_path(start, end, dp_local, next_local, true);
    }
  }
  // No zero cycle
  return null;
}

/*
Floyd warshall algorithm
Uses Dynamic programming (it stores subsequent paths to get the shortest path)

Adj_matrix: an Adjacency matrix that contains only 0 and 1s.
Cost_matrix: Cost matrix
Time_matrix: Time matrix
*/
function floyd_warshall(adj_matrix, cost_matrix, time_matrix, detect_cycle) {
  let m = to_fw_matrix(adj_matrix, cost_matrix, time_matrix, detect_cycle);
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
function reconstruct_path(start, end, dp, next, detect_cycle) {
  let path = [];

  // No path exists.
  if(dp[start][end] == Infinity) {
    return path;
  }

  // Reconstruct path.
  let current = start;
  let start_vertex;
  if(detect_cycle) {
    start_vertex = true;
  } else {
    start_vertex = false;
  }
  for(;(current != end || start_vertex); current = next[current][end]){
    start_vertex = false;
    // console.log("Going from node " + String(current) + " to node " + String(next[current][end]));
    // Check if path lies on negative cycle or if there exist no path.
    if(current == -1 || current == undefined) {
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
function remove_edges_from_m(adj_matrix, m, i, j) {
  // Deepcopy of array.
  let new_adj_matrix = clone_array(adj_matrix);

  // Remove edges from m to X.length onwards such that only 1 .. m - 1 can be
  // can be used as intermediary nodes.
  for(var k = m; k < new_adj_matrix.length; k++) {
    // Remove any edge from and to m
    for(var l = 0; l < new_adj_matrix.length; l++) {
        if(!((k == j || k == i ) && (l == j || l == i ))) {
          new_adj_matrix[k][l] = 0;
          new_adj_matrix[l][k] = 0;
        }
    }
  }
  return new_adj_matrix;
}

/*
  Create a matrix C where each c_ij = a_ij - tb_ij
*/
function construct_C(t, adj_matrix, cost_matrix, time_matrix) {
  C = clone_array(adj_matrix);
  for(var i = 0; i < cost_matrix.length; i++) {
    for(var j = 0; j < cost_matrix.length; j++) {
      C[i][j] = cost_matrix[i][j] - t * time_matrix[i][j];
    }
  }
  return C;
}

/*
Returns APSP matrix.
Set detect_cycle to false if you want to detect APSP with d_ii = 0 when using reconstruct_path
Set detect_cycle true to enbable shortest cycle through node with d_ii != 0 when using reconstruct_path.
*/
function parameterize(adj_matrix, cost_matrix, time_matrix, detect_cycle) {
  return function(t) {
    let C = construct_C(t, adj_matrix, cost_matrix, time_matrix);
    const ones = create_square_ones_matrix(cost_matrix.length);
    const res = floyd_warshall(adj_matrix, C, ones, detect_cycle); // c_{ij}/1 = c_{ij}
    const dp = res[0];
    const next = res[1];

    /*
    if(reconstruct) {
       const path = reconstruct_path(i, j, dp, next, detect_cycle);
    }

    if(detect_cycle) {
      console.log("The shortest cycle from vertex",
                  i, "to",j,
                  "when only using vertices in [0, "+String(m-1)+"] as intermediary nodes with t="+String(t)," is: ",
                  path, " and has a value of: ", dp[i][j]);
    } else {
      console.log("The shortest path from vertex",
                  i, "to",j,
                  "when only using vertices in [0, "+String(m-1)+"] as intermediary nodes with t="+String(t)," is: ",
                  path, " and has a value of: ", dp[i][j]);
    }
    return path;
*/
    return [dp, next];
  }
}

/*
Return u_ij all-shortest-pair-paths matrix and dp-array for reconstructing paths.
*/
function u_matrix(adj_matrix, cost_matrix, time_matrix, i, j, m) {
  let adj_matrix_m = remove_edges_from_m(adj_matrix, m, i, j);
  return parameterize(adj_matrix_m, cost_matrix, time_matrix, false);
}

/*
  Return the linear root of a linear function within a range.
  Result returned should be smaller then max_range, otherwise no solution
  is returned.
*/
function linear_root(f, min_range, max_range){

  // Calculate intersection of f with x-axis.
  const p1 = new Point(min_range, f(min_range));
  const p2 = new Point(max_range, f(max_range));
  const x1 = new Point(min_range, 0);
  const x2 = new Point(max_range, 0);

  const intersect = linear_intersection(p1, p2, x1, x2);
  if(intersect && (intersect.x <= max_range)) {
    return intersect;
  } else {
    return null;
  }
}

/*
Figure out linear root for t in [-min_range, 0[ UNION ]0, max_range] domain.
If there are multiple solutions, null is returned.
*/
function piecewise_linear_root(f, breakpointX, min_range, max_range) {
  let root;
  let root_min = linear_root(f, min_range, breakpointX);
  let root_max = linear_root(f, breakpointX, max_range);

  // Both parts have linear root.
  if(root_min && root_max) {
    if(root_min == root_max) {
      return root_min;
    } else {
      return null;
    }
  } else if(root_min) {
      return root_min;
  } else if(root_max) {
      return root_max;
  } else {
    return null;
  }
}

/*
  Create empty 3d dictionary where each value is null.
*/
function create_3d_dict(len) {
  let dict = [];
  for(var k = 0; k < len; k++){

    for(var l = 0; l < len; l++){
      for(var m = 0; m < len; m++){

      }
    }
  }
}

/*
Get the MRC usin parameterization.
*/
function mrc(adj_matrix, cost_matrix, time_matrix) {
  // Implements step 0 of algorithm: initialise.
  let e = -Infinity;
  let f = Infinity;
  let i = j = m = 0;
  let n = adj_matrix.length - 1;
  let u_memoize = create_cube_matrix(n+1); // Nesting: m -> i -> j. Contains minimization functions.
  let mrc;
  /*
  let u_ij;
  let u_im;
  let u_mj;
  */

  // Implements step 1 of algorithm: solve for t in: u_ij - i_im - i_mj = 0
  function solve_for_t() {
    //console.log("Solving for t with i = " + String(i) + ", j = " + String(j) + ", m = " + String(m) + ".");
    //console.log("The current search interval is [" + String(e) + ", " + String(f) + "].");
    let u_ij = function(t, m, i, j) {
      // Check if matrix was set by step 3 (update_apsp)
      if(m > 0 && u_memoize[m][i][j]) {
        //console.log("Using the memoization! ");
        //return u_memoize[m][i][j](t); // Use memoized value.
        return u_memoize[m][i][j](t, m, i, j);
      } else {
        let apsp = u_matrix(adj_matrix, cost_matrix, time_matrix, i, j, m);
        let apsp_matrix = apsp(t)[0];
        return apsp_matrix[i][j];
      }
    }
    let u_im = function(t, m, i, j) {
      let apsp = u_matrix(adj_matrix, cost_matrix, time_matrix, i, j, m);
      let apsp_matrix = apsp(t)[0];
      return apsp_matrix[i][m];
    }
    let u_mj = function(t, m, i, j) {
      let apsp = u_matrix(adj_matrix, cost_matrix, time_matrix, i, j, m);
      let apsp_matrix = apsp(t)[0];
      return apsp_matrix[m][j];
    }
    let lhs  = function(t) {
      // let current_i = i;
      // let current_j = j;
      // let current_m = m;
      // Pass the global t, m, i, j variables.
      return(u_ij(t, m, i, j) - u_im(t, m, i, j) - u_mj(t, m, i, j));
    }
    let t_prime_p = piecewise_linear_root(lhs, 0, -80, 80); // t'
    if(t_prime_p){  // Unique solution: go to step 3.
      // console.log("Unique solution found: ", t_prime_p.x);
      return check_cycles(t_prime_p.x);
    } else {      // Infinite amount of solutions: go to step 4.
      // console.log("No solution found, updating parameters. ");
      return update_parameters();
    }
  }

  // Implements step 2 of the algorithm.
  function check_cycles(t) {
    // Construct solution with parameter t.
    let current_adj_matrix = remove_edges_from_m(adj_matrix, m, i, j);
    let apsp_cycles = parameterize(current_adj_matrix, cost_matrix, time_matrix, true);

    // cycle_matrices[0] = Matrix with distances.
    // cycle_matrices[1] = Path reconstruction matrix.
    let cycle_matrices = apsp_cycles(t);
    //console.log("Checking negative cycles with: ", cycle_matrices[0]);
    let negative_cycle = has_negative_cycle(cycle_matrices[0]);
    let zero_cycle = find_zero_cycle(cycle_matrices[0], cycle_matrices[1]);

    if(!negative_cycle && zero_cycle) {
      //console.log("No negative cycle and zero cycle found. ");
      // If there is a zero cycle and no negative cycle, terminate with the zero cycle as minimum ratio cycle.
      return find_zero_cycle(t, adj_matrix, cost_matrix, time_matrix);
    } else if(negative_cycle) {
      //console.log("Negative cycle found, updating upper bound with: ", t);
      // If there is a negative cycle, update the upperbound f of the search interval to t′.

      f = t;
      return update_apsp(t);
    } else {
      // console.log("No negative cycles found, updating lower bound with: ", t);
      // If all cycles are positive, update the lowerbound e of the search interval to t′.
      e = t;
      return update_apsp(t);
    }
  }

  // Implements step 3 of the algorithm.
  function update_apsp(t) {
    if((m + 1) <= n) {
      // Closure with current snapshot of scope.
      /*
      let current_i = i;
      let current_j = j;
      let current_m = m;
  */

      let u_ij = function(t, m, i, j) {
        let apsp = u_matrix(adj_matrix, cost_matrix, time_matrix,
                            i, j, m);
        let apsp_matrix = apsp(t)[0];
        return apsp_matrix[i][j];
      }
      let u_im = function(t, m, i, j) {
        let apsp = u_matrix(adj_matrix, cost_matrix, time_matrix,
                            i, j, m);
        let apsp_matrix = apsp(t)[0];
        return apsp_matrix[i][m];
      }
      let u_mj = function(t, m, i, j) {
        let apsp = u_matrix(adj_matrix, cost_matrix, time_matrix,
                            i, j, m);
        let apsp_matrix = apsp(t)[0];
        return apsp_matrix[m][j];
      }

      // let rhs = (u_im(t, current_m, current_i, current_j) +
      //            u_mj(t, current_m, current_i, current_j));

      u_memoize[m+1][i][j] = function(t, m, i, j) {
        let rhs = (u_im(t, m, i, j) +
                   u_mj(t, m, i, j));
        return Math.min(u_ij(t, m, i, j), rhs);
      }
    }
    // Go to next step. (Step 4)
    return update_parameters();
  }

  // Implements step 4 of the algorithm.
  function update_parameters() {
    if(j < n) {
      j += 1;
      // Go back to step 1:
      return solve_for_t();
    } else if(j == n && i < n) {
      i += 1;
      // Go back to step 1:
      return solve_for_t();
    } else if((i == j) && (j == n) && m < n) {
      i = j = 1;
      m += 1;
      return solve_for_t();
    } else if((i == j) && (j == n) && (m == n)) {
      // Go to step 5;
      return find_k();
    }
  }

  // Implements step 5 of the algorithm. (Terminates)
  function find_k() {
    // console.log("Finding k.");
    let apsp_cycles = parameterize(adj_matrix, cost_matrix, time_matrix, true);
    let apsp_matrices;

    // Pick max range.
    if(f == Infinity && e == -Infinity){
      let num = randFloatBetween(-20, 20);
      apsp_matrices = apsp_cycles(num);
    } else if(f == Infinity && e > -Infinity){
      let num = randFloatBetween(e, 20);
      apsp_matrices = apsp_cycles(num);
    } else {
      // F is not infinity, use upper limit of range.
      apsp_matrices = apsp_cycles(f);
    }
    return find_shortest_cycle(apsp_matrices[0], apsp_matrices[1]);
  }

  // Start algorithm.
  return solve_for_t();
}
