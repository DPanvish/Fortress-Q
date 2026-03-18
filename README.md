# Fortress-Q: Quantum-Resistant Blockchain Infrastructure

## 1. Introduction

Fortress-Q is a comprehensive, full-stack final year major project designed to demonstrate the profound impact of quantum computing on modern blockchain technology. As quantum computers advance, they threaten to break the foundational cryptographic protocols that secure today's digital assets and decentralized networks. Fortress-Q explores both the imminent threats posed by quantum algorithms to current cryptographic standards (like RSA and ECC) and the robust solutions offered by Post-Quantum Cryptography (PQC) and Quantum Key Distribution (QKD).

This project serves as a bridge between theoretical quantum physics, advanced cryptography, and practical software engineering, providing a tangible implementation of a quantum-secure environment.

---

## 2. Literature Survey

The advent of quantum computing introduces a paradigm shift in computational complexity, fundamentally challenging the security of classical cryptographic systems.

### 2.1 Classical Cryptography in Blockchain
Current blockchain architectures, including Bitcoin and Ethereum, rely heavily on Elliptic Curve Cryptography (ECC), specifically the `secp256k1` curve, for digital signatures (ECDSA). These systems base their security on the computational hardness of the Elliptic Curve Discrete Logarithm Problem (ECDLP). For classical computers, solving ECDLP is practically infeasible.

