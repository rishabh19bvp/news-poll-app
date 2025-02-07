import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import axios from "axios";
import { IoArrowBack } from "react-icons/io5"; // ✅ Import back arrow icon from react-icons

const ProfilePage = () => {
    const [votes, setVotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate(); // ✅ Initialize useNavigate

    useEffect(() => {
        const auth = getAuth();

        // ✅ Listen for authentication changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                fetchUserVotes(user.uid); // ✅ Fetch votes when user is logged in
            } else {
                setUser(null);
                setVotes([]);
                setLoading(false);
            }
        });

        return () => unsubscribe(); // ✅ Cleanup listener on unmount
    }, []);

    const fetchUserVotes = async (userId) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:5001/api/user/votes/${userId}`);

            if (response.data && response.data.votes) {
                setVotes(response.data.votes);
            } else {
                setVotes([]);
            }
        } catch (error) {
            console.error("❌ Error fetching user votes:", error);
            setError("Failed to load votes. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-lightbg dark:bg-darkbg px-6 py-10 relative">
            
            {/* ✅ Back Button in the Top-Left Corner with White Background */}
            <button
                onClick={() => navigate("/")}
                className="absolute top-6 left-6 bg-white dark:bg-gray-900 p-3 rounded-full shadow-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
                <IoArrowBack className="text-2xl" />  {/* ✅ Back Arrow Symbol */}
            </button>

            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 shadow-lg rounded-lg p-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Your Votes</h1>

                {/* ✅ Loading State */}
                {loading ? (
                    <p className="text-gray-600 dark:text-gray-300 text-lg">Loading your votes...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : votes.length > 0 ? (
                    <ul className="space-y-4">
                        {votes.map((vote) => (
                            <li key={vote.pollId} className="border-b py-4 text-gray-700 dark:text-gray-300">
                                <strong>{vote.question}</strong> → You voted <strong>{vote.choice}</strong>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600 dark:text-gray-300 text-lg">No votes recorded.</p>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;