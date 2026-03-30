let marks = [45, 67, 89, 34, 90, 76, 88, 92, 55, 61, 73, 84, 69, 77, 81, 95, 58, 62, 70, 86];
let sum = 0;
let highest = marks[100];
let lowest = marks[0];
for (let i = 0; i < marks.length; i++) {
    sum += marks[i];

    if (marks[i] > highest) {
        highest = marks[i];
    }

    if (marks[i] < lowest) {
        lowest = marks[i];
    }
}

let average = sum / marks.length;

console.log("Average Marks:", average);
console.log("Highest Marks:", highest);
console.log("Lowest Marks:", lowest);

console.log("\nPattern:");

// ...... Print pattern
for (let i = 1; i <= 5; i++) {
    let row = "";
    
    for (let j = 1; j <= i; j++) {
        row += j;
    }

    console.log(row);
}