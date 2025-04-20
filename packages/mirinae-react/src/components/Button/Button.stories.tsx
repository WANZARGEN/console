import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";
import { expect, userEvent, within } from "@storybook/test";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Button 컴포넌트는 사용자 상호작용을 위한 기본적인 버튼입니다.",
      },
    },
  },
  tags: ["autodocs", "test"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "tertiary"],
      description: "버튼의 스타일 변형",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "버튼의 크기",
    },
    disabled: {
      control: "boolean",
      description: "버튼 비활성화 여부",
    },
    children: {
      control: "text",
      description: "버튼 내부 콘텐츠",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 스토리
export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Item
      </>
    ),
  },
};

// Variants
export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
  },
};

export const Tertiary: Story = {
  args: {
    variant: "tertiary",
    children: "Tertiary Button",
  },
};

// Sizes
export const Small: Story = {
  args: {
    size: "sm",
    children: "Small Button",
  },
};

export const Medium: Story = {
  args: {
    size: "md",
    children: "Medium Button",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large Button",
  },
};

// States
export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled Button",
  },
};

// Interactive Stories
export const WithClickEvent: Story = {
  args: {
    children: "Click Me",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await userEvent.click(button);
    await expect(button).toHaveFocus();
  },
};

export const WithKeyboardNavigation: Story = {
  args: {
    children: "Press Tab",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button");
    await userEvent.tab();
    await expect(button).toHaveFocus();
  },
};

// Accessibility Stories
export const WithAriaLabel: Story = {
  args: {
    children: "Close",
    "aria-label": "Close dialog",
  },
};

// Visual Tests
export const VisualTest: Story = {
  args: {
    children: "Visual Test Button",
  },
  parameters: {
    chromatic: { viewports: [320, 768, 1024] },
  },
};
