// 1. Function Expression 
const add = function (a, b) {
    return a + b;
};
console.log("Addition:", add(5, 3));


// 2. Callback Function 
function processNumber(num, callback) {
    return callback(num);
}

const square = function (x) {
    return x * x;
};
console.log("Square using callback:", processNumber(4, square));


// // 3. Event Handler 

// 4. Self-Invoking Function
(function () {
    console.log("IIFE executed immediately!");
});


// 5. Function Expression with Default Parameters
const greet = function (name = "Guest") {
    return "Hello, " + name;
};
console.log(greet());
console.log(greet("John"));


// 6. Function Expression with Rest Parameters
const sumAll = function (...numbers) {
    return numbers.reduce(function (total, num) {
        return total + num;
    }, 0);
};
console.log("Sum of all:", sumAll(1, 2, 3, 4));
// 7. Anonymous Function inside setTimeout
setTimeout(function () {
    console.log("Executed after 2 seconds");
}, 2000);


// 8. Higher-Order Function using Function Expression
const multiplyBy = function (factor) {
    return function (num) {
        return num * factor;
    };
};
const double = multiplyBy(2);
console.log("Double:", double(5));


// 9. Recursive Function Expression
const factorial = function fact(n) {
    if (n <= 1) return 1;
    return n * fact(n - 1);
};
console.log("Factorial:", factorial(5));


// 10. Nested Function Expression
const outer = function () {
    console.log("Outer function");

    const inner = function () {
        console.log("Inner function");
    };

    inner();
};
outer();


// 11. Pure Function using Function Expression
const pureAdd = function (a, b) {
    return a + b;
};
console.log("Pure Function:", pureAdd(10, 20));


// 12. Constructor Function Expression
const Person = function (name, age) {
    this.name = name;
    this.age = age;
};
const p1 = new Person("Alice", 25);
console.log("Person:", p1);


// 13. Async Function Expression
const fetchData = async function () {
    return "Async Data Loaded";
};
fetchData().then(function (data) {
    console.log(data);
});


// 14. Generator Function Expression
const generatorFunc = function* () {
    yield 1;
    yield 2;
    yield 3;
};
const gen = generatorFunc();
console.log(gen.next().value);
console.log(gen.next().value);


// 15. Arrow Function Expression
const subtract = (a, b) => a - b;
console.log("Subtract:", subtract(10, 4));