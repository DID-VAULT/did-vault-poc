import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from "ethers";

// --- SVG Icons ---
// Using inline SVGs is a best practice for performance and scalability.
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h12v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>;
const IdCardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 18v-7.5a2 2 0 0 0-2-2h-1.5a2 2 0 0 1-2-2V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v1.5a2 2 0 0 1-2 2H2.5a2 2 0 0 0-2 2V18"/><path d="M22 18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2"/><circle cx="12" cy="10" r="2"/><path d="M18 18c-3.33 0-5-1.5-6-3s-2.67-3-6-3"/></svg>;
const IssueIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const VerifyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.78l1.72 1.72a4 4 0 0 1 4.78 4.78l1.72 1.72a4 4 0 0 1 4.78 4.78l-1.72 1.72a4 4 0 0 1-4.78 4.78l-1.72-1.72a4 4 0 0 1-4.78-4.78l-1.72-1.72a4 4 0 0 1-4.78-4.78z"/><path d="m12 12 4 4"/></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const PolygonIcon = () => <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="18" height="18"><title>Polygon</title><path d="M6.281 4.438l7.193-2.13L19.562 8.5v6.563l-6.094 5.5-7.187-2.812V8.375zm.688 4.187v3.563l2.812 1.125V9.75zm3.5 1.438l2.938-1.063 2.562 1.063v3.5l-2.562 1.125-2.938-1.125z"></path></svg>;


// --- Network Configuration ---
const amoyTestnet = {
  chainId: '0x13882',
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
  blockExplorerUrls: ['https://www.oklink.com/amoy'],
};

// --- Helper Functions ---
const generateDid = (address) => address ? `did:ethr:${address}` : null;
const truncateAddress = (address) => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

// --- Reusable Components ---
const LoadingSpinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

const CopyButton = ({ textToCopy }) => {    
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        // This is a workaround for clipboard API issues in sandboxed environments.
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        document.body.removeChild(textArea);
    };

    return (
        <button onClick={handleCopy} className="p-1.5 bg-slate-700/50 rounded-md hover:bg-slate-600/50 transition">
            {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
    );
};

const Toast = ({ message, type, onDismiss }) => {
    const baseClasses = "fixed bottom-5 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-2xl text-white font-semibold transition-all duration-300";
    const typeClasses = {
        success: "bg-green-500",
        error: "bg-red-500",
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            {message}
        </div>
    );
};

// --- Main App Component ---
function App() {
  const [account, setAccount] = useState(null);
  const [userDid, setUserDid] = useState(null);
  const [toast, setToast] = useState(null);
  const [userVC, setUserVC] = useState(null);
  const [vcToVerify, setVcToVerify] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isIssuing, setIsIssuing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const connectWallet = useCallback(async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        setAccount(userAddress);
        setUserDid(generateDid(userAddress));
        await switchOrAddNetwork();
        showToast("Wallet Connected Successfully!", "success");
      } catch (err) {
        showToast("Failed to connect wallet.", "error");
      }
    } else {
      showToast("MetaMask is not installed.", "error");
    }
  }, []);

  const switchOrAddNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: amoyTestnet.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [amoyTestnet] });
        } catch (addError) {
          showToast("Failed to add Polygon Amoy network.", "error");
        }
      } else {
        showToast("Failed to switch network.", "error");
      }
    }
  };
  
  const issueNewVC = async () => {
    setIsIssuing(true);
    setVerificationResult(null);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const mockVC = {
      "@context": "https://www.w3.org/2018/credentials/v1",
      id: `urn:uuid:${crypto.randomUUID()}`,
      type: ["VerifiableCredential", "VerifiedUserCredential"],
      issuer: `did:ethr:${account}`, // For demo, user issues to themself
      issuanceDate: new Date().toISOString(),
      credentialSubject: { id: userDid, isVerified: true },
      proof: {
        type: "EcdsaSecp256k1Signature2019",
        created: new Date().toISOString(),
        proofPurpose: "assertionMethod",
        verificationMethod: `did:ethr:${account}`,
        jws: "eyJhbGciOiJFUzI1NksiLCJ..."
      }
    };
    setUserVC(JSON.stringify(mockVC, null, 2));
    showToast("Sample Credential Issued!", "success");
    setIsIssuing(false);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationResult(null);
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (!vcToVerify) {
      setVerificationResult({ success: false, message: "Please paste a credential to verify." });
    } else {
      try {
        const parsedVC = JSON.parse(vcToVerify);
        if (parsedVC && parsedVC.credentialSubject && parsedVC.proof) {
          setVerificationResult({ success: true, message: "Verification Successful (Mock Data)" });
        } else {
          setVerificationResult({ success: false, message: "Verification Failed: Invalid format (Mock Data)" });
        }
      } catch (e) {
        setVerificationResult({ success: false, message: "Verification Failed: Invalid JSON format." });
      }
    }
    setIsVerifying(false);
  };

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setUserDid(generateDid(accounts[0]));
          showToast("Account switched.", "success");
        } else {
          setAccount(null);
          setUserDid(null);
          showToast("Wallet disconnected.", "error");
        }
      };
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
      return () => {
        window.ethereum.removeAllListeners();
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-900/50 via-slate-900 to-slate-900 opacity-50"></div>
        <div className="relative w-full max-w-3xl mx-auto">
            <header className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">DID Vault</h1>
                <p className="text-slate-400 mt-2">Your Data. Your Control. Your Identity.</p>
            </header>

            {!account ? (
                <div className="text-center bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 shadow-2xl shadow-cyan-500/10">
                    <h2 className="text-2xl font-semibold mb-4 text-white">Get Started</h2>
                    <p className="text-slate-400 mb-6">Connect your wallet to create and manage your decentralized identity.</p>
                    <button onClick={connectWallet} className="w-full max-w-xs mx-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105">
                        Connect Wallet
                    </button>
                </div>
            ) : (
                <div className="space-y-8">
                    <DashboardSection account={account} userDid={userDid} />
                    <IssueCredentialSection onIssue={issueNewVC} isIssuing={isIssuing} userVC={userVC} />
                    <VerifyCredentialSection onVerify={handleVerify} isVerifying={isVerifying} vcToVerify={vcToVerify} setVcToVerify={setVcToVerify} verificationResult={verificationResult} />
                </div>
            )}
             {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        </div>
    </div>
  );
}

