# Fortress-Q Project Documentation

## 1. Introduction
Fortress-Q is a comprehensive project designed to demonstrate the impact of quantum computing on blockchain technology. It explores both the threats posed by quantum algorithms to current cryptographic standards and the solutions offered by Post-Quantum Cryptography (PQC) and Quantum Key Distribution (QKD).

This documentation details the specific algorithms implemented in the project, their theoretical basis, and their practical implementation within the codebase.

---

## 2. Shor's Algorithm (Integer Factorization)

### Purpose
Shor's algorithm is used to demonstrate the vulnerability of legacy public-key cryptography (like RSA and ECDSA) to quantum attacks. These cryptosystems rely on the difficulty of factoring large integers or solving the discrete logarithm problem. Shor's algorithm solves these problems exponentially faster than the best known classical algorithms.

### How It Works
Shor's algorithm consists of two parts:
1.  **Classical Part:** Reduces the factoring problem to the problem of finding the period of a function $f(x) = a^x \pmod N$.
2.  **Quantum Part:** Uses Quantum Phase Estimation (QPE) to find the period $r$.

The quantum circuit involves:
*   **Superposition:** Initializing a register of qubits in a uniform superposition.
*   **Modular Exponentiation:** Applying a unitary operator that transforms the state based on $a^x \pmod N$.
*   **Inverse Quantum Fourier Transform (QFT†):** Extracts the phase (period) from the quantum state.
*   **Measurement:** The result is processed classically to find the factors of $N$.

### Implementation Details (`server/shor_algorithm.py`)
*   **Library:** `Qiskit`
*   **Target:** The implementation specifically targets factoring $N=15$ using $a=7$.
*   **Circuit:**
    *   Uses 8 counting qubits and 4 target qubits.
    *   Implements `c_amod15` (controlled multiplication by $a \pmod{15}$) gates.
    *   Applies `qft_dagger` (Inverse QFT) to the counting qubits.
*   **Simulation:**
    *   For $N=15$, the quantum circuit is executed on a simulator (`BasicProvider`).
    *   For larger numbers (which require too many qubits for a simple simulator), the project uses a classical fallback that mathematically simulates the period-finding step to produce consistent results.

---

## 3. Lattice-Based Cryptography (CRYSTALS-Dilithium)

### Purpose
To demonstrate a "Quantum Vault" secure against Shor's algorithm. Lattice-based cryptography is a leading candidate for Post-Quantum Cryptography (PQC) standardization by NIST. It relies on the hardness of lattice problems (like Learning With Errors - LWE) which are believed to be resistant to quantum computers.

### How It Works
CRYSTALS-Dilithium is a digital signature scheme based on the hardness of finding short vectors in lattices.
*   **Key Generation:** Involves generating a matrix $A$ and vectors $s, e$ such that $t = As + e$.
*   **Signing:** Uses the secret key $s$ to create a signature vector $z$ that satisfies a linear relation with the message hash, while keeping $s$ hidden using rejection sampling.
*   **Verification:** Checks if the signature vector $z$ is "short" enough and satisfies the linear equation.

### Implementation Details (`server/lattice_sign.py`)
*   **Type:** Simulation.
*   **Logic:**
    *   A full implementation of Dilithium requires complex polynomial ring arithmetic. This project simulates the *behavior* and *structure* of the algorithm.
    *   It generates a deterministic signature using `SHAKE-256` (a quantum-resistant hash function).
    *   It produces output fields mimicking the real protocol: `z_vector` (the signature proof) and `h_hint`.
*   **Security:** The simulation relies on SHA-3/SHAKE, which are quantum-resistant, ensuring the "mock" signatures are still cryptographically strong in terms of unpredictability, even if they don't perform the full lattice reduction math.

---

## 4. CRYSTALS-Kyber (Key Encapsulation)

### Purpose
To provide a quantum-safe method for encryption and key exchange. While Dilithium is for signatures, Kyber is a Key Encapsulation Mechanism (KEM) chosen by NIST for standardization. It is used in this project to generate a quantum-resistant user identity.

### How It Works
Kyber is based on the hardness of solving learning with errors (LWE) problems on module lattices.
1.  **Key Generation:** Generates a public key (a matrix and a vector) and a private key (a secret vector).
2.  **Encapsulation:** A party uses the public key to generate a shared secret and a ciphertext. The ciphertext is sent to the key owner.
3.  **Decapsulation:** The key owner uses their private key to decrypt the ciphertext and derive the same shared secret.

An attacker with a quantum computer cannot feasibly derive the private key from the public key or the shared secret from the ciphertext.

