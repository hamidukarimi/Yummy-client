import { useParams, useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import usePage from "@/features/pages/hooks/usePage";
import EditPageForm from "@/features/pages/components/EditPageForm";
import Spinner from "@/components/ui/Spinner";
import { useEffect } from "react";

const EditPagePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, restoreSession, isInitializing } = useAuth();
  const { data, isLoading } = usePage(slug ?? "");

  useEffect(() => {
    if (!user && !isInitializing) {
      void restoreSession();
    }
  }, [user, isInitializing, restoreSession]);

  useEffect(() => {
    if (!isLoading && !isInitializing && user && data && !data.isOwner) {
      navigate(`/pages/${slug}`);
    }
  }, [isLoading, isInitializing, user, data, navigate, slug]);

  if (isLoading || isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <EditPageForm slug={slug ?? ""} />;
};

export default EditPagePage;
