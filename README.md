# PokémonDB

PokémonDB is a web application that allows users to create and manage Pokémon teams. Users can randomly generate Pokémon, view their stats, and save their teams for future reference.

## Features

- **Random Pokémon Generation**: Generate random Pokémon based on selected generations.
- **Team Management**: Add generated Pokémon to your team, view team details, and save teams with custom names.
- **Stat Calculation**: View detailed stats for each Pokémon, including level-based calculations and nature effects.
- **Type Icons**: Visual representation of Pokémon types using icons.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Python (Flask)
- **Database**: PostgreSQL
- **Version Control**: Git

## Getting Started

### Prerequisites

- Python 3.x
- PostgreSQL
- Git

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/dgwamna44/pokemondb.git
   cd pokemondb
Set Up Virtual Environment:

bash
Copy
Edit
python3 -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
Install Dependencies:

bash
Copy
Edit
pip install -r requirements.txt
Configure the Database:

Create a PostgreSQL database named pokemondb.
Update the database connection details in your application configuration.
Run the Application:

bash
Copy
Edit
python pokemon_data_server.py
Access the Application: Open your browser and navigate to http://127.0.0.1:5000.

Usage
Generate Pokémon: Click on the Pokéball to generate random Pokémon choices.
![image](https://github.com/user-attachments/assets/a89ced1d-9e26-483b-9fa3-1cb9408970e6)

Add to Team: Click on a Pokémon to view details and add it to your team.
![image](https://github.com/user-attachments/assets/3c17e563-44ba-45e4-8486-c5b681934fe9)

Save Team: Once your team has 6 Pokémon, save it with a custom name.
![image](https://github.com/user-attachments/assets/f5d4f492-b1f2-4b0c-b611-914130c8cd41)
![image](https://github.com/user-attachments/assets/19d40c82-aea8-4302-b58a-866791e45111)


Manage Teams: View and manage your saved teams.
Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.

License
This project is licensed under the MIT License. See the LICENSE file for details.

Acknowledgments
Inspired by the Pokémon franchise.
Pokémon data sourced from PokéAPI.
sql
Copy
Edit





