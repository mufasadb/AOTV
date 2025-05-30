# **Project Plan: Project Loot & Craft**

## **Overall Project Phases**

1. **Phase 1: Core Combat & Loot Loop Prototype**  
   * **Objective:** Implement the fundamental turn-based combat, basic player actions, simple enemy AI, item drops (basic gear), and a rudimentary town screen for viewing loot. Prove the core fun factor.  
   * **Technology Focus:** React, MobX for state management, MUI for UI components, JavaScript (PWA structure), basic HTML/CSS for UI. Test-Driven Development (TDD) approach.  
2. **Phase 2: Crafting System & Expanded Itemization**  
   * **Objective:** Introduce the initial crafting system (deconstruction, basic orb effects), more diverse item base types, and the concept of magic/rare affixes.  
   * **Technology Focus:** Implement crafting logic, item generation algorithms, expand UI for crafting and detailed item views.  
3. **Phase 3: Key System & Dungeon Variety**  
   * **Objective:** Implement the dungeon key system, tiered dungeons, and introduce different enemy types associated with specific keys/areas.  
   * **Technology Focus:** Logic for key drops, key modification (basic), dungeon generation/selection.  
4. **Phase 4: Advanced Content & Systems (Vertical Slice)**  
   * **Objective:** Introduce unique/set items, early meta-crafting concepts, a special game mode (e.g., the "Delve-like" mode), and basic character loadouts. This phase aims for a more complete, albeit small, slice of the game.  
   * **Technology Focus:** Advanced item logic, specific game mode implementation, UI for loadouts.  
5. **Phase 5: Content Expansion & Balancing**  
   * **Objective:** Populate the game with a wider variety of items, affixes, enemies, bosses, and key modifications. Extensive playtesting and balancing of combat, loot, and crafting.  
   * **Technology Focus:** Data entry/management for content, balancing tools/analytics (if any).  
6. **Phase 6: Polish & Beta**  
   * **Objective:** UI polish, sound effects (if any), bug fixing, performance optimization. Prepare for a wider testing audience. Implement PWA features fully (offline, installability).  
   * **Technology Focus:** Code cleanup, optimization, asset integration.  
7. **Phase 7: Idle System & Initial Release**  
   * **Objective:** Implement the basic version of the NPC idle system. Final bug fixes and preparation for initial launch (e.g., web deployment, wrapped app if pursuing stores).  
   * **Technology Focus:** Idle system logic, integration with core game.  
8. **Phase 8: Post-Release Support & Iteration**  
   * **Objective:** Monitor player feedback, fix critical bugs, and plan for future content updates or system enhancements based on reception.

## **Phase 1: Core Combat & Loot Loop Prototype \- High-Level Task Breakdown**

**1\. Project Setup & Basic Structure:** \* Task 1.1: Set up a basic React project with MobX, MUI, and a TDD framework (e.g., Jest, React Testing Library). \* Task 1.2: Create main UI areas/components for: Combat Screen, Town Screen, Player Stats Display (very basic). \* Task 1.3: Implement simple navigation/routing between Combat and Town screens.

**2\. Combat System \- Core Mechanics:** \* Task 2.1: Design data structures for player stats (HP, basic Attack Power) and enemy stats (HP, Attack Power) using MobX stores. \* Task 2.2: Implement a turn management system (player turn, enemy turn). \* Task 2.3: Implement Player "Attack" action: player clicks attack, selects an enemy, deals damage. \* Task 2.4: Implement Player "Block" action: player clicks block, applies a temporary defensive buff. \* Task 2.5: Implement basic Enemy AI: on enemy turn, attacks player for fixed damage. \* Task 2.6: Display combat feedback: damage numbers, "Player Turn," "Enemy Turn." \* Task 2.7: Implement combat end conditions: player HP reaches 0 (lose), all enemies HP reach 0 (win), and basic reward modal.

**3\. Loot System \- Basic Drops:** \* Task 3.1: Design a very simple item data structure (e.g., item name, item type like 'Weapon'/'Armor', basic stat bonus like '+5 Attack Power'). \* Task 3.2: On combat win, randomly "drop" 1-2 predefined basic items. \* Task 3.3: Create a temporary "backpack" data structure (MobX store) to hold items collected during combat.

**4\. Town Screen \- Basic Functionality:** \* Task 4.1: On returning to Town from a won combat, transfer items from "backpack" to a simple "stash" display. \* Task 4.2: Display items in the stash (just item names for now). \* Task 4.3: Implement a "Start New Combat/Dungeon" button on the Town screen.

