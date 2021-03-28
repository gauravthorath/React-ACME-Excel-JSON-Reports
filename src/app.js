const fs = require("fs"); //Core fs module
const prompt = require("prompt-sync")();
const _ = require("lodash");
const reorder = require('csv-reorder');

do {
  const Input = prompt(
    "Please enter command: (ingest <fileName> or summary <category name> <year> <month> or generate_report <file name> or exit)"
  );

  var commandWithArgs = _.split(Input, " ");
  var command = _.nth(commandWithArgs, 0);
  var argFileName = null;
  var argCategoryName = null;
  var argYear = null;
  var argMonth = null;

  switch (command) {
    case "ingest":
      if (commandWithArgs.length > 2) {
        console.log("Invalid Command or arguments");
        break;
      }
      console.log(command);
      argFileName = _.nth(commandWithArgs, 1);
      console.log(argFileName);

      //Remove duplicate SKU and conmbine units and sales

      break;
    case "summary":
      if (commandWithArgs.length > 4) {
        console.log("Invalid Command or arguments");
        break;
      }
      console.log(command);
      argCategoryName = _.nth(commandWithArgs, 1);
      argYear = _.nth(commandWithArgs, 2);
      argMonth = _.nth(commandWithArgs, 3);
      console.log(argCategoryName);
      console.log(argYear);
      console.log(argMonth);
      break;
    case "generate_report":
      if (commandWithArgs.length > 2) {
        console.log("Invalid Command or arguments");
        break;
      }
      console.log(command);
      argFileName = _.nth(commandWithArgs, 1);
      console.log(argFileName);

      //* Read file Stream
      if (argFileName) {
        const readStream = fs.createReadStream(`../data/${argFileName}.txt`, {
          encoding: "utf8",
        });

        //* Generate Report
        const writeStream = fs.createWriteStream(
          `../output/${argFileName}.csv`
        );

        //* Input file to Output file
        readStream.pipe(writeStream);
      }

      break;
    case "exit":
      console.log("successfully exited!");
      break;
    default:
      console.log("Invalid Command or arguments");
  }
} while (_.lowerCase([command]) != "exit");
