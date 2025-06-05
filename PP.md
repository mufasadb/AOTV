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
Section 1 is now complete

**Section 2:**
Task 2.1.3: Integrate Player Stats with UI

Description: Connect the playerStore to the High-Level Stats Bar UI (Task 1.4.4) and the "Stats" tab in the TownView (Task 1.2.2 / 1.4.5) so they display actual values from the store.

Deliverables: Player HP and Attack Power are dynamically displayed and update if changed in the store.

Notes: Use MobX observer HOC or hooks to make components reactive.

Task 2.2.1: Implement Turn Manager Logic (MobX)

Description: In combatStore.js, implement a simple turn management system. Add an observable property like currentTurn: 'player' | 'enemy'. Create actions to switch turns (e.g., endPlayerTurn(), startEnemyTurn()).

Deliverables: Logic to track and change the current turn.

Notes: The actual turn progression will be triggered by player actions or after enemy actions complete.

Task 2.2.2: Display Current Turn in UI

Description: In the CombatView, display a message indicating whose turn it is (e.g., "Player's Turn" or "Enemies' Turn") based on combatStore.currentTurn.

Deliverables: UI element dynamically shows the current turn.

Task 2.3.1: Implement Player "Attack" Action Logic

Description: When the "Attack" button in CombatView is clicked and an enemy is targeted:

Verify it's the player's turn.

Get player's baseAttackPower from playerStore.

Reduce the targeted enemy instance's currentHP in combatStore by the player's attack power.

Trigger endPlayerTurn() if the action is successful.

Deliverables: Clicking "Attack" on a selected enemy reduces its HP. The turn advances to the enemy.

Notes: Ensure an enemy must be selected. Disable attack button if not player's turn. For this prototype phase, damage calculation is direct: damage dealt = attacker's attackPower. No other modifiers (like defense, critical hits, or damage ranges) are implemented yet, beyond the specific 'Block' mechanic.

Task 2.3.2: Update Enemy UI on Damage

Description: The CombatView should observe changes to enemy HP in combatStore and update the visual representation of enemies (e.g., HP bar or text) when they take damage.

Deliverables: Enemy HP display updates in real-time.

Task 2.4.1: Implement Player "Block" Action Logic

Description: When the "Block" button in CombatView is clicked:

Verify it's the player's turn.

Set a temporary status on the playerStore (e.g., isBlocking: true).

Trigger endPlayerTurn().

Deliverables: Clicking "Block" sets a blocking status on the player and advances the turn.

Notes: When the player next takes damage (in Task 2.5.1), if isBlocking is true, reduce that instance of damage by 50%, and then immediately set isBlocking = false. This means the block applies to only one hit.

Task 2.5.1: Implement Basic Enemy AI Action

Description: When startEnemyTurn() is called and combatStore.currentTurn is 'enemy':

Iterate through active enemy instances. For now, the first living enemy instance attacks.

The active enemy instance deals its attackPower (from its JSON definition/instance data) as damage to the player's currentHP in playerStore.

If player isBlocking, reduce damage taken by 50%. Reset playerStore.isBlocking to false.

After the enemy action, switch turn back to player (combatStore.currentTurn = 'player').

Deliverables: Player takes damage from an enemy during the enemy's turn. Block correctly mitigates damage. Turn returns to player.

Notes: This is very basic AI. For this prototype phase, damage calculation is direct: damage dealt = attacker's attackPower. No other modifiers implemented yet.

Task 2.6.1: Display Floating Damage Numbers

Description: When damage is dealt (to player or enemy), display a temporary "floating" number near the target indicating the damage amount.

Deliverables: Visual feedback for damage dealt.

Notes: This can be a simple animated component that appears and fades out.

Task 2.7.1: Implement Combat End Condition - Player Defeat

Description: Continuously monitor playerStore.currentHP. If it reaches 0 or less:

Set a game state to "Combat Lost" (e.g., in combatStore).

Display a "Defeat!" message or modal.

Provide an option to return to TownView (no item loss penalties for this prototype phase).

Deliverables: Combat ends when player HP is 0, defeat message shown.

Task 2.7.2: Implement Combat End Condition - Player Victory

Description: Continuously monitor enemy HPs in combatStore. If all enemies' currentHP reach 0 or less:

Set a game state to "Combat Won."

Trigger the RewardModal (Task 1.2.4) to be displayed.

Deliverables: Combat ends when all enemies are defeated, Reward Modal appears.

Notes: The Reward Modal's "Return to Town" button will handle navigation. Loot generation will be a separate set of tasks.