import sys
import json
import random
import argparse
from qiskit import QuantumCircuit, transpile
from qiskit.providers.basic_provider import BasicProvider

def run_bb84(intercept=False):
    num_qubits = 24 # Length of the transmission
    
    # 1. Alice prepares random bits and bases
    # Bases: 0 = Rectilinear (+), 1 = Diagonal (X)
    alice_bits = [random.randint(0, 1) for _ in range(num_qubits)]
    alice_bases = [random.randint(0, 1) for _ in range(num_qubits)]
    
    # 2. Bob chooses random bases
    bob_bases = [random.randint(0, 1) for _ in range(num_qubits)]
    
    # 3. Eve chooses bases (if attacking)
    eve_bases = [random.randint(0, 1) for _ in range(num_qubits)] if intercept else None
    
    backend = BasicProvider().get_backend('basic_simulator')
    bob_results = []

    for i in range(num_qubits):
        qc = QuantumCircuit(1, 1)
        
        # ALICE PREPARES
        if alice_bits[i] == 1:
            qc.x(0) # |1>
        if alice_bases[i] == 1:
            qc.h(0) # Rotate to X basis |->
            
        # EVE INTERCEPTS (Man-in-the-Middle)
        if intercept:
            # Eve measures in her chosen basis
            if eve_bases[i] == 1:
                qc.h(0)
            qc.measure(0, 0) # Collapses the state!
            
            # If Eve measured in X basis, she must rotate back if she wants to pretend nothing happened?
            # No, she sends the qubit *as is* after measurement.
            # If she measured in X, the qubit is now in an X eigenstate.
            if eve_bases[i] == 1:
                qc.h(0) 

        # BOB MEASURES
        if bob_bases[i] == 1:
            qc.h(0)
        qc.measure(0, 0)
        
        tqc = transpile(qc, backend)
        job = backend.run(tqc, shots=1)
        res = int(list(job.result().get_counts().keys())[0])
        bob_results.append(res)

    # 4. Sifting (Classical Post-Processing)
    sifted_key = []
    errors = 0
    
    for i in range(num_qubits):
        # They only keep bits where they chose the same basis
        if alice_bases[i] == bob_bases[i]:
            sifted_key.append(bob_results[i])
            # Check for errors (if Eve intercepted, she might have flipped the bit)
            if alice_bits[i] != bob_results[i]:
                errors += 1
                
    qber = errors / len(sifted_key) if len(sifted_key) > 0 else 0
    
    return {
        "key_length": len(sifted_key),
        "qber": round(qber, 2),
        "secure": qber < 0.1, # Standard threshold is ~11%
        "raw_bits_sample": alice_bits[:8]
    }

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--attack", action="store_true", help="Simulate Eve eavesdropping")
    args = parser.parse_args()
    
    try:
        print(json.dumps({"success": True, "data": run_bb84(args.attack)}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))