import psycopg2
import json
import requests

DB_NAME = "pokemondb"
DB_USER = "ash"
DB_PASSWORD = "ketchum"
DB_HOST = "localhost"
DB_PORT = "5432"

MAX_POKEDEX_NUMBER = 1025

def get_pokemon_data(id):
    MAX_RETRIES = 3
    retry_counter = 0
    base_url = f"https://pokeapi.co/api/v2/pokemon/{id}/"
    response = requests.get(f"{base_url}")
    data = response.json()
    moveset = {}
    if response.status_code == 200:
            # for move_entry in data['moves']:
            #     move_name = move_entry['move']['name']
            #     move_data_url = move_entry['move']['url']
            #     move_response = requests.get(f"{move_data_url}/")
            #     if move_response.status_code != 200:
            #         print(f"Error fetching move details for {move_name}: {move_response.status_code}")
            #         continue
            #     move_data = move_response.json()
            #     move_details = {
            #         "power": move_data.get("power") if move_data.get("power") else 'NA',  # None if no power is specified
            #         "pp": move_data.get("pp"),
            #         "type": move_data['type']['name'],
            #         "effect_entry": move_data['effect_entries'][0]['effect'] if move_data['effect_entries'] else "No effect description",
            #         "accuracy": move_data.get("accuracy") if move_data.get("power") else 'NA' # None if no accuracy is specified
            #     }
            #     # Add to the moveset dictionary
            #     moveset[move_name] = move_details
            # return json.dumps(moveset)
        cry = data['cries']['legacy'] if data['cries']['legacy'] is not None else data['cries']['latest']
        # # name = data['name']
        # height = data['height']/10
        # weight = data['weight']/10
        # base_experience = data['base_experience']
        # types = ", ".join(t['type']['name'] for t in data['types'])
        # abilities = ", ".join(a['ability']['name'] for a in data['abilities'])
        # sprite_url = data['sprites']['front_default']
        # shiny_sprite_url = data['sprites']['front_shiny']
        # base_stats = [s['base_stat'] for s in data['stats']]
        return cry
    else:
        retry_counter += 1
        if retry_counter < MAX_RETRIES:
            return get_pokemon_data(id)
        else:
            return "Error fetching data"

def insert_pokemon_data(cursor, data, id):
    # query = """INSERT INTO pokemondb.pokemon (name, height, weight, base_experience, types, abilities, sprite_url, shiny_sprite_url, base_hp, base_attack, base_defense, base_sp_attack, base_sp_defense, base_speed)
    # VALUES (%s, %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) 
    # """

    query = f"""UPDATE pokemondb.pokemon SET cry_url = %s WHERE id = %s"""
    cursor.execute(query, (data, id))

def main():
    PROGRESS_BAR_LENGTH = 50
    print("Connecting to database...")
    conn = psycopg2.connect(
        dbname = DB_NAME, user = DB_USER, password = DB_PASSWORD, host = DB_HOST, port = DB_PORT
    )
    cursor = conn.cursor()
    progress = 0
    print("Inserting pokemon data...")
    for id in range(1, MAX_POKEDEX_NUMBER):
        pokemon_data = get_pokemon_data(id)
        if pokemon_data:
            insert_pokemon_data(cursor, pokemon_data, id)
            progress += 1
            percent_complete = (progress / MAX_POKEDEX_NUMBER) * 100
            bar = '#' * int(PROGRESS_BAR_LENGTH * progress // MAX_POKEDEX_NUMBER)  # create filled part of the bar
            spaces = '-' * (PROGRESS_BAR_LENGTH - len(bar))  # create unfilled part of the bar
            print(f"[{bar}{spaces}] {percent_complete:.2f}%", end='\r')
    conn.commit()
    cursor.close()
    conn.close()
    print("/n Insert finished")

if __name__ == "__main__":
    main()
