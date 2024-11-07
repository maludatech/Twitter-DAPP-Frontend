"use client";
import { useState, useEffect } from "react";
import Web3 from "web3";
import ABI from "../src/abi";

const contractAddress = "0xdCcAdccFd693aDA73E27e5D07091d1C397c8bf26";

export default function Home() {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string>("");
  const [tweets, setTweets] = useState<any[]>([]);
  const [tweetContent, setTweetContent] = useState("");
  const [contract, setContract] = useState<any>(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      // Set up the contract instance
      const contractInstance = new web3Instance.eth.Contract(
        ABI as any,
        contractAddress
      );
      setContract(contractInstance);
    } else {
      console.error("No web3 provider detected");
    }
  }, []);

  const connectWallet = async () => {
    if (!web3) return;
    try {
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);
      displayTweets();
    } catch (error) {
      console.error("Wallet connection failed", error);
    }
  };

  const createTweet = async () => {
    if (!contract || !account) return;
    try {
      await contract.methods.createTweet(tweetContent).send({ from: account });
      setTweetContent("");
      displayTweets();
    } catch (error) {
      console.error("Error creating tweet", error);
    }
  };

  const displayTweets = async () => {
    if (!contract || !account) return;
    try {
      const fetchedTweets = await contract.methods.getAllTweets(account).call();
      setTweets(fetchedTweets);
    } catch (error) {
      console.error("Error fetching tweets", error);
    }
  };

  const likeTweet = async (author: string, id: number) => {
    if (!contract || !account) return;
    try {
      await contract.methods.likeTweet(author, id).send({ from: account });
      displayTweets();
    } catch (error) {
      console.error("Error liking tweet", error);
    }
  };

  const shortAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="container mx-auto max-w-lg p-6 bg-white shadow-lg rounded-lg mt-10">
      <h1 className="text-3xl font-bold text-blue-500 text-center mb-6">
        Twitter DAPP
      </h1>

      <div className="flex flex-col items-center mb-6">
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-2"
        >
          Connect Wallet
        </button>
        <div id="userAddress" className="text-blue-500 text-sm">
          {account && `Connected: ${shortAddress(account)}`}
        </div>
      </div>

      {account && (
        <>
          <form
            className="flex flex-col gap-4 mb-6"
            onSubmit={(e) => {
              e.preventDefault();
              createTweet();
            }}
          >
            <textarea
              id="tweetContent"
              rows={4}
              value={tweetContent}
              onChange={(e) => setTweetContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Tweet
            </button>
          </form>

          <div id="tweetsContainer" className="space-y-4">
            {tweets.map((tweet, index) => (
              <div
                key={index}
                className="tweet flex items-start p-4 border border-gray-200 rounded-lg"
              >
                <img
                  className="user-icon w-12 h-12 rounded-full mr-4"
                  src={`https://avatars.dicebear.com/api/human/${tweet.author}.svg`}
                  alt="User Icon"
                />
                <div className="tweet-inner flex-1">
                  <div className="author font-bold text-blue-500">
                    {shortAddress(tweet.author)}
                  </div>
                  <div className="content mb-2">{tweet.content}</div>
                  <button
                    onClick={() => likeTweet(tweet.author, tweet.id)}
                    className="like-button text-blue-500 flex items-center gap-1"
                  >
                    <i className="far fa-heart"></i>
                    <span className="likes-count">{tweet.likes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
