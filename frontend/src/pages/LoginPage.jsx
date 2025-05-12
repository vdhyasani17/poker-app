import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "../store/useAuthStore.js";
import toast from "react-hot-toast";

const LoginPage = () => {
    const [formData, setFormData] = useState({ username: "", password: "" });
    const navigate = useNavigate();
    const { authUser, isLoggingIn, login, setAuthUser } = useAuthStore();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            return toast.error("Username is required");
        }

        if (!formData.password) {
            return toast.error("Password is required");
        }

        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const success = validateForm();

        if (success) {
            login(formData)
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card w-full max-w-md shadow-xl bg-base-100">
                <div className="card-body">
                    <h2 className="text-2xl font-bold text-center">Login</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <input
                                type="text"
                                name="username"
                                className="input input-bordered w-full"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                                disabled={isLoggingIn}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <input
                                type="password"
                                name="password"
                                className="input input-bordered w-full"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={isLoggingIn}
                                required
                            />
                        </div>

                        <div className="form-control mt-6 flex justify-center">
                            <button
                                className={`btn btn-primary flex justify-center ${isLoggingIn ? "btn-disabled" : ""}`}
                                type="submit"
                            >
                                {isLoggingIn ? (
                                    <span className="loading loading-spinner"></span>
                                ) : (
                                    "Login"
                                )}
                            </button>
                        </div>
                    </form>

                    <p className="text-center mt-4">
                        Don't have an account?{" "}
                        <a href="/register" className="link link-primary">
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
