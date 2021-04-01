# ACME

Application to generate sales summaries by categories and Ingest monthly reports

# Execution Steps:

1. npm install
2. navigate to src folder from terminal
3. node app
   then follow the commands from given option in project

---

# Test Data for all the commands:

1. ingest <fileName>
   Tested command: ingest 201904.xlsx
2. summary <category name> <year> <month>
   Tested command: summary Dairy 2019 1
3. generate_report <file name>
   Tested command: generate_Report test
4. exit
   Tested command: exit

---

# Note: On exit command, I am clearing stored data, so you will have to re run ingest command to make data available for summary and generate report.

---

# Project Structure:

data : keep .xlsx or .txt(CSV) which needs to be ingest
reports: <filename>.csv  
 Its tab deliminated report.(result of generate_report command)
storage: used to store modified data
src>app.js: complete code is kept in this file.

---

# packages used in project:

lodash : used this utility library to handle array related operations
prompt-sync: used to give command menu and take input from user
xlsx: used to work with .xlsx file format
fs: used this core module to handle file I/O operations in node

# Pending Tasks

CSV data is stored but not processed as per requirement. So to test summary and generate_report functionality please first import excel format data as its complete.
