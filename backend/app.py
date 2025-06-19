from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import openai
import solcx  # Solidity compiler for Python
from solcx import compile_source, compile_standard, install_solc  
from web3 import Web3
# Load environment variables from .env file
load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)
CORS(app)  # Allow requests from React frontend

# Connect to Ganache
GANACHE_URL = "HTTP://127.0.0.1:8545"  # Change this if Ganache is running on a different port
w3 = Web3(Web3.HTTPProvider(GANACHE_URL))
if w3.is_connected():
    print("Connected to Ganache!")
else:
    print("Failed to connect to Ganache.")
    
solcx.install_solc("0.8.20")
solcx.set_solc_version("0.8.20")



# Ensure Solidity compiler is installed
solcx.install_solc("0.8.20")
solcx.set_solc_version("0.8.20")


@app.route('/generate-contract', methods=['POST'])
def generate_contract():
    try:
        data = request.get_json()
        contract_purpose = data.get('contractPurpose')

        if not contract_purpose:
            return jsonify({"error": "Contract purpose is required"}), 400

        # Define the prompt
        prompt = f"""
        Generate a complete and functional Solidity smart contract for {contract_purpose}.
        The contract should include:
        1) The contract name.
        2) Relevant state variables.
        3) Necessary functions.
        4) Important events.
        Only provide the contract code. Do not include any additional explanations or instructions.
        """

        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}]
        )
        
        contract_code = response.choices[0].message.content.strip("``` solidity").strip("```")

        return jsonify({"contractCode": contract_code})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/compile-contract', methods=['POST'])
def compile_contract():
    try:
        data = request.get_json()
        contract_code = data.get('contractCode')

        if not contract_code:
            return jsonify({"error": "Contract code is required"}), 400

        install_solc("0.8.20")  # Ensure Solidity compiler is installed
        compiled_sol = compile_standard(
            {
                "language": "Solidity",
                "sources": {"Contract.sol": {"content": contract_code}},
                "settings": {"outputSelection": {"*": {"*": ["abi", "metadata", "evm.bytecode"]}}},
            },
            solc_version="0.8.20",
        )

        return jsonify({"compiledCode": compiled_sol})

    except Exception as e:
        return jsonify({"error": str(e)}), 500  # Return detailed error message

@app.route('/deploy-contract', methods=['POST'])
def deploy_contract():
    try:
        data = request.get_json()
        contract_code = data['contractCode']

        compiled_sol = compile_source(contract_code)
        contract_interface = compiled_sol[next(iter(compiled_sol))]

        # Deploy contract
        w3.eth.default_account = w3.eth.accounts[0]
        Contract = w3.eth.contract(abi=contract_interface['abi'], bytecode=contract_interface['bin'])
        tx_hash = Contract.constructor().transact()
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        # Debugging: Print all deployment details
        print("Deployment Details:", {
            "contractAddress": tx_receipt.contractAddress,
            "transactionHash": tx_hash.hex(),
            "gasUsed": tx_receipt.gasUsed,
            "abi": contract_interface['abi']
        })

        return jsonify({
            "contractAddress": tx_receipt.contractAddress,
            "txHash": tx_hash.hex(),
            "gasUsed": tx_receipt.gasUsed,
            "abi": contract_interface['abi']
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
