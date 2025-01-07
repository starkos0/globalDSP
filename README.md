# GlobalDSP

This project allows you to plan your dyson sphere program factories, giving you the perfect ratios for every single step in your logistic system.

## How it works

- The tree starts from a user-selected root item.
- After selecting the initial amount and root item, the system builds a recursive tree by fetching recipes and dependencies until reaching the base ores.

## Features

- **Dynamic Recipe Tree Generation:** Automatically generates complex, nested tree structures based on items/buildings recipes and dependencies.
- **Automatic Total Calculations:**
  - Total power consumption.
  - Total machines required by facility type.
  - Total items produced.
- **Real-Time Data Updates (upcoming):** Customize any tree value to see updated nested item requirements.
- **Reactive Forms:** Dynamically change building upgrades for calculations.
- **Real-Time Recipe Switching:** Switch recipes for items with multiple options, dynamically recalculating the tree.
- **Upcoming Features:**
  - Proliferation per item.
  - Belt stack calculations per item.
  - Quick ratios visualization.
  - Network tree visualization.

## How to start the project

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.0.

- npm install
- ng serve

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Technologies Used

- **Angular:** Frontend framework used for building the application.
- **Dexie.js:** Client-side IndexedDB wrapper for efficient database management.
- **DaisyUI:** Tailwind CSS plugin for pre-designed UI components.

## Key files and Folders

- `src/app/services/data-management.service.ts`: Core logic for:

  - enerating recipe trees.
  - alculating totals (power, machines, items).
  - andling database queries with Dexie.js.

- `src/app/services/global-settings-service.service.ts`: Manages dynamic building selection for calculations.
- `src/app/services/db.ts`: Configures and manages the IndexedDB database.
- `src/app/mainComponents/table-ratios/`: Contains components for displaying item ratios and totals in a tabular format.
- `src/assets/`: Stores static resources such as item icons and other assets.
- `src/app/mainComponents/calculator/`: Includes all components and logic for filtering and generating crafting trees.

## Execute prettier

Run `npx prettier . --write`
