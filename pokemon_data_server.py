from flask import Flask, jsonify, render_template, request, send_from_directory
import requests
import random
import os
import psycopg2
import json
import re

DB_NAME = "pokemondb"
DB_USER = "ash"
DB_PASSWORD = "ketchum"
DB_HOST = "localhost"
DB_PORT = "5432"

app = Flask(__name__)

ICONS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'icons')

def clean_json_string(json_string):
    string = str(json_string)
    string = string.replace("'", '"').replace("null","None")
    string = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', string)
    return string

@app.route('/icons/<path:filename>')
def serve_icon(filename):
    return send_from_directory(ICONS_DIR, filename)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/get-random-pokemon', methods=['GET'])

def get_random_pokemon():
    generation = request.args.get('generation')
    conn = psycopg2.connect(dbname = DB_NAME, user = DB_USER, password = DB_PASSWORD, host = DB_HOST, port = DB_PORT)
    cursor = conn.cursor()
    def get_nature():
        nature = random.choice(['Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty', 'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax', 'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive', 'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash', 'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'])
        if nature in ['Hardy', 'Docile', 'Serious', 'Bashful', 'Quirky']:
            return (nature, None, None)
        else:
            if nature == 'Lonely':
                return (nature, 'Attack', 'Defense')
            elif nature == 'Brave':
                return (nature, 'Attack', 'Speed')
            elif nature == 'Adamant':
                return (nature, 'Attack', 'Sp. Attack')
            elif nature == 'Naughty':
                return (nature, 'Attack', 'Sp. Defense')
            elif nature == 'Bold':
                return (nature, 'Defense', 'Attack')
            elif nature == 'Relaxed':
                return (nature, 'Defense', 'Speed')
            elif nature == 'Impish':
                return (nature, 'Defense', 'Sp. Attack')
            elif nature == 'Lax':
                return (nature, 'Defense', 'Sp. Defense')
            elif nature == 'Timid':
                return (nature, 'Speed', 'Attack')
            elif nature == 'Hasty':
                return (nature, 'Speed', 'Defense')
            elif nature == 'Jolly':
                return (nature, 'Speed', 'Sp. Attack')
            elif nature == 'Naive':
                return (nature, 'Speed', 'Sp. Defense')
            elif nature == 'Modest':
                return (nature, 'Sp. Attack', 'Attack')
            elif nature == 'Mild':
                return (nature, 'Sp. Attack', 'Defense')
            elif nature == 'Quiet':
                return (nature, 'Sp. Attack', 'Speed')
            elif nature == 'Rash':
                return (nature, 'Sp. Attack', 'Sp. Defense')
            elif nature == 'Calm':
                return (nature, 'Sp. Defense', 'Attack')
            elif nature == 'Gentle':
                return (nature, 'Sp. Defense', 'Defense')
            elif nature == 'Sassy':
                return (nature, 'Sp. Defense', 'Speed')
            elif nature == 'Careful':
                return (nature, 'Sp. Defense', 'Sp. Attack')
    def get_moves(id):
        query = """SELECT moveset FROM pokemondb.pokemon WHERE id = %s"""
        cursor.execute(query, (id,))
        move_data = cursor.fetchone()[0] 
        move_data = [{'name': name, **details} for name, details in move_data.items()]  
        try:
            if len(move_data) > 4:
                return random.sample(move_data, 4)
            else: # fetch and return what's there
                move_data
        except json.JSONDecodeError:
            return []
    sprite_type = 'shiny_sprite_url' if random.randint(1, 8192) == 1 else 'sprite_url'
    generation_ranges = {1: (1, 151), 2: (152, 251), 3: (252, 386), 4: (387, 493), 5: (494, 649), 6: (650, 721), 7: (722, 809), 8: (810, 898), 9: (899, 1025)}
    start_id, end_id = generation_ranges[generation] if generation in generation_ranges else (1, 1010)   
    pokemon_id = random.randint(start_id, end_id)
    query = """SELECT * FROM pokemondb.pokemon WHERE id = %s""" 
    cursor.execute(query, (pokemon_id,))
    data = cursor.fetchone()    
    if data:
        columns = [desc[0] for desc in cursor.description]
        data = dict(zip(columns, data))
        pokemon_type = ""
        if ',' in data['types']:
            pokemon_type = data['types'].replace(", ", '/').title()
        else:
            pokemon_type = data['types'].title()
        return jsonify({
            'name': data['name'].capitalize(),
            'sprite': data[sprite_type],
            'id': data['id'],
            "hp": data['base_hp'],
            "attack": data['base_attack'],
            "defense": data['base_defense'],
            "special-attack": data['base_sp_attack'],
            "special-defense": data['base_sp_defense'],
            "speed": data['base_speed'],
            "type": pokemon_type,
            "height": data['height'],
            "weight": data['weight'],
            "cry": data['cry_url'],
            "ability": random.choice(data['abilities'].split(",")),
            "moves": get_moves(data['id']),
            "nature": get_nature(),  
            "ivs": [random.randint(0,31) for i in range(0,6)]
            }      
        )
    else:
        return jsonify({'error': 'Failed to fetch Pokémon'}), 500


@app.route('/save-pokemon', methods=['POST'])
def save_pokemon():
    data = request.get_json()
    trainer_name = data['trainerName']
    team_name = data['teamName']
    team = data['team']
    conn = psycopg2.connect(
        dbname = DB_NAME, user = DB_USER, password = DB_PASSWORD, host = DB_HOST, port = DB_PORT
    )
    cursor = conn.cursor()
    query = """select distinct trainer_name, team_name from pokemondb.stored_pokemon;"""
    cursor.execute(query)
    current_teams = cursor.fetchall()
    if any((trainer_name, team_name) == t for t in current_teams):
        return jsonify({'message': f'Error: {(trainer_name, team_name)} Duplicate team and trainer combination exists!'})
    else:
        for member in team:
            query = """INSERT INTO pokemondb.stored_pokemon (pokedex_id, name, trainer_name, team_name, 
            date_modified, type, level, hp, attack, defense, sp_attack, sp_defense, 
            speed, iv_0,iv_1,iv_2,iv_3,iv_4,iv_5, nature, ability, move_1, move_2, move_3, move_4)
            VALUES (%s, %s, %s, %s, CURRENT_DATE , %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) """
            cursor.execute(query, (member['id'], member['name'], trainer_name, team_name, 
                        member['type'], member['level'],member['hp'], member['attack'], member['defense'], 
                        member['specialAttack'], member['specialDefense'], member['speed'], member['ivs'][0],member['ivs'][1],
                        member['ivs'][2],member['ivs'][3],member['ivs'][4],member['ivs'][5], member['nature'], member['ability'],
                        member['moves'][0]['name'], member['moves'][1]['name'], member['moves'][2]['name'], member['moves'][3]['name']))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'message': 'Pokemon saved successfully'})

if __name__ == '__main__':
    app.run(debug=True, port=5500)