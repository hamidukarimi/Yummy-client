import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface CreatePostModalContextValue {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const CreatePostModalContext =
  createContext<CreatePostModalContextValue | null>(null);

export const CreatePostModalProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(
    () => ({
      isOpen,
      openModal: () => setIsOpen(true),
      closeModal: () => setIsOpen(false),
    }),
    [isOpen],
  );

  return (
    <CreatePostModalContext.Provider value={value}>
      {children}
    </CreatePostModalContext.Provider>
  );
};

export const useCreatePostModal = () => {
  const context = useContext(CreatePostModalContext);
  if (!context) {
    throw new Error(
      "useCreatePostModal must be used within CreatePostModalProvider",
    );
  }
  return context;
};
