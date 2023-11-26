"use client";
import { useEffect, useState } from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import contractAbi from "@/artifacts/voting.json";
import axios from "axios";

export default function VotingSystem() {
  const { address, isConnected, isDisconnected } = useAccount();
  const [voteCountA, setVoteCountA] = useState(0);
  const [voteCountB, setVoteCountB] = useState(0);
  const [selectedCandidate, setSelectedCandidate] = useState("a");
  const [transactionHash, setTransactionHash] = useState();

  const candidateAVC = useContractRead({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: "voteCount",
    args: ["a"],
  });

  useEffect(() => {
    if (candidateAVC.isFetched) {
      setVoteCountA(BigInt(candidateAVC.data).toString());
    }
  }, [candidateAVC]);

  const candidateBVC = useContractRead({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: "voteCount",
    args: ["b"],
  });

  useEffect(() => {
    if (candidateBVC.isFetched) {
      setVoteCountB(BigInt(candidateBVC.data).toString());
    }
  }, [candidateBVC]);

  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: "vote",
    onError(error) {
      alert(error.cause);
    },
    onSuccess(data) {
      setTransactionHash(data.hash);
    },
  });

  const transactionConfirmHook = useWaitForTransaction({
    hash: transactionHash,
  });

  useEffect(() => {
    if (transactionConfirmHook.isSuccess && !transactionConfirmHook.isLoading) {
      alert("Voted successfully!");
      candidateAVC.refetch();
      candidateBVC.refetch();
      sendDiscordMessage();
    } else if (transactionConfirmHook.error) {
      alert(`Error: ${transactionConfirmHook.error.message}`);
    }
  }, [transactionConfirmHook.isLoading]);

  const sendDiscordMessage = () => {
    axios
      .get(
        `http://localhost:3000/api/sendMessage?selectedCandidate=${selectedCandidate}&address=${address}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        console.log(response.data);
      });
  };

  return (
    <div>
      <div className="my-12">
        <p>VoteA:{voteCountA}</p>
        <p>VoteB:{voteCountB}</p>
      </div>
      {isConnected && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // refetch();
            write({
              args: [selectedCandidate],
            });
          }}
          className="form-control"
        >
          <div className="mx-2">
            <label className="label mt-4">
              <span className="label-text">Candidates</span>
            </label>
            <select
              defaultValue={"a"}
              className="select w-full"
              value={selectedCandidate}
              onChange={(e) => {
                setSelectedCandidate(e.target.value);
              }}
            >
              <option value={"a"}>A</option>
              <option value={"b"}>B</option>
            </select>
          </div>
          <div className="my-12">
            <button className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
              Vote
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
