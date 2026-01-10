import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const baseOptions: BaseLayoutProps = {
  links: [
    {
      text: "Drive Docs",
      url: "/docs/pages",
      active: "nested-url",
    },
    {
      text: "Page 2",
      url: "/docs/pages?page=2",
    },
  ],
};
