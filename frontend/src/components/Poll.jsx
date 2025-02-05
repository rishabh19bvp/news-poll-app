import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import axios from "axios";

const Poll = ({ pollId, poll }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    useEffect(() => {
        const fetchUserVote = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                const userId = user ? user.uid : null;

                const response = await axios.get(`http://localhost:5001/api/poll/results/${pollId}`, {
                    params: { userId }
                });

                setSelectedOption(response.data.userVote || null); // ✅ Show user's previous vote
            } catch (error) {
                console.error("Error fetching user vote:", error);
            }
        };

        fetchUserVote();
    }, [pollId]);

    const handleVote = async (option) => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            setShowLoginPrompt(true);
            return;
        }

        try {
            const response = await axios.post("http://localhost:5001/api/poll/vote", {
                pollId,
                option,
                userId: user.uid
            });

            setSelectedOption(option);
            poll.options[option] += 1; // ✅ Manually update UI with new vote count
        } catch (error) {
            console.error("Error submitting vote:", error.response?.data || error.message);
        }
    };

    return (
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{poll.question}</h3>

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
                        <div key={option} className="flex justify-between items-center my-1">
                            <span className="text-gray-900 dark:text-gray-100">{option}</span>
                            <div className="w-48 h-4 bg-gray-300 dark:bg-gray-700 rounded-md">
                                <div
                                    className={`h-full rounded-md ${
                                        option === "Yes" ? "bg-green-500" : "bg-red-400"
                                    }`}
                                    style={{ width: `${(count / (poll.options.Yes + poll.options.No)) * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-gray-900 dark:text-gray-100">{count} votes</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ✅ Login Prompt Popup */}
            {showLoginPrompt && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            You need to log in to vote.
                        </h2>
                        <div className="flex justify-between">
                            <button
                                onClick={() => window.location.href = "/auth"}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => setShowLoginPrompt(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Poll;