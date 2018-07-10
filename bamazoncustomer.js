var inquirer = require("inquirer");
var mysql = require("mysql");

//global variables
var product = null;
var quantity = null;
var stock = false;
var price = null;


var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 8889,

    // Your username
    user: "root",

    // Your password
    password: "root",
    database: "bamazon"
});

var display_db = function (res) {
    for (i = 0; i < res.length; i++) {
        var len1 = 8 - res[i].item_id.toString().length;
        var len2 = 50 - res[i].product_name.length;
        var len3 = 30 - res[i].department_name.length;
        var len4 = 20 - res[i].price.toString().length;
        var str1 = new Array(len1).join(" ");
        var str2 = new Array(len2).join(" ");
        var str3 = new Array(len3).join(" ");
        var str4 = new Array(len4).join(" ");
        console.log("ID: " + res[i].item_id + str1 + "|| Name: " + res[i].product_name + str2 + "|| Dptm: "
            + res[i].department_name + str3 + "|| Price: $" + res[i].price + str4 + "|| Stock: " + res[i].stock_quantity);
    }
}

var another_instruction = function () {
    inquirer
        .prompt({
            name: "instruction",
            type: "list",
            message: "\n What do you want to do?",
            choices: ["Buy something else", "Finish"]
        }).then(function (answer) {
            if (answer.instruction == "Buy something else") {
                start_app();
            }else {
                process.exit();
            }
        });
}
var get_total = function () {
    var totalAmount = quantity * price;
    console.log("Thank you for your purchase, your total is: $" + totalAmount.toFixed(2));
    another_instruction();

}

var register_purchase = function (actualStock) {

    console.log("we got here");
    var query = "UPDATE products SET stock_quantity=? WHERE item_id=?";
    var newStock = actualStock - quantity;
    connection.query(query,[newStock, product], function (err, res) {
        if (err) throw err;
        get_total();
    });


}

var check_stock = function () {
    var query = "SELECT * FROM products WHERE item_id=?";
    connection.query(query, product, function (err, res) {
        var actualStock = res[0].stock_quantity;
        if (err) throw err;
        if (quantity < actualStock) {
            stock = true;
            price = res[0].price;
            console.log("Thank you for your purchase, We're processing your order");
            register_purchase(actualStock);
        } else {
            console.log("Insuficient Quantity");
            ask_client();
        }
    });
}


var ask_client = function () {
    product = null;
    quantity = null;
    inquirer
        .prompt([{
            name: "product",
            type: "input",
            message: "\nWhat ID product would you like to buy?",
        }, {
            name: "quantity",
            type: "input",
            message: "\nHow many would you like to buy?",
        }])
        .then(function (answer) {
            product = answer.product;
            quantity = parseInt(answer.quantity);
            check_stock();
        });
}


var start_app = function () {
    var query = "SELECT * FROM products";
    connection.query(query, function (err, res) {
        if (err) throw err;
        display_db(res);
        ask_client();
    });
}

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    start_app();
});