**5\. Initial "Game Loop" Test:** \* Task 5.1: Ensure the player can go from Town \-\> Combat \-\> Win \-\> Collect Loot \-\> Return to Town and see loot \-\> Start new combat.

## **Phase 1: Core Combat & Loot Loop Prototype \- Detailed Task Breakdown for Junior Developers**

**Section 1: Project Foundation & Core UI Structure**

* **Task 1.1.1: Initialize React Project & Core Dependencies**  
  * **Description:** Create a new React project (e.g., using Create React App or Vite). Integrate MobX for state management and MUI for UI components. Set up a testing framework (Jest and React Testing Library are recommended).  
  * **Deliverables:** A runnable React application with MobX and MUI installed and configured. Basic "App" component rendering. Initial test suite setup capable of running simple component tests.  
  * **Notes:** Follow TDD principles: write a failing test before implementing functionality.  
* **Task 1.1.2: Theming & Basic App Layout**  
  * **Description:** Implement a basic theme system using MUI, supporting dark (default) and light modes. Choose a primary font reminiscent of Diablo 2 (e.g., "Exocet" or a similar free alternative like "Cinzel Decorative" or "MedievalSharp" \- developer to research and select a suitable free font). The overall aesthetic should be dark and gritty.  
  * **Deliverables:** App uses the chosen font. Dark mode is applied by default. A simple toggle or mechanism for switching to light mode (can be basic for now).  
  * **Notes:** Ensure theme colors and font choices contribute to the "Diablo 2" gritty feel.  
* **Task 1.2.1: Mockup & Implement Main UI Views (Components)**  
  * **Description:** Create basic React components for the three primary game views: `TownView`, `CombatView`, and a `RewardModal` component. These will initially be placeholders with minimal content but should be routable/displayable.  
  * **Deliverables:**  
    * `TownView.js`: Placeholder component.  
    * `CombatView.js`: Placeholder component.  
    * `RewardModal.js`: Placeholder component.  
  * **Notes:** Focus on component structure and basic rendering.  
