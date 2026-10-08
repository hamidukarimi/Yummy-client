import { useState } from "react";
import { Search } from "lucide-react";
import useMenu from "@/features/pages/hooks/useMenu";
import MenuCard from "@/features/posts/components/MenuCard";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import type { ApiPost } from "@/features/posts/types/post.types";
import type { MenuSection } from "@/features/pages/types/menu.types";
import SendToChat from "@/features/messages/components/SendToChat";

interface PageMenuProps {
  slug: string;
  isOwner: boolean;
  menuItems: ApiPost[];
  menuLoading: boolean;
  onCreatePost: () => void;
}

const emptyItem = () => ({
  name: "",
  description: "",
  price: undefined as number | undefined,
  isAvailable: true,
});

const PageMenu = ({
  slug,
  isOwner,
  menuItems,
  menuLoading,
  onCreatePost,
}: PageMenuProps) => {
  const { sections, isLoading, isError, saveMenu, isSaving, saveError } = useMenu(slug);
  const [draft, setDraft] = useState<MenuSection[] | null>(null);
  const [search, setSearch] = useState("");

  const editing = draft !== null;
  const visible = editing ? draft : sections;
  const query = search.trim().toLowerCase();

  const filtered = query
    ? visible
        .map((section) => ({
          ...section,
          items: section.items.filter((item) =>
            [section.name, item.name, item.description]
              .filter(Boolean)
              .some((field) => field!.toLowerCase().includes(query)),
          ),
        }))
        .filter((section) => section.items.length > 0 || section.name.toLowerCase().includes(query))
    : visible;

  const updateSection = (index: number, next: MenuSection) => {
    setDraft((current) =>
      (current ?? sections).map((section, sectionIndex) =>
        sectionIndex === index ? next : section,
      ),
    );
  };

  const save = async () => {
    if (!draft) return;
    const cleaned = draft
      .map((section) => ({
        name: section.name.trim(),
        items: section.items
          .filter((item) => item.name.trim())
          .map((item) => ({
            name: item.name.trim(),
            isAvailable: item.isAvailable,
            ...(item.description?.trim() ? { description: item.description.trim() } : {}),
            ...(item.price !== undefined && !Number.isNaN(item.price)
              ? { price: item.price }
              : {}),
          })),
      }))
      .filter((section) => section.name);
    try {
      await saveMenu(cleaned);
      setDraft(null);
    } catch {
      return;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {isOwner && (
        <div className="flex items-center gap-3">
          {editing ? (
            <>
              <button
                type="button"
                onClick={() => void save()}
                disabled={isSaving}
                className="text-sm font-semibold text-black bg-[#F7C12B] rounded-xl px-3 py-2 disabled:opacity-40 cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save menu"}
              </button>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="text-sm text-zinc-400 cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() =>
                setDraft(
                  sections.length > 0
                    ? sections
                    : [{ name: "", items: [emptyItem()] }],
                )
              }
              className="text-sm font-semibold text-[#F7C12B] cursor-pointer"
            >
              {sections.length > 0 ? "Edit menu" : "Create menu"}
            </button>
          )}
        </div>
      )}

      {saveError && <Alert variant="error" message={saveError.message} />}
      {isError && <p className="text-zinc-500 text-sm">Failed to load the menu.</p>}
      {isLoading && (
        <div className="flex justify-center py-6">
          <Spinner size="sm" />
        </div>
      )}

      {editing && draft && (
        <div className="flex flex-col gap-4">
          {draft.map((section, sectionIndex) => (
            <div key={sectionIndex} className="rounded-2xl border border-zinc-800 p-3 flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  value={section.name}
                  onChange={(event) =>
                    updateSection(sectionIndex, { ...section, name: event.target.value })
                  }
                  maxLength={40}
                  placeholder="Section name, e.g. Mains"
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#F7C12B]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setDraft(draft.filter((_, index) => index !== sectionIndex))
                  }
                  className="text-xs text-red-400 cursor-pointer"
                >
                  Remove
                </button>
              </div>
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="grid grid-cols-1 sm:grid-cols-[1fr_120px_auto] gap-2">
                  <input
                    value={item.name}
                    onChange={(event) => {
                      const items = section.items.map((current, index) =>
                        index === itemIndex ? { ...current, name: event.target.value } : current,
                      );
                      updateSection(sectionIndex, { ...section, items });
                    }}
                    maxLength={80}
                    placeholder="Item name"
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#F7C12B]"
                  />
                  <input
                    type="number"
                    min={0}
                    value={item.price ?? ""}
                    onChange={(event) => {
                      const price = event.target.value === "" ? undefined : Number(event.target.value);
                      const items = section.items.map((current, index) =>
                        index === itemIndex ? { ...current, price } : current,
                      );
                      updateSection(sectionIndex, { ...section, items });
                    }}
                    placeholder="Price"
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#F7C12B]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const items = section.items.filter((_, index) => index !== itemIndex);
                      updateSection(sectionIndex, { ...section, items });
                    }}
                    className="text-xs text-zinc-500 cursor-pointer"
                  >
                    Remove
                  </button>
                  <input
                    value={item.description ?? ""}
                    onChange={(event) => {
                      const items = section.items.map((current, index) =>
                        index === itemIndex
                          ? { ...current, description: event.target.value }
                          : current,
                      );
                      updateSection(sectionIndex, { ...section, items });
                    }}
                    maxLength={300}
                    placeholder="Description"
                    className="sm:col-span-2 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#F7C12B]"
                  />
                  <label className="flex items-center gap-2 text-xs text-zinc-400">
                    <input
                      type="checkbox"
                      checked={item.isAvailable}
                      onChange={(event) => {
                        const items = section.items.map((current, index) =>
                          index === itemIndex
                            ? { ...current, isAvailable: event.target.checked }
                            : current,
                        );
                        updateSection(sectionIndex, { ...section, items });
                      }}
                    />
                    Available
                  </label>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  updateSection(sectionIndex, {
                    ...section,
                    items: [...section.items, emptyItem()],
                  })
                }
                className="text-xs text-[#F7C12B] self-start cursor-pointer"
              >
                Add item
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setDraft([...draft, { name: "", items: [emptyItem()] }])}
            className="text-sm text-[#F7C12B] self-start cursor-pointer"
          >
            Add section
          </button>
        </div>
      )}

      {!editing && !isLoading && sections.length > 0 && (
        <>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search menu..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
            />
          </div>
          {filtered.length === 0 && (
            <p className="text-zinc-500 text-sm text-center py-8">No items match your search.</p>
          )}
          {filtered.map((section) => (
            <div key={section.name} className="flex flex-col gap-2">
              <h3 className="text-white font-semibold text-sm">{section.name}</h3>
              {section.items.map((item) => (
                <div
                  key={`${section.name}-${item.name}`}
                  className="flex items-start justify-between gap-3 border-b border-zinc-900 py-2"
                >
                  <div>
                    <p className={`text-sm ${item.isAvailable ? "text-white" : "text-zinc-500 line-through"}`}>
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-xs text-zinc-500">{item.description}</p>
                    )}
                    {!item.isAvailable && (
                      <p className="text-xs text-zinc-600">Unavailable</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {item.price !== undefined && (
                      <span className="text-[#F7C12B] text-sm font-semibold">${item.price}</span>
                    )}
                    <SendToChat
                      share={{
                        kind: "menu_item",
                        pageSlug: slug,
                        section: section.name,
                        name: item.name,
                      }}
                      iconOnly
                      className="text-zinc-500 hover:text-white cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      {!editing && !isLoading && sections.length === 0 && (
        <>
          {menuItems.length > 0 && (
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search menu..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600"
              />
            </div>
          )}
          {menuLoading && (
            <div className="flex justify-center py-10">
              <Spinner size="md" />
            </div>
          )}
          {!menuLoading && menuItems.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-12">
              <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center">
                <span className="text-2xl">🍽️</span>
              </div>
              <p className="text-white font-semibold text-sm">No menu yet</p>
              {isOwner && (
                <p className="text-zinc-500 text-xs text-center">
                  Create sections such as starters, mains, and drinks.
                </p>
              )}
            </div>
          )}
          {!menuLoading && menuItems.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {menuItems
                .filter((post) =>
                  query
                    ? [post.title, post.content, ...post.tags]
                        .filter(Boolean)
                        .some((field) => field!.toLowerCase().includes(query))
                    : true,
                )
                .map((post) => (
                  <MenuCard key={post._id} post={post} />
                ))}
            </div>
          )}
          {isOwner && menuItems.length > 0 && (
            <button
              type="button"
              onClick={onCreatePost}
              className="text-xs text-zinc-500 hover:text-white cursor-pointer"
            >
              Menu item posts still appear here until you save a sectioned menu.
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default PageMenu;
