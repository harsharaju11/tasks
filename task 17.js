console.log("===== BASIC OPERATIONS =====");

// 1. Length
let str1 = "JavaScript";
console.log("1. Length:", str1.length);

// 2. Concatenation
let firstName = "John";
let lastName = "Doe";
console.log("2. Concatenation:", firstName + " " + lastName);

// 3. Escape Characters
let text = "He said, \"JavaScript is awesome!\"";
console.log("3. Escape:", text);

// 4. Breaking Long Strings
let message = "JavaScript is a powerful language " +
              "used for web development.";
console.log("4. Long String:", message);

// 5. Substring
let str2 = "Hello JavaScript World";
console.log("5. Substring:", str2.substring(6, 16));

// 6. Upper & Lower
let str3 = "JavaScript";
console.log("6. Upper:", str3.toUpperCase());
console.log("   Lower:", str3.toLowerCase());

// 7. Search
let str4 = "Learn JavaScript programming";
console.log("7. Index:", str4.indexOf("JavaScript"));

// 8. Replace
let str5 = "I love Java";
console.log("8. Replace:", str5.replace("Java", "JavaScript"));

// 9. Trim
let str6 = "   Hello World   ";
console.log("9. Trim:", str6.trim());

// 10. Access Characters
let str7 = "JavaScript";
console.log("10. First:", str7[0]);
console.log("    Last:", str7[str7.length - 1]);

// 11. Comparison
let a = "apple";
let b = "banana";
console.log("11. Comparison:", a === b);

// 12. String Object
let strObj = new String("Hello");
console.log("12. Object Type:", typeof strObj);

console.log("\n===== STRING METHODS =====");

// 13. slice()
let s1 = "JavaScript";
console.log("13. slice:", s1.slice(0, 4));

// 14. substring()
console.log("14. substring:", s1.substring(4, 10));

// 15. substr()
console.log("15. substr:", s1.substr(4, 6));

// 16. replace()
let s2 = "Hello World";
console.log("16. replace:", s2.replace("World", "JS"));

// 17. replaceAll()
let s3 = "apple apple apple";
console.log("17. replaceAll:", s3.replaceAll("apple", "orange"));

// 18. toUpperCase()
let s4 = "hello";
console.log("18. upper:", s4.toUpperCase());

// 19. toLowerCase()
let s5 = "HELLO";
console.log("19. lower:", s5.toLowerCase());

// 20. concat()
let s6 = "Hello";
let s7 = "World";
console.log("20. concat:", s6.concat(" ", s7));

// 21. trim()
let s8 = "   JS   ";
console.log("21. trim:", s8.trim());

// 22. trimStart()
let s9 = "   JavaScript";
console.log("22. trimStart:", s9.trimStart());

// 23. trimEnd()
let s10 = "JavaScript   ";
console.log("23. trimEnd:", s10.trimEnd());

// 24. padStart()
let num1 = "5";
console.log("24. padStart:", num1.padStart(3, "0"));

// 25. padEnd()
let num2 = "5";
console.log("25. padEnd:", num2.padEnd(3, "0"));

// 26. charAt()
let s11 = "JavaScript";
console.log("26. charAt:", s11.charAt(2));

// 27. split()
let s12 = "apple,banana,orange";
console.log("27. split:", s12.split(","));

// 28. charCodeAt() (Optional)
let s13 = "A";
console.log("28. charCodeAt:", s13.charCodeAt(0));