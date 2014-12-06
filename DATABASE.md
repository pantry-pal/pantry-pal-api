Pantry Pal
===
CSC 4402 - Fall 2014
Dr. Jianhua Chen


Project Stages
Write up a report describing the above processes [(a) - (c) in project description], including the script of program execution and program source code, with appropriate documentation.

I’m not 100% sure if this part needs to be in the report. It’s listed in Step 3d on the handout, but Step 5 explains again what the report should consist of. The format from Step 5 is outlined on the following pages.

Database Design

Application Domain						 				The database design part should give a reasonable description about the application domain, then show your analysis of the domain.

E-R Diagram


					 							
List the identified constraints and assumptions about the domain

Show your database design process and the result tables

List the functional dependencies, the primary key for each table, and the foreign keys.

Database System Implementation
---

Data Definition Statements
---

```sql
CREATE TABLE ingredient (
    id int    NOT NULL  AUTO_INCREMENT,
    name varchar(45)    NOT NULL ,
    CONSTRAINT ingredient_pk PRIMARY KEY (id)
);


-- Table: inventory
CREATE TABLE inventory (
    id int    NOT NULL  AUTO_INCREMENT,
    user int    NOT NULL ,
    category int    NOT NULL ,
    name varchar(45)    NOT NULL ,
    CONSTRAINT inventory_pk PRIMARY KEY (id)
);

-- Table: inventory_ingredient
-- inventory to ingredient relation table: inventory contains ingredients

CREATE TABLE inventory_ingredient (
    id int    NOT NULL  AUTO_INCREMENT,
    inventory int    NOT NULL ,
    ingredient int    NOT NULL ,
    amount varchar(45)    NOT NULL ,
    CONSTRAINT inventory_ingredient_pk PRIMARY KEY (id)
);

-- Table: recipe
CREATE TABLE recipe (
    id int    NOT NULL  AUTO_INCREMENT,
    user int    NOT NULL ,
    name varchar(45)    NOT NULL ,
    description text    NOT NULL ,
    directions text    NOT NULL ,
    CONSTRAINT recipe_pk PRIMARY KEY (id)
);

-- Table: recipe_ingredient
-- recipe to ingredient relation table: recipe contains ingredients

CREATE TABLE recipe_ingredient (
    id int    NOT NULL  AUTO_INCREMENT,
    recipe int    NOT NULL ,
    ingredient int    NOT NULL ,
    amount varchar(45)    NOT NULL ,
    CONSTRAINT recipe_ingredient_pk PRIMARY KEY (id)
);

-- Table: user
CREATE TABLE user (
    id int    NOT NULL  AUTO_INCREMENT,
    email varchar(45)    NOT NULL ,
    password varchar(45)    NOT NULL ,
    fname varchar(45)    NULL ,
    lname varchar(45)    NULL ,
    groups text    NOT NULL  COMMENT 'Linux-style rbac',
    CONSTRAINT user_pk PRIMARY KEY (id)
);
```

Insert Statements
INSERT INTO user (email, password, fname, lname, groups) VALUES (“cadetho@gmail.com”, “pa$$word1”, “Cade”, “Thomasson”, “admin”)
INSERT INTO user (email, password, fname, lname, groups) VALUES (randomemail@lsu.edu, “tigersrule”, “Mike”, “Tiger”, “user”)

INSERT INTO ingredient (name) VALUES (“cheese”)
INSERT INTO ingredient (name) VALUES (“eggs”)

INSERT INTO inventory (user, category, name) VALUES (1, “personal”, “home”)
INSERT INTO inventory (user, category, name) VALUES (5, “work”, “kitchenstock”)

INSERT INTO recipe (user, name, description, directions) VALUES (3, “scrambled eggs”, “light and fluffy scrambled eggs”, “1. heat a skillet to medium temperature and spray with non-stick spray 2. mix milk and eggs in a bowl 3. pour into skillet 4. scramble eggs by moving around until thoroughly cooked”)
INSERT INTO recipe (user, name, description, directions) VALUES (6, “cheese quesadilla”, “1. spread cheese over one side of a tortilla 2. fold tortilla in half 3. place on griddle and flatten 4. cook until golden brown and cheese is melted”)

INSERT INTO recipe_ingredient (recipe, ingredient, amount) VALUES (6, 1, “¼ cup”)
INSERT INTO recipe_ingredient (recipe, ingredient, amount) VALUES (3, 2, “2”)

INSERT INTO inventory_ingredient (inventory, ingredient, amount) VALUES (1, 2, “12”)
INSERT INTO inventory_ingredient (inventory, ingredient, amount) VALUES (2, 1, “4 cups”)

All Table Records
Users


Recipe



Inventory


Ingredient

recipe_ingredient


inventory_ingredient




Data Manipulation Statements
---
Statements can be tested at http://know.selby.io:3000/?username=pantry-pal&db=pantry-pal using host localhost, username pantry-pal, password pantry-pal, database pantry-pal


Get all ingredient names from recipe with id=5
SELECT ingredient.id, ingredient.name
FROM ingredient JOIN recipe_ingredient ON ingredient.id = recipe_ingredient.ingredient
WHERE ingredient.recipe = 5;


Get ingredient names and amounts for a recipe named “scrambled eggs”
SELECT name, amount
FROM ingredient JOIN recipe_ingredient ON ingredient.id = recipe_ingredient.ingredient
WHERE recipe_ingredient.recipe IN (SELECT id FROM recipe WHERE name="scrambled eggs");