### 2.2 The Quantum Threat
In 1994, Peter Shor formulated a quantum algorithm (Shor's Algorithm) capable of factoring large integers and solving discrete logarithms in polynomial time. A sufficiently powerful, fault-tolerant quantum computer running Shor's algorithm would completely compromise RSA and ECC, allowing an attacker to derive a user's private key from their public key, thereby gaining full control over their blockchain assets.
Furthermore, Grover's algorithm, a quantum search algorithm, provides a quadratic speedup over classical brute-force searches. While not as devastating as Shor's algorithm, it effectively halves the security strength of symmetric cryptographic primitives (like AES) and cryptographic hash functions (like SHA-256), impacting the Proof-of-Work mining process.

### 2.3 Post-Quantum Cryptography (PQC)
To mitigate these threats, the National Institute of Standards and Technology (NIST) initiated a process to standardize Post-Quantum Cryptography (PQC) algorithms. These algorithms run on classical computers but are mathematically designed to be resistant to attacks from both classical and quantum computers. Leading candidates are based on mathematical frameworks such as:
*   **Lattice-based cryptography:** Relying on the hardness of problems like Learning With Errors (LWE) and Shortest Vector Problem (SVP). (e.g., CRYSTALS-Kyber, CRYSTALS-Dilithium).
*   **Hash-based cryptography:** Relying on the security of well-established hash functions.
*   **Multivariate cryptography:** Based on the difficulty of solving systems of multivariate polynomial equations.

### 2.4 Quantum Key Distribution (QKD)
While PQC relies on computational hardness assumptions, QKD (such as the BB84 protocol developed by Bennett and Brassard in 1984) utilizes the principles of quantum mechanics (specifically Heisenberg's Uncertainty Principle and the No-Cloning Theorem) to guarantee unconditionally secure communication. Any attempt by an eavesdropper to intercept the quantum key introduces detectable anomalies, alerting the communicating parties.

---

## 3. Research Gap

While extensive theoretical research exists regarding quantum threats and PQC solutions, there is a distinct gap in practical, accessible, and integrated implementations.

1.  **Lack of Unified Educational Platforms:** Most tools focus on either classical blockchain development OR quantum computing simulations. There are few platforms that visually and practically integrate both to demonstrate the transition from classical vulnerability to quantum security.
2.  **Implementation Complexity:** Integrating complex PQC algorithms (like CRYSTALS-Kyber and Dilithium) and simulating quantum protocols (like BB84 and Shor's) within a standard modern web architecture (MERN/Vite stack) remains a complex challenge not widely addressed in standard academic curricula.
3.  **Hybrid Architecture Demonstration:** The transition to a quantum-secure internet will not be instantaneous. There is a need for models demonstrating "hybrid" systems where classical (ECDSA) and quantum-resistant (PQC) identities coexist, which Fortress-Q actively implements.

---

## 4. Project Objectives

1.  To simulate and demonstrate the vulnerability of classical blockchain cryptography using Shor's algorithm.
2.  To implement a quantum-resistant user authentication and key exchange system using NIST-standardized PQC algorithms (CRYSTALS-Kyber).
3.  To simulate lattice-based digital signatures (CRYSTALS-Dilithium) to represent quantum-secure transactions.
4.  To simulate the BB84 Quantum Key Distribution protocol to demonstrate information-theoretic secure communication.
5.  To illustrate the impact of Grover's algorithm on blockchain mining (Proof of Work).
6.  To provide a comprehensive, interactive web interface for users to visualize and interact with these quantum concepts.

---

## 5. System Architecture & File Structure

Fortress-Q is built using a modern, decoupled architecture consisting of a React-based frontend, a Node.js backend, Python-based quantum simulation scripts (using Qiskit), and Solidity smart contracts.

### 5.1 High-Level Directory Structure

```text
fortress-q/
│
├── client/                 # Frontend React application (Vite)
│   ├── public/             # Static assets
│   ├── src/                # React source code (Components, Pages, Hooks, Contexts)
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
│
├── server/                 # Backend Node.js Express server
│   ├── config/             # Database and environment configurations
│   ├── controllers/        # Route logic (Auth, Quantum processing)
│   ├── middleware/         # Express middleware (Auth guards, error handling)
│   ├── models/             # MongoDB Mongoose schemas
│   ├── routes/             # API endpoint definitions
│   ├── utils/              # Helper functions
│   ├── quantum-engine/     # Python integration logic
│   ├── index.js            # Server entry point
│   ├── package.json        # Backend dependencies
│   ├── shor_algorithm.py   # Qiskit simulation of Shor's Algorithm
│   ├── lattice_sign.py     # Simulation of CRYSTALS-Dilithium signatures
│   ├── quantum_bb84.py     # Qiskit simulation of the BB84 QKD protocol
│   ├── quantum_mining.py   # Qiskit simulation of Grover's algorithm for mining
│   └── quantum_rng.py      # Quantum Random Number Generator simulation
│
├── contracts/              # Solidity Smart Contracts (Hardhat environment)
├── ignition/               # Hardhat Ignition deployment modules
├── test/                   # Smart contract testing scripts
├── hardhat.config.js       # Hardhat configuration
├── PROJECT_DOCUMENTATION.md# Internal algorithmic documentation
└── README.md               # This comprehensive project documentation
```

---

## 6. Detailed Algorithmic Implementations

This section details the specific algorithms implemented in the project, their theoretical basis, and their practical implementation within the codebase.

### 6.1 Shor's Algorithm (Integer Factorization)
*   **Purpose:** Shor's algorithm is used to demonstrate the vulnerability of legacy public-key cryptography (like RSA and ECDSA). These cryptosystems rely on the difficulty of factoring large integers or solving the discrete logarithm problem. Shor's algorithm solves these problems exponentially faster than the best-known classical algorithms.
*   **How It Works:**
    1.  *Classical Part:* Reduces the factoring problem to finding the period of a function $f(x) = a^x \pmod N$.
    2.  *Quantum Part:* Uses Quantum Phase Estimation (QPE) to find the period $r$. It involves initializing qubits in superposition, applying modular exponentiation, performing the Inverse Quantum Fourier Transform (QFT†), and measuring the result.
*   **Implementation (`server/shor_algorithm.py`):**
    *   Utilizes the `Qiskit` library.
    *   Specifically targets factoring $N=15$ using $a=7$ on a simulated quantum circuit with 8 counting qubits and 4 target qubits.
    *   Includes a classical fallback function `classical_factorization(N)` to mathematically simulate the period-finding step for larger numbers where local quantum simulation is computationally prohibitive.

### 6.2 Lattice-Based Cryptography (CRYSTALS-Dilithium)
*   **Purpose:** To demonstrate a "Quantum Vault" secure against Shor's algorithm. Lattice-based cryptography is a leading candidate for PQC standardization by NIST, relying on the hardness of lattice problems (like Learning With Errors - LWE).
*   **How It Works:** Dilithium is a digital signature scheme based on finding short vectors in lattices. It involves generating a matrix $A$ and vectors $s, e$. The signature vector $z$ is created to satisfy a linear relation with the message hash, while keeping the secret $s$ hidden using rejection sampling.
*   **Implementation (`server/lattice_sign.py`):**
    *   This is a sophisticated simulation that mimics the behavior and structure of Dilithium.
    *   Generates a deterministic signature using `SHAKE-256` (a quantum-resistant hash function).
    *   Produces output fields mimicking the real protocol: `z_vector` (the signature proof) and `h_hint`.

### 6.3 CRYSTALS-Kyber (Key Encapsulation)
*   **Purpose:** To provide a quantum-safe method for encryption and key exchange. Kyber is a Key Encapsulation Mechanism (KEM) chosen by NIST for standardization.
*   **How It Works:** Based on the hardness of solving learning with errors (LWE) problems on module lattices. It involves key generation, encapsulation (generating a shared secret and ciphertext), and decapsulation (recovering the shared secret).
*   **Implementation (`server/controllers/auth.controller.js`):**
    *   Utilizes the `crystals-kyber-js` library.
    *   Implements `MlKem1024` (Module-Lattice-based KEM, NIST Level 5 - the highest security level).
    *   During user registration, a Kyber public/private key pair is generated and stored, establishing a quantum-resistant identity alongside their classical ECDSA keys.

### 6.4 Quantum Key Distribution (BB84 Protocol)
*   **Purpose:** To demonstrate secure communication and key exchange that is theoretically unbreakable, relying on the laws of quantum physics.
*   **How It Works:** Alice sends qubits in random states from two bases (Rectilinear and Diagonal). Bob measures using random bases. They publicly compare bases and keep the matching bits (sifting). Any eavesdropper (Eve) disturbs the quantum state (No-Cloning Theorem), introducing a detectable Quantum Bit Error Rate (QBER).
*   **Implementation (`server/quantum_bb84.py`):**
    *   Simulated using `Qiskit` for a transmission of 24 qubits.
    *   Calculates the QBER to detect interception. If `intercept=True` is simulated, the measurement collapses the state, introducing errors that signify an attack.

### 6.5 Quantum Mining (Grover's Algorithm)
*   **Purpose:** To demonstrate the potential advantage of quantum computers in "mining" (Proof of Work), which involves searching for a nonce that produces a specific hash.
*   **How It Works:** Grover's algorithm provides a quadratic speedup for unstructured search problems ($\approx \sqrt{N}$ steps instead of $N/2$). It uses an Oracle to mark the solution state and a Diffuser to amplify its amplitude.
*   **Implementation (`server/quantum_mining.py`):**
    *   Implemented via `Qiskit` with a search space of 6 Qubits ($N = 64$ possibilities).
    *   Constructs a dynamic Oracle and Diffuser.
    *   Demonstrates finding the "winning nonce" with high probability in significantly fewer steps than classical brute-force.

### 6.6 Classical Algorithms (For Baseline Comparison)
*   **Purpose:** To provide a baseline against which the performance and security of quantum algorithms are compared, demonstrating a "hybrid" system.
*   **Implementation (`server/controllers/auth.controller.js`):**
    *   Uses `elliptic.js` to generate classical `secp256k1` ECDSA key pairs during user registration.
    *   Represents the "Vulnerable Layer" of the user's identity, susceptible to Shor's algorithm, contrasting with the secure Kyber key pair.

---

## 7. Setup & Installation

### Prerequisites
*   Node.js (v18 or higher recommended)
*   Python (v3.8 or higher)
*   MongoDB
*   Git

### Installation Steps

1.  **Clone the Repository**
    ```bash
    git clone <repository_url>
    cd fortress-q
    ```

2.  **Install Server Dependencies & Python Packages**
    ```bash
    cd server
    npm install
    pip install qiskit
    # (Add any other necessary pip packages)
    ```

3.  **Install Client Dependencies**
    ```bash
    cd ../client
    npm install
    ```

4.  **Smart Contracts (Optional/If applicable)**
    ```bash
    cd ..
    npm install # for Hardhat
    npx hardhat compile
    ```

5.  **Environment Variables**
    *   Create a `.env` file in the `server` directory.
    *   Add necessary configurations (e.g., `MONGO_URI`, `PORT`, `JWT_SECRET`).

6.  **Run the Application**
    *   Start the server: `cd server && npm start` (or `npm run dev`)
    *   Start the client: `cd client && npm run dev`

---

## 8. Conclusion

Fortress-Q successfully integrates complex theoretical quantum mechanics and advanced cryptography into a functional, demonstrative web application. By visualizing both the existential threat of Shor's algorithm and the robust defense of lattice-based cryptography and QKD, this project highlights the urgent necessity for the technological ecosystem to transition towards quantum-resistant infrastructures before large-scale quantum computers become a reality.
