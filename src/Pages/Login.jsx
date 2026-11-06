import React, { useState } from "react";
import { getMessage, useLogin, useRegister } from "../Hooks/userAuth";

function Login() {
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const login = useLogin();
  const register = useRegister();

  // Jo form khula hai, uski mutation use karo
  const mutation = state === "Sign Up" ? register : login;

  // Sign Up <-> Login badalte waqt purana error saaf karo
  const switchTo = (next) => {
    setState(next);
    setLocalError("");
    login.reset();
    register.reset();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError("");
    const cleanEmail = email.trim().toLowerCase();

    if (state === "Sign Up") {
      // Backend ke zod rules jaisi checking
      if (name.trim().length < 2)
        return setLocalError("Name must be at least 2 characters");
      if (password.length < 6)
        return setLocalError("Password must be at least 6 characters");

      register.mutate({ name: name.trim(), email: cleanEmail, password });
    } else {
      login.mutate({ email: cleanEmail, password });
    }
    // Success ke baad GuestRoute khud "/" par bhej deta hai
  };

  const errorText =
    localError || (mutation.isError ? getMessage(mutation.error) : "");

  return (
    <div>
      <form onSubmit={handleSubmit} className="min-h-[80vh] flex items-center">
        <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border text-xl text-zinc-600 shadow-lg">
          <p className="text-2xl font-semibold">
            {state === "Sign Up" ? "Create Account" : "Login"}
          </p>
          <p>
            Please {state === "Sign Up" ? "sign up" : "login"} to book
            appointment
          </p>

          {errorText && (
            <p
              className="w-full bg-red-50 text-red-600 text-base px-3 py-2"
              role="alert"
            >
              {errorText}
            </p>
          )}

          {state === "Sign Up" && (
            <div className="w-full">
              <p>Full Name</p>
              <input
                type="text"
                className="border border-zinc-300 w-full text p-2 mt-1"
                onChange={(e) => setName(e.target.value)}
                name="name"
                id="name"
                value={name}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="w-full">
            <p>Email</p>
            <input
              type="email"
              className="border border-zinc-300 w-full text p-2 mt-1"
              onChange={(e) => setEmail(e.target.value)}
              name="email"
              id="email"
              value={email}
              autoComplete="email"
              required
            />
          </div>

          <div className="w-full">
            <p>Password</p>
            <input
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              name="password"
              id="password"
              className="border border-zinc-300 w-full rounded p-2 mt-1"
              value={password}
              autoComplete={
                state === "Sign Up" ? "new-password" : "current-password"
              }
              required
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-primary text-white w-full py-2 rounded-md text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {mutation.isPending
              ? "Please wait..."
              : state === "Sign Up"
              ? "Create Account"
              : "Login"}
          </button>

          {state === "Sign Up" ? (
            <p>
              Already have an account?{" "}
              <span
                className="text-primary underline cursor-pointer"
                onClick={() => switchTo("Login")}
              >
                Login here
              </span>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <span
                onClick={() => switchTo("Sign Up")}
                className="text-primary underline cursor-pointer"
              >
                Click Here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default Login;