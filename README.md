# NutriTrack - Personal Macro & Wellness Tracker

NutriTrack is a modern, ultra-lightweight, mobile-first Single Page Application (SPA) that allows you to track your daily calories, macros (protein, carbs, fats, fiber), water intake, and body weight.

It is designed with a **Serverless & Private** architecture: it runs entirely in your web browser and uses your private **Google Spreadsheet** as its database via a **Google Apps Script Web App API**. This means your data remains entirely under your control, and there are zero hosting or database costs!

---

## Features

*   **Calorie & Macro Budgeting**: Automatically deducts logged food items from a daily budget of `2000 kcal` and visually tracks macro goals (`130g Protein`, `230g Carbs`, `65g Fat`, `30g Fiber`).
*   **Multi-Item Meal Builder**: Log entire meals (e.g. "Breakfast", "Post-Workout") by adding multiple foods and portions to a basket before submitting.
*   **Custom Food Library**: Add and manage your custom food items with exact serving sizes and macronutrients.
*   **Water Intake Tracker**: Log your daily hydration with quick-add buttons (+250ml, +500ml) against a `2.0L` fixed goal (supports exceeding and turns green on completion).
*   **Daily Body Weight Log**: Log your body weight daily and visualize your progress trends in a beautiful interactive line chart.
*   **Cross-Device Sync**: Access your data from any computer or phone by pointing it to your personal Google Sheet.

---

## Installation & Backend Setup (5 Minutes)

To make the app work, you need to create a Google Sheet and deploy the backend Apps Script. Follow these steps:

### Step 1: Create your Google Sheet
1. Go to [Google Sheets](https://sheets.google.com) and create a **Blank Spreadsheet**.
2. Rename the spreadsheet to something like `My NutriTrack Data`.
3. *Note: Do NOT create any columns or sheets manually. The script will automatically build the database structure for you on its first run!*
4. Copy the spreadsheet URL or keep the tab open.

### Step 2: Create and Deploy the Apps Script Backend
1. In your Google Sheet tab, click on **Extensions** in the top menu -> **Apps Script**.
2. Delete any default code in the editor.
3. Open the `Code.gs` file from this repository, copy all its content, and paste it into the Apps Script editor.
4. Click the **Save** disk icon at the top of the editor.
5. Click the **Deploy** button in the top right -> **New deployment**.
6. Click the gear icon next to "Select type" and choose **Web app**.
7. Configure the deployment:
    *   **Description**: `NutriTrack Backend API`
    *   **Execute as**: `Me (your-google-email@gmail.com)`
    *   **Who has access**: `Anyone` *(This is required so your browser can securely send data. The URL contains a unique key that acts as your API password—keep this URL private!)*
8. Click **Deploy**.
9. Click **Authorize Access**, log in with your Google account, click **Advanced** -> **Go to Untitled project (unsafe)**, and click **Allow**.
10. Copy the **Web app URL** (it ends with `/exec`).

### Step 3: Connect and Start Tracking!
1. Open the `index.html` file in any browser (locally or host it on GitHub Pages!).
2. You will see the **NutriTrack Connect Screen**.
3. Paste the **Apps Script Web App URL** you copied in the previous step.
4. Click **Connect Spreadsheet**.
5. **You are all set!** The app will connect, initialize the sheets in your Google Spreadsheet, and display the dashboard.

---

## Mobile Web App Setup (Install on your Phone)

NutriTrack is optimized to look and feel like a native mobile app when installed on your phone's home screen:

### iPhone (Safari)
1. Open your live `index.html` URL in **Safari**.
2. Tap the **Share** button (square with an arrow pointing up) at the bottom.
3. Scroll down and tap **Add to Home Screen**.
4. Name it "NutriTrack" and tap **Add**.

### Android (Chrome)
1. Open your live `index.html` URL in **Chrome**.
2. Tap the **Menu** button (three dots in the top right).
3. Tap **Install App** or **Add to Home screen**.

---

## File Directory Structure

*   `index.html`: The entire frontend application (HTML5, CSS Tailwind, ES6 JS, SVG Icons, Chart.js).
*   `Code.gs`: The Google Apps Script backend API (handles database actions on Google Sheets).
*   `README.md`: Setup manual (this document).