### Implementation Details (`server/controllers/auth.controller.js`)
*   **Library:** `crystals-kyber-js`
*   **Algorithm:** `MlKem1024` (Module-Lattice-based KEM, NIST Level 5, the highest security level).
*   **Usage:**
    *   During user registration (`registerUser`), the system calls `recipient.generateKeyPair()` to create a Kyber public/private key pair.
    *   These keys are stored in the user's profile (`quantumPublicKey`, `encryptedQuantumPrivateKey`), establishing a quantum-resistant identity alongside their classical ECDSA keys.

---

## 5. Quantum Key Distribution (BB84 Protocol)

### Purpose
To demonstrate secure communication and key exchange that is theoretically unbreakable, relying on the laws of physics rather than computational hardness.

### How It Works
The BB84 protocol allows two parties (Alice and Bob) to generate a shared secret key.
1.  **Preparation:** Alice sends qubits in random states ($|0\rangle, |1\rangle, |+\rangle, |-\rangle$) chosen from two bases (Rectilinear $+$ and Diagonal $\times$).
2.  **Measurement:** Bob measures the incoming qubits using random bases.
3.  **Sifting:** Alice and Bob publicly compare their chosen bases (but not the results). They keep the bits where their bases matched.
4.  **Eavesdropping Check:** If an eavesdropper (Eve) tries to intercept and measure the qubits, the "No-Cloning Theorem" ensures she disturbs the quantum state, introducing errors. Alice and Bob check a subset of their key for errors (Quantum Bit Error Rate - QBER). If QBER is too high, they discard the key.

### Implementation Details (`server/quantum_bb84.py`)
*   **Library:** `Qiskit`
*   **Qubits:** Simulates a transmission of 24 qubits.
*   **Process:**
    *   Generates random bits and bases for Alice and Bob.
    *   Constructs a quantum circuit for each bit.
    *   If `intercept=True` (simulating Eve), an intermediate measurement is applied, collapsing the state and potentially introducing errors.
    *   Calculates the **QBER** (Quantum Bit Error Rate). A QBER > 11% typically indicates an attack.

---

## 6. Quantum Mining (Grover's Algorithm)

### Purpose
To demonstrate the potential advantage of quantum computers in "mining" (Proof of Work), which essentially involves searching for a nonce that produces a hash below a target.

### How It Works
Grover's algorithm provides a quadratic speedup for unstructured search problems.
*   **Classical Search:** To find one item in $N$ items, it takes on average $N/2$ steps.
*   **Quantum Search:** Grover's algorithm takes $\approx \sqrt{N}$ steps.
*   **Mechanism:**
    *   **Oracle:** Marks the solution state by flipping its phase (multiplying by -1).
    *   **Diffuser:** Amplifies the amplitude of the marked state, increasing the probability of measuring it.

### Implementation Details (`server/quantum_mining.py`)
*   **Library:** `Qiskit`
*   **Search Space:** 6 Qubits ($N = 2^6 = 64$ possibilities).
*   **Target:** A randomly selected "winning nonce".
*   **Circuit:**
    *   Initializes qubits in superposition ($H$ gates).
    *   Constructs a dynamic **Oracle** that flips the phase of the specific target state.
    *   Applies the **Diffuser** (Inversion about the mean) to amplify the target.
    *   Measures the state to find the nonce.
*   **Result:** Demonstrates that the correct nonce is found with high probability in significantly fewer steps than a classical brute-force search.

---

## 7. Classical Algorithms (For Baseline Comparison)

### Purpose
To provide a baseline against which the performance and security of quantum algorithms can be compared. The project demonstrates a "hybrid" system where both classical and quantum-resistant technologies coexist.

### Implementations

#### a) ECDSA (Elliptic Curve Digital Signature Algorithm)
*   **Library:** `elliptic.js`
*   **Curve:** `secp256k1` (the same curve used by Bitcoin and Ethereum).
*   **Usage (`server/controllers/auth.controller.js`):**
    *   During user registration, a classical `secp256k1` key pair is generated for each user.
    *   This represents the "Vulnerable Layer" of the user's identity, which is susceptible to attack by Shor's algorithm. It serves as a direct contrast to the secure Kyber key pair generated at the same time.

#### b) Classical Period Finding (Shor's Simulation)
*   **File:** `server/shor_algorithm.py`
*   **Function:** `classical_factorization(N)`
*   **Usage:**
    *   When Shor's algorithm is simulated for a number larger than 15 (which would require too many qubits for a simple local simulation), this function is used as a fallback.
    *   It finds the period `r` of $a^x \pmod N$ using a classical loop. This mimics the output of the quantum part of Shor's algorithm, allowing the demonstration to proceed with larger numbers without needing a real quantum computer.
