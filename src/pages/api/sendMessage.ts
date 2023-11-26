import axios from "axios";

export default function handler(req, res) {
  console.log(req.query);
  axios
    .post(
      "https://discord.com/api/v10/channels/1177988524096630807/messages",
      {
        content: `Voted successfully to ${req.query.selectedCandidate} by ${req.query.address}`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.NEXT_PUBLIC_DISCORD_TOKEN,
        },
      }
    )
    .then((response) => {
      res.status(200).json({ text: "Hello" });
    });
}
