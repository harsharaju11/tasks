
let temp = 28; // Example temperature

if (temp > 35) {
    console.log("Mode: Turbo Cool (Maximum power)");
}
else if (temp > 25) {
    console.log("Mode: Normal Cooling");
}
else if (temp >= 20) {
    console.log("Mode: Fan Only");
}
else {
    console.log("Mode: Heating / Standby");
}
// month using switch

let month = "August"; // Change month value to test

switch (month) {
    case "November":
    case "December":
    case "January":
    case "February":
    case "March":
        console.log("It's Winter season.");
        break;

    case "July":
    case "August":
    case "September":
    case "October":
        console.log("It's Rainy season.");
        break;

    case "April":
    case "May":
    case "June":
        console.log("It's Summer season.");
        break;

    default:
        console.log("Unknown season.");
}