import Image from "next/image";
import VotingSystem from "./votingSystem";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="bg-black">
        <w3m-button />
      </div>

      <VotingSystem />
    </main>
  );
}
