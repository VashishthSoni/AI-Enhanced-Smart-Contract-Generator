import React, { useState } from "react";
import axios from "axios";
import { Container, Form, Button, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { ethers } from "ethers";
import "bootstrap-icons/font/bootstrap-icons.css";  // Import Bootstrap icons

function App() {
  const [contractInput, setContractInput] = useState("");
  const [generatedContract, setGeneratedContract] = useState("");
  const [gasEstimate, setGasEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [theme, setTheme] = useState("light");
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [deploymentDetails, setDeploymentDetails] = useState(null);


  // Close modal handler
  const handleCloseModal = () => setShowModal(false);

  // Handle input change
  const handleInputChange = (e) => {
    setContractInput(e.target.value);
  };

  // Toggle theme mode
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-bs-theme", newTheme);
  };

  // Show Bootstrap Alert
  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);  // Auto-hide after 3 seconds
  };

  // Copy contract to clipboard
  const handleCopy = () => {
    if (!generatedContract) {
      showAlert("No contract available to copy.", "danger");
      return;
    }
    navigator.clipboard.writeText(generatedContract)
      .then(() => showAlert("Contract copied to clipboard!", "success"))
      .catch(() => showAlert("Failed to copy contract.", "danger"));
  };

  // Download contract
  const downloadContract = () => {
    if (!generatedContract) {
      showAlert("No contract available to download.", "danger");
      return;
    }
  
    const blob = new Blob([generatedContract], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "smart_contract.sol";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showAlert("Contract downloaded successfully!", "success");
  };

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);
        showAlert(`Wallet Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`, "success");
      } catch (error) {
        showAlert("Failed to connect wallet.", "danger");
      }
    } else {
      showAlert("MetaMask is not installed. Please install MetaMask!", "warning");
    }
  };

  // Generate contract
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/generate-contract", {
        contractPurpose: contractInput
      });

      // Remove extra formatting from code
      const cleanedContract = response.data.contractCode
        .replace(/```solidity/g, "")
        .replace(/```/g, "");

      setGeneratedContract(cleanedContract);
      estimateGas(cleanedContract);
      showAlert("Smart contract generated successfully!", "success");
    } catch (error) {
      showAlert("Failed to generate contract.", "danger");
    } finally {
      setLoading(false);
    }
  };

  // Compile Contract
  const compileContract = async () => {
    if (!generatedContract) {
      showAlert("No contract available to compile.", "danger");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/compile-contract", {
        contractCode: generatedContract
      });

      showAlert("Contract compiled successfully!", "success");
      console.log("Compiled Output:", response.data);
    } catch (error) {
      // Extract detailed error message
      const errorMessage = error.response?.data?.error || error.message || "An unknown error occurred.";
      
      setModalContent(errorMessage);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const deployContract = async () => {
    if (!generatedContract) {
      showAlert("No contract available to deploy.", "danger");
      return;
    }
  
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/deploy-contract", {
        contractCode: generatedContract
      });
  
      console.log("Full Deployment Response:", response.data); // Debugging
  
      setDeploymentDetails({
        contractAddress: response.data.contractAddress || "N/A",
        transactionHash: response.data.txHash || "N/A",
        gasUsed: response.data.gasUsed || "N/A",
        abi: response.data.abi || []
      });
  
      showAlert(`Contract Deployed at: ${response.data.contractAddress}`, "success");
    } catch (error) {
      showAlert("Failed to deploy contract.", "danger");
      console.error("Deployment Error:", error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };
  


  // Estimate gas
  const estimateGas = (contractCode) => {
    const functionCount = (contractCode.match(/function/g) || []).length;
    const variableCount = (contractCode.match(/uint|address|string|bool/g) || []).length;

    const gasPerFunction = 21000;
    const gasPerVariable = 5000;

    const totalGasEstimate = functionCount * gasPerFunction + variableCount * gasPerVariable;

    setGasEstimate({
      functions: functionCount * gasPerFunction,
      variables: variableCount * gasPerVariable,
      total: totalGasEstimate
    });
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#!">AI Smart-Contract Generator</a>

          <div className="d-flex ms-auto">
            {/* Toggle Mode Button */}
            <Button variant="secondary" onClick={toggleTheme} className="me-2">
              {theme === "light" ? "🌙" : "☀️"}
            </Button>

            {/* Connect Wallet Button */}
            <Button variant="primary" onClick={connectWallet}>
              {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connect Wallet"}
            </Button>
          </div>
        </div>
      </nav>

      <Container className="mt-5">
        {/* Bootstrap Alert */}
        {alert && (
          <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>
            <i className={`bi bi-check-circle-fill me-2 ${alert.type === "success" ? "text-success" : ""}`}></i>
            {alert.message}
          </Alert>
        )}
        {/* Error Modal */}
        {showModal && (
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">Compilation Error</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  <p>{modalContent}</p>
                </div>
                <div className="modal-footer">
                  <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Input Field */}
        <Row>
          <Col>
            <h2 className="text-center mb-5">Enter Contract Details to Generate Solidity Code:</h2>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col md={8}>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Enter contract description..."
              value={contractInput}
              onChange={handleInputChange}
            />
          </Col>
          <Col md={4}>
            <Button variant="info" className="w-100" onClick={handleGenerate} disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Generate"}
            </Button>
          </Col>
        </Row>

        {/* Copy & Download Buttons */}
        {generatedContract && (
          <Row className="mt-3">
            <Col>
              <Button variant="secondary" onClick={downloadContract} className="mx-2">Download 💾</Button>
              <Button variant="warning" onClick={handleCopy} className="mx-2">Copy 📋</Button>
              <Button variant="primary" onClick={compileContract} className="mx-2">Compile Contract</Button>
              <Button variant="danger" onClick={deployContract} className="mx-2">Deploy Contract</Button>
            </Col>
          </Row>
        )}

        {/* Generated Contract Section */}
        {generatedContract && (
          <Row className="mt-4">
            <Col>
              <Card className="card text-white bg-dark mb-3">
                <Card.Header>
                  <strong>Generated Contract Code:</strong>
                </Card.Header>
                <Card.Body>
                  <Form.Control
                    as="textarea"
                    rows={10}
                    value={generatedContract}
                    onChange={(e) => setGeneratedContract(e.target.value)}
                    className="bg-light text-dark"
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
        {deploymentDetails && (
        <Row className="mt-4">
          <Col>
            <Card className="card text-white bg-dark">
              <Card.Header>
                <strong>Deployment Details:</strong>
              </Card.Header>
              <Card.Body>
                <p><strong>Contract Address:</strong> {deploymentDetails.contractAddress}</p>
                <p><strong>Transaction Hash:</strong> {deploymentDetails.transactionHash}</p>
                <p><strong>Gas Used:</strong> {deploymentDetails.gasUsed}</p>
                <p><strong>ABI:</strong></p>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={JSON.stringify(deploymentDetails.abi, null, 2)}
                  readOnly
                  className="bg-light text-dark"
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}


      </Container>
    </>
  );
}

export default App;
