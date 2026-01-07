import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  nav: {
    title: (
      <span className="inline-flex flex-row gap-3 items-center pb-2 [aside_&]:-ms-1.5">
        <svg
          aria-label="Top hat logomark"
          role="img"
          viewBox="0 0 32 32"
          height="32"
          width="32"
        >
          <path
            fill="currentColor"
            d="M5.7057 6.4166c-0.1074 -2.8311 1.1744 -4.9813 3.9704 -4.9813H22.352c1.7438 0 4.0942 1.3139 3.9258 4.8849 -0.0831 1.7632 -0.3075 5.9103 -0.5225 9.8141 3.3731 0.635 5.9247 3.5956 5.9247 7.1522 0 4.0197 -3.2592 7.2781 -7.28 7.2781H7.6c-4.0208 0 -7.28 -3.2584 -7.28 -7.2781 0 -3.5502 2.5423 -6.5065 5.9063 -7.1487 -0.2358 -4.099 -0.4695 -8.374 -0.5206 -9.7212Zm3.8906 14.8991c-1.568 0 -2.7083 -1.0536 -3.1997 -2.5428v4.0299c0 1.675 1.5043 2.998 3.1934 2.998h12.8184c1.6891 0 3.1934 -1.3344 3.1934 -2.998v-3.9613c-0.4907 1.4891 -1.6303 2.4742 -3.1983 2.4742H9.5963Z"
            strokeWidth="1"
          />
        </svg>
      </span>
    ),
  },
  links: [
    {
      text: "Documentation",
      url: "/docs",
      active: "nested-url",
    },
  ],
};
