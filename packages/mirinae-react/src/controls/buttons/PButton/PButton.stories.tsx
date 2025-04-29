import { type Meta, type StoryObj } from "@storybook/react";

import { PButton } from "./PButton";

const meta: Meta<typeof PButton> = {
  title: "Controls/Buttons/PButton",
  component: PButton,
  tags: ["autodocs"],
  argTypes: {
    styleType: {
      control: "select",
      options: [
        "primary",
        "substitutive",
        "secondary",
        "tertiary",
        "transparent",
        "highlight",
        "positive",
        "negative-primary",
        "negative-secondary",
        "negative-transparent",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    loading: {
      control: "boolean",
    },
    block: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
    readonly: {
      control: "boolean",
    },
    active: {
      control: "boolean",
    },
    iconLeft: {
      control: "text",
    },
    iconRight: {
      control: "text",
    },
    onClick: {
      action: "clicked",
    },
  },
};

export default meta;
type Story = StoryObj<typeof PButton>;

export const Primary: Story = {
  args: {
    styleType: "primary",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    styleType: "secondary",
    children: "Secondary Button",
  },
};

export const Tertiary: Story = {
  args: {
    styleType: "tertiary",
    children: "Tertiary Button",
  },
};

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

export const Loading: Story = {
  args: {
    loading: true,
    children: "Loading Button",
  },
};

export const Block: Story = {
  args: {
    block: true,
    children: "Block Button",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: "Disabled Button",
  },
};

export const WithIcons: Story = {
  args: {
    iconLeft: "fas fa-star",
    iconRight: "fas fa-arrow-right",
    children: "Button with Icons",
  },
};

export const Active: Story = {
  args: {
    active: true,
    children: "Active Button",
  },
};

export const AsLink: Story = {
  args: {
    href: "https://spaceone.dev",
    target: "_blank",
    children: "External Link",
  },
};

export const IconOnly: Story = {
  args: {
    iconLeft: "fas fa-plus",
    children: "",
  },
};

export const ButtonGroup: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: 0 }}>
        <PButton styleType="primary" style={{ borderRadius: "4px 0 0 4px" }}>
          Left
        </PButton>
        <PButton styleType="primary" style={{ borderRadius: 0 }}>
          Middle
        </PButton>
        <PButton styleType="primary" style={{ borderRadius: "0 4px 4px 0" }}>
          Right
        </PButton>
      </div>
      <div style={{ display: "flex", gap: 0 }}>
        <PButton styleType="secondary" style={{ borderRadius: "4px 0 0 4px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: "4px" }}>fas fa-plus</span>
            Add
          </div>
        </PButton>
        <PButton styleType="secondary" style={{ borderRadius: "0 4px 4px 0" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ marginRight: "4px" }}>fas fa-minus</span>
            Remove
          </div>
        </PButton>
      </div>
    </div>
  ),
};
