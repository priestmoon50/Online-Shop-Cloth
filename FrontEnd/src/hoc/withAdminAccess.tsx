import React, { useEffect, useState } from "react";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

const withAdminAccess = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AdminAccessComponent: React.FC<P> = (props) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");

    useEffect(() => {
      const stored = localStorage.getItem("admin_access");
      if (stored === "granted") {
        setIsAuthenticated(true);
      }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput === ADMIN_PASSWORD) {
        localStorage.setItem("admin_access", "granted");
        setIsAuthenticated(true);
      } else {
        alert("Incorrect password");
      }
    };

    if (!isAuthenticated) {
      return (
        <div style={{ padding: "100px", textAlign: "center", fontFamily: "sans-serif" }}>
          <h2>Admin Access</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter admin password"
              style={{ padding: "10px", fontSize: "16px" }}
            />
            <button type="submit" style={{ padding: "10px 20px", marginLeft: "10px" }}>
              Enter
            </button>
          </form>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  return AdminAccessComponent;
};

export default withAdminAccess;
