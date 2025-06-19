# 🧠 AI-Enhanced Smart Contract Generator

A full-stack DApp that uses AI to generate, compile, and deploy secure Solidity smart contracts to a local Ethereum blockchain (Ganache).

## 🚀 Features

- 🤖 **AI-Powered Contract Generation**  
  Uses OpenAI API to generate smart contracts from plain-language descriptions.

- 💾 **Utilities**  
  - Copy contract to clipboard  
  - Download as `.sol` file

- 🧪 **Smart Contract Compilation**  
  - Compiles Solidity code  
  - Displays detailed errors if any

- 📦 **Blockchain Deployment**  
  - Deploys contracts to Ganache using Web3.py  
  - Displays contract address, transaction hash, gas used, and ABI

---

## 🛠 Tech Stack

**Frontend:** React.js, Bootstrap, ethers.js  
**Backend:** Flask, Python, OpenAI API, Web3.py, py-solc-x  
**Blockchain:** Ganache CLI / Ganache GUI  
**AI:** OpenAI GPT (via ChatCompletion API)

---
## ⚙️ Setup Instructions

### 1. Clone the Repository
```
git clone https://github.com/VashishthSoni/AI-Enhanced-Smart-Contract-Generator.git
cd AI-Enhanced-Smart-Contract-Generator
```
### 2. Backend Setup (Python + Flask)
```
cd backend
python -m venv venv
source venv/bin/activate   # For Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a .env file in the backend folder:
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx

- Run the Flask server:
```python app.py```

### 3. Frontend Setup (React)
```
cd frontend
npm install
npm start
```

### 4. Start Ganache
Install Ganache CLI from https://trufflesuite.com/ganache
Run ganache CLI
Make sure it runs on default port 8545

### 🧪 Sample Usage
- Enter a smart contract idea (e.g., "a voting contract for a DAO").
- Click Generate to receive Solidity code.
- Click Compile to validate the contract.
- Click Deploy to deploy it on your local blockchain via Ganache.

## 📷 Screenshots
### Generate Contract:
![Generate](https://github.com/user-attachments/assets/cce0e32f-d5b2-4659-afd0-adbcafb2ea95)

### Copt Contract:
![Copy](https://github.com/user-attachments/assets/0a9805ee-7fd6-4465-8a7c-9ea1c0df8828)

### Download:
![Download](https://github.com/user-attachments/assets/09511894-244c-4613-bd7a-8f1c530a8cea)

### Contract Compile:
![Contract Compile](https://github.com/user-attachments/assets/801793d7-05dc-46ff-9c5e-01b1e6e90560)

### Deploy:
![Deploy](https://github.com/user-attachments/assets/eb0964ea-c747-451d-99c8-88c826ee4460)


### ✍️ Author
Vashishth Soni
Automation & AI Workflow Developer
<a href="https://www.linkedin.com/in/vashishthsoni/">LinkedIn</a> • <a href="https://github.com/VashishthSoni">GitHub</a>

📄 License
This project is licensed under the MIT License — feel free to use it with proper attribution.
