/**
 * NutriTrack Backend - Google Apps Script
 * Manages the Google Sheets database for the Macro Tracker app.
 * 
 * Deploy as a Web App with:
 * - Execute as: Me (your email)
 * - Who has access: Anyone
 */

function doGet(e) {
  const res = handleRequest(e);
  return ContentService.createTextOutput(JSON.stringify(res))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function handleRequest(e) {
  try {
    if (!e || !e.parameter) {
      return { success: false, error: "No parameters provided" };
    }
    
    const action = e.parameter.action;
    if (!action) {
      return { success: false, error: "Action parameter missing" };
    }

    // Ensure all sheets exist and have headers
    initSheets();
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    switch (action) {
      // --- FOOD LIBRARY ---
      case "getFoods": {
        const data = getSheetData("Foods");
        return { success: true, foods: data };
      }
      
      case "addFood": {
        const payload = JSON.parse(e.parameter.payload);
        payload.id = "food_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        appendRow("Foods", payload);
        return { success: true, food: payload };
      }
      
      case "updateFood": {
        const payload = JSON.parse(e.parameter.payload);
        updateRow("Foods", "id", payload.id, payload);
        return { success: true, food: payload };
      }
      
      case "deleteFood": {
        const id = e.parameter.id;
        deleteRowMatching("Foods", "id", id);
        return { success: true };
      }
      
      // --- MEAL LOGS ---
      case "getLogs": {
        const date = e.parameter.date; // yyyy-MM-dd
        if (!date) return { success: false, error: "Date required" };
        
        const logs = getSheetData("Logs").filter(row => row.date === date);
        return { success: true, entries: logs };
      }
      
      case "addMealLog": {
        const payload = JSON.parse(e.parameter.payload);
        // Expects: { mealName: "Breakfast", date: "2026-05-29", items: [{ foodId: "...", qty: 1.5 }, ...] }
        if (!payload.mealName || !payload.date || !payload.items || !payload.items.length) {
          return { success: false, error: "Invalid payload for addMealLog" };
        }
        
        const mealId = "meal_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        const time = new Date().toISOString();
        const foods = getSheetData("Foods");
        const loggedItems = [];
        
        payload.items.forEach(item => {
          const food = foods.find(f => f.id === item.foodId);
          if (!food) return; // Skip if food not found in library
          
          const qty = parseFloat(item.qty) || 0;
          const logRow = {
            id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
            mealId: mealId,
            date: payload.date,
            time: time,
            mealName: payload.mealName,
            foodId: food.id,
            foodName: food.name,
            qty: qty,
            calories: Math.round(food.calories * qty * 10) / 10,
            protein: Math.round(food.protein * qty * 10) / 10,
            carbs: Math.round(food.carbs * qty * 10) / 10,
            fat: Math.round(food.fat * qty * 10) / 10,
            fiber: Math.round(food.fiber * qty * 10) / 10
          };
          
          appendRow("Logs", logRow);
          loggedItems.push(logRow);
        });
        
        return { success: true, mealId: mealId, loggedItems: loggedItems };
      }
      
      case "deleteMealLog": {
        const mealId = e.parameter.mealId;
        if (!mealId) return { success: false, error: "mealId required" };
        deleteRowMatching("Logs", "mealId", mealId);
        return { success: true };
      }
      
      // --- WATER LOGS ---
      case "getWaterLogs": {
        const date = e.parameter.date;
        if (!date) return { success: false, error: "Date required" };
        const logs = getSheetData("WaterLogs").filter(row => row.date === date);
        return { success: true, entries: logs };
      }
      
      case "logWater": {
        const amountMl = parseFloat(e.parameter.amountMl) || 0;
        const date = e.parameter.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
        const row = {
          id: "water_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
          date: date,
          time: new Date().toISOString(),
          amountMl: amountMl
        };
        appendRow("WaterLogs", row);
        return { success: true, entry: row };
      }
      
      case "deleteWaterLog": {
        const id = e.parameter.id;
        deleteRowMatching("WaterLogs", "id", id);
        return { success: true };
      }
      
      // --- WEIGHT LOGS ---
      case "getWeightLogs": {
        const data = getSheetData("WeightLogs");
        // Sort by date ascending for easy charting
        data.sort((a, b) => new Date(a.date) - new Date(b.date));
        return { success: true, entries: data };
      }
      
      case "logWeight": {
        const weightKg = parseFloat(e.parameter.weightKg) || 0;
        const date = e.parameter.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
        
        const existing = getSheetData("WeightLogs").find(w => w.date === date);
        const row = {
          id: existing ? existing.id : "weight_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
          date: date,
          time: new Date().toISOString(),
          weightKg: weightKg
        };
        
        if (existing) {
          updateRow("WeightLogs", "date", date, row);
        } else {
          appendRow("WeightLogs", row);
        }
        return { success: true, entry: row };
      }
      
      default:
        return { success: false, error: "Unknown action: " + action };
    }
  } catch (error) {
    return { success: false, error: error.toString(), stack: error.stack };
  }
}

// --- HELPER DATABASE FUNCTIONS ---

const HEADERS = {
  Foods: ["id", "name", "servingSize", "servingUnit", "calories", "protein", "carbs", "fat", "fiber"],
  Logs: ["id", "mealId", "date", "time", "mealName", "foodId", "foodName", "qty", "calories", "protein", "carbs", "fat", "fiber"],
  WaterLogs: ["id", "date", "time", "amountMl"],
  WeightLogs: ["id", "date", "time", "weightKg"]
};

function initSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(HEADERS).forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(HEADERS[name]);
    }
  });
}

function getSheetData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length <= 1) return [];
  
  const headers = values[0];
  const data = [];
  
  for (let i = 1; i < values.length; i++) {
    const row = {};
    headers.forEach((h, index) => {
      let val = values[i][index];
      // Ensure dates aren't mangled
      if (val instanceof Date) {
        if (h === "date") {
          val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
        } else {
          val = val.toISOString();
        }
      }
      row[h] = val;
    });
    data.push(row);
  }
  return data;
}

function appendRow(sheetName, obj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  
  const headers = HEADERS[sheetName];
  const row = headers.map(h => obj[h] !== undefined ? obj[h] : "");
  sheet.appendRow(row);
}

function updateRow(sheetName, keyColumn, keyValue, obj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  
  const headers = HEADERS[sheetName];
  const keyColIdx = headers.indexOf(keyColumn);
  if (keyColIdx === -1) return;
  
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][keyColIdx]) === String(keyValue)) {
      const row = headers.map(h => obj[h] !== undefined ? obj[h] : values[i][headers.indexOf(h)]);
      sheet.getRange(i + 1, 1, 1, headers.length).setValues([row]);
      return;
    }
  }
}

function deleteRowMatching(sheetName, keyColumn, keyValue) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  
  const headers = HEADERS[sheetName];
  const keyColIdx = headers.indexOf(keyColumn);
  if (keyColIdx === -1) return;
  
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  // Delete from bottom up so row indices don't shift!
  for (let i = values.length - 1; i >= 1; i--) {
    if (String(values[i][keyColIdx]) === String(keyValue)) {
      sheet.deleteRow(i + 1);
    }
  }
}