Get names of all inventories belonging to user with email “trouss6@lsu.edu”
SELECT name
FROM inventory JOIN user ON inventory.user = user.id
WHERE email = "trouss6@lsu.edu";


Get all ingredient names and amounts in the inventory named “Restaurant Inventory”
SELECT name, amount
FROM ingredient JOIN inventory_ingredient ON ingredient.id = inventory_ingredient.ingredient
WHERE inventory_ingredient.inventory IN (SELECT id FROM inventory WHERE name="Restaurant Inventory");



Get all recipes that use the ingredient “Fish”
SELECT name
 FROM recipe 
WHERE id in (SELECT recipe FROM recipe_ingredient WHERE ingredient in (SELECT id from ingredient WHERE name="FISH"))


Get the ingredients, amounts required  to prepare all of a user’s recipes one time
```sql
SELECT `recipe_ingredient`.`ingredient`, `ingredient`.`name`, SUM(`recipe_ingredient`.`amount`) as 'recipes_require'
FROM `recipe`
JOIN `recipe_ingredient` ON (`recipe_ingredient`.`recipe` = `recipe`.`id`)
JOIN `ingredient` on (`ingredient`.`id` = `recipe_ingredient`.`ingredient`)
WHERE `recipe`.`user` = 1
GROUP BY `ingredient`.`id`;
```

Get all recipe id, name, descriptions that CAN be prepared using ingredients from an inventory
```sql
SELECT `id`, `user`, `name`, `description`, `directions`
FROM `recipe`
WHERE NOT EXISTS (SELECT *
FROM `recipe_ingredient`
JOIN `inventory_ingredient`
WHERE `recipe_ingredient`.`amount` > `inventory_ingredient`.`amount` AND `recipe_ingredient`.`recipe` = `recipe`.`id` AND `inventory_ingredient`.`inventory` = 1);
```


Get all recipe id, name, descriptions that CANNOT be prepared using ingredients from an inventory
```sql
SELECT `id`, `user`, `name`, `description`, `directions`
FROM `recipe`
WHERE EXISTS (SELECT *
FROM `recipe_ingredient`
JOIN `inventory_ingredient`
WHERE `recipe_ingredient`.`amount` > `inventory_ingredient`.`amount` AND `recipe_ingredient`.`recipe` = `recipe`.`id` AND `inventory_ingredient`.`inventory` = 1);
```


Get the ingredients that need to be purchased to prepare a recipe
```sql
SELECT `recipe_ingredient`.`ingredient`, `ingredient`.`name`, SUM(`recipe_ingredient`.`amount`-`inventory_ingredient`.`amount`) as 'amount_needed'
FROM `recipe`
JOIN `recipe_ingredient` ON (`recipe_ingredient`.`recipe` = `recipe`.`id`)
JOIN `inventory_ingredient` ON (`inventory_ingredient`.`ingredient` = `recipe_ingredient`.`ingredient`)
JOIN `ingredient` on (`ingredient`.`id` = `recipe_ingredient`.`ingredient`)
WHERE `recipe`.`id` = 3 AND `inventory_ingredient`.`inventory` = 1 AND `recipe_ingredient`.`amount`-`inventory_ingredient`.`amount` > 0
GROUP BY `ingredient`.`id`;
```

Get the ingredients that need to be purchased to prepare ALL a user’s recipes (my user only has 1 recipe that needs ingredients not in my inventory)
```sql
SELECT `recipe_ingredient`.`ingredient`, `ingredient`.`name`, SUM(`recipe_ingredient`.`amount`-`inventory_ingredient`.`amount`) as 'amount_needed'
FROM `recipe`
JOIN `recipe_ingredient` ON (`recipe_ingredient`.`recipe` = `recipe`.`id`)
JOIN `inventory_ingredient` ON (`inventory_ingredient`.`ingredient` = `recipe_ingredient`.`ingredient`)
JOIN `ingredient` on (`ingredient`.`id` = `recipe_ingredient`.`ingredient`)
WHERE `recipe`.`user` = 1 AND `inventory_ingredient`.`inventory` = 1 AND `recipe_ingredient`.`amount`-`inventory_ingredient`.`amount` > 0
GROUP BY `ingredient`.`id`;
```



Simple List Entity Selects
SELECT email, fname, lname, created_at, updated_at
FROM `user`
LIMIT 50


SELECT *
FROM `ingredient`
LIMIT 50

SELECT *
FROM `inventory`
LIMIT 50

SELECT *
FROM `recipe`
LIMIT 50

SELECT name, amount
FROM ingredient JOIN recipe_ingredient ON ingredient.id = recipe_ingredient.ingredient
WHERE recipe = 2;







Update Statements
---

UPDATE user
SET password="newPassword123"
WHERE email=“cadetho@gmail.com”;

UPDATE recipe
SET description='light and fluffy - GRANDPAS RECIPE'
WHERE name='scrambled eggs';

UPDATE recipe_ingredient
SET amount=0.5
WHERE recipe=6 AND ingredient=1;

UPDATE inventory_ingredient
SET amount=0.25
WHERE inventory=2 AND ingredient=1;



Application Access
---

* Web: http://pantry-pal.herokuapp.com/
* GitHub: https://github.com/pantry-pal
* Documentation: http://pantry-pal-api.herokuapp.com/




