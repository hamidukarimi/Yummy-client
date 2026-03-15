import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import usePost from "@/features/posts/hooks/usePost";
import EditPostForm from "@/features/posts/components/EditPostForm";
import Spinner from "@/components/ui/Spinner";

const EditPostPage = () => {
  const { id }                         = useParams<{ id: string }>();
  const navigate                       = useNavigate();
  const { user, restoreSession, isInitializing } = useAuth();
  const { isOwner, isLoading }         = usePost(id ?? "");

  // Restore session if not loaded
  useEffect(() => {
    if (!user && !isInitializing) {
      void restoreSession();
    }
  }, []);

  // Redirect if not owner once loaded
  useEffect(() => {
    if (!isLoading && !isInitializing && user && !isOwner) {
      navigate(-1);
    }
  }, [isLoading, isInitializing, user, isOwner]);

  if (isLoading || isInitializing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return <EditPostForm postId={id ?? ""} />;
};

export default EditPostPage;