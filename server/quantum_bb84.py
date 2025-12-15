import sys
import json
import numpy as np
from qiskit import QuantumCircuit, transpile
from qiskit.providers.basic_provider import BasicProvider

def run_bb84_simulation(num_bits=100, eve_present=False):
    # Setup
    alice_bits = np.random.randint(2, size=num_bits)
    alice_bases = np.random.randint(2, size=num_bits)
    bob_bases = np.random.randint(2, size=num_bits)

    backend = BasicProvider().get_backend('basic_simulator')
    bob_results = []

    # Transmission (Qubit by Qubit)
    for i in range(num_bits):
        qc = QuantumCircuit(1, 1)

        # Alice Prepares
        if alice_bits[i] == 1:
            qc.x(0) # Encode 1
        if alice_bases[i] == 1:
            qc.h(0) # Switch to X-basis

        # Eve Intercepts (The Attack)
        if eve_present:
            # Eve guesses a basis randomly to measure
            eve_basis = np.random.randint(2)
            if eve_basis == 1:
                qc.h(0)
            qc.measure(0, 0) # This Collapses the quantum state
            # If Eve guessed wrong, she corrupted the qubit.
            if eve_basis == 1:
                qc.h(0) # Try to put it back (spoofing), but damage is done.

        # Bob Measures
        if bob_bases[i] == 1:
            qc.h(0) # Bob matches basis
        qc.measure(0, 0)

        # Run Simulation
        tqc = transpile(qc, backend)
        job = backend.run(tqc, shots=1)
        result = job.result().get_counts()
        measured_bit = int(list(result.keys())[0])
        bob_results.append(measured_bit)

    # Shifting (Classical Post-Processing)
    # Alice and bob publicly companr Bases (not bits) and keep only matches
    shifted_key = []
    matches = 0
    errors = 0

    for i in range(num_bits):
        if alice_bases[i] == bob_bases[i]:
            matches += 1
            if alice_bits[i] != bob_results[i]:
                errors += 1
            else:
                shifted_key.append(alice_bits[i])

    # Claculate QBER (Quantum Bit Error Rate)
    # Ideally )%. If Eve is present, theoretically ~25%
    qber = errors / matches if matches > 0 else 0

    final_key_hex = ""
    if len(shifted_key) >= 8:
        # First 8 bits for demo purpose
        byte_val = int("".join(map(str, shifted_key[:8])), 2)
        final_key_hex = hex(byte_val)[2:]

    return {
        "total_qubits": num_bits,
        "basis_matches": matches,
        "errors_detected": errors,
        "QBER": round(qber * 100, 2), # Percentage
        "key": final_key_hex,
        "is_secure": qber < 5.0 # Threshold usually ~11%
    }

if __name__ == "__main__":
    try:
        # Check if 'attack' argument is passed
        eve_exists = '--attack' in sys.argv
        result = run_bb84_simulation(num_bits=50, eve_present=eve_exists)
        print(json.dumps({"success": True, "data": result}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))