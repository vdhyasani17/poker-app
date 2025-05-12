import { useEffect, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const CreateGamePage = () => {
    const { createGame, creatingGame } = useGameStore();
    const [formData, setFormData] = useState({
        gameId: "",
        password: "",
        maxPlayers: 4,
    });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createGame(formData);
            navigate(`/${formData.gameId}`);
        } catch (err) {
            toast.error("Failed to join game");
        }
    };

    return (
        <div className="min-h-screen pt-32 px-4 padding-5">
            <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-4">Create a Game</h2>

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
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                </div>


                <div className="form-control mb-4">
                    <div className="flex items-center justify-between w-full">
                        <label className="label-text">Max Players</label>
                        <input
                            type="number"
                            className="input input-bordered w-20"
                            value={formData.maxPlayers}
                            onChange={(e) =>
                                setFormData({ ...formData, maxPlayers: Number(e.target.value) })
                            }
                            min="2"
                            max="9"
                            required
                        />
                    </div>
                </div>


                <button type="submit" className="btn btn-primary w-full" disabled={creatingGame}>
                    {creatingGame ? "Creating..." : "Create Game"}
                </button>
            </form>
        </div>
    );
};

export default CreateGamePage;
