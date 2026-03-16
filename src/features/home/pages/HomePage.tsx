import HomeNavbar from "@/features/home/components/HomeNavbar";
import FeedPage from "@/features/feed/pages/FeedPage";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-black">
      {/* Sticky navbar */}
      <div className="sticky top-0 z-40 bg-black border-b border-zinc-900">
        <HomeNavbar />
      </div>
      <FeedPage />
    </div>
  );
};

export default HomePage;
