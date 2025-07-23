import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-gaming">
      <div className="text-center game-card max-w-md">
        <h1 className="text-6xl font-bold mb-4 neon-text">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Oops! Page not found</p>
        <p className="text-sm text-muted-foreground mb-6">
          The game you're looking for doesn't exist in our arcade.
        </p>
        <a href="/" className="game-button inline-block px-6 py-3 text-center text-decoration-none">
          🎮 Return to Arcade
        </a>
      </div>
    </div>
  );
};

export default NotFound;
