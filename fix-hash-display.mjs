import fs from "fs";

const path = "components/FundProjectForm.tsx";
let src = fs.readFileSync(path, "utf8");

// 1. Add a "copied" state right after txHash state
const txHashStateLine = 'const [txHash, setTxHash] = useState("");';
if (src.includes(txHashStateLine) && !src.includes('const [copied, setCopied]')) {
  src = src.replace(
    txHashStateLine,
    `${txHashStateLine}\n  const [copied, setCopied] = useState(false);`
  );
}

// 2. Replace the success block with truncated hash + copy button
const oldBlock = `    return (
      <div>
        <p>Thank you, your contribution is recorded.</p>
        <p>
          Transaction:{" "}
          <a href={\`https://sepolia.etherscan.io/tx/\${txHash}\`} target="_blank" rel="noreferrer">
            {txHash}
          </a>
        </p>
      </div>
    );`;

const newBlock = `    const shortHash = txHash ? \`\${txHash.slice(0, 10)}...\${txHash.slice(-8)}\` : "";
    const copyHash = () => {
      navigator.clipboard.writeText(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    return (
      <div>
        <p>Thank you, your contribution is recorded.</p>
        <p style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span>Transaction:</span>
          <a
            href={\`https://sepolia.etherscan.io/tx/\${txHash}\`}
            target="_blank"
            rel="noreferrer"
            style={{ wordBreak: "break-all" }}
          >
            {shortHash}
          </a>
          <button type="button" onClick={copyHash}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </p>
      </div>
    );`;

if (src.includes(oldBlock)) {
  src = src.replace(oldBlock, newBlock);
  fs.writeFileSync(path, src);
  console.log("Success block updated.");
} else {
  console.log("WARNING: old block not found exactly — no changes made. Check the file manually.");
}
