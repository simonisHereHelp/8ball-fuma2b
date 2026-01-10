import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <span className="inline-flex flex-row items-center pb-2 [aside_&]:-ms-1.5">
        Bagel Docs
      </span>
    ),
  },
  links: [
    {
      text: "Bagel Docs",
      url: "/docs/pages",
      active: "nested-url",
    },
    {
      text: "Page 2",
      url: "/docs/pages?page=2",
    },
  ],
};
