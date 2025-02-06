import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import axios from "axios";

const Poll = ({ pollId }) => {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPoll = async () => {
        if (!pollId) {
            console.error("❌ Poll ID is missing!");
            setError("Invalid Poll ID.");
            setLoading(false);
            return;
        }

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            const userId = user ? user.uid : null;

            console.log(`🔍 Fetching poll for newsId: ${pollId}, userId: ${userId}`);

            let response = await axios.get(`http://localhost:5001/api/poll/results/${pollId}`, {
                params: { userId }
            });

            if (response.data && response.data.poll) {
                setPoll(response.data.poll);
                setSelectedOption(response.data.userVote || null);
            } else {
                console.warn("⚠️ No poll found, requesting a new one...");
                
                // ✅ Request Backend to Generate a New Poll
                response = await axios.post(`http://localhost:5001/api/poll/generate/${pollId}`);

                if (response.data && response.data.poll) {
                    setPoll(response.data.poll);
                    console.log(`✅ New poll generated: ${response.data.poll.question}`);
                } else {
                    throw new Error("Poll generation failed.");
                }
            }
        } catch (error) {
            console.error("❌ Error fetching poll:", error.response?.data || error.message);

            if (error.response && error.response.status === 404) {
                // ✅ If poll is not found, request to create a new one
                console.log("⚠️ Poll not found, generating new poll...");

                try {
                    const response = await axios.post(`http://localhost:5001/api/poll/generate/${pollId}`);
                    if (response.data && response.data.poll) {
                        setPoll(response.data.poll);
                        console.log(`✅ New poll created: ${response.data.poll.question}`);
                    } else {
                        throw new Error("Poll generation failed.");
                    }
                } catch (generateError) {
                    console.error("❌ Error generating poll:", generateError);
                    setError("Failed to generate poll.");
                }
            } else {
                setError("Failed to load poll.");
            }
        } finally {
            setLoading(false);
        }
    };

    fetchPoll();
}, [pollId]);

  // ✅ Handle Voting
  const handleVote = async (option) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      console.log(`🗳️ Submitting vote: ${option}`);
      const response = await axios.post("http://localhost:5001/api/poll/vote", {
        pollId: poll._id,
        option,
        userId: user.uid,
      });

      if (response.data && response.data.poll) {
        setPoll(response.data.poll);
        setSelectedOption(option);
      }
    } catch (error) {
      console.error(
        "❌ Error submitting vote:",
        error.response?.data || error.message
      );
      setError("Failed to submit vote.");
    }
  };

  // ✅ UI: Loading State
  if (loading) {
    return <p className="text-gray-600 dark:text-gray-300">Loading poll...</p>;
  }

  // ✅ UI: Poll Not Found
  if (!poll) {
    return (
      <p className="text-red-500">Error: Poll not found or failed to load.</p>
    );
  }

  return (
    <div key={pollId} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
        {poll?.question || "No Question Available"}
      </h3>

      {!selectedOption ? (
        <div className="flex gap-4 mt-3">
          <button
            onClick={() => handleVote("Yes")}
            className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
          >
            Yes
          </button>
          <button
            onClick={() => handleVote("No")}
            className="px-4 py-2 rounded-lg bg-red-400 text-white hover:bg-red-500 transition"
          >
            No
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <h4 className="text-gray-900 dark:text-gray-100">Poll Results:</h4>
          {Object.entries(poll.options).map(([option, count]) => (
            <div
              key={`${poll._id}-${option}`}
              className="flex justify-between items-center my-1"
            >
              <span className="text-gray-900 dark:text-gray-100">{option}</span>
              <div className="w-48 h-4 bg-gray-300 dark:bg-gray-700 rounded-md">
                <div
                  className={`h-full rounded-md ${
                    option === "Yes" ? "bg-green-500" : "bg-red-400"
                  }`}
                  style={{
                    width: `${
                      (count / (poll.options.Yes + poll.options.No)) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <span className="text-gray-900 dark:text-gray-100">
                {count} votes
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Poll;
