# riverstat.us - lambda

Lambda function that converts http://water.weather.gov/ahps2/hydrograph_to_xml.php?gage=rmdv2&output=xml to json

# Installation

    npm install

# Configuration

There are 2 types of configuration files set up in the `env/` directory.

- `XXX.env.production` are various environment files that are processed into a `.env` file for the lambda to consume.
- `config.json` is a json file that contains the program level config that AWS ignores from the .env file.
  - `config.json` uses the value of `XXX.env.production`'s `AWS_LAMBDA_FUNCTION_NAME` variable to determine which config section to use during execution.

# Running the scripts

Each config and env needs a seperate gulp deploy task in order to be invoked.

    gulp deploy_production

OR

    gulp deploy_azure

the gulp task sets up the environment level configs to use, and then builds using shared subtasks.
