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
Add to Team: Click on a Pokémon to view details and add it to your team.
Save Team: Once your team has 6 Pokémon, save it with a custom name.
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

**Notes**:

- Ensure that the `requirements.txt` file lists all necessary Python packages for your project.
- Update the database configuration section with specific details relevant to your setup.
- Include any additional information that might help users understand and contribute to your project.

Feel free to customize this template to better fit the specifics of your project!
::contentReference[oaicite:0]{index=0}
 






