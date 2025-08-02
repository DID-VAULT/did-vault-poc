

# DID Vault: A Verifiable Credential PoC for DPDP Act Compliance

![Project Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Tech Stack](https://img.shields.io/badge/tech-React%20|%20Ethers.js%20|%20Hardhat-cyan)

An open-source proof-of-concept exploring the use of W3C Verifiable Credentials (VCs) and Decentralized Identifiers (DIDs) on the Polygon network. This project aims to demonstrate a technical architecture for building privacy-preserving, user-centric identity solutions that align with the principles of India's Digital Personal Data Protection (DPDP) Act, 2023.

---

### Table of Contents
1. [Problem Statement](#problem-statement)
2. [Proposed Solution](#proposed-solution)
3. [Technical Architecture](#technical-architecture)
4. [Tech Stack](#tech-stack)
5. [Getting Started](#getting-started)
6. [Project Status](#project-status)
7. [Contributing](#contributing)
8. [License](#license)

### Problem Statement

With the enforcement of India's DPDP Act, data fiduciaries (businesses) face significant legal and financial liability for storing and managing Personally Identifiable Information (PII). Traditional identity verification processes, such as KYC, are inefficient, repetitive for users, and create centralized "honeypots" of sensitive data that are prime targets for breaches. There is a need for a system that can verify user claims (e.g., identity, age) without requiring the verifier to store the underlying PII.

### Proposed Solution

This project implements a decentralized identity model based on the "Triangle of Trust" (Issuer-Holder-Verifier).

* **Holder (User):** The user controls their own identity in a standard crypto wallet.
* **Issuer (DID Vault Service):** A trusted entity performs a one-time verification and issues a cryptographically signed Verifiable Credential to the user.
* **Verifier (Third-Party App):** A business can verify the authenticity and validity of the user's credential without directly accessing or storing their sensitive documents.

This model enables **data minimization** and **user consent**, two core pillars of the DPDP Act.

### Technical Architecture

1.  **Verifiable Credentials (VCs):** User credentials are created as W3C-compliant JSON objects containing specific claims. These are signed by the Issuer and held by the user in their wallet (off-chain).
2.  **Decentralized Identifiers (DIDs):** User and Issuer identities are represented by DIDs, derived from their public keys.
3.  **Smart Contract Registry (`VCRegistry.sol`):** A simple smart contract is deployed on the Polygon network. It does **not** store any PII. Its sole function is to act as a public, immutable registry for the status (Valid/Revoked) of a credential's hash.
4.  **Frontend dApp (React):** A user interface that allows users to connect their wallet, receive credentials, and present them for verification.

### Tech Stack

* **Frontend:** React.js, Ethers.js, Tailwind CSS
* **Smart Contract:** Solidity
* **Development Environment:** Hardhat
* **Target Network:** Polygon Amoy Testnet

### Getting Started

Follow these steps to run the project locally.

**Prerequisites:**
* Node.js (v18 or later)
* NPM
* A browser with the MetaMask extension installed

**1. Clone the repository:**
```bash
git clone [https://github.com/DID-VAULT/did-vault-poc.git](https://github.com/DID-VAULT/did-vault-poc.git)
cd did-vault-poc

**2. Install Dependencies:
This will install dependencies for both the React app and the Hardhat environment.
Bash

npm install

3. Set up Environment Variables:
Create a .env file in the project root and add your Polygon Amoy RPC URL and your private key.

AMOY_RPC_URL="[https://rpc-amoy.polygon.technology/](https://rpc-amoy.polygon.technology/)"
PRIVATE_KEY="YOUR_METAMASK_PRIVATE_KEY"

4. Compile the Smart Contract:
Bash

npx hardhat compile

5. Run the Frontend Application:
Bash

npm start

The application will be available at http://localhost:3000.

Project Status

This project is currently a Proof-of-Concept (PoC). The core mechanics are functional on the testnet. The next phase will involve integrating user-friendly onboarding (Account Abstraction) and building out the business-facing API.

Contributing

This project is currently in the early stages of research and is not actively accepting contributions at this time. Please check back for updates.

License

This project is licensed under the MIT License. See the LICENSE file for details.
