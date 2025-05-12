import { Diamond, Club, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const HomePage = () => {
    const { authUser } = useAuthStore();
    console.log(authUser);
    return (
        <div className="min-h-screen bg-base-200 py-10 px-4 flex flex-col items-center pt-24">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold">Welcome to BKCPoker, {authUser.username}</h1>
                <p className="text-base-content/70 mt-2">Select an option to get started</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 max-w-4xl w-full">
                <Link to="/join" className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                    <div className="card-body items-center text-center">
                        <Club className="size-8 text-primary mb-2" />
                        <h2 className="card-title">Join a Game</h2>
                    </div>
                </Link>

                <Link to="/create" className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                    <div className="card-body items-center text-center">
                        <Diamond className="size-8 text-primary mb-2" />
                        <h2 className="card-title">Create a Game</h2>
                    </div>
                </Link>

                <Link to="/profile" className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                    <div className="card-body items-center text-center">
                        <User className="size-8 text-primary mb-2" />
                        <h2 className="card-title">Profile</h2>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
