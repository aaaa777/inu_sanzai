// alias of doPost
function doGet(e) {
    return doPost(e);
  }
  
  // auth and parse data
  function doPost(e) {
    let token = "sample-token";
  
    if(token != getEnv("ACCESS_TOKEN"))
      return;
  
    // let action = "add";
    let action = e.parameter.action;
  
    let json;
    try {
      json = JSON.parse(e.postData.contents);
    } catch {
      json = {}
    }
  
    return doRouting(action, json);
  }
  
  // routing and return response data
  // reduce eventcontainer entropy for testing more easily
  function doRouting(action, json) {
    
    // add a new record
    if(action == "add") {
      addRecord(json.money, json.date, json.comment);
      updateTotal(json.total);
      return createResponseSucceed();
    }
    
    // delete latest record
    if(action == "del") {
      delLatestRecord();
      updateTotal(json.total);
      return createResponseSucceed();
    }
    
    // return all data
    if(action == "get") {
      let allData = getAllRecord();
      return createResponseFormat("ok", allData);
    }
  }
  
  // utils
  
  function addRecord(money, date, comment) {
    const sheet = getSheet();
    const maxRow = sheet.getLastRow();
  
    sheet.getRange("1:1").insertCells(SpreadsheetApp.Dimension.ROWS);
    sheet.getRange(1, 1).setValue(money);
    sheet.getRange(1, 2).setValue(date);
    sheet.getRange(1, 3).setValue(comment);
  }
  
  function delLatestRecord() {
    const sheet = getSheet();
  
    sheet.getRange("1:1").deleteCells(SpreadsheetApp.Dimension.ROWS);
  }
  
  function getAllRecord() {
    const sheet = getSheet();
    const maxRow = sheet.getLastRow();
  
    return sheet.getRange(1, 1, maxRow, 3).getValues();
  }
  
  function updateTotal(total) {
    const sheet = getSheet(1);
    sheet.getRange(1, 2).setValue(total);
  }
  
  function createResponseFormat(type, content) {
    let resData = {
      status: type,
      content,
    }
    let out = ContentService.createTextOutput(JSON.stringify(resData));
    out.setMimeType(ContentService.MimeType.JSON);
  
    return out;
  }
  
  function createResponseSucceed() { return createResponseFormat("ok"); }
  
  
  // get String
  function getEnv(key) { return PropertiesService.getScriptProperties().getProperty(key);}
  
  
  // get Sheet
  function getSheet(p=0) { return SpreadsheetApp.getActiveSpreadsheet().getSheets()[p]; }
  
  // tests
  
  function testJSON(a) {console.log(JSON.stringify({a}));}
  function testGetAllRecord() { console.log(getAllRecord()); }
  function testAddRecord() { addRecord(100, "2001-12-3", "test 100")}
  function testDelLatestRecord() { delLatestRecord(); }
  function testUpdateTotal() { updateTotal(12345); }
  