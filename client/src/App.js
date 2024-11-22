import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./Layout";
import IndexPage from "./pages/IndexPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from './pages/RegisterPage';
import CreatePost from './pages/CreatePost';
import PostPage from "./pages/PostPage";
import { UserContextProvider } from "./UserContext";
import EditPost from "./pages/EditPost";
import { ThemeContextProvider } from "./ThemeContext";
import SearchResultsPage from './pages/SearchResultsPage';

function App() {
  return (
    <ThemeContextProvider>
      <UserContextProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<IndexPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/edit/:id" element={<EditPost />} />
            <Route path="/search" element={<SearchResultsPage />} />
          </Route>
        </Routes>
      </UserContextProvider>
    </ThemeContextProvider>
  );
}

export default App;

// https://picsum.photos/200/300
