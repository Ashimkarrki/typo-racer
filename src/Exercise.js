// const fun = (arg) => {
//   console.log("argument is ", arg);
// };
// const wrapper = (y) => {
//   const x = 20;
//   y(x);
// };

// wrapper(fun);

// Outer function
function outer() {
  let arr = [];
  let i;
  for (i = 0; i < 4; i++) {
    // storing anonymous function
    arr[i] = function () {
      return i;
    };
  }

  // returning the array.
  return arr;
}

let get_arr = outer();

console.log(get_arr[0]());
console.log(get_arr[1]());
console.log(get_arr[2]());
console.log(get_arr[3]());
