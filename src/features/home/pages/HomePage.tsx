import HomeNavbar from "@/features/home/components/HomeNavbar";
import FeedPage from "@/features/feed/pages/FeedPage";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-black">
      {/* Sticky navbar */}
      <div className="sticky top-0 z-40 bg-black border-b border-zinc-900 lg:ml-[82px]">
        <HomeNavbar />
      </div>
      <div className="lg:ml-[82px]">
        <FeedPage />
      </div>
    </div>
  );
};

export default HomePage;
