import { useState, useEffect } from 'react';
import { BrowserProvider, Contract, parseEther } from 'ethers';
import abi from '../../web3/contracts/Fundraise.json';

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const contractABI = abi;

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [memos, setMemos] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [donation, setDonation] = useState('0.01'); // donation amount in ETH
  const [loading, setLoading] = useState(false);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      }
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
        getMemos();
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('Please install MetaMask!');
        return;
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
      getMemos();
    } catch (error) {
      console.log(error);
    }
  };

  const getMemos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const fundraiseContract = new Contract(contractAddress, contractABI, signer);
        const memos = await fundraiseContract.getMemos();
        // Transform the returned data into the expected format
        const formattedMemos = memos.map(memo => ({
          from: memo.donor,
          timestamp: Number(memo.timestamp),
          name: memo.name,
          message: memo.message
        }));
        setMemos(formattedMemos);
      } else {
        console.log('Ethereum object does not exist');
      }
    } catch (error) {
      console.log('Error fetching memos:', error);
    }
  };

  const donate = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        setLoading(true);
        const provider = new BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const fundraiseContract = new Contract(contractAddress, contractABI, signer);
        // Parse donation amount provided by user
        const txn = await fundraiseContract.donate(name, message, { value: parseEther(donation) });
        console.log('Mining...', txn.hash);
        await txn.wait();
        console.log('Mined -- ', txn.hash);
        setName('');
        setMessage('');
        setDonation('0.01');
        getMemos();
      } else {
        console.log('Ethereum object does not exist');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Listen to new donations and update memos in realtime
  useEffect(() => {
    if (!window.ethereum || !currentAccount) return;

    let fundraiseContract;
    const setupEventListener = async () => {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      fundraiseContract = new Contract(contractAddress, contractABI, signer);
      
      const onDonationReceived = (donor, _amount, donorName, donorMessage, _event) => {
        console.log('Donation received from:', donor);
        setMemos((prevMemos) => [
          ...prevMemos,
          {
            from: donor,
            timestamp: Math.floor(Date.now() / 1000),
            name: donorName,
            message: donorMessage,
          },
        ]);
      };

      fundraiseContract.on('DonationReceived', onDonationReceived);
    };

    setupEventListener();

    return () => {
      if (fundraiseContract) {
        fundraiseContract.removeAllListeners('DonationReceived');
      }
    };
  }, [currentAccount]);

  useEffect(() => {
    if (window.ethereum) {
      checkIfWalletIsConnected();
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Fundraise DApp</h1>
        {currentAccount ? (
          <div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                donate();
              }}
            >
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Your Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <input
                type="number"
                step="0.001"
                placeholder="Donation Amount in ETH"
                value={donation}
                onChange={(e) => setDonation(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Processing...' : `Donate ${donation} ETH`}
              </button>
            </form>
            <div>
              <h2>Memos</h2>
              {memos.map((memo, idx) => (
                <div key={idx} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                  <p><strong>Message:</strong> {memo.message}</p>
                  <p>
                    <strong>From:</strong> {memo.name} at{' '}
                    {new Date(memo.timestamp * 1000).toLocaleString()}
                  </p>
                  <p><strong>Address:</strong> {memo.from}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}
      </header>
    </div>
  );
}

export default App;