* **Task 1.2.2: Town View \- Initial Layout & Mockup Elements**  
  * **Description:** Based on mockups, structure the `TownView` component.  
    * **Player Inventory Section:**  
      * Tabbed interface: "Items" (main gear/backpack), "Stats" (Health, Mana, Attack placeholder), "Crafting Mats," "Keys."  
    * **Player Doll Section:** A visual placeholder area where equipped items will eventually be shown.  
    * **Main Town Area:** Initially shows basic town visuals/buttons. This area will later be replaced by Stash or Crafting Bench overlays.  
      * Button/Interaction point: "Open Stash"  
      * Button/Interaction point: "Open Crafting Bench"  
      * Button/Interaction point: "Go to Dungeon" (leads to combat)  
  * **Deliverables:** `TownView` component with MUI components structuring these areas. Tabs should be clickable but don't need functional content yet. Player doll is a styled div.  
  * **Notes:** Aim for a layout that feels intuitive on both desktop and mobile (MUI's responsive features will help).  
* **Task 1.2.3: Combat View \- Initial Layout & Mockup Elements**  
  * **Description:** Based on mockups, structure the `CombatView` component.  
    * **Enemy Area:** Design space for up to 5 enemy representations. Include visual placeholders for "forward" (melee) and "back" (ranged) positioning for each enemy slot. Add a placeholder for "next action indicator" above each enemy slot.  
    * **Player Action Bar:** Two prominent buttons: "Attack," "Block."  
    * **Target Selector:** A visual way to indicate which enemy is currently targeted (can be a simple border or highlight around an enemy placeholder).  
  * **Deliverables:** `CombatView` component with MUI components structuring these areas. Buttons are present but not functional.  
  * **Notes:** Consider how enemy selection will work on touch vs. mouse.  
* **Task 1.2.4: Reward Modal \- Initial Layout**  
  * **Description:** Structure the `RewardModal` component. This will appear after combat.  
    * Title (e.g., "Victory\!")  
    * Area to display list of rewards (placeholder for now).  
    * "Return to Town" button.  
  * **Deliverables:** `RewardModal` component layout.  
* **Task 1.3.1: Basic Navigation/Routing**  
  * **Description:** Implement a simple routing or state-driven mechanism to switch between `TownView` and `CombatView`. The `RewardModal` will be shown conditionally (e.g., on combat completion).  
  * **Deliverables:** User can navigate from Town to Combat and (conceptually) trigger the Reward Modal which then returns to Town.  
  * **Notes:** React Router can be used, or a simpler state management approach for these few views.

**Section 2: Item Interaction & Core Displays**

* **Task 1.4.1: Item Component & Basic Display**  
  * **Description:** Create a reusable `ItemDisplay` component. It should take item data (placeholder for now, e.g., `{ name: "Rusty Sword", type: "Weapon" }`) and display it. Implement onHover/onTouchStart to show a tooltip with item details (mock details for now).  
  * **Deliverables:** `ItemDisplay` component. Tooltip appears on interaction.  
  * **Notes:** This component is crucial. Focus on clarity and responsiveness of the tooltip.  
* **Task 1.4.2: Inventory UI & Basic Drag-and-Drop Foundation**  
  * **Description:** Implement the "Items" tab within the Player Inventory section of `TownView`. Display a grid of placeholder items using the `ItemDisplay` component. Begin implementing drag-and-drop functionality for items within this inventory grid.  
  * **Deliverables:** Inventory grid displays items. Basic drag-and-drop allows reordering items within the grid.  
  * **Notes:** Libraries like `react-beautiful-dnd` or `dnd-kit` can be used. Ensure it feels fluid. Test on desktop (mouse) and consider touch interactions.  
* **Task 1.4.3: Player Doll UI & Equipping Logic (Placeholder Stats)**  
  * **Description:** Implement the Player Doll section in `TownView` with distinct slots for equippable items (e.g., Weapon, Helmet, Chest). Allow dragging items from the inventory to these slots. When an item is equipped, update a *mock* behind-the-scenes stats object (e.g., in a MobX store) and reflect a change in the "Stats" tab (e.g., "Attack: 10 \-\> 15").  
  * **Deliverables:** Items can be dragged to player doll slots. Mock stats update and display in the "Stats" tab.  
  * **Notes:** The stat update is just a visual placeholder; no actual combat calculations yet.  
* **Task 1.4.4: High-Level Stats Bar UI**  
  * **Description:** Create a persistent UI component (e.g., at the top or bottom of the screen) that displays mock Health, Energy Shield (if applicable early), and Mana values, plus a basic Attack overview. This should read from the mock stats object.  
  * **Deliverables:** Stats bar component displaying mock data.  
* **Task 1.4.5: Detailed Stats Display (On Hover/Click)**  
  * **Description:** In the "Stats" tab of the player inventory, or as a general UI element, create a section that shows more detailed stats. Initially, this can be mock data. Implement an onHover/onClick interaction for certain stats to show a tooltip explaining what they do (e.g., hover over "Crit Chance" shows "Chance to deal critical damage").  
  * **Deliverables:** Detailed stats display area with interactive tooltips for explanations.  
* **Task 1.4.6: Stash View UI (Overlay)**  
  * **Description:** When "Open Stash" is clicked in `TownView`, display an overlay component for the Stash. This should feature a tabbed interface for multiple "chests" (initially, one tab is fine). The stash itself is another grid for items, supporting drag-and-drop from the player inventory to the stash, and vice-versa. Include placeholder areas for "spare player dolls" for loadouts (non-functional).  
  * **Deliverables:** Stash overlay with item grid and drag-and-drop interaction with player inventory.  
* **Task 1.4.7: Crafting Bench UI (Overlay \- Placeholder)**  
  * **Description:** When "Open Crafting Bench" is clicked, display an overlay. This should have a central "anvil" area (where an item to be crafted is placed) and a slot for a "crafting tool/consumable." For now, these are visual placeholders.  
  * **Deliverables:** Crafting bench overlay with placeholder slots.  
* **Task 1.4.8: Combat View \- Enemy Placement & Target Selector (Visuals Only)**  
  * **Description:** In `CombatView`, populate the enemy area with 1-3 visual placeholders for enemies (can be simple styled divs). Implement the visual aspect of the target selector: clicking an enemy placeholder should visually highlight it. The Attack/Block buttons should be present but do not need to trigger any game logic yet.  
  * **Deliverables:** Enemies visually represented. Clicking an enemy highlights it. Attack/Block buttons are visible.

*(Subsequent detailed tasks for combat logic, loot logic, etc., will follow once this UI foundation is in place)*

