CREATE TABLE pokemon (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    height DECIMAL NOT NULL,
    weight DECIMAL NOT NULL,
    base_experience INTEGER NOT NULL,
    types TEXT NOT NULL,
    abilities TEXT NOT NULL,
    sprite_url TEXT NOT NULL,
    shiny_sprite_url TEXT NOT NULL,
    base_hp DECIMAL,
    base_attack DECIMAL,
    base_defense DECIMAL,
    base_sp_attack DECIMAL,
    base_sp_defense DECIMAL,
    base_speed DECIMAL
);

