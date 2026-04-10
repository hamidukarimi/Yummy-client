import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface ModalContextValue {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

// ==================== Create Post Modal ====================

const CreatePostModalContext = createContext<ModalContextValue | null>(null);

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

// ==================== Create Page Modal ====================

const CreatePageModalContext = createContext<ModalContextValue | null>(null);

export const CreatePageModalProvider = ({
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
    <CreatePageModalContext.Provider value={value}>
      {children}
    </CreatePageModalContext.Provider>
  );
};

export const useCreatePageModal = () => {
  const context = useContext(CreatePageModalContext);
  if (!context) {
    throw new Error(
      "useCreatePageModal must be used within CreatePageModalProvider",
    );
  }
  return context;
};