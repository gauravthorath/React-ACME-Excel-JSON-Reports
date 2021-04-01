//#region import extenal dependancies
const prompt = require("prompt-sync")({ sigint: true }); // sigint set to enable user to user cntl+c feature to exit the programm execution
const _ = require("lodash");
const fs = require("fs");
const xlsx = require("xlsx");
//#endregion

//#region variables
const results = [];
var continueexec = true;
//#endregion

do {
  //#region  user input
  if (continueexec == false) {
    continueexec = prompt("Press any key to continue.");
  }

  console.log(
    "\nPlease enter command: \n1) ingest <fileName> \n2) summary <category name> <year> <month> \n3) generate_report <file name> \n4) exit"
  );
  const input = prompt(">>>"); //recived command with arument from user

  var commandWithArgs = _.split(input, " ");
  var command = _.nth(commandWithArgs, 0);
  var argFileName = null;
  var argCategoryName = null;
  var argYear = null;
  var argMonth = null;
  //#endregion

  switch (command.toLowerCase()) {
    //#region ingest command
    case "ingest":
      if (commandWithArgs.length != 2) {
        console.log("Invalid Command or arguments");
        continueexec == true;
        break;
      }
      argFileName = _.nth(commandWithArgs, 1);

      if (argFileName.includes(".")) {
        var fileWithExtention = _.split(argFileName, ".");

        var fileName = _.nth(fileWithExtention, 0);
        if (_.nth(fileWithExtention, 1)) {
          var extention = _.nth(fileWithExtention, 1);
        } else {
          console.log("Please provide file extention!");
          continueexec == true;
          break;
        }
      } else {
        console.log("Please provide file extentions!");
        continueexec == true;
        break;
      }
      if (_.lowerCase(extention) == "txt") {
        try {
          //Reading from .txt file
          var path = `../data/${fileName}.${extention}`;

          var array = fs.readFileSync(path).toString().split("\n");

          for (i in array) {
            results[i] = _.split(array[i].trim(), "\t");
          }

          //Data stored locally for further processing
          let saveData = JSON.stringify(results);
          fs.writeFileSync("../storage/csvresult.json", saveData);

          console.log("Success");
        } catch (err) {
          console.log("Error");
        }
      } else if (_.lowerCase(extention) == "xlsx") {
        try {
          //Reading from .xlsx file
          var path = `../data/${fileName}.${extention}`;
          const wb = xlsx.readFile(path);
          const ws = wb.Sheets["Sales"];
          const data = xlsx.utils.sheet_to_json(ws);

          var valueArr = data.map(function (item) {
            return item.SKU;
          });
          var duplicateSKU = [];
          var isDuplicate = valueArr.some(function (item, idx) {
            if (valueArr.indexOf(item) != idx) {
              duplicateSKU.push(item);
              return true;
            } else {
              return false;
            }
          });

          if (isDuplicate) {
            var duplicateRecord = [];
            var newData = null;
            for (i in duplicateSKU) {
              newData = data.map((record) => {
                if (record.SKU == duplicateSKU[i]) {
                  //console.log(record);
                  duplicateRecord.push(record);
                }
                return record;
              });
            }

            for (i in duplicateSKU) {
              newData = data.filter((record) => {
                if (record.SKU == duplicateSKU[i]) {
                  return false;
                } else {
                  return true;
                }
              });
            }

            let lastMonthGrossSales = Object.keys(duplicateRecord[0])[13];
            SortData(duplicateRecord, lastMonthGrossSales, false);
            for (i in duplicateRecord) {
              newData.push(duplicateRecord[i]);
              break;
            }
          }

          //Data stored locally for serving report and summary commands
          SortData(newData, "SKU", true);

          let saveData = JSON.stringify(newData);
          fs.writeFileSync("../storage/excelresult.json", saveData);
          console.log("Success");
          break;
        } catch (err) {
          console.log("Error");
          continueexec == true;
          break;
        }
      } else {
        console.error("Error : Invalid extention.");
        continueexec == true;
        break;
      }

      break;
    //#endregion
    //#region summary command
    case "summary":
      if (commandWithArgs.length != 4) {
        console.log("Invalid Command or arguments");
        continueexec == true;
        break;
      } else {
        argCategoryName = _.nth(commandWithArgs, 1);
        argYear = _.nth(commandWithArgs, 2);
        argMonth = _.nth(commandWithArgs, 3);

        if (argMonth > 12 || argMonth < 1) {
          console.log("Invalid month, enter between 1 to 12.");
          break;
        }

        let unitsCols = argYear + "-" + argMonth + " Units";
        let GrossSalesCols = argYear + "-" + argMonth + " Gross Sales";

        let url = "../storage/excelresult.json";

        let jsonString = fs.readFileSync(url);
        try {
          let data = JSON.parse(jsonString);
          let total_units = 0;
          let total_gross_sales = 0;
          let foundCategory = false;
          for (i in data) {
            if (_.lowerCase(data[i].Section) == _.lowerCase(argCategoryName)) {
              foundCategory = true;
              total_units += data[i][unitsCols];
              total_gross_sales += data[i][GrossSalesCols];
            }
          }
          if (foundCategory == true) {
            console.log(
              `${argCategoryName} - Total Units: ${
                isNaN(total_units) ? 0 : total_units
              }, Total Gross Sales: ${(
                Math.round(
                  isNaN(total_gross_sales) ? 0 : total_gross_sales * 100
                ) / 100
              ).toFixed(2)}`
            );
          } else {
            console.log(
              "You have entered an invalid category. Please try again."
            );
            break;
          }
        } catch (err) {
          console.log("Error parsing JSON data", err);
        }
        break;
      }
    //#endregion
    //#region generate report command
    case "generate_report":
      if (commandWithArgs.length != 2) {
        console.log("Invalid Command or arguments");
        continueexec == true;
        break;
      }
      console.log(command);
      argFileName = _.nth(commandWithArgs, 1);
      console.log(argFileName);

      //* Read file Stream from json from storage
      if (argFileName) {
        let url = "../storage/excelresult.json";
        let reportData = "";
        let jsonString = fs.readFileSync(url);
        try {
          let data = JSON.parse(jsonString);
          for (i in data) {
            for (j = 2; j < Object.keys(data[0]).length; j = j + 2) {
              if (
                data[i][Object.keys(data[0])[j]] == 0 &&
                data[i][Object.keys(data[0])[j + 1]] == 0
              ) {
                break;
              } else {
                reportData += `${_.nth(
                  _.split(_.nth(_.split(Object.keys(data[0])[j], " "), 0), "-"),
                  0
                )}\t\t${_.nth(
                  _.split(_.nth(_.split(Object.keys(data[0])[j], " "), 0), "-"),
                  1
                )}\t\t${data[i].SKU}\t\t${
                  30 - data[i].Section.length > 20
                    ? data[i].Section + "\t\t\t\t"
                    : 30 - data[i].Section.length < 20 &&
                      30 - data[i].Section.length > 15
                    ? data[i].Section + "\t\t"
                    : data[i].Section + "\t"
                }\t\t${
                  data[i][Object.keys(data[0])[j]].toString().length > 3
                    ? data[i][Object.keys(data[0])[j]]
                    : data[i][Object.keys(data[0])[j]] + "\t"
                }\t${(
                  Math.round(data[i][Object.keys(data[0])[j + 1]] * 100) / 100
                ).toFixed(2)}\n`;
              }
            }
          }

          // Push headers at top row of CSV
          const headers = `Year\t\tMonth\t\tSKU\t\tCategory\t\t\t\t\tUnits\tGrossSales\n`;
          cleanData("../reports/${argFileName}", "csv"); // Deleteing file, if exits already

          // To write generated report in reports folder
          fs.writeFileSync(
            `../reports/${argFileName}.csv`,
            headers + reportData,
            "UTF-8"
          );
        } catch (err) {
          console.log(err);
        }
      }
      break;
    //#endregion
    //#region exit
    case "exit":
      console.log("successfully exited!");
      cleanData("../storage/excelresult", "json"); // Delete excel result set from storage
      cleanData("../storage/csvresult", "json"); // Delete csv result set from storage
      break;
    //#endregion
    //#region  default case
    default:
      console.log("Invalid Command or arguments");
      continueexec == true;
    //#endregion
  }
} while (_.lowerCase([command]) != "exit"); //Exit from the loop on case of exit commaned

//#region Reusable functions
// Function to clean memory: Delete file from stoage
function cleanData(path, extention) {
  if (fs.existsSync(`${path}.${extention}`)) {
    fs.unlink(`${path}.${extention}`, (err) => {
      if (err) {
        console.log(err);
        continueexec == true;
      }
    });
    console.log("Storage cleared.");
  }
}

//Function to sort data source by the prop passed
function SortData(dataSource, prop, asc) {
  dataSource.sort(function (a, b) {
    if (asc) {
      return a[prop] > b[prop] ? 1 : a[prop] < b[prop] ? -1 : 0;
    } else {
      return b[prop] > a[prop] ? 1 : b[prop] < a[prop] ? -1 : 0;
    }
  });
}
//#endregion
