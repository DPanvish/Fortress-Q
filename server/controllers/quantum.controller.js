import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to run the BB84 script with optional attack flag
const runBB84 = (isAttack) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../quantum_bb84.py');
        const args = [scriptPath];
        if(isAttack){
            args.push("--attack");
        }

        console.log(`⚛️ Starting BB84 Simulation (Attack: ${isAttack})...`);

        const pythonProcess = spawn("python", args);
        let dataString = "";

        pythonProcess.stdout.on('data', (data) => dataString += data.toString());
        pythonProcess.stderr.on('data', (data) => console.error(`Qiskit Error: ${data}`));
        pythonProcess.on('close', () => {
            try {
                const res = JSON.parse(dataString);
                resolve(res);
            }catch (e) {
                console.error("Failed to parse BB84 output", e);
                resolve(null);
            }
        });
    })
}

export const negotiateQuantumKey = async (req, res) => {
    const {simulateAttack} = req.body;
    const result = await runBB84(simulateAttack);

    if(result && result.success){
        res.json(result.data);
    }else{
        res.status(500).json({msg: "Quantum Simulation Failed"});
    }
}

// Helper for Mining
const runMiningScript = () => {
    return new Promise((resolve) => {
        const scriptPath = path.join(__dirname, '../quantum_mining.py');
        const pythonProcess = spawn('python', [scriptPath]);

        let dataString = '';
        pythonProcess.stdout.on('data', (d) => dataString += d.toString());
        pythonProcess.on('close', () => {
            try {
                resolve(JSON.parse(dataString));
            }catch (err) {
                resolve(null);
            }
        });
    });
};

export const mineQuantumBlock = async (req, res) => {
    try {
        const result = await runMiningScript();
        if (result && result.success) {
            res.json(result.data);
        }else {
            res.status(500).json({ msg: "Mining Simulation Failed" });
        }
    }catch (e) {
        console.error(e);
        res.status(500).send("Server Error");
    }
};

// Helper for Signature
const runSignatureScript = (msg) => {
    return new Promise((resolve) => {
        const scriptPath = path.join(__dirname, '../lattice_sign.py');
        const pythonProcess = spawn('python', [scriptPath, msg]);
        let dataString = '';
        pythonProcess.stdout.on('data', (d) => dataString += d.toString());
        pythonProcess.on('close', () => {
            try {
                resolve(JSON.parse(dataString));
            }catch(e){
                resolve(null);
            }
        });
    });
};

export const signMigration = async (req, res) => {
    const { migrationId } = req.body;
    const result = await runSignatureScript(`Migration_${migrationId}`);
    if (result && result.success) {
        res.json(result.data);
    } else {
        res.status(500).json({ msg: "Signing Failed" });
    }
};

// Helper for Shor's
const runShorScript = (walletType, targetValue) => {
    return new Promise((resolve) => {
        const scriptPath = path.join(__dirname, '../shor_algorithm.py');
        
        // Pass arguments to the Python script
        const args = [scriptPath];
        if (walletType) {
            args.push("--wallet_type", walletType);
        }
        if (targetValue) {
            args.push("--target_value", targetValue.toString());
        }

        const pythonProcess = spawn('python', args);

        let dataString = '';
        pythonProcess.stdout.on('data', (d) => dataString += d.toString());
        pythonProcess.stderr.on('data', (d) => console.error(`Shor Error: ${d}`));
        
        pythonProcess.on('close', () => {
            try { resolve(JSON.parse(dataString)); } catch (e) { resolve(null); }
        });
    });
};

export const runAttackSimulation = async (req, res) => {
    try {
        const { walletType, targetValue } = req.body;
        const result = await runShorScript(walletType, targetValue);
        if (result && !result.error) {
            res.json(result);
        } else {
            res.status(500).json({ msg: "Attack Simulation Failed" });
        }
    } catch (e) {
        console.error(e);
        res.status(500).send("Server Error");
    }
};
