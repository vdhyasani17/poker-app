import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useGameStore } from "../store/useGameStore";
import { BlocksIcon, LogOut } from "lucide-react";

const Navbar = () => {
    const { logout, authUser } = useAuthStore();
    const { exitGame, currentGame } = useGameStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleExitAndNavigateHome = async () => {
        const onGamePage = location.pathname.startsWith("/game/");
        if (currentGame) {
            try {
                await exitGame(currentGame._id);
            } catch (err) {
                console.error("Failed to exit game:", err);
            }
        }
        navigate("/");
    };

    const handleLogout = async () => {
        const onGamePage = location.pathname.startsWith("/game/");
        if (currentGame) {
            try {
                await exitGame(currentGame._id);
            } catch (err) {
                console.error("Failed to exit game:", err);
            }
        }
        logout();
        navigate("/login");
    };

    return (
        authUser && (
            <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
                <div className="container mx-auto px-4 h-16">
                    <div className="flex items-center justify-between h-full">
                        <div className="flex items-center gap-8">
                            <button
                                onClick={handleExitAndNavigateHome}
                                className="flex items-center gap-2.5 hover:opacity-80 transition-all"
                            >
                                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <BlocksIcon className="w-5 h-5 text-primary" />
                                </div>
                                <h1 className="text-lg font-bold">BKCPoker</h1>
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="flex gap-2 items-center" onClick={handleLogout}>
                                <LogOut className="size-5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        )
    );
};

export default Navbar;
