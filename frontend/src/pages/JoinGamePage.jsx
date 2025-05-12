import { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const JoinGamePage = () => {
    const { joinGame, joiningGame } = useGameStore();
    const [formData, setFormData] = useState({
        gameId: "",
        password: ""
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await joinGame(formData);
            navigate(`/${formData.gameId}`);
        } catch (err) {
            toast.error("Failed to join game");
        }
    };

    return (
        <div className="min-h-screen pt-32 px-4">
            <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-4">Join a Game</h2>

                <div className="form-control mb-4">
                    <div className="flex items-center w-full gap-1">
                        <label className="w-32">
                            <span className="label-text">Game ID</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered flex-1"
                            value={formData.gameId}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, gameId: e.target.value }))
                            }
                            required
                        />
                    </div>
                </div>

                <div className="form-control mb-4">
                    <div className="flex items-center w-full gap-1">
                        <label className="w-32">
                            <span className="label-text">Password</span>
                        </label>
                        <input
                            type="password"
                            className="input input-bordered flex-1"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, password: e.target.value }))
                            }
                            required
                        />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary w-full" disabled={joiningGame}>
                    {joiningGame ? "Joining..." : "Join Game"}
                </button>
            </form>
        </div>
    );
};

export default JoinGamePage;
