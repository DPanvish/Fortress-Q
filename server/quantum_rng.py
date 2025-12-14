import sys
import json
from qiskit import QuantumCircuit, transpile
from qiskit.providers.basic_provider import BasicProvider

def generate_quantum_random_hex(total_bits=256):
    # We can't simulate 256 qubits at once.
    # So we generate 8 bits at a time (chunk_size) and loop.
    chunk_size = 8
    num_chunks = total_bits // chunk_size

    full_bitstring = ""

    # Setup the backend once
    backend = BasicProvider().get_backend('basic_simulator')

    for _ in range(num_chunks):
        # Create a small 8-qubit circuit
        qc = QuantumCircuit(chunk_size, chunk_size)

        # Apply Hadamard Gate (H) to all qubits
        for i in range(chunk_size):
            qc.h(i)

        # Measure
        qc.measure(range(chunk_size), range(chunk_size))

        # Run Simulation
        tqc = transpile(qc, backend)
        job = backend.run(tqc, shots=1)
        result = job.result()

        # Get the 8 random bits
        counts = result.get_counts()
        chunk_bits = list(counts.keys())[0]

        # Ensure we get exactly 8 bits (pad with leading zeros if needed)
        chunk_bits = chunk_bits.zfill(chunk_size)

        full_bitstring += chunk_bits

    # Convert the full 256-bit string to Hex
    v = int(full_bitstring, 2)
    return hex(v)[2:] # Remove '0x'

if __name__ == "__main__":
    try:
        quantum_key = generate_quantum_random_hex(256)
        print(json.dumps({"success": True, "key": quantum_key}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))