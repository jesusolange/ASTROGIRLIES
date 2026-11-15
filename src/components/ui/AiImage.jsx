import "./kit.css";

export default function AiImage({ src, alt, ai = false, imgClass = "", class: className = "", loading = "lazy", ...rest }) {
  return (
    <span class={`am-ai-image${className ? ` ${className}` : ""}`}>
      <img
        class={imgClass || undefined}
        src={src}
        alt={ai ? `${alt} (AI-generated illustration)` : alt}
        loading={loading}
        decoding="async"
        {...rest}
      />
      {ai ? <span class="am-ai-badge" aria-hidden="true">AI-generated</span> : null}
    </span>
  );
}
