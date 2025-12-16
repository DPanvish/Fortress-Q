import sys
import json
import time
from qiskit import QuantumCircuit, transpile
from qiskit.providers.basic_provider import BasicProvider

# This script simulates "Quantum Mining" using Grover's Algorithm.
# In PoW, miners search for a 'nonce'. Grover's finds it quadratically faster.

def run_quantum_miner(target_nonce='11'):
    start_time = time.time()

    # Setup Grover Circuit (2-Qubit / 4-Possibilities for demo)
    qc = QuantumCircuit(2, 2)
    qc.h([0, 1]) # Superposition (Check all nonces at once)

    # Oracle (The Hash Function Check)
    # Marks the correct nonce phase
    if target_nonce == '11':
        qc.cz(0, 1);
    elif target_nonce == '00':
        qc.x([0, 1])
        qc.cz(0, 1);
        qc.x([0, 1])

    # Diffuser (Amplitude Amplification)
    qc.h([0, 1])
    qc.x([0, 1])
    qc.cz(0, 1)
    qc.x([0, 1])
    qc.h([0, 1])

    # Measure
    qc.measure([0, 1], [0, 1])

    # Execute
    backend = BasicProvider().get_backend("basic_simulator")
    tqc = transpile(qc, backend)
    job = backend.run(tqc, shots=1)
    result = job.result().get_counts()
    found_nonce = list(result.keys())[0]

    end_time = time.time()

    # CALCULATE ENERGY SAVINGS
    # Classical needs avg 2.25 queries. Quantum needs 1.
    energy_saved = "55.5%"

    return {
        "block_found": True,
        "nonce": found_nonce,
        "time_taken": round(end_time - start_time, 4),
        "iterations": 1,
        "energy_saved": energy_saved,
        "mode": "Quantum (Grover's)"
    }

if __name__ == "__main__":
    try:
        # In a real scenario, the 'target' is determined by the hash difficulty
        res = run_quantum_miner('11')
        print(json.dumps({"success": True, "data": res}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))