import { Callout } from "fumadocs-ui/components/callout";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { Tabs, Tab } from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { Check, X } from "lucide-react";
import { Fragment, type ReactNode, type ImgHTMLAttributes } from "react";

function normalizePathSegments(input: string) {
  const segments = input.split("/");
  const stack: string[] = [];

  for (const segment of segments) {
    if (!segment || segment === ".") {
      continue;
    }
    if (segment === "..") {
      stack.pop();
      continue;
    }
    stack.push(segment);
  }

  return stack.join("/");
}

export function resolveImageSrc(src?: string, filePath?: string) {
  if (!src) {
    return src ?? "";
  }

  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("data:") ||
    src.startsWith("#") ||
    src.startsWith("/")
  ) {
    return src;
  }

  if (!filePath) {
    return src;
  }

  const match = src.match(/^([^?#]+)(.*)$/);
  const pathPart = match?.[1] ?? src;
  const suffix = match?.[2] ?? "";
  const baseDir = filePath.split("/").slice(0, -1).join("/");
  const combined = baseDir ? `${baseDir}/${pathPart}` : pathPart;
  const normalized = normalizePathSegments(combined);

  return `/api/docs/assets/${normalized}${suffix}`;
}

const isRemoteImage = true;

const mdxComponents = {
  ...defaultMdxComponents,
  blockquote: Callout,
  Tabs,
  Tab,
  Check,
  Cross: X,
  Image: ({
    srcDark,
    srcLight,
    ...props
  }: {
    srcDark: string;
    srcLight: string;

    width: `${number}` | number;
    height: `${number}` | number;
    alt: string;
  }) => (
    <div className="not-prose my-6 rounded-xl p-1 bg-gradient-to-br from-white/10 to-black/10 border shadow-lg">
      <ImageZoom
        src={isRemoteImage ? `https://nextjs.org${srcLight}` : srcLight}
        loading="lazy"
        {...props}
        className="rounded-lg block dark:hidden"
      />
      <ImageZoom
        src={isRemoteImage ? `https://nextjs.org${srcDark}` : srcDark}
        loading="lazy"
        {...props}
        className="rounded-lg hidden dark:block"
      />
    </div>
  ),
};

export function createMdxComponents({
  isAppRouter,
  filePath,
}: {
  isAppRouter: boolean;
  filePath?: string;
}) {
  return {
    ...mdxComponents,
    img: ({
      src,
      ...props
    }: ImgHTMLAttributes<HTMLImageElement>) => (
      <img src={resolveImageSrc(src, filePath)} {...props} />
    ),
    AppOnly: ({ children }: { children: ReactNode }) =>
      isAppRouter ? <Fragment>{children}</Fragment> : null,
    PagesOnly: ({ children }: { children: ReactNode }) =>
      !isAppRouter ? <Fragment>{children}</Fragment> : null,
  };
}