// --- Sectional Components ---
const DashboardSection = ({ account, userDid }) => (
    <SectionCard Icon={IdCardIcon} title="Your Identity Dashboard">
        <InfoRow label="Wallet Address:" value={truncateAddress(account)} textToCopy={account} />
        <InfoRow label="Decentralized ID (DID):" value={truncateAddress(userDid)} textToCopy={userDid} />
        <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-center gap-2 text-xs text-slate-500">
            <PolygonIcon />
            <span>Secured on Polygon</span>
        </div>
    </SectionCard>
);

const IssueCredentialSection = ({ onIssue, isIssuing, userVC }) => (
    <SectionCard Icon={IssueIcon} title="Issue Credential">
        <p className="text-slate-400 mb-5 text-sm">Get a "Verified User" credential issued to your DID. This will be signed and its hash will be recorded on the blockchain.</p>
        <button onClick={onIssue} disabled={isIssuing} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-green-500/20 transition disabled:bg-slate-600 disabled:cursor-not-allowed">
            {isIssuing ? <><LoadingSpinner /> Issuing...</> : "Issue Me a Credential"}
        </button>
        {userVC && (
            <div className="mt-5">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-green-400">Credential Issued! (Sample)</h3>
                    <CopyButton textToCopy={userVC} />
                </div>
                <p className="text-slate-400 text-xs mb-2">Copy and save this Verifiable Credential. You can present it for verification below.</p>
                <pre className="bg-slate-900/70 p-4 rounded-lg text-xs text-yellow-300 overflow-x-auto">{userVC}</pre>
            </div>
        )}
    </SectionCard>
);

const VerifyCredentialSection = ({ onVerify, isVerifying, vcToVerify, setVcToVerify, verificationResult }) => (
    <SectionCard Icon={VerifyIcon} title="Verify Credential">
        <p className="text-slate-400 mb-4 text-sm">Paste a Verifiable Credential JSON here to verify its authenticity and on-chain status.</p>
        <textarea value={vcToVerify} onChange={(e) => setVcToVerify(e.target.value)} className="w-full h-40 bg-slate-900/70 border border-slate-600 rounded-lg p-3 font-mono text-xs text-yellow-300 focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder='Paste Verifiable Credential JSON here...'></textarea>
        <button onClick={onVerify} disabled={isVerifying} className="mt-4 w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-blue-500/20 transition disabled:bg-slate-600 disabled:cursor-not-allowed">
            {isVerifying ? <><LoadingSpinner /> Verifying...</> : "Verify"}
        </button>
        {verificationResult && (
            <div className={`mt-4 p-3 rounded-lg text-center font-semibold text-sm ${verificationResult.success ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                {verificationResult.message}
            </div>
        )}
    </SectionCard>
);

const SectionCard = ({ Icon, title, children }) => (
    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700 shadow-2xl shadow-cyan-500/10">
        <div className="flex items-center gap-3 mb-4 border-b border-slate-700 pb-3">
            <div className="text-cyan-400"><Icon /></div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
        </div>
        {children}
    </div>
);

const InfoRow = ({ label, value, textToCopy }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-slate-400">{label}</p>
        <div className="flex items-center gap-2 bg-slate-900/70 p-2 rounded-md">
            <span className="font-mono text-cyan-300 text-xs sm:text-sm">{value}</span>
            <CopyButton textToCopy={textToCopy} />
        </div>
    </div>
);


export default App;

