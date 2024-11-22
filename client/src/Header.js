import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";
import { ThemeContext } from "./ThemeContext";
import Search from "./components/Search";

export default function Header() {
  const { userInfo, setUserInfo } = useContext(UserContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    fetch("http://localhost:4000/profile", {
      credentials: "include",
    }).then((response) => {
      if (response.ok) {
        response.json().then((userInfo) => {
          setUserInfo(userInfo);
        });
      } else {
        setUserInfo(null);
      }
    });
  }, [setUserInfo]);

  function logout() {
    fetch("http://localhost:4000/logout", {
      credentials: "include",
      method: "POST",
    }).then(() => {
      setUserInfo(null);
    });
  }

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">
        <span className="logo-text">MyBlog</span>
      </Link>
      <nav>
        <Search />
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        {username ? (
          <>
            <Link to="/create" className="nav-link">
              Create new post
            </Link>
            <button onClick={logout} className="nav-link logout-btn">
              Logout ({username})
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
