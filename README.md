# Recipe Manager Web App

A simple, fully client-side Recipe Manager built using **HTML**, **CSS**, and **JavaScript**, with **localStorage** for data persistence.

This project is based on the assessment requirements described in the provided specification.  
It supports creating, viewing, editing, searching, and deleting recipes directly in the browser.

---

## 🚀 Features

### 📌 Views / Pages
- **Home (Recipe List):**  
  - Grid layout displaying recipe cards  
  - Search bar (search by title)  
  - Difficulty filter (All/Easy/Medium/Hard)

- **Recipe Detail Page:**  
  - Shows full recipe information  
  - Edit and Delete options

- **Add/Edit Recipe Form:**  
  - Inputs: Title, Description, Ingredients, Steps, Prep Time, Cook Time, Difficulty, Optional Image URL  
  - Client-side form validation

---

## 🗄️ Data & Local Storage

- On first load, the app inserts **the candidate’s recipe** into `localStorage`.
- All recipes are stored under the key:

---
## 🛠️ CRUD Operations

### ✔️ Create  
User submits the Add Recipe form → New recipe is saved to `localStorage`.

### 📖 Read  
Recipes are loaded from `localStorage` on app startup.

### ✏️ Update  
Editing a recipe overwrites the existing object in `localStorage`.

### 🗑️ Delete  
Recipe can be removed and the UI refreshes.

---

## 🔍 Search & Filters

- Search by **recipe title**
- Filter by **difficulty level**:  
  `All | Easy | Medium | Hard`
 Filter by **maximum preparation time**

---

## 📱 Responsiveness

- Fully responsive layout  
- Works on **desktop**, **tablet**, and **mobile**
- 
---

## ⚠️ Error Handling & Validation

- Prevents invalid form submissions  
- Shows clear error messages  
- Handles corrupted or missing `localStorage` data gracefully  
- Fallback default dataset if needed
- 
--- 

## 📝 Assumptions & Limitations

- All data persists only in **localStorage** → clearing browser storage deletes all recipes.
- No backend or authentication is implemented.
- Images are referenced via URLs (no file upload).
- Designed for browsers that support modern JavaScript (ES6+).

---

## 🐞 Known Issues

- Very large datasets may impact performance due to client-only storage.
- Image URLs are not validated beyond basic checks.
- If `localStorage` is blocked or disabled, the app cannot function.

---

## ▶️ How to Run the App

1. **Download or clone** the source code.  
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge).  
3. No server is required—everything runs fully on the client.