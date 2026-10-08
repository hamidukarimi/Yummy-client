const TOKEN = /(?:https?:\/\/|www\.)[^\s]+|\+?\d[\d\s().-]{5,}\d/gi;

const trimTrail = (value: string): { core: string; trail: string } => {
  let core = value;
  let trail = "";
  while (core.length > 0 && /[.,;:!?)]$/.test(core)) {
    trail = core.slice(-1) + trail;
    core = core.slice(0, -1);
  }
  return { core, trail };
};

const MessageText = ({ text, mine }: { text: string; mine: boolean }) => {
  const parts: { key: string; href?: string; value: string }[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(TOKEN)) {
    const raw = match[0];
    const start = match.index ?? 0;
    if (start > last) {
      parts.push({ key: `t-${index}`, value: text.slice(last, start) });
      index += 1;
    }
    if (/^(https?:\/\/|www\.)/i.test(raw)) {
      const { core, trail } = trimTrail(raw);
      const href = /^www\./i.test(core) ? `https://${core}` : core;
      parts.push({ key: `l-${index}`, href, value: core });
      index += 1;
      if (trail) {
        parts.push({ key: `t-${index}`, value: trail });
        index += 1;
      }
    } else {
      const digits = raw.replace(/\D/g, "");
      if (digits.length >= 7 && digits.length <= 15) {
        const href = raw.trim().startsWith("+") ? `tel:+${digits}` : `tel:${digits}`;
        parts.push({ key: `p-${index}`, href, value: raw });
      } else {
        parts.push({ key: `t-${index}`, value: raw });
      }
      index += 1;
    }
    last = start + raw.length;
  }
  if (last < text.length) parts.push({ key: "tail", value: text.slice(last) });

  const linkClass = mine ? "underline text-black" : "underline text-white";

  return (
    <>
      {parts.map((part) => part.href ? (
        <a
          key={part.key}
          href={part.href}
          {...(part.href.startsWith("http")
            ? { target: "_blank", rel: "noreferrer" }
            : {})}
          className={linkClass}
        >
          {part.value}
        </a>
      ) : (
        <span key={part.key}>{part.value}</span>
      ))}
    </>
  );
};

export default MessageText;
