import HomeNavbar from "@/features/home/components/HomeNavbar";
import FeedPage from "@/features/feed/pages/FeedPage";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="sticky top-0 z-40 bg-black border-b border-zinc-900 lg:ml-[240px]">
        <HomeNavbar />
      </div>
      <div className="lg:ml-[240px]">
        <FeedPage />
      </div>
    </div>
  );
};

export default HomePage;
